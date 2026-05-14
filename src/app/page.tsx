// app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
// ✨ 방금 분리한 Header 컴포넌트를 불러옵니다. ✨
// (만약 components 폴더 경로가 다르면 '../components/Header' 등으로 맞춰주세요)
import Header from '../components/Header'; 

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
    <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <h3 className="text-sm md:text-base font-normal text-gray-800 mb-1">{product.name}</h3>
    <p className="text-sm font-medium text-gray-900">{product.price.toLocaleString()}원</p>
  </div>
);

export default function ShoppingApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProducts(json.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로딩 실패:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-gray-200">
      
      {/* 💡 Header 코드가 단 한 줄로 깔끔해졌습니다! */}
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light leading-snug md:leading-tight mb-10 font-yeongwol">
              The World's Flavors, Ready to Drink.<br />
              Enjoy Your Selection At Home
            </h2>
          </div>
        </section>

        {/* Product Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-gray-400 font-yeongwol text-lg">
              상품을 불러오는 중입니다...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-gray-400 uppercase">
          <p>© 2026 Drink OverSeas. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#">Instagram</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}