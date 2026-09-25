'use client';

import { useState, useEffect } from 'react';
import { ChevronUpIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';

export default function FloatingActionButtons() {
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Scroll To Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`w-12 h-12 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        title="Lên đầu trang"
      >
        <ChevronUpIcon className="w-6 h-6 font-bold" />
      </button>

      {/* Message Button */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
        className="relative w-12 h-12 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-dark)] hover:scale-110 transition-all duration-300 cursor-pointer"
        title="Nhắn tin với quán"
      >
        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
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
        <PhoneIcon className="w-6 h-6" />
      </a>
    </div>
  );
}
