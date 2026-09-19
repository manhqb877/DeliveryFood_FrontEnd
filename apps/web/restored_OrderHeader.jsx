'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, PhoneIcon, UserCircleIcon, Bars3Icon, ShoppingCartIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function OrderHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`w-full bg-white flex items-center px-4 lg:px-6 sticky top-0 z-[60] shadow-sm gap-4 border-b border-gray-100 relative transition-all duration-300 ${isScrolled ? 'h-[64px]' : 'h-[84px]'}`}>
        
        {/* Logo or Hamburger Menu depending on Scroll */}
        <div className="flex items-center h-full relative">
          
          <div className={`flex items-center transition-all duration-300 absolute left-0 h-full ${isScrolled ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
            <button type="button" className="group flex items-center gap-3 cursor-pointer w-full relative h-full select-none bg-transparent border-0">
              <Bars3Icon className="w-6 h-6 text-gray-800 shrink-0" />
              <span className="text-[15px] font-bold text-[#333333] hidden sm:block whitespace-nowrap">Danh mục sản phẩm</span>
            </button>
          </div>
          
          <div className={`flex-shrink-0 h-full flex items-center lg:ml-6 lg:w-[260px] transition-all duration-300 absolute left-0 ${!isScrolled ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-black tracking-tighter text-[#1a1a1a]">
                be<span className="text-[var(--color-primary)]">Food</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Spacer to push things right based on logo width */}
        <div className="w-[100px] lg:w-[260px] h-full invisible"></div>

        {/* Search */}
        <div className="flex-1 max-w-[500px] hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo sản phẩm..."
              className="w-full bg-[#f3f4f6] rounded-[20px] pl-6 pr-12 py-2 text-[13px] text-gray-700 outline-none focus:ring-1 focus:ring-gray-300 transition-all border border-gray-200"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-[var(--color-primary)]/20 rounded-full text-[var(--color-primary-dark)] shadow-sm hover:bg-[var(--color-primary)] hover:text-black transition-colors z-10">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 font-bold" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 lg:gap-6 ml-auto mr-0 lg:mr-8">
          
          {/* Language Switchers */}
          <div className="hidden md:flex items-center gap-2">
            <button type="button" className="transition-all hover:scale-110 ring-2 ring-gray-200 opacity-100 rounded-[2px]">
              <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="h-[20px] rounded-[2px] shadow-sm w-auto block" />
            </button>
            <button type="button" className="transition-all hover:scale-110 opacity-40 hover:opacity-100">
              <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-[20px] rounded-[2px] shadow-sm w-auto block" />
            </button>
          </div>

          {/* Hotline */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">Giao tận nơi</span>
              <span className="text-[14px] font-black text-gray-800 leading-tight">1900 1755</span>
            </div>
          </div>

          {/* User Account */}
          <Link href="/login" className="flex items-center gap-2 group relative cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 group-hover:bg-gray-100 transition-colors">
              <UserCircleIcon className="w-5 h-5" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[11px] text-gray-700 font-bold leading-tight">Tài khoản</span>
              <span className="text-[11px] font-normal text-gray-500 leading-tight">Đăng nhập</span>
            </div>
          </Link>

          {/* Track Order Button (Header) - Only show when NOT scrolled maybe? Or always? */}
          <Link
            href="#"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full hover:border-[var(--color-primary)] text-gray-700 hover:text-[var(--color-primary-dark)] font-bold text-[13px] transition-all bg-white h-[36px] cursor-pointer shadow-sm group"
          >
            <TruckIcon className="w-4 h-4 transition-transform" />
            <span>Tra cứu đơn</span>
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:border-[var(--color-primary)] transition-colors bg-white h-[36px] cursor-pointer shadow-sm group"
          >
            <ShoppingCartIcon className="w-4 h-4 text-gray-700 group-hover:text-[var(--color-primary-dark)] transition-colors" />
            <span className="text-[13px] font-bold text-[#1a1a1a] hidden sm:inline">Giỏ hàng</span>
            <span className="bg-gray-100 group-hover:bg-[var(--color-primary)] text-gray-800 group-hover:text-black text-[12px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center transition-colors">
              0
            </span>
          </Link>

        </div>
      </header>

      {/* FULL WIDTH YELLOW BAR */}
      <div className="w-full h-[50px] bg-[var(--color-primary)] border-b border-[var(--color-primary-dark)] relative z-20">
        <div className="mx-auto flex h-full w-full max-w-[1440px] px-4 lg:px-8 items-center gap-6 lg:gap-8">
          
          {/* Categories Header */}
          <div className="hidden lg:flex h-full w-[260px] shrink-0 items-center bg-white px-6 select-none relative cursor-pointer group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-primary-dark)]"></div>
            <div className="w-5 flex flex-col gap-[3px] mr-3">
              <span className="w-full h-[2px] bg-black block"></span>
              <span className="w-full h-[2px] bg-black block"></span>
              <span className="w-full h-[2px] bg-black block"></span>
            </div>
            <span className="text-[14px] font-bold text-black capitalize">Danh mục sản phẩm</span>
          </div>

          <Link href="#" className="flex items-center text-black hover:opacity-80 transition-opacity">
            <span className="text-[13px] font-bold">Chính sách đặt hàng</span>
          </Link>
          
          <Link href="#" className="flex items-center text-black hover:opacity-80 transition-opacity">
            <span className="text-[13px] font-bold">Liên hệ</span>
          </Link>

        </div>
      </div>
    </>
  );
}
