import React from "react";
import Link from "next/link";

// Next.js App Router에서는 URL의 쿼리 파라미터(?reason=...)를 props로 쉽게 받을 수 있습니다.
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  // 에러 원인에 따라 보여줄 메시지를 다르게 설정할 수 있습니다.
  let errorMessage = "유효하지 않거나 이미 만료된 인증 링크입니다.";

  if (searchParams.reason === "no_token") {
    errorMessage =
      "인증 토큰이 누락되었습니다. 메일의 링크를 다시 확인해주세요.";
  } else if (searchParams.reason === "server_error") {
    errorMessage =
      "인증 처리 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] p-4 text-black">
      <div className="w-full max-w-md border border-gray-100 bg-white p-12 text-center shadow-sm">
        {/* 경고 느낌표 아이콘 */}
        <svg
          className="mx-auto mb-6 h-12 w-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h1 className="mb-4 text-2xl font-bold tracking-tighter uppercase">
          Verification Failed
        </h1>

        <p className="mb-10 text-sm leading-relaxed text-gray-500">
          {errorMessage}
          <br />
          다시 로그인하여 인증 메일을 재요청해주세요.
        </p>

        {/* 🌟 Next.js의 Link 컴포넌트를 사용하여 부드러운 페이지 이동 구현 */}
        <Link
          href="/"
          className="block w-full bg-black py-4 text-[10px] font-bold tracking-[0.3em] text-white uppercase transition-colors hover:bg-gray-800"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
