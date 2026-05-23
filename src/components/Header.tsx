"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // 🌟 클라이언트 전용 signIn 임포트

const NAV_ITEMS = ["ABOUT", "NOTICE", "CONTACT"];

export default function Header() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // --- ESC 키로 모달 닫기 로직 ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowLoginModal(false);
    }
  }, []);

  useEffect(() => {
    if (showLoginModal) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLoginModal, handleKeyDown]);

  // 화면이 처음 켜질 때 로그인 상태 검사
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserName(data.user.name);
        }
      } catch (err) {
        console.error("로그인 상태 확인 실패:", err);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
        setUserName(data.user.name);
        setShowLoginModal(false);
        setLoginId("");
        setPassword("");
        alert(`${data.user.name}님 환영합니다! ☕`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUserName("");
    alert("로그아웃 되었습니다.");
  };

  return (
    <>
      <header className="w-full bg-[#FDFCFB]">
        {/* Desktop Navigation */}
        <div className="mx-auto hidden h-20 max-w-7xl items-center justify-between px-6 md:flex">
          <a
            href="/"
            className="flex flex-shrink-0 cursor-pointer items-center"
          >
            <img
              src="/DOS.png"
              alt="DOS Logo"
              className="h-12 w-auto object-contain"
            />
          </a>

          <nav className="flex items-center text-sm font-medium tracking-widest text-gray-800">
            <div className="flex items-center gap-x-10">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="transition-opacity hover:opacity-50"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="mr-8 ml-9.5 h-3 w-px bg-gray-300"></div>
            <div className="flex items-center gap-x-8">
              {isLoggedIn ? (
                <div className="flex w-auto min-w-[64px] items-center justify-center gap-x-4">
                  <a
                    href="#mypage"
                    className="font-bold text-[#1A1A1A] uppercase transition-opacity hover:opacity-50"
                  >
                    {userName}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-800"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-16 text-center uppercase transition-opacity hover:opacity-50"
                >
                  LOGIN
                </button>
              )}

              <button className="relative flex items-center justify-center transition-opacity hover:opacity-50">
                <i className="fa-solid fa-bag-shopping text-lg"></i>
                <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] font-sans text-[9px] font-bold tracking-normal text-white">
                  0
                </span>
              </button>
              <button className="flex items-center justify-center transition-opacity hover:opacity-50">
                <i className="fa-solid fa-magnifying-glass text-lg"></i>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Header Top */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4 text-gray-800 md:hidden">
          <button className="w-8 text-left text-xl hover:opacity-50">
            <i className="fa-solid fa-bars"></i>
          </button>
          <h1 className="text-lg font-bold tracking-tighter uppercase">DOS</h1>

          <div className="flex w-auto items-center justify-end space-x-4">
            {isLoggedIn ? (
              <>
                <a
                  href="#mypage"
                  className="text-[10px] font-bold tracking-widest text-black uppercase hover:opacity-50"
                >
                  {userName}
                </a>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-medium tracking-widest text-gray-400 hover:opacity-50"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-[10px] font-medium tracking-widest hover:opacity-50"
              >
                LOGIN
              </button>
            )}
            <button className="relative flex items-center text-lg hover:opacity-50">
              <i className="fa-solid fa-bag-shopping"></i>
              <span className="absolute -top-1 -right-2 flex h-3 w-3 items-center justify-center rounded-full bg-[#1A1A1A] font-sans text-[8px] font-bold tracking-normal text-white">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Grid Menu */}
        <div className="grid grid-cols-3 border-b border-gray-200 text-center text-xs font-semibold tracking-widest text-gray-500 md:hidden">
          {NAV_ITEMS.map((item, idx) => (
            <div
              key={item}
              className={`border-r border-gray-200 py-4 ${idx > 2 ? "" : "border-b"}`}
            >
              {item}
            </div>
          ))}
          <div className="border-r border-b border-gray-200 py-4"></div>
          <div className="border-b border-gray-200 py-4"></div>
        </div>
      </header>

      {/* --- 로그인 팝업(모달) UI --- */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)} // 배경 클릭 시 닫기
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
          >
            {/* 1. X 버튼 */}
            <button
              onClick={() => setShowLoginModal(false)}
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

            {/*2. [신규 추가] 소셜 로그인 연동 섹션 */}
            <div className="mt-6 space-y-3">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="mx-3 flex-shrink text-[9px] font-bold tracking-widest text-gray-300 uppercase">
                  Or Connect With
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* 구글 로그인 버튼 */}
                <button
                  onClick={() => signIn("google")} // 클라이언트 방식 호출
                  className="flex justify-center border border-gray-100 py-3 transition-colors hover:bg-gray-50"
                  title="Google 로그인"
                >
                  {/* <img src="/icons/google.png" className="" alt="Google" /> */}
                </button>

                {/* 네이버 로그인 버튼 */}
                <button
                  onClick={() => signIn("naver")}
                  className="flex justify-center bg-[#03C75A] py-3 transition-colors hover:opacity-90"
                  title="Naver 로그인"
                >
                  {/* <img src="/icons/naver.png" className="" alt="Naver" /> */}
                </button>

                {/* 카카오 로그인 버튼 */}
                <button
                  onClick={() => signIn("kakao")}
                  className="flex justify-center bg-[#FEE500] py-3 transition-colors hover:opacity-90"
                  title="Kakao 로그인"
                >
                  {/* <img src="/icons/kakao.png" className="" alt="Kakao" /> */}
                </button>
              </div>
            </div>

            {/* 3. 회원가입 버튼 추가 섹션 */}
            <div className="mt-6 border-t border-gray-100 pt-5 text-center">
              <p className="mb-3 text-xs tracking-widest text-gray-400 uppercase">
                계정이 없으신가요?
              </p>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  router.push("/signup");
                }}
                className="text-xs font-bold tracking-[0.15em] text-gray-800 uppercase underline underline-offset-4 transition-colors hover:text-gray-500"
              >
                Create an Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
