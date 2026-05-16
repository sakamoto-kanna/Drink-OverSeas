import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] p-4 text-black">
      <div className="w-full max-w-md border border-gray-100 bg-white p-12 text-center shadow-sm">
        {/* 돋보기/물음표 아이콘 */}
        <svg
          className="mx-auto mb-6 h-12 w-12 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <h1 className="mb-2 text-3xl font-bold tracking-tighter uppercase">
          404
        </h1>
        <h2 className="mb-4 text-lg font-bold tracking-widest text-gray-800 uppercase">
          Page Not Found
        </h2>

        <p className="mb-10 text-sm leading-relaxed text-gray-500">
          원하시는 페이지를 찾을 수 없습니다.
          <br />
          입력하신 주소가 정확한지 다시 한번 확인해주세요.
        </p>

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
