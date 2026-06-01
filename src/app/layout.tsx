import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 추가된 서버 사이드 모듈
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyToken } from "@/lib/jwt";
import AuthInitializer from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drink OverSeas",
  description: "집에서 즐기는 세계 각국의 음료",
};

// RootLayout을 async 함수로 변경하여 서버 렌더링을 허용합니다.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 초기 상태 세팅
  let isLoggedIn = false;
  let userName = "";

  try {
    // 서버 단에서 환경변수와 쿠키를 읽어옵니다.
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // 토큰이 존재하면 해독하여 상태를 확정합니다.
    if (token && env.JWT_SECRET) {
      const decoded = await verifyToken(token, env.JWT_SECRET as string);
      if (decoded && decoded.loginId) {
        isLoggedIn = true;
        userName = decoded.name as string;
      }
    }
  } catch (error) {
    console.error("Layout SSR Auth Check Error:", error);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* FontAwesome 6.4.0 CDN 추가 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* FontAwesome (아이콘) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* 카카오 주소 API 스크립트 */}
        <script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          defer
        ></script>
      </head>
      <body className="flex min-h-full flex-col">
        {/* 서버에서 확정된 값을 브릿지를 통해 클라이언트로 주입합니다 */}
        <AuthInitializer isLoggedIn={isLoggedIn} userName={userName} />
        {children}
      </body>
    </html>
  );
}
