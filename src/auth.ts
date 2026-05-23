import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = await getCloudflareContext();
  const db = drizzle(env.DB);

  return {
    // 🌟 Drizzle 어댑터를 사용하여 우리 D1 DB와 연결
    adapter: DrizzleAdapter(db),
    secret: env.AUTH_SECRET,
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true, //이메일 같으면 자동 연동
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
      async session({ session, user }) {
        // 세션에 유저 ID(LOGIN_ID)를 넣어 프론트엔드에서 쓰기 편하게 합니다.
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
    pages: {
      signIn: "/", // 로그인 페이지 경로
      error: "/auth-error", // 에러 발생 시 이동할 경로
    },
  };
});
