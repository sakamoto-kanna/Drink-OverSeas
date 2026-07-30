import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 1. 요청된 주소가 /notice/write 인지 확인
  if (request.nextUrl.pathname.startsWith("/notice/write")) {
    // 2. 브라우저 쿠키에서 JWT 토큰 추출
    const token = request.cookies.get("token")?.value;

    // 토큰이 없으면 메인 페이지(또는 공지사항 목록)로 강제 이동
    if (!token) {
      return NextResponse.redirect(new URL("/notice", request.url));
    }

    try {
      // 3. Edge 환경에 맞게 JWT 페이로드(가운데 부분) 디코딩
      // JWT 구조: header.payload.signature
      const payloadBase64Url = token.split(".")[1];
      const payloadBase64 = payloadBase64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      // 한글 깨짐 방지를 위한 안전한 디코딩 처리
      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const decodedToken = JSON.parse(jsonPayload);

      // 4. 권한 배열(roles)에 "ADMIN"이 있는지 검사
      if (!decodedToken.roles || !decodedToken.roles.includes("ROLE_ADMIN")) {
        // 관리자가 아니면 돌려보냄
        return NextResponse.redirect(new URL("/notice", request.url));
      }

      // 관리자가 맞으면 무사통과!
      return NextResponse.next();
    } catch (error) {
      // 토큰을 해독할 수 없거나 위조된 경우 강제 이동
      console.error("Middleware Token Decode Error:", error);
      return NextResponse.redirect(new URL("/notice", request.url));
    }
  }

  // 다른 모든 페이지는 미들웨어가 관여하지 않고 통과시킴
  return NextResponse.next();
}

// 🚀 미들웨어가 실행될 경로를 지정 (성능 최적화)
export const config = {
  matcher: [
    "/notice/write",
    // 나중에 수정 페이지가 생기면 "/notice/edit/:path*" 등을 추가할 수 있습니다.
  ],
};
