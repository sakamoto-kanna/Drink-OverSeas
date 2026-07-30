"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-6 py-20 md:py-32">
        {/* 1. Hero Section */}
        <section className="mb-24 text-center md:mb-40">
          <h1 className="font-yeongwol mb-6 text-4xl font-light tracking-tighter uppercase md:text-6xl">
            Taste The World's Refreshment.
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
            각 국 마다 콜라맛이 다르다는 사실 아시나요?
            <br className="hidden md:block" />
            지구 반대편 누군가의 일상을 채우는 달콤하고 톡 쏘는 로컬 소다들을
            당신의 방 안으로 배달합니다.
          </p>
        </section>

        {/* 2. 메인 브랜드 이미지 (크래프트 소다/탄산음료 무드) */}
        <section className="mb-24 md:mb-40">
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1600"
              alt="Colorful craft sodas and sparkling drinks"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </section>

        {/* 3. Brand Story 영역 (텍스트와 이미지 교차 배치) */}
        <section className="mb-24 flex flex-col gap-12 md:mb-40 md:flex-row md:items-center md:gap-20">
          <div className="flex-1 space-y-6">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
              Our Mission
            </h2>
            <h3 className="text-2xl leading-snug font-light md:text-4xl">
              국경을 넘나드는 <br />
              짜릿한 미각 탐험.
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              멕시코 길거리의 강렬한 하마이카(히비스커스) 소다부터, 영국
              할머니의 레시피로 만든 알싸한 진저 비어, 이탈리아 지중해의 햇살을
              듬뿍 머금은 레몬 스파클링 워터까지.
              <br />
              <br />
              Drink OverSeas의 큐레이터들은 여권에 도장을 찍듯 세계 곳곳의
              숨겨진 로컬 소프트 드링크들을 찾아 나섭니다. 인공 향료로 흉내 낸
              맛이 아닌, 그 지역의 문화와 천연 재료가 빚어낸 진짜 '오리지널
              캔'을 가장 신선한 상태로 전달하는 것. 그것이 우리의 유일한
              타협점입니다.
            </p>
          </div>
          <div className="aspect-\[4\/5\] flex-1 overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=800"
              alt="Refreshing cold beverage with ice"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* 4. Core Values (소프트 드링크에 맞춘 3가지 철학) */}
        <section className="mb-24 md:mb-40">
          <h2 className="mb-12 text-center text-sm font-bold tracking-widest text-gray-400 uppercase">
            Our Philosophy
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {/* Value 1 */}
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 text-xs font-bold tracking-widest text-black uppercase">
                01. Local Curation
              </span>
              <p className="text-sm text-gray-500">
                편의점에서는 절대 구할 수 없는, 각 지역 주민들의 사랑을 받는
                유니크한 크래프트 음료들을 엄선합니다.
              </p>
            </div>
            {/* Value 2 */}
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 text-xs font-bold tracking-widest text-black uppercase">
                02. Original Ingredients
              </span>
              <p className="text-sm text-gray-500">
                흔한 시럽 맛을 배제하고, 그 나라의 고유한 과일, 허브, 천연
                탄산이 주는 본연의 다채로운 풍미에 집중합니다.
              </p>
            </div>
            {/* Value 3 */}
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 text-xs font-bold tracking-widest text-black uppercase">
                03. Refreshing Escape
              </span>
              <p className="text-sm text-gray-500">
                낯선 나라의 음료 캔을 '따악' 따는 그 경쾌한 순간, 지루했던
                당신의 일상에 새로운 영감과 청량감을 채웁니다.
              </p>
            </div>
          </div>
        </section>

        {/* 5. CTA (Call To Action) */}
        <section className="flex flex-col items-center border-t border-gray-100 pt-20 text-center">
          <h2 className="mb-8 text-2xl font-light">
            당신의 갈증을 채워줄 새로운 맛을 찾아보세요.
          </h2>
          <button
            onClick={() => router.push("/")}
            className="border border-black bg-black px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
          >
            Start Exploring
          </button>
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
