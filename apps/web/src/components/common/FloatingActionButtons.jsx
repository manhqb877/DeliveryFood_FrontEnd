'use client';

import { useState, useEffect } from 'react';
import { ChevronUpIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';

export default function FloatingActionButtons() {
  const [isVisible, setIsVisible] = useState(false);

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
      <a
        href="#"
        className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-dark)] hover:scale-110 transition-all duration-300"
        title="Nhắn tin"
      >
        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
      </a>

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
