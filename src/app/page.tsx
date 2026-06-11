// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

// --- Components ---
const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="group cursor-pointer text-center">
    <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <h3 className="mb-1 text-sm font-normal text-gray-800 md:text-base">
      {product.name}
    </h3>
    <p className="text-sm font-medium text-gray-900">
      {product.price.toLocaleString()}원
    </p>
  </div>
);

export default function ShoppingApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
                <ProductCard key={product.id} product={product} />
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
