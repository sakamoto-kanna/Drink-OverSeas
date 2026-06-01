"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import { signOut } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = ["ABOUT", "NOTICE", "CONTACT"];

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  // 추가: 모바일 메뉴 열림/닫힘 상태 관리
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    isLoggedIn,
    userName,
    isAuthLoading,
    checkLogin,
    setLogin,
    setLogout,
  } = useAuthStore();

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const handleLogout = async () => {
    setLogout();
    await fetch("/api/auth/logout", { method: "POST" });
    alert("로그아웃 되었습니다.");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* 추가: 모바일 메뉴의 절대 좌표 기준점을 위해 relative 클래스 추가 */}
      <header className="relative w-full bg-[#FDFCFB]">
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
              {isAuthLoading ? (
                <div className="w-16"></div>
              ) : isLoggedIn ? (
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

              <button className="relative flex items-center justify-center transition-opacity hover:opacity-50">
                <Link
                  href="/cart"
                  className="fa-solid fa-bag-shopping text-lg"
                ></Link>
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
          {/* 변경: 클릭 시 모바일 메뉴 상태를 토글하는 onClick 이벤트 추가 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-8 text-left text-xl hover:opacity-50"
          >
            <i
              className={`fa-solid ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"}`}
            ></i>
          </button>

          <h1 className="text-lg font-bold tracking-tighter uppercase">DOS</h1>

          <div className="flex w-auto items-center justify-end space-x-4">
            {isAuthLoading ? (
              <div className="w-10"></div>
            ) : isLoggedIn ? (
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
              <Link href="/cart" className="fa-solid fa-bag-shopping"></Link>
              <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] font-sans text-[9px] font-bold tracking-normal text-white">
                0
              </span>
            </button>
            <button className="ml-1 flex items-center text-lg hover:opacity-50">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        {/* 추가: 모바일 드롭다운 메뉴 영역 */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 z-50 w-full border-b border-gray-100 bg-[#FDFCFB] px-4 py-6 shadow-sm md:hidden">
            <nav className="flex flex-col space-y-6 text-sm font-bold tracking-widest text-gray-800">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="transition-opacity hover:opacity-50"
                  onClick={() => setIsMobileMenuOpen(false)} // 링크 클릭 시 메뉴 닫기
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(name) => {
            setLogin(name);
          }}
        />
      )}
    </>
  );
}
