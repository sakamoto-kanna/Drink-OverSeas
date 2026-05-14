"use client";

import React, { useState, useEffect } from 'react';

const NAV_ITEMS = ['SHOP', 'ABOUT', 'NOTICE', 'CONTACT'];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // 🌟 [추가됨] 화면이 처음 켜질 때(새로고침 시) 로그인 상태인지 쿠키를 검사합니다.
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserName(data.user.name); // 이름 복구 완료!
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        setUserName(data.user.name);
        setShowLoginModal(false);
        setLoginId('');
        setPassword('');
        alert(`${data.user.name}님 환영합니다! ☕`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setUserName('');
    alert("로그아웃 되었습니다.");
  };

  return (
    <>
      <header className="w-full bg-[#FDFCFB]">
        {/* Desktop Navigation */}
        <div className="max-w-7xl mx-auto px-6 h-20 hidden md:flex items-center justify-between">
          <a href="/" className="flex-shrink-0 flex items-center cursor-pointer">
            <img src="/DOS.png" alt="DOS Logo" className="h-12 w-auto object-contain" />
          </a>

          <nav className="flex items-center text-sm font-medium tracking-widest text-gray-800">
            <div className="flex items-center gap-x-10">
              {NAV_ITEMS.map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:opacity-50 transition-opacity">
                  {item}
                </a>
              ))}
            </div>
            
            <div className="h-3 w-px bg-gray-300 ml-18 mr-8"></div>
            
            <div className="flex items-center gap-x-8">
              <button className="hover:opacity-50 transition-opacity flex items-center justify-center">
                <i className="fa-solid fa-magnifying-glass text-lg"></i>
              </button>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-x-4 w-auto min-w-[64px] justify-center">
                  <a href="#mypage" className="hover:opacity-50 transition-opacity font-bold uppercase text-[#1A1A1A]">
                    {userName}
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="text-[10px] text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="hover:opacity-50 transition-opacity w-16 text-center uppercase"
                >
                  LOGIN
                </button>
              )}

              <button className="hover:opacity-50 transition-opacity relative flex items-center justify-center">
                <i className="fa-solid fa-bag-shopping text-lg"></i>
                <span className="absolute -top-1.5 -right-2.5 bg-[#1A1A1A] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold font-sans tracking-normal">
                  0
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Header Top */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-gray-100 text-gray-800">
          <button className="text-xl w-8 text-left hover:opacity-50"><i className="fa-solid fa-bars"></i></button>
          <h1 className="text-lg font-bold tracking-tighter uppercase">DOS</h1>
          
          <div className="flex items-center space-x-4 w-auto justify-end">

            {isLoggedIn ? (
              <>
                <a href="#mypage" className="text-[10px] font-bold tracking-widest hover:opacity-50 uppercase text-black">
                  {userName}
                </a>
                <button onClick={handleLogout} className="text-[10px] font-medium tracking-widest hover:opacity-50 text-gray-400">
                  LOGOUT
                </button>
              </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="text-[10px] font-medium tracking-widest hover:opacity-50">
                LOGIN
              </button>
            )}
            <button className="text-lg relative hover:opacity-50 flex items-center">
              <i className="fa-solid fa-bag-shopping"></i>
              <span className="absolute -top-1 -right-2 bg-[#1A1A1A] text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full font-bold font-sans tracking-normal">0</span>
            </button>
          </div>
        </div>

        {/* Mobile Grid Menu */}
        <div className="md:hidden grid grid-cols-3 border-b border-gray-200 text-center text-xs font-semibold tracking-widest text-gray-500">
          {NAV_ITEMS.map((item, idx) => (
            <div key={item} className={`py-4 border-r border-gray-200 ${idx > 2 ? '' : 'border-b'}`}>
              {item}
            </div>
          ))}
          <div className="py-4 border-b border-gray-200 border-r"></div>
          <div className="py-4 border-b border-gray-200"></div>
        </div>
      </header>

      {/* --- 로그인 팝업(모달) UI --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white p-10 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <h2 className="text-2xl font-bold tracking-tighter text-center mb-8 uppercase">Login</h2>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-2 uppercase">ID</label>
                <input 
                  type="text" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest text-gray-500 mb-2 uppercase">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white mt-4 py-4 text-sm tracking-[0.2em] font-bold hover:bg-black/80 transition-colors uppercase"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}