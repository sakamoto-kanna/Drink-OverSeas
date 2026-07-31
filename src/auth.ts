import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = await getCloudflareContext();

  return {
    session: {
      strategy: "jwt",
    },

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
          // Cloudflare D1 바인딩 객체를 직접 사용
          const rawDb = env.DB;
          const cookieStore = await cookies();

          const provider = account?.provider;
          const providerAccountId = account?.providerAccountId;
          // 🚀 카카오는 이메일을 안 줄 수도 있으므로 빈 문자열 처리 안전장치 추가
          const socialEmail = user.email || "";

          if (!provider || !providerAccountId) return false;

          const currentToken = cookieStore.get("token")?.value;

          if (currentToken) {
            // =========================================================
            // 갈래길 A: 마이페이지에서 [연동하기]
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
            // 갈래길 B: 로그인 모달에서 [소셜 로그인]
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
              // B-2: 이메일로 가입된 기존 로컬 계정 찾기
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
                // 이메일 미인증 계정이면 방어
                if (existingUser.IS_VERIFIED === 0) {
                  console.error(
                    "보안 경고: 미인증된 로컬 계정으로의 소셜 연동 시도 차단",
                  );
                  return false;
                }

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
                // B-3: 완전 신규 유저 (자동 회원가입)
                const newLoginId =
                  (socialEmail.split("@")[0] || "user") + `_${provider}`;
                const generatedId = crypto.randomUUID();
                const accountType = account.type || "oauth";

                await rawDb
                  .prepare(
                    `
                    INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, IS_VERIFIED) 
                    VALUES (?, 'OAUTH_LINKED_ACCOUNT', ?, ?, 1)
                  `,
                  )
                  .bind(newLoginId, targetName, socialEmail)
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
          return true; // 성공 시 로그인 허용
        } catch (error) {
          console.error("NextAuth SignIn Callback Error:", error);
          return false; // 에러 발생 시 /auth-error 페이지로 리다이렉트
        }
      },
      // 세션 콜백은 사실상 쓰지 않지만 (우리는 쿠키로 하니까), 타입 에러 방지용으로 둡니다.
      async session({ session }) {
        return session;
      },
    },
    pages: {
      signIn: "/",
      error: "/auth-error",
    },
  };
});

export const { GET, POST } = handlers;
