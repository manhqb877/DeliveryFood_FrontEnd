'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api';
import {
  X,
  PaperPlaneRight,
  CaretDown,
  ArrowClockwise,
  User,
  CircleNotch,
  Sparkle,
} from "@phosphor-icons/react";
import {
  CheckCircleIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:8088';

// ─── Helpers for Order & Guest Session ─────────────────────────────────────────
function getStoredGuestSessionId() {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem('befood_guest_session_id');
  if (!id) return null;
  return parseInt(id, 10);
}

function parseOrderDataFromText(text) {
  if (!text) return { cleanText: text, orderData: null };
  const match = text.match(/<!--\s*ORDER_DATA:\s*(\{.*?\})\s*-->/s);
  if (match) {
    try {
      const orderData = JSON.parse(match[1]);
      const cleanText = text.replace(/<!--\s*ORDER_DATA:\s*\{.*?\}\s*-->/s, '').trim();
      return { cleanText, orderData };
    } catch (e) {}
  }
  return { cleanText: text, orderData: null };
}

// ─── Thẻ xác nhận đơn hàng COD ────────────────────────────────────────────────
function CODOrderCard({ order }) {
  if (!order) return null;
  const orderId = order.order_id || order.id;
  const orderCode = order.order_code || order.orderCode || `ORD${orderId}`;
  const totalAmount = order.total_amount || order.totalAmount || 0;
  const address = typeof order.delivery_address === 'string'
    ? order.delivery_address
    : (order.delivery_address?.fullAddress || order.delivery_address?.addressLine || 'Giao theo địa chỉ của bạn');

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 text-slate-800 shadow-xs space-y-2.5">
      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
        <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Đã đặt đơn thành công (Tiền mặt COD)</span>
      </div>
      <div className="text-[11px] space-y-1 bg-white/90 p-2.5 rounded-lg border border-emerald-100">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Mã đơn hàng:</span>
          <strong className="font-mono text-emerald-800 font-bold">#{orderCode}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Tổng thanh toán:</span>
          <strong className="text-rose-600 font-bold text-xs">
            {Number(totalAmount).toLocaleString('vi-VN')}đ
          </strong>
        </div>
        <div className="flex items-start gap-1 pt-1 text-slate-600">
          <MapPinIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{address}</span>
        </div>
      </div>
      <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
        <BanknotesIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Chuẩn bị đúng tiền mặt khi shipper giao hàng</span>
      </div>
      <Link
        href={`/orders/${orderId}`}
        className="block w-full text-center py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
      >
        🛵 Xem chi tiết & Theo dõi đơn
      </Link>
    </div>
  );
}

// ─── Thẻ thanh toán Chuyển khoản VietQR SePay ─────────────────────────────────
function VietQRPaymentCard({ order, paymentQr }) {
  if (!order) return null;
  const orderId = order.order_id || order.id;
  const orderCode = order.order_code || order.orderCode || `ORD${orderId}`;
  const totalAmount = order.total_amount || order.totalAmount || paymentQr?.amount || 0;
  const qrData = paymentQr || order.payment_qr || {};

  const bankName = qrData.bankName || 'MBBank';
  const accountNumber = qrData.accountNumber || '025452790502';
  const accountHolder = qrData.accountHolder || 'NGUYEN THAI AN';
  const paymentDesc = qrData.paymentDescription || orderCode;

  const defaultQrUrl = qrData.qrUrl || `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankName}&amount=${Number(totalAmount)}&des=${encodeURIComponent(paymentDesc)}`;

  const [isPaid, setIsPaid] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {}
  };

  // Tự động kiểm tra trạng thái thanh toán từ SePay mỗi 3 giây
  useEffect(() => {
    if (isPaid || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/payments/status/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.status === 'SUCCESS' || data.paymentStatus === 'SUCCESS')) {
            setIsPaid(true);
            window.dispatchEvent(new Event('cart-updated'));
            clearInterval(interval);
          }
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, isPaid]);

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-slate-800 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
          <QrCodeIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Chuyển khoản VietQR SePay</span>
        </div>
        {isPaid ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
            ĐÃ THANH TOÁN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Chờ quét mã...
          </span>
        )}
      </div>

      {isPaid ? (
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center space-y-1.5">
          <CheckCircleIcon className="w-8 h-8 text-emerald-600 mx-auto" />
          <div className="text-xs font-extrabold text-emerald-800">Thanh toán thành công! 🎉</div>
          <p className="text-[11px] text-emerald-700">Đơn hàng #{orderCode} đã được SePay xác nhận.</p>
          <Link
            href={`/orders/${orderId}`}
            className="inline-block mt-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            Xem hóa đơn & Chi tiết đơn
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-blue-100 shadow-xs">
            <img
              src={defaultQrUrl}
              alt="VietQR SePay"
              className="w-36 h-36 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = `https://img.vietqr.io/image/MB-${accountNumber}-compact2.png?amount=${Number(totalAmount)}&addInfo=${encodeURIComponent(paymentDesc)}&accountName=${encodeURIComponent(accountHolder)}`;
              }}
            />
            <span className="text-[10px] text-slate-500 mt-1 font-medium">Mở App ngân hàng bất kỳ để quét QR</span>
          </div>

          <div className="text-[11px] space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ngân hàng:</span>
              <strong className="text-slate-800">{bankName} (Quân Đội)</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <strong className="font-mono text-slate-900">{accountNumber}</strong>
                <button
                  onClick={() => handleCopy(accountNumber, 'acc')}
                  className="text-blue-600 hover:text-blue-800 font-bold p-0.5"
                  title="Sao chép"
                >
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <strong className="text-slate-800 uppercase">{accountHolder}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số tiền:</span>
              <strong className="text-rose-600 font-bold text-xs">
                {Number(totalAmount).toLocaleString('vi-VN')}đ
              </strong>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-slate-500">Nội dung CK:</span>
              <div className="flex items-center gap-1.5">
                <strong className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{paymentDesc}</strong>
                <button
                  onClick={() => handleCopy(paymentDesc, 'des')}
                  className="text-blue-600 hover:text-blue-800 font-bold p-0.5"
                  title="Sao chép nội dung"
                >
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {copiedField && (
              <div className="text-[10px] text-center text-emerald-600 font-bold">
                Đã sao chép {copiedField === 'acc' ? 'số tài khoản' : 'nội dung'}!
              </div>
            )}
          </div>

          <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
            ⚠️ Giữ nguyên <strong>Nội dung ({paymentDesc})</strong> để SePay tự động xác nhận đơn tức thì!
          </div>
        </>
      )}
    </div>
  );
}

// ─── Session & history persistence ───────────────────────────────────────────
const HISTORY_KEY_PREFIX = 'ai_chat_history_';
const MAX_HISTORY = 60; // tối đa 60 tin nhắn lưu

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return 'ssr-session';
  let sid = sessionStorage.getItem('ai_agent_session_id');
  if (!sid) {
    sid = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('ai_agent_session_id', sid);
  }
  return sid;
}

function loadHistory(sessionId) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY_PREFIX + sessionId);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveHistory(sessionId, messages) {
  try {
    const toSave = messages.slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY_PREFIX + sessionId, JSON.stringify(toSave));
  } catch {}
}

function clearHistory(sessionId) {
  try {
    localStorage.removeItem(HISTORY_KEY_PREFIX + sessionId);
  } catch {}
}

// ─── Welcome message mặc định ─────────────────────────────────────────────────
const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  text: '👋 Xin chào! Tôi là **FoodieAI** — trợ lý đặt món thông minh.\n\nBạn muốn tìm quán ăn hay đặt món gì hôm nay? 🍽️',
  ts: Date.now(),
};

// ─── Markdown renderer: bold, link, xuống dòng, heading, list ─────────────────
function SimpleMarkdown({ text }) {
  if (!text) return null;

  // ── normalize href for shop links ────────────────────────────────────────────
  // /order/42            → /order?shopId=42          (old AI format, fallback)
  // /order?shopId=42&... → passthrough               (new AI format with shopName)
  // /product/...        → passthrough
  function normalizeHref(href) {
    if (!href) return '#';
    // Only normalize path-only /order/42 or /shop/42 (no query string)
    const pathOnly = href.match(/^\/(?:order|shop)\/(\d+)$/);
    if (pathOnly) return `/order?shopId=${pathOnly[1]}`;
    return href;
  }

  // ── render a Link element ──────────────────────────────────────────────────
  function renderLink(label, rawHref, key) {
    const href = normalizeHref(rawHref);
    const isInternal = href.startsWith('/');
    const isProduct = href.includes('/product/');
    if (isInternal) {
      return (
        <Link
          key={key}
          href={href}
          className={`inline-flex items-center gap-1 px-2 py-0.5 my-0.5 mx-0.5 rounded-lg font-medium text-xs
            border transition-all shadow-sm group
            ${isProduct
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border-emerald-300'
              : 'bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white border-violet-300'
            }`}
        >
          <span>{isProduct ? '🍽️' : '🏪'}</span>
          <span className="underline decoration-current/40 group-hover:decoration-white">{label}</span>
          <span className="text-[10px] opacity-60">↗</span>
        </Link>
      );
    }
    return (
      <a key={key} href={href} target="_blank" rel="noreferrer"
        className="underline text-violet-600 hover:text-violet-800">{label}</a>
    );
  }

  // ── parse inline tokens (links, bold) inside a text string ─────────────────
  function parseInline(str, prefix) {
    if (!str) return null;
    // strip leading/trailing single _ or * only when the whole string is enclosed in italic wrappers
    const s = (/^_[^_]+_$/.test(str) || /^\*[^*]+\*$/.test(str)) ? str.slice(1, -1) : str;
    const parts2 = s.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
    return parts2.map((p, idx) => {
      const k = `${prefix}-${idx}`;
      if (!p) return null;
      const lm = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (lm) return renderLink(lm[1], lm[2], k);
      if (/^\*\*(.+)\*\*$/.test(p)) {
        return <strong key={k} className="font-semibold text-slate-800">{p.slice(2, -2)}</strong>;
      }
      return p ? <span key={k}>{p}</span> : null;
    }).filter(Boolean);
  }

  // ── render line-by-line ────────────────────────────────────────────────────
  const lines = text.split('\n');

  return (
    <span>
      {lines.map((line, li) => {
        const lk = `l${li}`;
        if (!line.trim()) return <span key={lk} className="block h-1" />;

        // Heading
        const hm = line.match(/^(#{1,3})\s+(.+)$/);
        if (hm) {
          const lvl = hm[1].length;
          const cls = lvl === 1
            ? 'block font-bold text-sm text-violet-700 mt-2 mb-0.5'
            : lvl === 2
            ? 'block font-semibold text-xs text-violet-600 mt-1.5 mb-0.5'
            : 'block font-medium text-xs text-slate-600 mt-1';
          return <span key={lk} className={cls}>{parseInline(hm[2], lk)}</span>;
        }

        // List item: -, *, •, 1.
        const lim = line.match(/^(?:[-*•]|\d+\.)\s+(.+)$/);
        if (lim) {
          return (
            <span key={lk} className="flex items-start gap-1.5 my-0.5">
              <span className="text-violet-500 mt-0.5 shrink-0 select-none">•</span>
              <span className="text-slate-700">{parseInline(lim[1], lk)}</span>
            </span>
          );
        }

        // Plain line (may have links, bold, italic wrappers)
        return <span key={lk} className="block">{parseInline(line, lk)}</span>;
      })}
    </span>
  );
}

// ─── Quick reply suggestions ──────────────────────────────────────────────────
const QUICK_REPLIES = [
  '🍜 Tìm quán phở gần đây',
  '🧋 Trà sữa ngon nhất',
  '🛒 Xem giỏ hàng',
  '📦 Trạng thái đơn',
  '💸 Món dưới 50k',
];

// ─── AI Avatar SVG ────────────────────────────────────────────────────────────
function AIAvatar({ size = 'sm' }) {
  const s = size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div className={`${s} rounded-full flex-shrink-0 flex items-center justify-center
      bg-[#FFB700] text-black shadow-md border border-amber-300`}>
      <Sparkle size={size === 'lg' ? 18 : 13} weight="fill" className="text-black" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIAgentChatBubble() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([WELCOME_MSG]);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Chỉ khởi tạo session và load history ở client sau khi mounted để tránh lỗi Hydration
  useEffect(() => {
    setMounted(true);
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    const history = loadHistory(sid);
    if (history && history.length > 0) {
      setMessages(history);
    }

    const handleOpenAi = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenAi);
    return () => window.removeEventListener('open-ai-chat', handleOpenAi);
  }, []);

  // ─── Lưu lịch sử vào localStorage mỗi khi messages thay đổi ─────────────
  useEffect(() => {
    if (mounted && sessionId && messages.length > 1) { // không lưu nếu chỉ có welcome msg
      saveHistory(sessionId, messages);
    }
  }, [messages, sessionId, mounted]);

  // ─── Auto-scroll ────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  }, []);

  // ─── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim() || loading) return;
      const userText = text.trim();
      setInput('');

      const userMsg = { id: Date.now().toString(), role: 'user', text: userText, ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const area_code = user?.areaCode || 'UNKNOWN';
        const user_type = user ? 'customer' : 'guest';
        const jwt = getAccessToken() || user?.token || null;

        const headers = {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        };
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

        const guest_session_id = getStoredGuestSessionId();
        const user_id = user?.id || null;

        let res;
        const fetchOptions = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            session_id: sessionId,
            message: userText,
            area_code,
            user_type,
            user_id,
            guest_session_id,
          }),
          signal: AbortSignal.timeout(45000), // 45 giây timeout, tránh xoay vô tận
        };

        try {
          res = await fetch(`${AI_AGENT_URL}/api/v1/agent/chat`, fetchOptions);
        } catch (fetchErr) {
          if (fetchErr.name === 'TimeoutError') {
            throw new Error('Yêu cầu quá thời gian phản hồi (45s). Vui lòng thử lại.');
          }
          const fallbackUrl = AI_AGENT_URL.includes('8088')
            ? 'http://localhost:8080'
            : 'http://localhost:8088';
          res = await fetch(`${fallbackUrl}/api/v1/agent/chat`, fetchOptions);
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply || '(Không có phản hồi)',
          order_info: data.order_info || null,
          payment_qr: data.payment_qr || null,
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Tự động kích hoạt cập nhật giỏ hàng trên giao diện Web khi AI thêm món hoặc tạo đơn
        if (data.cart_updated || data.order_info) {
          window.dispatchEvent(new Event('cart-updated'));
        }

        if (!isOpen) setUnread((u) => u + 1);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            role: 'error',
            text: `⚠️ Lỗi kết nối AI: ${err.message}`,
            ts: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId, user, isOpen]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Reset: xóa lịch sử và tạo session mới
  const resetSession = () => {
    clearHistory(sessionId);
    sessionStorage.removeItem('ai_agent_session_id');
    window.location.reload();
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (!mounted) return null;

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        id="ai-agent-trigger-btn"
        data-ai-bubble-toggle="true"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl
          text-black font-extrabold text-sm transition-all duration-300 cursor-pointer
          ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}
          bg-[#FFB700] hover:bg-[#f5aa00] hover:shadow-2xl hover:-translate-y-0.5 border border-amber-300/60`}
        style={{ boxShadow: isOpen ? 'none' : '0 8px 24px rgba(255,183,0,0.4)' }}
        aria-label="Trợ lý beFood"
      >
        <div className="relative flex items-center">
          <Sparkle size={18} weight="fill" className="text-black" />
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px]
              rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </div>
        <span className="font-bold">Trợ lý beFood</span>
      </button>

      {/* ── Chat window ── */}
      <div
        id="ai-agent-chat-window"
        className={`fixed bottom-6 right-6 z-50 flex flex-col w-[370px] sm:w-[400px]
          rounded-2xl overflow-hidden
          transition-all duration-300 ease-out origin-bottom-right
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
          }`}
        style={{
          height: '580px',
          maxHeight: '90vh',
          boxShadow: '0 12px 40px rgba(109,40,217,0.18), 0 0 0 1px rgba(139,92,246,0.12)',
          background: '#ffffff',
        }}
      >
        {/* ── Header ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #3730a3 50%, #1e3a5f 100%)',
            borderBottom: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          {/* Decorative glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-violet-400/10 blur-2xl" />
            <div className="absolute -bottom-4 left-8 w-20 h-20 rounded-full bg-indigo-400/10 blur-xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-1">
            <AIAvatar size="lg" />
            <div>
              <p className="font-bold text-sm text-white leading-tight">Trợ lý beFood</p>
              <p className="text-[11px] text-violet-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tư vấn món & gợi ý quán gần
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1">
            <button
              id="ai-agent-reset-btn"
              onClick={resetSession}
              title="Cuộc hội thoại mới"
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            >
              <ArrowClockwise size={15} weight="bold" />
            </button>
            <button
              id="ai-agent-close-btn"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.2) transparent', background: '#f5f6fa' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {msg.role === 'user' ? (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                  bg-gradient-to-br from-violet-500 to-purple-600 ring-2 ring-violet-400/30">
                  <User size={13} className="text-white" />
                </div>
              ) : msg.role === 'error' ? (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-red-800/80">
                  <span className="text-xs text-red-300">!</span>
                </div>
              ) : (
                <AIAvatar size="sm" />
              )}

              {/* Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : msg.role === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-sm'
                    : 'rounded-tl-sm border'
                  }`}
                style={
                  msg.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
                      }
                    : msg.role === 'assistant'
                    ? {
                        background: '#ffffff',
                        borderColor: '#e5e7eb',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      }
                    : {}
                }
              >
                {(() => {
                  const { cleanText, orderData } = parseOrderDataFromText(msg.text);
                  const currentOrder = msg.order_info || orderData;
                  const currentPaymentQr = msg.payment_qr || currentOrder?.payment_qr;
                  const isOnlineQr = currentOrder && (
                    currentOrder.payment_method === 'ONLINE' ||
                    currentOrder.payment_method === 'SEPAY' ||
                    currentOrder.payment_method === 'VIETQR' ||
                    Boolean(currentPaymentQr)
                  );

                  return (
                    <>
                      <SimpleMarkdown text={cleanText} />
                      {currentOrder && (
                        isOnlineQr ? (
                          <VietQRPaymentCard order={currentOrder} paymentQr={currentPaymentQr} />
                        ) : (
                          <CODOrderCard order={currentOrder} />
                        )
                      )}
                    </>
                  );
                })()}
                <p className={`text-[10px] mt-1.5 ${
                  msg.role === 'user' ? 'text-violet-200' : 'text-gray-400'
                }`}>
                  {formatTime(msg.ts)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 items-end">
              <AIAvatar size="sm" />
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 border"
                style={{ background: '#ffffff', borderColor: '#e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Scroll-to-bottom button ── */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-4 w-8 h-8 rounded-full
              text-white shadow-lg flex items-center justify-center
              hover:opacity-90 transition-opacity z-10"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <CaretDown size={16} weight="bold" />
          </button>
        )}

        {/* ── Quick replies ── */}
        {!loading && messages[messages.length - 1]?.role === 'assistant' && (
          <div
            className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
            style={{ scrollbarWidth: 'none', borderTop: '1px solid #e5e7eb', background: '#ffffff' }}
          >
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                id={`quick-reply-${qr.slice(0, 10).replace(/\s/g, '-')}`}
                onClick={() => sendMessage(qr)}
                className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full
                  border transition-all duration-200 whitespace-nowrap
                  text-violet-600 hover:text-white hover:bg-violet-600 hover:border-violet-600"
                style={{ background: '#f3f0ff', borderColor: '#ddd6fe' }}
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* ── Input bar ── */}
        <div
          className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid #e5e7eb', background: '#ffffff' }}
        >
          <textarea
            id="ai-agent-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Nhắn tin với FoodieAI..."
            className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm
              text-gray-800 placeholder:text-gray-400 focus:outline-none
              transition-all max-h-28"
            style={{
              lineHeight: '1.5',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
            }}
            disabled={loading}
          />
          <button
            id="ai-agent-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              disabled:opacity-30 disabled:cursor-not-allowed
              active:scale-95 transition-all duration-150 shadow-md"
            style={{
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : '#ede9fe',
              boxShadow: input.trim() && !loading ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
            }}
          >
            {loading
              ? <CircleNotch size={17} weight="bold" className="text-white animate-spin" />
              : <PaperPlaneRight size={17} weight="fill" className={input.trim() ? 'text-white' : 'text-violet-400'} />
            }
          </button>
        </div>
      </div>
    </>
  );
}
