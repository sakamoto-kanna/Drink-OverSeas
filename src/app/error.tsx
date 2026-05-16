"use client"; // 에러 바운더리는 클라이언트 컴포넌트여야 합니다.

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 개발자 확인용으로 콘솔에 에러를 찍어줍니다. (실제 서비스에서는 Sentry 등에 수집)
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] p-4 text-black">
      <div className="w-full max-w-md border border-gray-100 bg-white p-12 text-center shadow-sm">
        {/* 시스템 오류 아이콘 */}
        <svg
          className="mx-auto mb-6 h-12 w-12 text-red-500"
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

        <h1 className="mb-2 text-2xl font-bold tracking-tighter uppercase">
          System Error
        </h1>
        <h2 className="mb-4 text-sm font-bold tracking-widest text-gray-400 uppercase">
          Something went wrong
        </h2>

        <p className="mb-10 text-sm leading-relaxed text-gray-500">
          예기치 않은 오류가 발생했습니다.
          <br />
          불편을 드려 죄송합니다. 잠시 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col gap-3">
          {/* 에러 복구 시도 버튼 (현재 화면을 새로고침하는 효과) */}
          <button
            onClick={() => reset()}
            className="w-full bg-black py-4 text-[10px] font-bold tracking-[0.3em] text-white uppercase transition-colors hover:bg-gray-800"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full border border-gray-200 bg-white py-4 text-[10px] font-bold tracking-[0.3em] text-black uppercase transition-colors hover:bg-gray-50"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
