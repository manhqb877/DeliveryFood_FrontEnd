'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TagIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/menu/ProductCard';
import { MOCK_MENU } from '@/lib/mockData';

// Giả lập Dữ liệu tương tự tham chiếu
const parentCats = [
  { ma_danh_muc: 'all', ten_danh_muc: 'Tất cả' },
  { ma_danh_muc: 'CF', ten_danh_muc: 'Cà phê' },
  { ma_danh_muc: 'TR', ten_danh_muc: 'Trà' },
  { ma_danh_muc: 'DX', ten_danh_muc: 'Đá xay' },
  { ma_danh_muc: 'BN', ten_danh_muc: 'Bánh ngọt' }
];

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="flex w-full mx-auto max-w-[1440px] px-4 lg:px-8 relative bg-white pb-10 pt-6">
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="w-full bg-white">
          
          {/* Hero Banner & Category Menu Area */}
          <div className="w-full mb-10 flex flex-col lg:flex-row items-stretch gap-8">
            
            {/* LEFT SIDEBAR (Category Menu Desktop) */}
            <div className="hidden lg:flex flex-col w-[260px] flex-shrink-0 z-10 bg-white shadow-sm border-l border-r border-b border-gray-100 rounded-b-2xl overflow-hidden pb-2">
              <ul className="w-full flex flex-col flex-1 overflow-y-auto no-scrollbar">
                {parentCats.map(cat => (
                  <li key={cat.ma_danh_muc} className="w-full">
                    <button 
                      onClick={() => setActiveCategory(cat.ma_danh_muc)}
                      className={`w-full flex items-center justify-between px-6 py-3.5 transition-all cursor-pointer border-l-4 ${activeCategory === cat.ma_danh_muc ? 'bg-yellow-50 text-[var(--color-hc-red)] font-bold border-[var(--color-hc-red)]' : 'bg-white text-gray-700 font-medium border-transparent hover:bg-gray-50'}`}
                    >
                      <span>{cat.ten_danh_muc}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* HERO BANNER */}
            <div className="flex-1 min-w-0 flex pt-4 lg:pt-0">
              <div className="w-full rounded-2xl overflow-hidden aspect-[21/9] bg-gray-100 relative">
                <img src="https://images2.thanhnien.vn/528068263637045248/2023/4/25/befood-1-16824114185821661157066.jpg" alt="beFood Banner" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Vouchers Section */}
          <div className="mb-5 w-full bg-gradient-to-r from-yellow-50/60 via-amber-50/40 to-white rounded-2xl border border-gray-100 p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--color-hc-red)]/10 flex items-center justify-center text-[var(--color-hc-red)]">
                  <TagIcon className="w-3.5 h-3.5 text-[var(--color-hc-red)]" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">Khuyến mãi cho bạn</h3>
              </div>
              <button className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors cursor-pointer">
                <SparklesIcon className="w-3 h-3 text-amber-500" /> Săn thêm mã giảm giá
              </button>
            </div>
            <div className="flex overflow-x-auto gap-2.5 pb-1 custom-scrollbar">
              {/* Mock Voucher */}
              <div className="min-w-[280px] bg-white rounded-xl border border-yellow-100 p-3 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  20K
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Giảm 20K cho đơn từ 100K</h4>
                  <p className="text-xs text-gray-500 mt-1">Hết hạn: 30/12/2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Recommendation */}
          <div className="mb-10 w-full">
            <div className="bg-white rounded-3xl border border-rose-100 p-6 md:p-8 shadow-2xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100/80 mb-2">
                    <SparklesIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    SMART RECOMMENDATION
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 font-sans">
                    Top 5 món yêu thích
                  </h2>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {MOCK_MENU.slice(0, 5).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>

          {/* Product Categories Grids (Vertical Stack) */}
          <div className="flex flex-col gap-12 mt-6">
            {parentCats.filter(cat => cat.ma_danh_muc !== 'all').map(cat => (
              <section key={cat.ma_danh_muc} id={`category-${cat.ma_danh_muc}`} className="scroll-mt-[100px]">
                <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3.5 mb-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-7 rounded-full bg-[var(--color-hc-red)] shrink-0 shadow-2xs"></div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase font-sans tracking-wide">
                      {cat.ten_danh_muc}
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                  {/* For mock, duplicate some products per category */}
                  {MOCK_MENU.map((product, idx) => (
                    <ProductCard key={`${cat.ma_danh_muc}-${idx}`} product={{ ...product, id: `${cat.ma_danh_muc}-${idx}` }} />
                  ))}
                </div>
              </section>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
