'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  InformationCircleIcon,
  BriefcaseIcon,
  ChatBubbleLeftEllipsisIcon,
  NewspaperIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function Header() {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const leftNavItems = [
    { id: 'menu-intro', label: 'THỰC ĐƠN', icon: HomeIcon, href: '/menu-intro' },
    { id: 'about', label: 'VỀ BEFOOD', icon: InformationCircleIcon, href: '/about' },
    { id: 'careers', label: 'NGHỀ NGHIỆP', icon: BriefcaseIcon, href: '/careers' },
    { id: 'contact', label: 'HỖ TRỢ', icon: ChatBubbleLeftEllipsisIcon, href: '/contact' },
  ];

  const rightNavItems = [
    { id: 'news', label: 'TIN TỨC', icon: NewspaperIcon, href: '/news' },
    { id: 'stores', label: 'CỬA HÀNG', icon: MapPinIcon, href: '/stores' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="mx-auto flex h-[90px] w-full max-w-[1440px] items-center justify-between px-2 sm:px-6 lg:px-8 relative">
        {/* LEFT NAV */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <nav className="hidden lg:flex items-center justify-start gap-0.5 xl:gap-1.5">
            {leftNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.id}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] font-black'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black font-bold'
                  }`}
                >
                  <span className="text-[11px] xl:text-[13px] uppercase tracking-wider whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CENTER LOGO */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center justify-center z-10 px-2 transition-transform hover:scale-105 active:scale-95 duration-200"
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tighter text-[#1a1a1a]">
            be<span className="text-[var(--color-primary)]">Food</span>
          </span>
        </Link>

        {/* RIGHT NAV */}
        <div className="flex-1 flex items-center justify-end min-w-0">
          <div className="hidden lg:flex items-center justify-end gap-1 xl:gap-2">
            {rightNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.id}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] font-black'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black font-bold'
                  }`}
                >
                  <span className="text-[11px] xl:text-[13px] uppercase tracking-wider whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Language Switcher Mock */}
            <div className="flex items-center gap-1.5 mx-1.5 bg-gray-100 p-1 rounded-lg">
              <button
                className="p-1 rounded transition-all cursor-pointer bg-white shadow-xs scale-105"
                title="Tiếng Việt"
              >
                <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="h-[14px] w-[20px] object-cover rounded-[2px] block" />
              </button>
              <button
                className="p-1 rounded transition-all cursor-pointer opacity-60 hover:opacity-100"
                title="English"
              >
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-[14px] w-[20px] object-cover rounded-[2px] block" />
              </button>
            </div>

            {/* ORDER CTA */}
            <Link
              href="/order"
              className="group flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-black uppercase tracking-wider text-black shadow-sm transition-all duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-md active:scale-95 cursor-pointer ml-1"
            >
              <span>ĐẶT HÀNG</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 transition-transform duration-200 group-hover:translate-x-1 text-black">
                <ArrowRightIcon className="h-3 w-3 stroke-[3]" />
              </span>
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center gap-2 lg:hidden ml-2">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              {showMobileMenu ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
