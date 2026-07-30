"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function NoticeWritePage() {
  const router = useRouter();

  // 폼 상태 관리
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 게시글 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!window.confirm("공지사항을 등록하시겠습니까?")) return;

    setIsSubmitting(true);

    try {
      // API 라우트로 데이터 전송 (아직 백엔드 API가 없다면 이 부분은 에러가 납니다)
      const res = await fetch("/api/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          isImportant,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        alert("공지사항이 성공적으로 등록되었습니다.");
        router.push("/notice"); // 등록 후 목록 페이지로 이동
      } else {
        alert(data.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 등록 중 에러:", error);
      alert("서버와 통신하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-6 py-20 md:py-32">
        {/* 타이틀 영역 */}
        <section className="mb-12 border-b border-gray-900 pb-6 text-center md:text-left">
          <h1 className="mb-2 text-3xl font-bold tracking-tighter uppercase md:text-4xl">
            Write Notice
          </h1>
          <p className="text-sm text-gray-500">
            새로운 공지사항을 작성해주세요.
          </p>
        </section>

        {/* 폼 영역 */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 border border-gray-100 bg-white p-6 shadow-sm md:p-10"
        >
          {/* 중요 공지사항 체크 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isImportant"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-black"
            />
            <label
              htmlFor="isImportant"
              className="cursor-pointer text-xs font-bold tracking-widest text-gray-800 uppercase"
            >
              Set as Important (상단 고정 및 강조)
            </label>
          </div>

          {/* 제목 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요."
              className="w-full rounded-none border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-black focus:outline-none"
              required
            />
          </div>

          {/* 내용 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 상세히 입력하세요."
              className="min-h-[400px] w-full resize-y rounded-none border border-gray-200 px-4 py-4 text-sm leading-relaxed transition-colors focus:border-black focus:outline-none"
              required
            />
          </div>

          {/* 버튼 영역 */}
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-200 px-8 py-3 text-xs font-bold tracking-widest text-gray-500 uppercase transition-colors hover:border-black hover:text-black"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-black bg-black px-12 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Publish"}
            </button>
          </div>
        </form>
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
