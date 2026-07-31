import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { CustomD1Adapter } from "@/lib/authAdapter";

const getDb = () => {
  // @ts-ignore
  return process.env.DB || globalThis.DB;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: CustomD1Adapter(getDb()),
  providers: [
    // 1. Google 로그인
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    // 2. Naver 로그인 (커스텀 OAuth)
    {
      id: "naver",
      name: "Naver",
      type: "oauth",
      authorization: {
        url: "https://nid.naver.com/oauth2.0/authorize",
        params: {
          response_type: "code",
          client_id: process.env.AUTH_NAVER_ID,
          redirect_uri: process.env.AUTH_NAVER_REDIRECT_URI,
        },
      },
      token: "https://nid.naver.com/oauth2.0/token.jsp",
      userinfo: "https://openapi.naver.com/v1/nid/me",
      clientId: process.env.AUTH_NAVER_ID,
      clientSecret: process.env.AUTH_NAVER_SECRET,
      profile(profile) {
        return {
          id: profile.response.id.toString(),
          name: profile.response.name || profile.response.nickname,
          email: profile.response.email,
          image: profile.response.profile_image,
        };
      },
    },

    // 3. Kakao 로그인 (커스텀 OAuth)
    {
      id: "kakao",
      name: "Kakao",
      type: "oauth",
      authorization: "https://kauth.kakao.com/oauth/authorize",
      token: "https://kauth.kakao.com/oauth/token",
      userinfo: "https://kapi.kakao.com/v2/user/me",
      clientId: process.env.AUTH_KAKAO_ID,
      clientSecret: process.env.AUTH_KAKAO_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.kakao_account?.profile?.nickname,
          email: profile.kakao_account?.email,
          image: profile.kakao_account?.profile?.profile_image_url,
        };
      },
    },
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/",
    error: "/auth-error",
  },
});

export const { GET, POST } = handlers;
