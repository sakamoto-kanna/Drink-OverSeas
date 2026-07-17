// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useCartStore } from "@/store/useCartStore";

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

// --- Components ---
const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (product: Product) => void;
}> = ({ product, onAddToCart }) => (
  <div className="group text-center">
    <div className="mb-4 aspect-[4/5] cursor-pointer overflow-hidden bg-gray-100">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <h3 className="mb-1 text-sm font-normal text-gray-800 md:text-base">
      {product.name}
    </h3>
    <p className="mb-4 text-sm font-medium text-gray-900">
      {product.price.toLocaleString()}원
    </p>

    {/*장바구니 담기 버튼 */}
    <button
      onClick={() => onAddToCart(product)}
      className="w-full bg-[#1A1A1A] py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
    >
      Add to Cart
    </button>
  </div>
);
export default function ShoppingApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { addToCart } = useCartStore();

  // 장바구니 담기 버튼을 눌렀을 때 실행될 함수
  const handleAddToCart = (drink: any) => {
    // 1. 스토어의 addToCart 함수에 상품 정보와 기본 수량(1)을 묶어서 보냅니다.
    addToCart({
      id: drink.id,
      name: drink.name,
      price: drink.price,
      image: drink.image,
      description: drink.description,
      quantity: 1, // 처음 담을 때는 무조건 1개!
    });

    // 2. 사용자에게 알림을 띄웁니다.
    if (
      window.confirm(
        `${drink.name}이(가) 장바구니에 담겼습니다!\n장바구니로 이동하시겠습니까?`,
      )
    ) {
      router.push("/cart");
    }
  };
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        const responseData = json as {
          success: boolean;
          data: any[];
        };

        if (responseData.success) {
          setProducts(responseData.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로딩 실패:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1A1A] selection:bg-gray-200">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="px-6 py-10 text-center md:py-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-yeongwol mb-10 text-2xl leading-snug font-light md:text-5xl md:leading-tight">
              The World's Flavors, Ready to Drink.
              <br />
              Enjoy Your Selection At Home
            </h2>
          </div>
        </section>

        {/* Product Grid */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          {isLoading ? (
            <div className="font-yeongwol flex items-center justify-center py-20 text-lg text-gray-400">
              상품을 불러오는 중입니다...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
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
