'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';

const API_BASE = 'http://localhost:8080/api/v1';
const WS_URL = 'http://localhost:8080/ws-chat';

const NotificationContext = createContext(null);

function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  } catch (e) {}
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef(null);

  // Remove toast
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show Toast
  const showToast = useCallback(
    ({ title, message, type = 'info', referenceId = null }) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newToast = { id, title, message, type, referenceId };
      setToasts((prev) => [newToast, ...prev].slice(0, 4));

      setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count/${user.id}`);
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(Number(json.data) || 0);
      }
    } catch (e) {
      console.error('Failed to fetch unread notifications count', e);
    }
  }, [user?.id]);

  // Fetch full list
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/recipient/${user.id}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notification list', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark single as read
  const markAsRead = useCallback(async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await fetch(`${API_BASE}/notifications/recipient/${user.id}/read-all`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ', readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    }
  }, [user?.id]);

  // Initialize data on user change
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id, fetchUnreadCount, fetchNotifications]);

  // Real-time STOMP connection
  useEffect(() => {
    if (!user?.id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
    });

    const handleIncomingMessage = (payload) => {
      try {
        const item = JSON.parse(payload.body);
        if (!item || !item.id) return;

        playNotificationChime();
        showToast({
          title: item.title,
          message: item.body,
          type: item.notificationType === 'ORDER_STATUS' ? 'order' : 'info',
          referenceId: item.referenceId,
        });

        setNotifications((prev) => {
          if (prev.some((n) => n.id === item.id)) return prev;
          return [item, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error('Error parsing notification event', err);
      }
    };

    client.onConnect = () => {
      // 1. Subscribe to personal recipient topic
      client.subscribe(`/topic/notifications.${user.id}`, handleIncomingMessage);
      // 2. Subscribe to role topic
      client.subscribe(`/topic/notifications.customer.${user.id}`, handleIncomingMessage);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [user?.id, showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        loading,
        dismissToast,
        showToast,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        fetchUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
