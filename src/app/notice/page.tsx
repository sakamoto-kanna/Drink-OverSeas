"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";

// --- 더미 데이터 & 타입 ---
interface Notice {
  id: number;
  title: string;
  date: string;
  isImportant?: boolean;
}

const dummyNotices: Notice[] = [
  {
    id: 1,
    title: "[필독] Drink OverSeas 서비스 정식 오픈 안내",
    date: "2026.07.30",
    isImportant: true,
  },
  {
    id: 2,
    title: "[안내] 하계 휴가로 인한 배송 지연 안내",
    date: "2026.07.25",
  },
  {
    id: 3,
    title: "[이벤트] 신규 가입 고객 대상 첫 구매 무료배송 쿠폰 지급",
    date: "2026.07.10",
  },
  {
    id: 4,
    title: "멕시코 로컬 크래프트 소다 신규 입점 안내",
    date: "2026.06.28",
  },
];

export default function NoticePage() {
  const router = useRouter();
  const [notices] = useState<Notice[]>(dummyNotices);

  // Auth Store에서 로그인한 유저 정보를 가져옵니다.
  const { roles } = useAuthStore();
  const isAdmin = roles?.includes("ROLE_ADMIN");

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-6 py-20 md:py-32">
        {/* 타이틀 영역 */}
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tighter uppercase md:text-5xl">
            Notice
          </h1>
          <p className="text-sm text-gray-500">
            Drink OverSeas의 새로운 소식과 안내 사항을 전해드립니다.
          </p>
        </section>

        {/* 게시판 리스트 영역 */}
        <section className="border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          {/* 상단 컨트롤 (총 게시글 수 & 관리자 글쓰기 버튼) */}
          <div className="mb-6 flex items-center justify-between border-b border-gray-900 pb-4">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Total {notices.length}
            </span>

            {/* 관리자에게만 노출되는 글쓰기 버튼 */}
            {isAdmin && (
              <button
                onClick={() => router.push("/notice/write")}
                className="bg-black px-6 py-2 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
              >
                Write Post
              </button>
            )}
          </div>

          {/* 게시글 목록 */}
          <div className="flex flex-col">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="group flex cursor-pointer flex-col justify-between border-b border-gray-100 px-4 py-6 transition-colors hover:bg-gray-50 md:flex-row md:items-center"
                onClick={() => router.push(`/notice/${notice.id}`)}
              >
                <div className="flex items-center gap-4">
                  {notice.isImportant && (
                    <span className="rounded bg-black px-2 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                      Notice
                    </span>
                  )}
                  <h3
                    className={`text-sm md:text-base ${
                      notice.isImportant ? "font-bold" : "font-normal"
                    } text-gray-800 transition-colors group-hover:text-black`}
                  >
                    {notice.title}
                  </h3>
                </div>
                <span className="mt-2 text-xs text-gray-400 md:mt-0">
                  {notice.date}
                </span>
              </div>
            ))}
          </div>

          {/* 페이지네이션 (디자인 용도) */}
          <div className="mt-12 flex justify-center space-x-2">
            <button className="flex h-8 w-8 items-center justify-center border border-gray-200 text-xs font-bold transition-colors hover:border-black hover:bg-black hover:text-white">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-gray-200 text-xs text-gray-400 transition-colors hover:border-gray-400">
              2
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between text-[10px] tracking-widest text-gray-400 uppercase md:flex-row">
          <p>© 2026 Drink OverSeas. All rights reserved.</p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <a href="#">Instagram</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
