import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = await getCloudflareContext();
  const db = drizzle(env.DB);

  return {
    adapter: DrizzleAdapter(db),
    secret: env.AUTH_SECRET,
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      Naver({
        clientId: env.NAVER_CLIENT_ID,
        clientSecret: env.NAVER_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      Kakao({
        clientId: env.KAKAO_CLIENT_ID,
        clientSecret: env.KAKAO_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    callbacks: {
      async signIn({ user, account }) {
        try {
          const rawDb = env.DB;
          const cookieStore = await cookies();

          const provider = account?.provider;
          const providerAccountId = account?.providerAccountId;
          const socialEmail = user.email;

          if (!provider || !providerAccountId) return false;

          const currentToken = cookieStore.get("token")?.value;

          if (currentToken) {
            // =========================================================
            // 🚀 갈래길 A: 마이페이지에서 [연동하기(Connect)]를 누른 경우
            // =========================================================
            const { verifyToken } = await import("@/lib/jwt");
            const decoded = await verifyToken(
              currentToken,
              env.JWT_SECRET as string,
            );

            if (!decoded || !decoded.loginId) return false;

            const loginId = decoded.loginId as string;

            const existingAccount = await rawDb
              .prepare(
                "SELECT id FROM accounts WHERE provider = ? AND providerAccountId = ?",
              )
              .bind(provider, providerAccountId)
              .first();

            if (!existingAccount) {
              const generatedId = crypto.randomUUID();
              const accountType = account.type || "oauth";

              await rawDb
                .prepare(
                  `
                  INSERT INTO accounts (id, userId, type, provider, providerAccountId) 
                  VALUES (?, ?, ?, ?, ?)
                `,
                )
                .bind(
                  generatedId,
                  loginId,
                  accountType,
                  provider,
                  providerAccountId,
                )
                .run();
            }
            return true;
          } else {
            // =========================================================
            // 🚀 갈래길 B: 로그인 모달에서 [소셜 로그인]을 누른 경우
            // =========================================================
            const linkedAccount = await rawDb
              .prepare(
                "SELECT userId FROM accounts WHERE provider = ? AND providerAccountId = ?",
              )
              .bind(provider, providerAccountId)
              .first<{ userId: string }>();

            let targetLoginId = "";
            let targetName = user.name || "소셜유저";

            if (linkedAccount) {
              // B-1: 이미 연동된 기록이 있는 경우
              targetLoginId = linkedAccount.userId;
              const authUser = await rawDb
                .prepare("SELECT NAME FROM USER_AUTH WHERE LOGIN_ID = ?")
                .bind(targetLoginId)
                .first<{ NAME: string }>();
              if (authUser) targetName = authUser.NAME;
            } else {
              // B-2: 연동 기록은 없지만, 같은 이메일로 가입한 내역이 있는지 조회
              // 🌟 보안 패치 적용 위치: IS_VERIFIED를 함께 불러옵니다.
              const existingUser = await rawDb
                .prepare(
                  "SELECT LOGIN_ID, NAME, IS_VERIFIED FROM USER_AUTH WHERE EMAIL = ?",
                )
                .bind(socialEmail)
                .first<{
                  LOGIN_ID: string;
                  NAME: string;
                  IS_VERIFIED: number;
                }>();

              if (existingUser) {
                // 🚨 해커 방어막 작동: 이메일 인증을 안 한 계정이라면 연동 거부
                if (existingUser.IS_VERIFIED === 0) {
                  console.error(
                    "보안 경고: 미인증된 로컬 계정으로의 소셜 연동 시도 차단",
                  );
                  return false;
                }

                // 정상적으로 인증된 내 계정이라면 연동 진행
                targetLoginId = existingUser.LOGIN_ID;
                targetName = existingUser.NAME;

                const generatedId = crypto.randomUUID();
                const accountType = account.type || "oauth";
                await rawDb
                  .prepare(
                    `
                    INSERT INTO accounts (id, userId, type, provider, providerAccountId) 
                    VALUES (?, ?, ?, ?, ?)
                  `,
                  )
                  .bind(
                    generatedId,
                    targetLoginId,
                    accountType,
                    provider,
                    providerAccountId,
                  )
                  .run();
              } else {
                // B-3: 완전히 처음 온 유저 (자동 회원가입)
                const newLoginId =
                  (socialEmail?.split("@")[0] || "user") + `_${provider}`;
                const generatedId = crypto.randomUUID();
                const accountType = account.type || "oauth";

                await rawDb
                  .prepare(
                    `
                    INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, IS_VERIFIED) 
                    VALUES (?, 'OAUTH_LINKED_ACCOUNT', ?, ?, 1)
                  `,
                  )
                  .bind(newLoginId, targetName, socialEmail || "")
                  .run();

                await rawDb
                  .prepare(
                    `
                    INSERT INTO accounts (id, userId, type, provider, providerAccountId) 
                    VALUES (?, ?, ?, ?, ?)
                  `,
                  )
                  .bind(
                    generatedId,
                    newLoginId,
                    accountType,
                    provider,
                    providerAccountId,
                  )
                  .run();

                targetLoginId = newLoginId;
              }
            }

            // 🌟 마지막 커스텀 JWT 토큰 굽기 로직
            const { signToken } = await import("@/lib/jwt");
            const { results: roles } = await rawDb
              .prepare("SELECT ROLE_NAME FROM USER_ROLES WHERE LOGIN_ID = ?")
              .bind(targetLoginId)
              .all<{ ROLE_NAME: string }>();

            const roleList = roles.map((r) => r.ROLE_NAME);
            if (roleList.length === 0) roleList.push("ROLE_USER");

            const customJwt = await signToken(
              { loginId: targetLoginId, name: targetName, roles: roleList },
              env.JWT_SECRET as string,
            );

            cookieStore.set("token", customJwt, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 60 * 60 * 2,
              path: "/",
            });
          }
          return true;
        } catch (error) {
          console.error("NextAuth SignIn Callback Error:", error);
          return false;
        }
      },
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
    pages: {
      signIn: "/",
      error: "/auth-error",
    },
  };
});
