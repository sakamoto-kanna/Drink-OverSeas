"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // 💡 주의: Zustand 스토어에 setCart(전체 덮어쓰기) 함수가 없다면 추가해주셔야 합니다!
  const { cartItems, setCart } = useCartStore();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // 🚀 1. 두 개의 API를 동시에 병렬로 호출합니다 (속도 향상!)
        const [productsRes, cartRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/cart"),
        ]);

        const productsData = await productsRes.json();

        // 🚀 2. 비회원(401)인 경우: DB 조회 없이 브라우저(Zustand) 상태를 그대로 사용합니다.
        if (!cartRes.ok) {
          setIsLoading(false);
          return;
        }

        const cartData = await cartRes.json();

        // 🚀 3. 두 API가 모두 성공적으로 데이터를 가져왔다면 조립(Merge) 시작!
        if (productsData.success && cartData.success) {
          const allProducts = productsData.data;
          const dbCart = cartData.data;

          if (dbCart.length > 0) {
            // DB의 장바구니 내역(상품ID)을 전체 상품 목록과 짝지어 줍니다.
            const mergedCart = dbCart
              .map((dbItem: { product_id: number; quantity: number }) => {
                const productInfo = allProducts.find(
                  (p: any) => p.id === dbItem.product_id,
                );
                return {
                  ...productInfo, // 이미지, 이름, 가격 등
                  quantity: dbItem.quantity, // DB에 기록된 최신 수량
                };
              })
              .filter((item: any) => item.id !== undefined); // 혹시 삭제된 상품이 있다면 걸러냅니다.

            // 🚀 4. 완성된 데이터를 Zustand 스토어에 통째로 밀어넣어 줍니다.
            if (setCart) {
              setCart(mergedCart);
            }
          }
        }
      } catch (error) {
        console.error("장바구니 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false); // 로딩 끝
      }
    };

    fetchCartData();
  }, [setCart]);

  // 총 결제 금액 계산
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="mb-10 text-3xl font-light md:text-4xl">Your Cart</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-lg text-gray-400">
            장바구니를 불러오는 중입니다...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-6 text-gray-500">장바구니가 비어 있습니다.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#1A1A1A] px-8 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* 왼쪽: 상품 리스트 */}
            <div className="flex-1 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-6 border-b border-gray-100 pb-6"
                >
                  <div className="h-24 w-20 flex-shrink-0 bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.price.toLocaleString()}원
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    수량: {item.quantity}개
                  </div>
                </div>
              ))}
            </div>

            {/* 오른쪽: 결제 요약 카드 */}
            <div className="h-fit w-full bg-gray-50 p-6 lg:w-80">
              <h2 className="mb-6 text-lg font-medium">Order Summary</h2>
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-gray-600">상품 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="mb-6 flex justify-between text-sm">
                <span className="text-gray-600">배송비</span>
                <span>무료</span>
              </div>
              <div className="mb-8 flex justify-between border-t border-gray-200 pt-4 text-base font-bold">
                <span>총 결제 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              <button className="w-full bg-[#1A1A1A] py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800">
                결제하기
              </button>
            </div>
          </div>
        )}
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
