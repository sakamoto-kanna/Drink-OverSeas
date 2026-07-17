"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// Header와 소통하기 위한 창구(Props) 정의
interface LoginModalProps {
  onClose: () => void; // 모달 닫기 함수
  onLoginSuccess: (userName: string) => void; // 로그인 성공 시 헤더에 이름 전달
}

export default function LoginModal({
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // --- ESC 키로 모달 닫기 로직 ---
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(); // 부모가 준 닫기 함수 실행
      }
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // --- 로그인 제출 로직 ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = (await res.json()) as {
        success: boolean;
        user: {
          name: string;
        };
        message?: string;
      };

      if (data.success) {
        alert(`${data.user.name}님 환영합니다!`);
        onLoginSuccess(data.user.name); // 부모(Header)에게 성공했음을 알림
        onClose(); // 로그인 완료 후 모달 닫기
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-10 shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-track]:my-6 [&::-webkit-scrollbar-track]:bg-transparent"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
      >
        {/* X 버튼: 다시 원래 있던 자리로 돌아와 자연스럽게 이어집니다 (잘림 현상 완벽 해결) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 transition-colors hover:text-black"
        >
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>

        <h2 className="mb-8 text-center text-2xl font-bold tracking-tighter uppercase">
          Login
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
          <div>
            <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
              ID
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full rounded-none border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-black focus:outline-none"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs tracking-widest text-gray-500 uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-none border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-black focus:outline-none"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-[#1A1A1A] py-4 text-sm font-bold tracking-[0.2em] text-white uppercase transition-colors hover:bg-black/80"
          >
            Sign In
          </button>
        </form>

        {/* 소셜 로그인 연동 섹션 */}
        <div className="mt-6 space-y-3">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="mx-3 flex-shrink text-[9px] font-bold tracking-widest text-gray-300 uppercase">
              Or Connect With
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => signIn("google")}
              className="border-black-100 flex w-full items-center justify-center rounded-md border transition-colors hover:bg-gray-50"
            >
              <img src="/icons/google.png" className="h-10" alt="Google" />
              Sign with Google
            </button>
            <button
              onClick={() => signIn("naver")}
              className="flex w-full items-center justify-center rounded-md bg-[#03a94d] transition-colors hover:opacity-90"
            >
              <img
                src="/login_btn/naver_btn.png"
                className="h-10"
                alt="Naver"
              />
            </button>
            <button
              onClick={() => signIn("kakao")}
              className="flex w-full items-center justify-center rounded-md bg-[#FEE500] pl-4 transition-colors hover:opacity-90"
            >
              <img
                src="/login_btn/kakao_btn.png"
                className="h-10"
                alt="Kakao"
              />
            </button>
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="mb-3 text-xs tracking-widest text-gray-400 uppercase">
            계정이 없으신가요?
          </p>
          <button
            onClick={() => {
              onClose();
              router.push("/signup");
            }}
            className="text-xs font-bold tracking-[0.15em] text-gray-800 uppercase underline underline-offset-4 transition-colors hover:text-gray-500"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
