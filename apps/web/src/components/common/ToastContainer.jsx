'use client';

import React from 'react';
import { useNotification } from '@/context/NotificationContext';
import { ShoppingBag, Info, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isOrder = toast.type === 'order';
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 transform transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in hover:shadow-2xl"
          >
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isOrder
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isOrder ? (
                <ShoppingBag className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-gray-900 leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug line-clamp-2">
                {toast.message}
              </p>
              {toast.referenceId && (
                <Link
                  href={`/orders/${toast.referenceId}`}
                  onClick={() => dismissToast(toast.id)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary-dark,#d97706)] hover:underline"
                >
                  <span>Chi tiết đơn #{toast.referenceId}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
              title="Đóng"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
