import React from "react";
import Link from "next/link";

export default function VerifyPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] p-4 text-black">
      <div className="w-full max-w-md border border-gray-100 bg-white p-12 text-center shadow-sm">
        {/* ✉️ 이메일 발송 안내 아이콘 */}
        <svg
          className="mx-auto mb-6 h-14 w-14 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>

        <h1 className="mb-4 text-2xl font-bold tracking-tighter uppercase">
          Check Your Email
        </h1>

        <p className="mb-10 text-sm leading-relaxed text-gray-500">
          회원가입이 거의 완료되었습니다!
          <br />
          입력하신 메일함으로 이동하여 <br />
          <strong className="text-black">인증 링크</strong>를 클릭해 계정을
          활성화해주세요.
        </p>

        {/* 메인(로그인) 화면으로 돌아가는 버튼 */}
        <Link
          href="/"
          className="block w-full bg-black py-4 text-[10px] font-bold tracking-[0.3em] text-white uppercase transition-colors hover:bg-gray-800"
        >
          Return to Main
        </Link>
      </div>
    </div>
  );
}
