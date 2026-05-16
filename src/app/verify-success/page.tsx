import React from "react";
import Link from "next/link";

export default function VerifySuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] p-4 text-black">
      <div className="w-full max-w-md border border-gray-100 bg-white p-12 text-center shadow-sm">
        {/* 🌟 성공을 알리는 초록색 체크 아이콘 */}
        <svg
          className="mx-auto mb-6 h-14 w-14 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <h1 className="mb-4 text-2xl font-bold tracking-tighter uppercase">
          Verification Complete
        </h1>

        <p className="mb-10 text-sm leading-relaxed text-gray-500">
          이메일 인증이 성공적으로 완료되었습니다.
          <br />
          이제 DOS의 모든 서비스를 정상적으로 이용하실 수 있습니다.
        </p>

        {/* 메인(로그인) 화면으로 돌아가는 버튼 */}
        <Link
          href="/"
          className="block w-full bg-black py-4 text-[10px] font-bold tracking-[0.3em] text-white uppercase transition-colors hover:bg-gray-800"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
