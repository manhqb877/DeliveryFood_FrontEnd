import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dbService } from '@/api/client';
import { Order } from '@/api/mockData';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  Check, X, Clock, ShoppingBag, MapPin, User, Phone,
  AlertCircle, RefreshCw, ChefHat, Bell, Flame, PackageCheck,
  CreditCard, Wallet, Truck, MessageSquare, History, CheckCircle2
} from 'lucide-react';

// --- Mini Status Stepper ---
const ORDER_STEPS = [
  { status: 'PLACED', label: 'Đặt Hàng', icon: '📦' },
  { status: 'CONFIRMED', label: 'Đã Duyệt', icon: '✅' },
  { status: 'PREPARING', label: 'Đang Nấu', icon: '🍳' },
  { status: 'READY_FOR_PICKUP', label: 'Sẵn Sàng', icon: '🚀' },
  { status: 'ASSIGNED', label: 'Shipper Nhận', icon: '🛵' },
  { status: 'DELIVERING', label: 'Đang Giao', icon: '🏃' },
  { status: 'DELIVERED', label: 'Đã Giao', icon: '🎉' },
  { status: 'COMPLETED', label: 'Hoàn Thành', icon: '⭐' },
];

const STEP_INDEX: Record<string, number> = {};
ORDER_STEPS.forEach((s, i) => { STEP_INDEX[s.status] = i; });

function OrderStepper({ status }: { status: string }) {
  const activeIdx = STEP_INDEX[status] ?? -1;
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold">
        <X className="w-3.5 h-3.5" /> Đơn hàng đã bị hủy
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-1">
      {ORDER_STEPS.map((step, idx) => {
        const done = idx < activeIdx;
        const active = idx === activeIdx;
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center min-w-[56px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all duration-500 ${
                  done
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? '✓' : step.icon}
              </div>
              <span className={`text-[9px] font-semibold mt-1 text-center leading-tight ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[8px] mb-3 transition-all duration-500 ${idx < activeIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// --- Order Timer (elapsed since placed) ---
function OrderTimer({ placedAt }: { placedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [placedAt]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const isUrgent = m >= 10;
  return (
    <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${isUrgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
      ⏱ {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </span>
  );
}

// --- Payment Method Icon ---
function PaymentIcon({ method }: { method: string }) {
  if (method === 'ONLINE') return <span className="inline-flex items-center gap-1 text-blue-700 font-semibold"><CreditCard className="w-3 h-3" /> Online</span>;
  if (method === 'WALLET') return <span className="inline-flex items-center gap-1 text-violet-700 font-semibold"><Wallet className="w-3 h-3" /> Ví</span>;
  return <span className="inline-flex items-center gap-1 text-amber-700 font-semibold"><Truck className="w-3 h-3" /> COD</span>;
}

// --- Single Order Card ---
interface OrderCardProps {
  order: Order;
  onConfirm: () => void;
  onReady: () => void;
  onHandover?: () => void;
  onReject: () => void;
  onViewDetail: () => void;
  entering?: boolean;
}

function OrderCard({ order, onConfirm, onReady, onHandover, onReject, onViewDetail, entering }: OrderCardProps) {
  const isNew = order.order_status === 'PLACED';
  const isPreparing = ['CONFIRMED', 'PREPARING'].includes(order.order_status);
  const isReady = order.order_status === 'READY_FOR_PICKUP';
  const isHistory = ['ASSIGNED', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.order_status);

  const cardClass = `
    bg-white rounded-xl border shadow-sm transition-all duration-500 p-5 flex flex-col gap-4 h-full
    ${entering ? 'animate-slide-in-up' : ''}
    ${isNew ? 'border-blue-300 shadow-blue-100' : ''}
    ${isPreparing ? 'border-amber-200 shadow-amber-50' : ''}
    ${isReady ? 'border-emerald-300 shadow-emerald-100' : ''}
    ${isHistory && order.order_status !== 'CANCELLED' ? 'border-slate-200' : ''}
    ${order.order_status === 'CANCELLED' ? 'border-slate-200 opacity-70' : ''}
    hover:shadow-md
  `;

  return (
    <div className={cardClass}>
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-bold text-blue-600">{order.order_code}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {new Date(order.placed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {(isNew || isPreparing) && <OrderTimer placedAt={order.placed_at} />}
          </div>
        </div>
        <Badge statusText={order.order_status} />
      </div>

      {/* Pulse dot for new */}
      {isNew && (
        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Đơn mới – cần xác nhận ngay!
        </div>
      )}

      {/* Customer Info */}
      <div className="text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{order.delivery_address.recipient_name || order.customer_name}</span>
          <span className="text-slate-400">• {order.customer_phone}</span>
        </div>
        <div className="flex items-start gap-1.5 text-slate-500">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            {order.delivery_address.building} – {order.delivery_address.unit}
            {order.delivery_address.floor ? ` (Tầng ${order.delivery_address.floor})` : ''}
          </span>
        </div>
        {order.delivery_address.note && (
          <div className="flex items-start gap-1 text-amber-700 italic text-[11px]">
            <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
            <span>"{order.delivery_address.note}"</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
        <span className="font-bold text-slate-600 text-[10px] uppercase tracking-wider block">
          🍽 Món ăn ({order.items.reduce((a, it) => a + it.quantity, 0)} phần):
        </span>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">
                <span className="text-blue-600 font-bold mr-1">{item.quantity}×</span>
                {item.item_name}
              </p>
              {item.selected_options && item.selected_options.length > 0 && (
                <p className="text-[10px] text-slate-500 italic pl-4">
                  + {item.selected_options.map((o) => o.option).join(', ')}
                </p>
              )}
              {item.item_note && (
                <p className="text-[10px] text-amber-700 italic pl-4">📝 {item.item_note}</p>
              )}
            </div>
            <span className="font-semibold text-slate-700 whitespace-nowrap">{item.total_price.toLocaleString()} ₫</span>
          </div>
        ))}
        {order.order_note && (
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-start gap-1 text-amber-800 bg-amber-50 p-1.5 rounded font-medium text-[11px]">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            Ghi chú: "{order.order_note}"
          </div>
        )}
      </div>

      {/* Total + Payment */}
      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
        <div className="space-y-0.5">
          <div className="text-slate-500">
            Tạm tính: <span className="font-semibold text-slate-700">{order.subtotal.toLocaleString()} ₫</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="text-emerald-600">
              Giảm giá ({order.promotion_code}): <span className="font-semibold">-{order.discount_amount.toLocaleString()} ₫</span>
            </div>
          )}
          <div className="text-slate-500">
            Phí ship: <span className="font-semibold text-slate-700">{order.delivery_fee.toLocaleString()} ₫</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-800 text-base">{order.total_amount.toLocaleString()} ₫</div>
          <div className="text-[11px] mt-0.5"><PaymentIcon method={order.payment_method} /></div>
        </div>
      </div>

      {/* FSM Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        {isNew && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReject}
              className="py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200 flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Từ Chối
            </button>
            <button
              onClick={onConfirm}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Xác Nhận
            </button>
          </div>
        )}
        {isPreparing && (
          <button
            onClick={onReady}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5" /> Báo Món Đã Sẵn Sàng
          </button>
        )}
        {isReady && (
          <div className="flex flex-col gap-2">
            <div className="py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5">
              <Truck className="w-3.5 h-3.5 animate-bounce text-emerald-600" /> Món Đã Sẵn Sàng — Chờ Shipper Đến Lấy
            </div>
            {onHandover && (
              <button
                onClick={onHandover}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Bàn Giao Cho Shipper (Đang Giao)
              </button>
            )}
          </div>
        )}
        {isHistory && (
          <button
            onClick={onViewDetail}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <History className="w-3.5 h-3.5" /> Xem Chi Tiết Đơn Hàng
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================
// Main Page
// =============================================
export function ShopOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'NEW' | 'PREPARING' | 'READY' | 'HISTORY'>('NEW');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [lastPollTime, setLastPollTime] = useState<Date>(new Date());
  const [transitioning, setTransitioning] = useState<number | null>(null);
  const prevOrderIds = useRef<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadOrders = useCallback(async () => {
    const myShop = await dbService.getMyShop();
    const currentShopId = myShop?.id || 1;
    const list = await dbService.getOrders({ shop_id: currentShopId });
    setOrders(list);
    setLastPollTime(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('hyperlocal_orders');
      channel.onmessage = () => {
        loadOrders();
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      channel?.close();
    };
  }, [loadOrders]);

  const handleUpdateStatus = async (
    orderId: number,
    nextStatus: Order['order_status'],
    reason?: string,
    targetTab?: 'NEW' | 'PREPARING' | 'READY' | 'HISTORY'
  ) => {
    setTransitioning(orderId);
    await new Promise(r => setTimeout(r, 300)); // brief visual transition
    try {
      await dbService.updateOrderStatus(orderId, nextStatus, 'SHOP_MANAGER', reason);
      
      // Auto-switch to next progress stage as user requested ("xác nhận xong chuyển tiến trình")
      if (targetTab) {
        setActiveTab(targetTab);
        setCurrentPage(1);
      } else if (nextStatus === 'CONFIRMED' || nextStatus === 'PREPARING') {
        setActiveTab('PREPARING');
        setCurrentPage(1);
        showToast('✓ Đã xác nhận đơn hàng thành công! Đơn đã chuyển sang tiến trình "Đang Nấu".');
      } else if (nextStatus === 'READY_FOR_PICKUP') {
        setActiveTab('READY');
        setCurrentPage(1);
        showToast('✓ Đã báo món sẵn sàng! Đơn đã chuyển sang tiến trình "Chờ Lấy".');
      } else if (['DELIVERING', 'DELIVERED', 'COMPLETED'].includes(nextStatus)) {
        setActiveTab('HISTORY');
        setCurrentPage(1);
        showToast('✓ Đã bàn giao cho Shipper! Đơn đã chuyển sang tiến trình "Lịch Sử".');
      } else if (nextStatus === 'CANCELLED') {
        setActiveTab('HISTORY');
        setCurrentPage(1);
        showToast('Đã từ chối đơn hàng.');
      }
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      await loadOrders();
      setTransitioning(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    if (!cancelReasonInput.trim()) {
      alert('Vui lòng nhập lý do từ chối đơn hàng!');
      return;
    }
    await handleUpdateStatus(cancelModalOrder.id, 'CANCELLED', cancelReasonInput, 'HISTORY');
    setCancelModalOrder(null);
    setCancelReasonInput('');
  };

  const newOrders = orders.filter((o) => o.order_status === 'PLACED');
  const preparingOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING'].includes(o.order_status));
  const readyOrders = orders.filter((o) => o.order_status === 'READY_FOR_PICKUP');
  const historyOrders = orders.filter((o) =>
    ['ASSIGNED', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.order_status)
  );

  const currentList =
    activeTab === 'NEW' ? newOrders :
    activeTab === 'PREPARING' ? preparingOrders :
    activeTab === 'READY' ? readyOrders :
    historyOrders;

  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const paginatedList = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tabs = [
    { key: 'NEW' as const, label: 'Đơn Mới', icon: Bell, count: newOrders.length, color: 'blue', dotColor: 'bg-blue-600' },
    { key: 'PREPARING' as const, label: 'Đang Nấu', icon: ChefHat, count: preparingOrders.length, color: 'amber', dotColor: 'bg-amber-500' },
    { key: 'READY' as const, label: 'Chờ Lấy', icon: Flame, count: readyOrders.length, color: 'emerald', dotColor: 'bg-emerald-600' },
    { key: 'HISTORY' as const, label: 'Lịch Sử', icon: History, count: historyOrders.length, color: 'slate', dotColor: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Injected CSS for animation */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes scaleFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.92); }
        }
        .animate-exit {
          animation: scaleFadeOut 0.35s ease-in both;
        }
      `}</style>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-500 font-semibold text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span>Xử Lý Đơn Hàng Real-Time</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tự động cập nhật 5s/lần — Cập nhật lần cuối: {lastPollTime.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Làm Mới
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === tab.key
                  ? `bg-${tab.color === 'blue' ? 'blue' : tab.color === 'amber' ? 'amber' : tab.color === 'emerald' ? 'emerald' : 'slate'}-600 border-transparent text-white shadow-md`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${activeTab === tab.key ? 'text-white/80' : 'text-slate-400'}`} />
                <span className={`text-2xl font-bold ${activeTab === tab.key ? 'text-white' : 'text-slate-800'}`}>{tab.count}</span>
              </div>
              <p className={`text-xs font-semibold mt-2 ${activeTab === tab.key ? 'text-white/90' : 'text-slate-600'}`}>{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải đơn hàng...
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-slate-600 font-semibold text-sm">Không có đơn hàng nào ở mục này.</p>
          <p className="text-slate-400 text-xs mt-1">Đơn mới sẽ xuất hiện tự động mỗi 5 giây.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {paginatedList.map((order) => (
              <div
                key={order.id}
                className={transitioning === order.id ? 'animate-exit pointer-events-none' : 'animate-slide-in-up'}
              >
                <OrderCard
                  order={order}
                  entering={!prevOrderIds.current.has(order.id)}
                  onConfirm={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                  onReady={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                  onHandover={() => handleUpdateStatus(order.id, 'DELIVERING')}
                  onReject={() => setCancelModalOrder(order)}
                  onViewDetail={() => setDetailOrder(order)}
                />
              </div>
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        title="Từ Chối Đơn Hàng"
        subtitle={`Mã đơn: ${cancelModalOrder?.order_code}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>Đơn hàng bị từ chối sẽ tự động hoàn tiền nếu khách đã thanh toán Online/Ví. Hành động này không thể hoàn tác.</span>
          </div>

          {cancelModalOrder && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
              <p className="font-semibold text-slate-800">{cancelModalOrder.customer_name} — {cancelModalOrder.customer_phone}</p>
              <p className="text-slate-500">{cancelModalOrder.items.map(i => `${i.quantity}× ${i.item_name}`).join(', ')}</p>
              <p className="text-slate-700 font-bold">{cancelModalOrder.total_amount.toLocaleString()} ₫</p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['Hết nguyên liệu', 'Quán quá tải', 'Đang đóng cửa sớm', 'Món không còn phục vụ'].map((r) => (
                <button
                  key={r}
                  onClick={() => setCancelReasonInput(r)}
                  className={`px-2 py-1 rounded border text-[11px] font-medium cursor-pointer transition-colors ${cancelReasonInput === r ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Hoặc nhập lý do riêng..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCancelModalOrder(null)} className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer text-xs">
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmCancel}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 cursor-pointer text-xs"
            >
              Xác Nhận Từ Chối
            </button>
          </div>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title="Chi Tiết Đơn Hàng"
        subtitle={`Mã đơn: ${detailOrder?.order_code}`}
      >
        {detailOrder && (
          <div className="space-y-5 text-xs">
            {/* Status Stepper */}
            <div>
              <p className="font-bold text-slate-700 mb-2 text-[11px] uppercase tracking-wider">Hành Trình Đơn Hàng</p>
              <OrderStepper status={detailOrder.order_status} />
            </div>

            {/* Order info grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Khách hàng</span>
                <p className="font-bold text-slate-800">{detailOrder.customer_name}</p>
                <p className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {detailOrder.customer_phone}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Trạng thái</span>
                <div className="mt-1"><Badge statusText={detailOrder.order_status} /></div>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Phương thức TT</span>
                <p className="font-semibold text-slate-800 mt-0.5"><PaymentIcon method={detailOrder.payment_method} /></p>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">TT Thanh Toán</span>
                <div className="mt-0.5"><Badge statusText={detailOrder.payment_status} /></div>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Thời gian đặt</span>
                <p className="font-semibold text-slate-800">{new Date(detailOrder.placed_at).toLocaleString('vi-VN')}</p>
              </div>
              {detailOrder.completed_at && (
                <div>
                  <span className="text-slate-400 font-medium text-[11px]">Hoàn thành</span>
                  <p className="font-semibold text-slate-800">{new Date(detailOrder.completed_at).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
              <p className="font-bold text-blue-800 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Địa chỉ giao hàng</p>
              <p className="text-slate-700">{detailOrder.delivery_address.building} — {detailOrder.delivery_address.unit}
                {detailOrder.delivery_address.floor ? ` (Tầng ${detailOrder.delivery_address.floor})` : ''}</p>
              {detailOrder.delivery_address.note && <p className="text-amber-700 italic mt-1">Ghi chú: {detailOrder.delivery_address.note}</p>}
            </div>

            {/* Items */}
            <div>
              <p className="font-bold text-slate-700 mb-2 text-[11px] uppercase tracking-wider">Danh Sách Món</p>
              <div className="space-y-2">
                {detailOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between gap-2 bg-white border border-slate-100 rounded-lg p-2.5">
                    <div>
                      <span className="text-blue-600 font-bold">{item.quantity}×</span> {item.item_name}
                      {item.selected_options?.map(o => (
                        <span key={o.option} className="ml-1 text-slate-400 text-[10px]">• {o.option}</span>
                      ))}
                    </div>
                    <span className="font-semibold whitespace-nowrap">{item.total_price.toLocaleString()} ₫</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-slate-500"><span>Tạm tính</span><span>{detailOrder.subtotal.toLocaleString()} ₫</span></div>
              {detailOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá ({detailOrder.promotion_code})</span>
                  <span>-{detailOrder.discount_amount.toLocaleString()} ₫</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500"><span>Phí giao hàng</span><span>{detailOrder.delivery_fee.toLocaleString()} ₫</span></div>
              <div className="flex justify-between font-bold text-slate-800 text-sm pt-1 border-t border-slate-200">
                <span>Tổng cộng</span><span>{detailOrder.total_amount.toLocaleString()} ₫</span>
              </div>
            </div>

            {detailOrder.cancel_reason && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                <p className="font-bold mb-0.5">Lý do hủy đơn:</p>
                <p>{detailOrder.cancel_reason}</p>
                {detailOrder.cancelled_by && <p className="text-rose-500 text-[10px] mt-1">Hủy bởi: {detailOrder.cancelled_by}</p>}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                {detailOrder.order_status === 'PLACED' && (
                  <>
                    <button
                      onClick={() => {
                        const ord = detailOrder;
                        setDetailOrder(null);
                        setCancelModalOrder(ord);
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Từ Chối
                    </button>
                    <button
                      onClick={async () => {
                        await handleUpdateStatus(detailOrder.id, 'CONFIRMED');
                        setDetailOrder(null);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Xác Nhận Đơn
                    </button>
                  </>
                )}
                {['CONFIRMED', 'PREPARING'].includes(detailOrder.order_status) && (
                  <button
                    onClick={async () => {
                      await handleUpdateStatus(detailOrder.id, 'READY_FOR_PICKUP');
                      setDetailOrder(null);
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" /> Báo Món Đã Sẵn Sàng
                  </button>
                )}
                {detailOrder.order_status === 'READY_FOR_PICKUP' && (
                  <button
                    onClick={async () => {
                      await handleUpdateStatus(detailOrder.id, 'DELIVERING');
                      setDetailOrder(null);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" /> Bàn Giao Cho Shipper
                  </button>
                )}
              </div>
              <button onClick={() => setDetailOrder(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 cursor-pointer text-xs">
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
