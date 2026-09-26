import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ShoppingBag, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { API_HOST } from '@/api/client';
import { useToast } from './Toast';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';

export interface AppNotification {
  id: string;
  recipientId: number;
  recipientPhone?: string;
  channel?: string;
  notificationType: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  status: 'SENT' | 'DELIVERED' | 'READ';
  referenceId?: number;
  createdAt: string;
  readAt?: string;
}

interface NotificationBellProps {
  recipientId: number | string;
  role: 'ADMIN' | 'SHOP';
  onNavigateToOrder?: (orderId: string | number) => void;
  className?: string;
}

export function NotificationBell({ recipientId, role, onNavigateToOrder, className = '' }: NotificationBellProps) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getApiBase = () => `http://${API_HOST}:8080/api/v1`;

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${getApiBase()}/notifications/unread-count/${recipientId}`);
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(Number(json.data) || 0);
      }
    } catch (e) {
      console.error('Failed to fetch unread count', e);
    }
  };

  // Fetch full notification list
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/notifications/recipient/${recipientId}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`${getApiBase()}/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await fetch(`${getApiBase()}/notifications/recipient/${recipientId}/read-all`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ', readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  // Sound chime
  const playSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  };

  // Initial load
  useEffect(() => {
    if (recipientId) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [recipientId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time WebSocket listener
  useEffect(() => {
    if (!recipientId) return;

    const wsUrl = `http://${API_HOST}:8080/ws-chat`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // 1. Subscribe to personal recipient topic
      client.subscribe(`/topic/notifications.${recipientId}`, (payload) => {
        handleIncomingNotification(payload);
      });

      // 2. Subscribe to role topic (shop or admin)
      if (role === 'SHOP') {
        client.subscribe(`/topic/notifications.shop.${recipientId}`, (payload) => {
          handleIncomingNotification(payload);
        });
      } else if (role === 'ADMIN') {
        client.subscribe(`/topic/notifications.admin`, (payload) => {
          handleIncomingNotification(payload);
        });
      }
    };

    const handleIncomingNotification = (payload: any) => {
      try {
        const item: AppNotification = JSON.parse(payload.body);
        if (!item || !item.id) return;

        playSound();
        // Show instant Toast Pop-up in top-right corner
        toast.info(item.body, item.title);

        // Prepend to list
        setNotifications((prev) => {
          if (prev.some((n) => n.id === item.id)) return prev;
          return [item, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error('Error parsing notification event', err);
      }
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [recipientId, role]);

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.readAt && n.status !== 'READ')
      : notifications;

  const formatTime = (isoString?: string) => {
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
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none"
        title="Thông báo hệ thống"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Thông báo</span>
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
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 bg-white px-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'unread'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Đang tải thông báo...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-slate-500">
                  {activeTab === 'unread' ? 'Không có thông báo chưa đọc nào' : 'Chưa có thông báo nào'}
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
                      if (item.referenceId && onNavigateToOrder) {
                        onNavigateToOrder(item.referenceId);
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.notificationType === 'ORDER_STATUS'
                          ? 'bg-amber-100 text-amber-600'
                          : item.notificationType === 'SYSTEM'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {item.notificationType === 'ORDER_STATUS' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : item.notificationType === 'SYSTEM' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate ${
                            isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                      {item.referenceId && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                          <span>Xem đơn hàng #{item.referenceId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Unread Dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
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
