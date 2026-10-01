'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp, PhoneCall, ChatCircleDots } from "@phosphor-icons/react";

export default function CustomerFloatingButtons() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleUnreadUpdate = (e) => {
      if (typeof e.detail === 'number') {
        setUnreadCount(e.detail);
      }
    };
    window.addEventListener('chat-unread-count-updated', handleUnreadUpdate);
    return () => window.removeEventListener('chat-unread-count-updated', handleUnreadUpdate);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!mounted) return null;

  // On home page: keep it clean, only show minimal Scroll To Top when scrolled down
  if (isHome) {
    if (!isVisible) return null;
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-black flex items-center justify-center shadow-lg border border-gray-200 transition-all duration-200 hover:scale-105 cursor-pointer"
          title="Lên đầu trang"
        >
          <ArrowUp size={18} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-[84px] right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Scroll To Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`w-12 h-12 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        title="Lên đầu trang"
      >
        <ArrowUp size={20} weight="bold" />
      </button>

      {/* Message Button */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
        className="relative w-12 h-12 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-dark)] hover:scale-110 transition-all duration-300 cursor-pointer"
        title="Nhắn tin với quán"
      >
        <ChatCircleDots size={22} weight="fill" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Phone Button */}
      <a
        href="tel:19001755"
        className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-dark)] hover:scale-110 transition-all duration-300 animate-pulse"
        title="Gọi điện"
      >
        <PhoneCall size={22} weight="fill" />
      </a>
    </div>
  );
}
