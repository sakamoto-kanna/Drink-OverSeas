"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import { signOut } from "next-auth/react";

const NAV_ITEMS = ["ABOUT", "NOTICE", "CONTACT"];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 화면이 처음 켜질 때 로그인 상태 검사 (기존 유지)
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

  const handleLogout = async () => {
    // 1. 상태 즉시 초기화 (유저 눈에 바로 로그아웃된 것처럼 보임)
    setIsLoggedIn(false);
    setUserName("");

    // 2. 백엔드 토큰 삭제
    await fetch("/api/auth/logout", { method: "POST" });

    // 3. 알림 및 NextAuth 정리 후 이동
    alert("로그아웃 되었습니다.");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="w-full bg-[#FDFCFB]">
        {/* Desktop Navigation */}
        <div className="mx-auto hidden h-20 max-w-7xl items-center justify-between px-6 md:flex">
          <Link
            href="/"
            className="flex flex-shrink-0 cursor-pointer items-center"
          >
            <img
              src="/DOS.png"
              alt="DOS Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center text-sm font-medium tracking-widest text-gray-800">
            <div className="flex items-center gap-x-10">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="transition-opacity hover:opacity-50"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="mr-8 ml-9.5 h-3 w-px bg-gray-300"></div>
            <div className="flex items-center gap-x-8">
              {isLoggedIn ? (
                <div className="flex w-auto min-w-[64px] items-center justify-center gap-x-4">
                  <Link
                    href="/mypage"
                    className="font-bold text-[#1A1A1A] uppercase transition-opacity hover:opacity-50"
                  >
                    {userName}
                  </Link>
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
              {/* 장바구니/검색 아이콘 생략 */}
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
                <Link
                  href="/mypage"
                  className="text-[10px] font-bold tracking-widest text-black uppercase hover:opacity-50"
                >
                  {userName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-medium tracking-widest text-gray-400 uppercase hover:opacity-50"
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
            </button>
          </div>
        </div>

        {/* Mobile Grid Menu 생략 */}
      </header>

      {/* 🌟 3. 분리한 LoginModal 불러오기 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(name) => {
            setIsLoggedIn(true);
            setUserName(name);
          }}
        />
      )}
    </>
  );
}
