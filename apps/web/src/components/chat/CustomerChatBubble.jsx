'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import {
  X,
  Send,
  ChevronLeft,
  ShoppingBag,
  Volume2,
  VolumeX,
  Check,
  CheckCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/v1';
const FALLBACK_API_BASE = 'http://localhost:8086';
const WS_URL = 'http://localhost:8086/ws-chat';
const DEFAULT_SHOP_ICON = 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png';

function playIncomingChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

const CUSTOMER_QUICK_REPLIES = [
  'Quán ơi món chuẩn bị xong chưa ạ? ⏱️',
  'Cho mình xin thêm nước chấm/tương nhé! 🥢',
  'Giao giúp mình lên sảnh tầng 1 nha! 🏢',
  'Quán lưu ý đừng bỏ hành giúp mình nhé! 🌿',
  'Cảm ơn quán nhiều ạ! ❤️'
];

export default function CustomerChatBubble() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [guestId, setGuestId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeConvIdRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    activeConvIdRef.current = activeConversation ? activeConversation.id : null;
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init guestId if not logged in
  useEffect(() => {
    let gid = localStorage.getItem('delivery_guest_id');
    if (!gid) {
      gid = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('delivery_guest_id', gid);
    }
    setGuestId(gid);
  }, []);

  const customerId = user?.id || null;
  const guestSessionId = !user?.id ? (guestId ? parseInt(guestId) : 999999) : null;

  // Load customer's conversation list
  const loadConversations = async () => {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId.toString());
      if (guestSessionId) params.append('guestSessionId', guestSessionId.toString());

      let res = await fetch(`${API_BASE}/conversations/customer?${params.toString()}`);
      if (!res.ok) {
        res = await fetch(`${FALLBACK_API_BASE}/conversations/customer?${params.toString()}`);
      }
      if (res.ok) {
        const json = await res.json();
        const list = json.data || (Array.isArray(json) ? json : []);
        setConversations(list);

        const unread = list.reduce((sum, c) => sum + (c.unreadCustomerCount || 0), 0);
        window.dispatchEvent(new CustomEvent('chat-unread-count-updated', { detail: unread }));
      }
    } catch (e) {
      console.warn('Could not load conversations:', e);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [customerId, guestSessionId]);

  // Select a conversation and load messages
  const selectConversation = async (conv) => {
    if (!conv || !conv.id) return;
    setActiveConversation(conv);
    setIsLoadingMessages(true);
    try {
      let res = await fetch(`${API_BASE}/conversations/${conv.id}/messages`);
      if (!res.ok) {
        res = await fetch(`${FALLBACK_API_BASE}/conversations/${conv.id}/messages`);
      }
      if (!res.ok) {
        res = await fetch(`${API_BASE}/messages/conversation/${conv.id}`);
      }
      if (!res.ok) {
        res = await fetch(`${FALLBACK_API_BASE}/messages/conversation/${conv.id}`);
      }
      if (res.ok) {
        const json = await res.json();
        const rawMsgs = json.data || (Array.isArray(json) ? json : []);
        // Filter out empty messages
        const validMsgs = rawMsgs.filter(m => m && m.content && m.content.trim().length > 0);
        setMessages(validMsgs);

        // Mark as read
        if (conv.unreadCustomerCount > 0) {
          fetch(`${API_BASE}/conversations/${conv.id}/read?readerType=CUSTOMER`, { method: 'PATCH' }).catch(() => {});
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, unreadCustomerCount: 0 } : c))
          );
          loadConversations();
        }
      }
    } catch (e) {
      console.error('Failed to load conversation messages:', e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Start or open a conversation with a specific shop
  const startConversationWithShop = async ({ shopId, shopName, shopLogo, orderId }) => {
    try {
      const payload = {
        shopId: Number(shopId),
        customerId: customerId,
        guestSessionId: guestSessionId,
        orderId: orderId ? Number(orderId) : null,
        shopName: shopName || `Quán ăn #${shopId}`,
        shopLogo: shopLogo || null,
        customerName: user?.fullName || user?.full_name || 'Khách hàng',
        customerPhone: user?.phone || null,
        customerAvatar: user?.avatarUrl || user?.avatar_url || null,
      };

      let res = await fetch(`${API_BASE}/conversations/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${FALLBACK_API_BASE}/conversations/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const json = await res.json();
        const conv = json.data || json;
        setIsOpen(true);
        selectConversation(conv);
        loadConversations();
      }
    } catch (e) {
      console.error('Failed to init conversation with shop:', e);
    }
  };

  // Listen for global custom events
  useEffect(() => {
    const handleToggleChat = () => {
      setIsOpen((prev) => {
        const nextState = !prev;
        if (nextState) {
          loadConversations();
        }
        return nextState;
      });
    };

    const handleOpenShopChat = (e) => {
      if (e.detail?.shopId) {
        startConversationWithShop(e.detail);
      } else {
        setIsOpen(true);
        loadConversations();
      }
    };

    window.addEventListener('toggle-chat', handleToggleChat);
    window.addEventListener('open-shop-chat', handleOpenShopChat);
    return () => {
      window.removeEventListener('toggle-chat', handleToggleChat);
      window.removeEventListener('open-shop-chat', handleOpenShopChat);
    };
  }, [customerId, guestSessionId, user]);

  // STOMP WebSocket Connection
  useEffect(() => {
    const targetTopicId = customerId || guestSessionId;
    if (!targetTopicId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
    });

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe(`/topic/customer.${targetTopicId}`, (payload) => {
        try {
          const newMsg = JSON.parse(payload.body);

          if (soundEnabled && newMsg.senderType === 'SHOP') {
            playIncomingChime();
          }

          if (activeConvIdRef.current === newMsg.conversationId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            fetch(`${API_BASE}/conversations/${newMsg.conversationId}/read?readerType=CUSTOMER`, {
              method: 'PATCH',
            }).catch(() => {});
          }

          loadConversations();
        } catch (e) {
          console.error('Error handling customer stomp message:', e);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };
    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      setIsConnected(false);
      if (client.active) client.deactivate();
    };
  }, [customerId, guestSessionId, soundEnabled]);

  // Subscribe to active conversation topic
  useEffect(() => {
    if (!activeConversation?.id || !isConnected || !stompClientRef.current?.connected) return;

    const sub = stompClientRef.current.subscribe(
      `/topic/conversation.${activeConversation.id}`,
      (payload) => {
        try {
          const msg = JSON.parse(payload.body);
          if (msg && msg.content && msg.content.trim()) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
          if (msg.senderType === 'SHOP') {
            if (soundEnabled) playIncomingChime();
            fetch(`${API_BASE}/conversations/${activeConversation.id}/read?readerType=CUSTOMER`, {
              method: 'PATCH',
            }).catch(() => {});
          }
        } catch (e) {
          console.error('Error reading topic conversation:', e);
        }
      }
    );

    return () => sub.unsubscribe();
  }, [activeConversation?.id, isConnected, soundEnabled]);

  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || inputContent).trim();
    if (!content || !activeConversation || isSending) return;

    setIsSending(true);
    if (!textToSend) setInputContent('');
    setTimeout(() => inputRef.current?.focus(), 10);

    try {
      const payload = {
        conversationId: activeConversation.id,
        senderType: customerId ? 'CUSTOMER' : 'GUEST',
        senderId: customerId || guestSessionId,
        content: content,
        messageType: 'TEXT',
      };

      let res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${FALLBACK_API_BASE}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const json = await res.json();
        const serverMsg = json.data || json;
        if (serverMsg && serverMsg.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === serverMsg.id)) return prev;
            return [...prev, serverMsg];
          });
        }
        loadConversations();
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMsgTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      return new Date(timeStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-22 right-6 z-50 w-[360px] sm:w-[380px] h-[520px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden font-sans">
      {/* HEADER: Solid Website Brand Yellow */}
      <div className="px-4 py-3 bg-[#ffb800] text-slate-900 flex items-center justify-between border-b border-amber-400 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {activeConversation && (
            <button
              onClick={() => setActiveConversation(null)}
              className="p-1 -ml-1 rounded-lg hover:bg-black/10 transition-colors text-slate-900 cursor-pointer"
              title="Quay lại danh sách"
            >
              <ChevronLeft className="w-5 h-5 font-bold" />
            </button>
          )}

          {activeConversation ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeConversation.shopLogo || DEFAULT_SHOP_ICON}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-amber-300 bg-white"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
              </div>

              <div className="truncate">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {activeConversation.shopName || 'Quán ăn'}
                </h4>
                <p className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Đang hoạt động
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src={DEFAULT_SHOP_ICON}
                alt=""
                className="w-8 h-8 rounded-full bg-white p-1"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Tin nhắn quán ăn</h4>
                <p className="text-[11px] text-slate-700 font-medium">Hỗ trợ đặt món trực tiếp</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 text-slate-800">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>

      {/* BODY */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#f8f9fa] min-h-0">
          {/* Order Banner */}
          {activeConversation.orderId && (
            <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 text-[11px] text-amber-900 shrink-0 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
              <span>Đơn hàng liên quan: <strong>#{activeConversation.orderId}</strong></span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ffb800]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                <img
                  src={DEFAULT_SHOP_ICON}
                  alt=""
                  className="w-12 h-12 mb-2 opacity-80"
                />
                <p className="text-xs font-bold text-slate-700">Bắt đầu trò chuyện với quán</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nhắn tin để hỏi về món ăn, ghi chú đơn hoặc yêu cầu hỗ trợ.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                if (!m.content || !m.content.trim()) return null;
                const isMe = m.senderType === 'CUSTOMER' || m.senderType === 'GUEST';
                return (
                  <div
                    key={m.id || idx}
                    className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={activeConversation.shopLogo || DEFAULT_SHOP_ICON}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-slate-200 mb-1"
                      />
                    )}

                    <div className={`max-w-[75%] space-y-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#ffb800] text-slate-950 font-medium rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-[9px] text-slate-400 px-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{formatMsgTime(m.createdAt)}</span>
                        {isMe && (
                          <span>
                            {m.isRead ? (
                              <CheckCheck className="w-3 h-3 text-amber-600 inline" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-400 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {CUSTOMER_QUICK_REPLIES.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(r)}
                className="shrink-0 text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập tin nhắn... (Enter để gửi)"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputContent.trim() || isSending}
              className={`p-2.5 rounded-xl transition-all ${
                inputContent.trim() && !isSending
                  ? 'bg-[#ffb800] hover:bg-[#e5a600] text-slate-950 font-bold shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* CONVERSATION LIST */
        <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <img
                src={DEFAULT_SHOP_ICON}
                alt=""
                className="w-12 h-12 mb-3 opacity-60"
              />
              <p className="text-xs font-bold text-slate-700">Chưa có cuộc trò chuyện nào</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                Bấm vào nút "Nhắn tin cho Quán" trên trang đặt món hoặc đơn hàng để bắt đầu chat.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {conversations.map((conv) => {
                const hasUnread = (conv.unreadCustomerCount || 0) > 0;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className="p-3.5 flex items-start gap-3 cursor-pointer hover:bg-amber-50/50 transition-colors"
                  >
                    <img
                      src={conv.shopLogo || DEFAULT_SHOP_ICON}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h5 className={`text-xs truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {conv.shopName || `Quán #${conv.participants?.shopId}`}
                        </h5>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatMsgTime(conv.lastMessageAt || conv.createdAt)}
                        </span>
                      </div>

                      {conv.orderId && (
                        <span className="inline-block text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mb-1">
                          Đơn #{conv.orderId}
                        </span>
                      )}

                      <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {conv.lastSenderType === 'CUSTOMER' && <span className="text-amber-700 mr-1">Bạn:</span>}
                        {conv.lastMessageContent || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>

                    {hasUnread && (
                      <div className="shrink-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold">
                        {conv.unreadCustomerCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
