"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 문의 제출 핸들러
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert("필수 입력 항목을 모두 채워주세요.");
      return;
    }

    setSubmitting(true);
    try {
      // 💡 필요에 따라 /api/contact 같은 백엔드 엔드포인트와 연동하세요.
      // const res = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });

      // 임시 성공 시뮬레이션
      await new Promise((r) => setTimeout(r, 800));
      alert(
        "문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변 드리겠습니다.",
      );
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("문의 전송 에러:", error);
      alert("문의 전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main className="flex justify-center px-4 py-20 text-black">
        <div className="w-full max-w-3xl">
          {/* 홈으로 돌아가기 버튼 */}
          <div className="pb-4">
            <button
              onClick={() => router.push("/")}
              className="group flex items-center text-xs font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-black"
            >
              <i className="fa-solid fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
              Back To Home
            </button>
          </div>

          {/* 타이틀 영역 */}
          <div className="mb-12 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold tracking-tighter uppercase">
              Contact Us
            </h1>
            <p className="mt-2 text-xs tracking-wider text-gray-400 uppercase">
              궁금하신 점이나 제휴 문의를 남겨주세요.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* 왼쪽: 고객센터 안내 정보 */}
            <div className="space-y-6 text-sm text-gray-600 lg:col-span-1">
              <div>
                <h3 className="mb-1 text-xs font-bold tracking-widest text-gray-900 uppercase">
                  Customer Center
                </h3>
                <p className="text-xs text-gray-500">
                  평일 10:00 - 17:00 (주말 및 공휴일 휴무)
                </p>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-bold tracking-widest text-gray-900 uppercase">
                  Email Support
                </h3>
                <p className="text-xs text-gray-500">
                  support@drinkoverseas.com
                </p>
                <p className="text-[8px]">실제로 작동하는 메일이 아닙니다.</p>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-bold tracking-widest text-gray-900 uppercase">
                  Location
                </h3>
                <p className="text-xs text-gray-500">대한민국 대전광역시</p>
              </div>
            </div>

            {/* 오른쪽: 문의하기 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="성함을 입력하세요"
                    className="w-full border border-gray-200 bg-white px-4 py-3 text-xs text-gray-800 transition-colors outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="이메일을 입력하세요"
                    className="w-full border border-gray-200 bg-white px-4 py-3 text-xs text-gray-800 transition-colors outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="제목을 입력하세요"
                  className="w-full border border-gray-200 bg-white px-4 py-3 text-xs text-gray-800 transition-colors outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="문의 내용을 상세히 적어주세요."
                  className="w-full resize-none border border-gray-200 bg-white px-4 py-3 text-xs text-gray-800 transition-colors outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800 disabled:bg-gray-400"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
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
