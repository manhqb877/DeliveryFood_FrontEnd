import React, { useState, useEffect, useRef } from 'react';
import { dbService, api, API_HOST, ChatConversation, ChatMessage } from '@/api/client';
import { ShopProfile } from '@/api/mockData';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
import {
  MessageSquare,
  Search,
  Send,
  Check,
  CheckCheck,
  Phone,
  Clock,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Smile,
  Volume2,
  VolumeX,
  User as UserIcon,
  Circle
} from 'lucide-react';

// Synthetic sound for notifications using Web Audio API
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Play a friendly two-tone "ding-dong"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio might be blocked if user hasn't interacted
  }
}

const QUICK_REPLIES = [
  'Dạ chào bạn, quán có thể hỗ trợ gì cho bạn ạ? 😊',
  'Dạ quán đã nhận đơn và đang chuẩn bị món ngay ạ! 🍳',
  'Món ăn đang được shipper giao đến bạn nhé! 🛵',
  'Cảm ơn bạn đã ủng hộ quán! Chúc bạn ngon miệng! ❤️',
  'Dạ bạn kiểm tra món có đúng yêu cầu chưa ạ?',
  'Dạ quán xin lỗi bạn vì sự bất tiện này ạ, để quán kiểm tra ngay!'
];

export function ShopMessagesPage() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'ORDER'>('ALL');
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep ref synchronized
  useEffect(() => {
    activeConvIdRef.current = activeConversation ? activeConversation.id : null;
  }, [activeConversation]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load shop profile
  useEffect(() => {
    dbService.getMyShop().then((myShop) => {
      if (myShop) {
        setShop(myShop);
        loadConversations(myShop.id);
      }
    });
  }, []);

  const loadConversations = async (shopId: number) => {
    const list = await api.getShopConversations(shopId);
    setConversations(list);
    // Auto select first conversation if none selected
    if (list.length > 0 && !activeConvIdRef.current) {
      selectConversation(list[0]);
    }
  };

  const selectConversation = async (conv: ChatConversation) => {
    setActiveConversation(conv);
    setIsLoadingMessages(true);
    try {
      const msgs = await api.getConversationMessages(conv.id);
      setMessages(msgs);
      // Mark as read for SHOP
      if (conv.unreadShopCount > 0) {
        await api.markMessagesRead(conv.id, 'SHOP');
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unreadShopCount: 0 } : c))
        );
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // STOMP WebSocket Connection
  useEffect(() => {
    if (!shop?.id) return;

    const wsUrl = `http://${API_HOST}:8086/ws-chat`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // Disable noisy logs
    });

    client.onConnect = () => {
      setIsConnected(true);

      // Subscribe to shop general notifications (for new messages across conversations)
      client.subscribe(`/topic/shop.${shop.id}`, (payload) => {
        try {
          const newMsg: ChatMessage = JSON.parse(payload.body);
          
          if (soundEnabled && newMsg.senderType !== 'SHOP') {
            playChimeSound();
          }

          // If message belongs to active conversation, append it
          if (activeConvIdRef.current === newMsg.conversationId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Auto mark read if we are looking at this conversation
            if (newMsg.senderType !== 'SHOP') {
              api.markMessagesRead(newMsg.conversationId, 'SHOP');
            }
          }

          // Refresh/update conversations list
          setConversations((prev) => {
            const index = prev.findIndex((c) => c.id === newMsg.conversationId);
            if (index !== -1) {
              const updated = [...prev];
              const conv = updated[index];
              const isCurrentlyActive = activeConvIdRef.current === conv.id;
              updated[index] = {
                ...conv,
                lastMessageContent: newMsg.content,
                lastSenderType: newMsg.senderType,
                lastMessageAt: newMsg.createdAt,
                unreadShopCount:
                  isCurrentlyActive || newMsg.senderType === 'SHOP'
                    ? 0
                    : (conv.unreadShopCount || 0) + 1,
              };
              // Move active conversation to top
              const [moved] = updated.splice(index, 1);
              return [moved, ...updated];
            } else {
              // New conversation started by customer, reload full list
              loadConversations(shop.id);
              return prev;
            }
          });
        } catch (e) {
          console.error('Error handling shop topic message:', e);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.warn('STOMP chat error:', frame.headers['message']);
      setIsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [shop?.id, soundEnabled]);

  // Subscribe to active conversation topic
  useEffect(() => {
    if (!activeConversation?.id || !stompClientRef.current || !isConnected) return;

    const sub = stompClientRef.current.subscribe(
      `/topic/conversation.${activeConversation.id}`,
      (payload) => {
        try {
          const msg: ChatMessage = JSON.parse(payload.body);
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.senderType !== 'SHOP') {
            api.markMessagesRead(activeConversation.id, 'SHOP');
          }
        } catch (e) {
          console.error('Error reading topic/conversation message:', e);
        }
      }
    );

    return () => {
      sub.unsubscribe();
    };
  }, [activeConversation?.id, isConnected]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputContent).trim();
    if (!content || !activeConversation || !shop || isSending) return;

    setIsSending(true);
    try {
      const payload = {
        conversationId: activeConversation.id,
        senderType: 'SHOP',
        senderId: shop.id,
        content: content,
        messageType: 'TEXT',
      };

      const result = await api.sendChatMessage(payload);
      if (result) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.id)) return prev;
          return [...prev, result];
        });
        // Update snippet in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  lastMessageContent: result.content,
                  lastSenderType: 'SHOP',
                  lastMessageAt: result.createdAt,
                }
              : c
          )
        );
      }
      if (!textToSend) {
        setInputContent('');
      }
      setTimeout(() => inputRef.current?.focus(), 10);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      (c.customerName || 'Khách hàng').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone || '').includes(searchQuery) ||
      (c.lastMessageContent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.orderId && c.orderId.toString().includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterTab === 'UNREAD') return (c.unreadShopCount || 0) > 0;
    if (filterTab === 'ORDER') return !!c.orderId;
    return true;
  });

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadShopCount || 0), 0);

  const formatMessageTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatConvTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins}p`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans">
      {/* LEFT SIDEBAR: Conversation List */}
      <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  Tin nhắn khách hàng
                  {totalUnread > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full">
                      {totalUnread}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isConnected ? 'Realtime kết nối' : 'Đang kết nối...'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors ${
                  soundEnabled ? 'text-blue-600' : 'text-slate-400'
                }`}
                title={soundEnabled ? 'Âm thanh thông báo bật' : 'Âm thanh thông báo tắt'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => shop && loadConversations(shop.id)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Làm mới"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm khách hàng, số điện thoại, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 mt-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'ALL'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({conversations.length})
            </button>
            <button
              onClick={() => setFilterTab('UNREAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'UNREAD'
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Chưa đọc {totalUnread > 0 && `(${totalUnread})`}
            </button>
            <button
              onClick={() => setFilterTab('ORDER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'ORDER'
                  ? 'bg-emerald-50 text-emerald-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Có đơn hàng
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-medium">Chưa có cuộc trò chuyện nào</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Khi khách hàng nhắn tin cho quán trên web, tin nhắn sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const hasUnread = (conv.unreadShopCount || 0) > 0;
              const customerName = conv.customerName || `Khách hàng #${conv.participants?.customerId || ''}`;

              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600 pl-2.5' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.customerAvatar ? (
                      <img
                        src={conv.customerAvatar}
                        alt={customerName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4
                        className={`text-xs truncate ${
                          hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {customerName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {formatConvTime(conv.lastMessageAt || conv.createdAt)}
                      </span>
                    </div>

                    {conv.orderId && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/60">
                        <ShoppingBag className="w-3 h-3" />
                        <span>Đơn #{conv.orderId}</span>
                      </div>
                    )}

                    <p
                      className={`text-xs truncate ${
                        hasUnread ? 'font-medium text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {conv.lastSenderType === 'SHOP' && (
                        <span className="text-blue-600 font-semibold mr-1">Bạn:</span>
                      )}
                      {conv.lastMessageContent || 'Bắt đầu cuộc trò chuyện'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {hasUnread && (
                    <div className="shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {conv.unreadShopCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN CHAT PANE */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {/* Header */}
          <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                {activeConversation.customerAvatar ? (
                  <img
                    src={activeConversation.customerAvatar}
                    alt={activeConversation.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {(activeConversation.customerName || 'K').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 truncate">
                    {activeConversation.customerName || 'Khách hàng'}
                  </h3>
                  {activeConversation.orderId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                      <ShoppingBag className="w-3 h-3" />
                      Mã đơn: #{activeConversation.orderId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {activeConversation.customerPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {activeConversation.customerPhone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Circle className="w-2 h-2 fill-emerald-500" />
                    Đang online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => selectConversation(activeConversation)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Làm mới tin nhắn"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order reference banner if linked to order */}
          {activeConversation.orderId && (
            <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>
                  Khách hàng đang nhắn tin về đơn hàng <strong>#{activeConversation.orderId}</strong>
                </span>
              </div>
              <a
                href={`/shop/orders`}
                className="text-amber-700 hover:text-amber-900 font-semibold underline text-xs"
              >
                Xem chi tiết đơn →
              </a>
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">Bắt đầu trò chuyện với khách hàng</p>
                <p className="text-[11px] text-slate-400">
                  Gửi tin nhắn chào mừng hoặc giải đáp thắc mắc của khách về món ăn.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isShop = msg.senderType === 'SHOP';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-end gap-2 ${isShop ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isShop && (
                      <div className="shrink-0 mb-1">
                        {activeConversation.customerAvatar ? (
                          <img
                            src={activeConversation.customerAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center">
                            {(activeConversation.customerName || 'K').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`max-w-[70%] space-y-1 ${isShop ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isShop
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>

                      <div
                        className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${
                          isShop ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isShop && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400 inline" />
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

          {/* Quick Replies Panel */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Trả lời nhanh:
            </span>
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(reply)}
                className="shrink-0 text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 rounded-full text-slate-600 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập tin nhắn cho khách hàng... (Nhấn Enter để gửi)"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputContent.trim() || isSending}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                inputContent.trim() && !isSending
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
            <MessageSquare className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Tin nhắn khách hàng</h3>
          <p className="text-xs text-slate-400 mt-1 text-center max-w-sm">
            Chọn một cuộc trò chuyện ở danh sách bên trái để xem nội dung và trả lời khách hàng trong thời gian thực.
          </p>
        </div>
      )}
    </div>
  );
}
