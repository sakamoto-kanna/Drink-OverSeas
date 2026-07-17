"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

// 추후 전역 상태로 분리할 장바구니 상품 아이템 타입 정의
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
}

export default function CartPage() {
  const router = useRouter();

  const { cartItems, updateQuantity, removeFromCart } = useCartStore();

  // 금액 계산 로직
  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFee = subTotal >= 50000 || subTotal === 0 ? 0 : 3000;
  const totalAmount = subTotal + shippingFee;

  return (
    <div className="flex min-h-screen justify-center bg-[#FDFCFB] px-4 py-4 text-black">
      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="group mb-8 flex w-fit items-center text-xs font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-black"
        >
          <i className="fa-solid fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
          Back to Home
        </Link>
        {/* 상단 타이틀 */}
        <h1 className="mb-12 text-3xl font-bold tracking-tighter uppercase">
          Shopping Bag
        </h1>

        {cartItems.length === 0 ? (
          /* 장바구니가 비었을 때의 UI */
          <div className="flex flex-col items-center justify-center border border-gray-100 bg-white py-32 shadow-sm">
            <p className="mb-6 text-sm tracking-wider text-gray-400">
              장바구니가 비어 있습니다.
            </p>
            <Link
              href="/"
              className="border border-black bg-black px-6 py-3 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
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
                  key={item.id}
                  className="relative flex flex-col items-center gap-4 border border-gray-100 bg-white p-6 shadow-sm md:grid md:grid-cols-12"
                >
                  {/* 상품 정보 (이미지, 이름, 설명) */}
                  <div className="flex w-full items-center gap-4 md:col-span-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 border border-gray-100 bg-gray-50 object-cover"
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
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 w-fit text-left text-[10px] font-bold tracking-wider text-red-400 uppercase hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* 수량 조절 버튼 */}
                  <div className="mt-4 flex w-full items-center justify-between md:col-span-3 md:mt-0 md:justify-center">
                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase md:hidden">
                      Quantity
                    </span>
                    <div className="flex items-center border border-gray-200 bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
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

            {/* 오른쪽: 최종 결제 정보 요약 주문 영역 */}
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
    </div>
  );
}
