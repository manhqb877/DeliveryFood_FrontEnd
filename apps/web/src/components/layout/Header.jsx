'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Info,
  Briefcase,
  Headset,
  Newspaper,
  Storefront,
  List,
  X,
  ArrowRight,
} from "@phosphor-icons/react";
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const leftNavItems = [
    { id: 'about', labelKey: 'nav_about', defaultLabel: 'VỀ BEFOOD', icon: Info, href: '/about' },
    { id: 'careers', labelKey: 'nav_careers', defaultLabel: 'NGHỀ NGHIỆP', icon: Briefcase, href: '/careers' },
    { id: 'support', labelKey: 'nav_support', defaultLabel: 'HỖ TRỢ', icon: Headset, href: '/support' },
  ];

  const rightNavItems = [
    { id: 'news', labelKey: 'nav_news', defaultLabel: 'TIN TỨC', icon: Newspaper, href: '/news' },
    { id: 'stores', labelKey: 'nav_stores', defaultLabel: 'CỬA HÀNG', icon: Storefront, href: '/stores' },
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
                  <span
                    suppressHydrationWarning
                    className="text-[11px] xl:text-[13px] uppercase tracking-wider whitespace-nowrap"
                  >
                    {t(item.labelKey, item.defaultLabel)}
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
                  <span
                    suppressHydrationWarning
                    className="text-[11px] xl:text-[13px] uppercase tracking-wider whitespace-nowrap"
                  >
                    {t(item.labelKey, item.defaultLabel)}
                  </span>
                </Link>
              );
            })}

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 mx-1.5 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`p-1 rounded transition-all cursor-pointer ${
                  language === 'vi' ? 'bg-white shadow-xs scale-105 opacity-100 ring-2 ring-amber-400' : 'opacity-50 hover:opacity-100'
                }`}
                title="Tiếng Việt"
              >
                <img
                  src="https://flagcdn.com/w40/vn.png"
                  alt="VN"
                  className="h-[14px] w-[20px] object-cover rounded-[2px] block"
                />
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-1 rounded transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white shadow-xs scale-105 opacity-100 ring-2 ring-amber-400' : 'opacity-50 hover:opacity-100'
                }`}
                title="English"
              >
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="EN"
                  className="h-[14px] w-[20px] object-cover rounded-[2px] block"
                />
              </button>
            </div>

            {/* ORDER CTA */}
            <Link
              href="/order"
              className="group flex items-center gap-2.5 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-black uppercase tracking-wider text-black shadow-sm transition-all duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-md active:scale-95 cursor-pointer ml-1"
            >
              <span suppressHydrationWarning>{t('nav_order_now', 'ĐẶT HÀNG')}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 transition-transform duration-200 group-hover:translate-x-1 text-black">
                <ArrowRight size={13} weight="bold" />
              </span>
            </Link>
          </div>

          {/* MOBILE TOGGLE & LANGUAGE */}
          <div className="flex items-center gap-2 lg:hidden ml-2">
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`p-0.5 rounded ${language === 'vi' ? 'bg-white shadow-xs' : 'opacity-50'}`}
              >
                <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="h-[12px] w-[18px] object-cover rounded-[1px]" />
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-0.5 rounded ${language === 'en' ? 'bg-white shadow-xs' : 'opacity-50'}`}
              >
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-[12px] w-[18px] object-cover rounded-[1px]" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              {showMobileMenu ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg">
          {[...leftNavItems, ...rightNavItems].map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-gray-700 font-bold hover:bg-amber-50 hover:text-black transition-colors"
            >
              <span suppressHydrationWarning>{t(item.labelKey, item.defaultLabel)}</span>
            </Link>
          ))}
          <Link
            href="/order"
            onClick={() => setShowMobileMenu(false)}
            className="block text-center mt-3 bg-[var(--color-primary)] text-black font-black py-2.5 rounded-xl uppercase tracking-wider"
          >
            <span suppressHydrationWarning>{t('nav_order_now', 'ĐẶT HÀNG')}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
