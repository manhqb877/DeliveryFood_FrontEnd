'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ShoppingBag, Info, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationBell({ className = '' }) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.readAt && n.status !== 'READ')
      : notifications;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
            fetchUnreadCount();
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-black cursor-pointer focus:outline-none"
        title="Thông báo"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute 0 top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 sm:w-96 rounded-2xl bg-white border border-gray-100 shadow-2xl z-[100] overflow-hidden text-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-[var(--color-primary-dark,#d97706)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-100 bg-white px-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'border-[var(--color-primary,#f59e0b)] text-[var(--color-primary-dark,#d97706)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'unread'
                  ? 'border-[var(--color-primary,#f59e0b)] text-[var(--color-primary-dark,#d97706)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">Đang tải thông báo...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-gray-500">
                  {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !item.readAt && item.status !== 'READ';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isUnread) markAsRead(item.id);
                      if (item.referenceId) {
                        router.push(`/orders/${item.referenceId}`);
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                      isUnread ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.notificationType === 'ORDER_STATUS'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {item.notificationType === 'ORDER_STATUS' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate ${
                            isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                      {item.referenceId && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-primary-dark,#d97706)] font-semibold">
                          <span>Chi tiết đơn #{item.referenceId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Unread Dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
