"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { cartItems, setCart, removeFromCart, updateQuantity } = useCartStore();

  // ==========================================
  // 기존 로직 유지: 장바구니 데이터 동기화
  // ==========================================
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const [productsRes, cartRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/cart"),
        ]);

        const productsData = (await productsRes.json()) as {
          success: boolean;
          data: any[];
        };

        if (!cartRes.ok) {
          setIsLoading(false);
          return;
        }

        const cartData = (await cartRes.json()) as {
          success: boolean;
          data: { product_id: number; quantity: number }[];
        };

        if (productsData.success && cartData.success) {
          const allProducts = productsData.data;
          const dbCart = cartData.data;

          if (dbCart.length > 0) {
            const mergedCart = dbCart
              .map((dbItem: { product_id: number; quantity: number }) => {
                const productInfo = allProducts.find(
                  (p: any) => p.id === dbItem.product_id,
                );
                return {
                  ...productInfo,
                  quantity: dbItem.quantity,
                };
              })
              .filter((item: any) => item.id !== undefined);

            if (setCart) {
              setCart(mergedCart);
            }
          }
        }
      } catch (error) {
        console.error("장바구니 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [setCart]);

  //수량 조절 + DB 업데이트 핸들러
  const handleQuantityUpdate = async (
    id: number,
    delta: number,
    currentQuantity: number,
  ) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return; // 수량이 1 미만으로는 내려가지 않도록 방어

    // 1. (Optimistic UI) 유저가 기다리지 않게 브라우저(Zustand) 숫자를 즉시 바꿉니다.
    updateQuantity(id, delta);

    try {
      // 2. 백엔드(DB)에 몰래 최종 수량을 알려줍니다.
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          quantity: newQuantity,
        }),
      });
    } catch (error) {
      console.error("수량 업데이트 API 통신 에러:", error);
    }
  };
  // ==========================================
  // 결제 금액 계산 로직 (이전 UI 버전 복구)
  // ==========================================
  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFee = subTotal >= 50000 || subTotal === 0 ? 0 : 3000;
  const totalAmount = subTotal + shippingFee;

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main className="flex justify-center px-4 py-20 text-black">
        <div className="w-full max-w-5xl">
          {/* 쇼핑 계속하기 버튼 */}
          <div className="pb-4">
            <button
              onClick={() => router.push("/")}
              className="group flex items-center text-xs font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-black"
            >
              <i className="fa-solid fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
              Continue Shopping
            </button>
          </div>
          {/* 상단 타이틀 */}
          <h1 className="mb-12 text-3xl font-bold tracking-tighter uppercase">
            Shopping Bag
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-32 text-lg text-gray-400">
              장바구니를 불러오는 중입니다...
            </div>
          ) : cartItems.length === 0 ? (
            /* 장바구니가 비었을 때의 UI */
            <div className="flex flex-col items-center justify-center border border-gray-100 bg-white py-32 shadow-sm">
              <p className="mb-6 text-sm tracking-wider text-gray-400">
                장바구니가 비어 있습니다.
              </p>
              <button
                onClick={() => router.push("/")}
                className="border border-black bg-black px-6 py-3 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* 장바구니 상품이 존재할 때의 UI */
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              {/* 왼쪽: 상품 리스트 영역 */}
              <div className="space-y-4 lg:col-span-2">
                <div className="hidden gap-4 border-b border-gray-200 pb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase md:grid md:grid-cols-12">
                  <div className="md:col-span-6">Product Details</div>
                  <div className="text-center md:col-span-3">Quantity</div>
                  <div className="text-right md:col-span-3">Price</div>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={`cart-item-${item.id}`}
                    className="relative flex flex-col items-center gap-4 border border-gray-100 bg-white p-6 shadow-sm md:grid md:grid-cols-12"
                  >
                    {/* 상품 정보 (이미지, 이름, 설명) */}
                    <div className="flex w-full items-center gap-4 md:col-span-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 border border-gray-100 bg-gray-50 object-cover object-center"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="mt-1 text-xs text-gray-400">
                            {item.description}
                          </span>
                        )}

                        {/* 삭제 로직이 연결된 Remove 버튼 */}
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "장바구니에서 해당 상품을 삭제하시겠습니까?",
                              )
                            )
                              return;

                            removeFromCart(item.id);
                            try {
                              const response = await fetch(
                                `/api/cart?product_id=${item.id}`,
                                {
                                  method: "DELETE",
                                },
                              );
                              if (!response.ok && response.status !== 401) {
                                console.error(
                                  "DB에서 상품을 삭제하는데 실패했습니다.",
                                );
                              }
                            } catch (error) {
                              console.error("삭제 API 네트워크 에러:", error);
                            }
                          }}
                          className="mt-2 w-fit text-left text-[10px] font-bold tracking-wider text-red-400 uppercase hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* 수량 조절 버튼 (Zustand 스토어 로직 연결) */}
                    <div className="mt-4 flex w-full items-center justify-between md:col-span-3 md:mt-0 md:justify-center">
                      <span className="text-xs font-bold tracking-wider text-gray-400 uppercase md:hidden">
                        Quantity
                      </span>
                      <div className="flex items-center border border-gray-200 bg-white">
                        <button
                          onClick={() =>
                            handleQuantityUpdate(item.id, -1, item.quantity)
                          }
                          className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityUpdate(item.id, 1, item.quantity)
                          }
                          className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 가격 표시 */}
                    <div className="mt-2 flex w-full items-center justify-between md:col-span-3 md:mt-0 md:justify-end md:text-right">
                      <span className="text-xs font-bold tracking-wider text-gray-400 uppercase md:hidden">
                        Total
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 오른쪽: 최종 결제 정보 요약 영역 */}
              <div className="h-fit border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="mb-6 border-b border-gray-200 pb-4 text-sm font-bold tracking-widest text-gray-800 uppercase">
                  Order Summary
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>상품 합계 금액</span>
                    <span>{subTotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>배송비</span>
                    <span>
                      {shippingFee === 0
                        ? "무료"
                        : `${shippingFee.toLocaleString()}원`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-right text-[10px] text-gray-400">
                      50,000원 이상 구매 시 무료배송
                    </p>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
                    <span>최종 결제 금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                  </div>
                </div>

                <button
                  onClick={() => alert("주문 프로세스 단계로 이동합니다.")}
                  className="mt-8 w-full bg-black py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
                >
                  Proceed To Checkout
                </button>
              </div>
            </div>
          )}
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
