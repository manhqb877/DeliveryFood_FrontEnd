'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageSquare,
  ShoppingBag,
  RefreshCw,
  ChefHat,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  Flame,
  Ticket
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ShipperTrackingMap = dynamic(
  () => import('@/components/ShipperTrackingMap').then((mod) => mod.ShipperTrackingMap),
  { ssr: false, loading: () => <div className="w-full h-64 bg-slate-100 animate-pulse rounded-xl" /> }
);

const API_GATEWAY = 'http://localhost:8080/api/v1';

export default function TrackingPage() {
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [error, setError] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);
  const router = useRouter();

  // Load user orders on mount & check query params
  useEffect(() => {
    fetchUserOrders();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        setOrderCode(code);
        fetchOrderByCode(code);
      }
    }
  }, []);

  const fetchUserOrders = async () => {
    setLoadingUserOrders(true);
    try {
      let token = null;
      let userId = null;
      let guestId = null;

      if (typeof window !== 'undefined') {
        token = localStorage.getItem('fooddelivery_access_token');
        const userStr = localStorage.getItem('fooddelivery_user');
        if (userStr) {
          try {
            userId = JSON.parse(userStr).id;
          } catch (e) {}
        }
        guestId = localStorage.getItem('befood_guest_session_id');
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        if (userId) headers['X-User-Id'] = userId;
      } else if (guestId) {
        headers['X-Guest-Session-Id'] = guestId;
      }

      const res = await fetch(`${API_GATEWAY}/orders`, { headers });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setUserOrders(list);
      }
    } catch (e) {
      console.warn('Could not load user orders in tracking page:', e);
    } finally {
      setLoadingUserOrders(false);
    }
  };

  const fetchOrderByCode = async (codeToSearch) => {
    if (!codeToSearch || !codeToSearch.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_GATEWAY}/orders/code/${codeToSearch.trim()}`);
      if (!res.ok) {
        throw new Error('Không tìm thấy đơn hàng hoặc mã không hợp lệ');
      }
      const data = await res.json();
      setOrder(data);

      try {
        const delRes = await fetch(`${API_GATEWAY}/tracking/deliveries/order/${data.id}`);
        if (delRes.ok) {
          const delData = await delRes.json();
          setDeliveryData(delData);
        } else {
          setDeliveryData(null);
        }
      } catch (e) {
        console.warn('Could not fetch delivery data:', e);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrderByCode(orderCode);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Đã đặt hàng', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock, progress: 1 };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: CheckCircle2, progress: 2 };
      case 'PREPARING':
      case 'COOKING':
        return { label: 'Đang chuẩn bị', color: 'text-amber-600', bg: 'bg-amber-50', icon: Package, progress: 2 };
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED':
      case 'DELIVERING':
      case 'ON_THE_WAY':
        return { label: 'Đang giao hàng', color: 'text-orange-600', bg: 'bg-orange-50', icon: Truck, progress: 3 };
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: 'Giao thành công', color: 'text-green-600', bg: 'bg-green-50', icon: MapPin, progress: 4 };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, progress: 0 };
      default:
        return { label: 'Chờ xử lý', color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock, progress: 1 };
    }
  };

  const getKanbanStageNumber = (status) => {
    switch (status) {
      case 'PLACED':
        return 1;
      case 'CONFIRMED':
      case 'PREPARING':
      case 'COOKING':
        return 2;
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED':
      case 'DELIVERING':
      case 'ON_THE_WAY':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = order ? getKanbanStageNumber(order.orderStatus) : 1;
  const isOrderActive = order && !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.orderStatus);

  const kanbanStages = [
    {
      step: 1,
      title: '1. Đã Tiếp Nhận Đơn',
      sub: 'Hệ thống tự động',
      icon: Clock,
      desc: 'Đơn hàng đã được tạo thành công và chuyển đến gian hàng.',
      timeLabel: order?.placedAt ? new Date(order.placedAt).toLocaleTimeString('vi-VN') : 'Vừa xong',
    },
    {
      step: 2,
      title: '2. Bếp Đang Nấu Món',
      sub: order?.shopName || 'Nhà hàng đối tác',
      icon: ChefHat,
      desc: 'Đầu bếp đang chế biến các món nóng hổi và đóng gói cẩn thận.',
      liveBadge: 'Đang nấu món',
    },
    {
      step: 3,
      title: '3. Tài Xế Đang Giao',
      sub: 'Giao hàng hỏa tốc',
      icon: Truck,
      desc: 'Shipper đã nhận món từ quán và đang trên đường di chuyển đến bạn.',
      liveBadge: 'Đang trên đường',
    },
    {
      step: 4,
      title: '4. Giao Hàng Thành Công',
      sub: 'Giao tận cửa',
      icon: MapPin,
      desc: 'Đơn hàng đã đến nơi. Chúc bạn có một bữa ăn ngon miệng!',
      liveBadge: 'Hoàn tất',
    },
  ];

  return (
    <div className="bg-slate-50/50 min-h-[calc(100vh-140px)] pb-16">
      {/* Banner & Search Form */}
      <div className="bg-[#FECD00] py-12 md:py-16 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-[#002B5E] mb-3 uppercase tracking-tight">
            Tra Cứu & Theo Dõi Đơn Hàng
          </h1>
          <p className="text-gray-800 font-medium mb-6 text-sm md:text-base">
            Kiểm tra trạng thái thời gian thực, xem lộ trình xử lý Kanban và vị trí shipper
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Nhập mã đơn hàng (VD: ORD-12345678)"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-transparent focus:border-[#002B5E] focus:outline-none shadow-sm text-gray-800 text-base md:text-lg uppercase transition-all bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderCode.trim()}
              className="bg-[#002B5E] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#001a38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Tra cứu ngay</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* DANH SÁCH CÁC ĐƠN HÀNG CỦA USER */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#002B5E] text-white rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Đơn Hàng Gần Đây Của Bạn
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {userOrders.length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchUserOrders}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loadingUserOrders ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {loadingUserOrders ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white border border-slate-200 rounded-2xl p-4 animate-pulse"></div>
            ))}
          </div>
        ) : userOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userOrders.slice(0, 6).map((ord) => {
              const code = ord.orderCode || ord.order_code || `ORD-${ord.id}`;
              const statusInfo = getStatusDisplay(ord.orderStatus || ord.order_status);
              const isActive = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING'].includes(
                ord.orderStatus || ord.order_status
              );
              const isSelected = order && (order.orderCode === code || order.id === ord.id);

              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setOrderCode(code);
                    fetchOrderByCode(code);
                  }}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-3 text-xs ${
                    isSelected
                      ? 'border-[#002B5E] ring-2 ring-[#002B5E]/30 bg-blue-50/30'
                      : isActive
                      ? 'border-amber-300 ring-1 ring-amber-200 hover:border-amber-400'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-black text-sm text-[#002B5E]">#{code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2">
                      {ord.placedAt || ord.placed_at ? new Date(ord.placedAt || ord.placed_at).toLocaleString('vi-VN') : '—'}
                    </p>

                    <p className="font-medium text-slate-700 line-clamp-1">
                      {ord.items && ord.items.length > 0
                        ? ord.items.map((it) => `${it.quantity || 1}x ${it.itemName || it.item_name}`).join(', ')
                        : 'Món ăn đặt hàng'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <span className="font-black text-slate-900 text-sm">
                      {Number(ord.totalAmount || ord.total_amount || 0).toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {isActive ? 'Xem lộ trình' : 'Xem chi tiết'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
            Bạn chưa có đơn hàng nào hoặc có thể nhập mã đơn phía trên để tra cứu.
          </div>
        )}
      </div>

      {/* RESULT CONTENT */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-6 rounded-2xl text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-bold text-base mb-1">Không tìm thấy đơn hàng!</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!order && !error && !loading && (
          <div className="text-center py-16 opacity-60 flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              Chọn đơn hàng từ danh sách trên hoặc nhập mã đơn để xem tiến độ chi tiết
            </p>
          </div>
        )}

        {order && (
          <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-8 shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">#{order.orderCode}</h2>
                  {order.promotionCode && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      {order.promotionCode}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  Thời gian đặt: {new Date(order.placedAt).toLocaleString('vi-VN')}
                </p>
              </div>

              {(() => {
                const statusInfo = getStatusDisplay(order.orderStatus);
                const StatusIcon = statusInfo.icon;
                return (
                  <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold ${statusInfo.bg} ${statusInfo.color} shadow-2xs`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="text-sm">{statusInfo.label}</span>
                  </div>
                );
              })()}
            </div>

            {/* LỘ TRÌNH KANBAN XỬ LÝ ĐƠN HÀNG (ANIMATED KANBAN PIPELINE) */}
            {order.orderStatus !== 'CANCELLED' && (
              <div className="bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-50 p-5 md:p-6 rounded-3xl border border-amber-200/60 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-amber-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#002B5E] text-white flex items-center justify-center font-bold shadow-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-extrabold text-[#002B5E] uppercase tracking-wide">
                        Lộ Trình Kanban Xử Lý Đơn Hàng
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Quy trình thực tế 4 giai đoạn từ tiếp nhận đến khi shipper giao tận tay bạn
                      </p>
                    </div>
                  </div>

                  {isOrderActive && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-xs animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <span>Hệ thống đang xử lý trực tiếp</span>
                    </div>
                  )}
                </div>

                {/* 4 Kanban Stage Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                  {kanbanStages.map((st) => {
                    const isCompleted = currentStage > st.step;
                    const isCurrent = currentStage === st.step;
                    const isPending = currentStage < st.step;
                    const StageIcon = st.icon;

                    return (
                      <div
                        key={st.step}
                        className={`rounded-2xl p-4 border transition-all duration-300 relative flex flex-col justify-between gap-3 ${
                          isCurrent
                            ? 'bg-white border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-lg scale-[1.02]'
                            : isCompleted
                            ? 'bg-white border-emerald-300 shadow-2xs'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div>
                          {/* Header badge */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Giai đoạn {st.step}
                            </span>
                            {isCompleted ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Hoàn tất
                              </span>
                            ) : isCurrent ? (
                              <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                Đang diễn ra
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Chờ đến lượt</span>
                            )}
                          </div>

                          {/* Icon & Title */}
                          <div className="flex items-start gap-3 mb-2">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isCurrent
                                  ? 'bg-amber-500 text-white shadow-md'
                                  : isCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              <StageIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4
                                className={`text-xs md:text-sm font-bold ${
                                  isCurrent ? 'text-amber-900 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                                }`}
                              >
                                {st.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{st.sub}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{st.desc}</p>
                        </div>

                        {/* Bottom animated status bar for active card */}
                        {isCurrent && (
                          <div className="pt-2">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full animate-pulse w-full"></div>
                            </div>
                            <p className="text-[10px] text-amber-700 font-semibold mt-1 text-center">
                              {st.liveBadge || 'Đang xử lý'} • Cập nhật tự động
                            </p>
                          </div>
                        )}
                        {isCompleted && (
                          <p className="text-[10px] text-emerald-600 font-semibold pt-1 border-t border-slate-100">
                            ✓ Đã hoàn thành giai đoạn này
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vị trí Shipper (hiện khi đang lấy hàng hoặc đang giao) */}
            {order.orderStatus !== 'CANCELLED' &&
              ['PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'DELIVERING'].includes(order.orderStatus) &&
              deliveryData?.shipperId && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-xs md:text-sm border-b pb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-500" />
                    Định Vị Vị Trí Shipper Giao Hàng Thời Gian Thực
                  </h3>
                  <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 shadow-sm">
                    <ShipperTrackingMap
                      shipperId={deliveryData.shipperId}
                      pickupLocation={{ lat: deliveryData.pickupLat || 10.7769, lng: deliveryData.pickupLng || 106.7009 }}
                      deliveryLocation={{ lat: deliveryData.deliveryLat || 10.78, lng: deliveryData.deliveryLng || 106.705 }}
                    />
                  </div>
                </div>
              )}

            {/* Order Details & Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs md:text-sm border-b pb-2">
                  Thông tin giao hàng
                </h3>
                <div className="space-y-3.5 text-xs md:text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Người nhận</p>
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-gray-600">{order.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-800">
                      {typeof order.deliveryAddress === 'string'
                        ? order.deliveryAddress
                        : order.deliveryAddress?.fullAddress || order.deliveryAddress?.addressLine || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Phương thức thanh toán</p>
                    <p className="font-semibold text-gray-800">
                      {order.paymentMethod === 'CASH' || order.paymentMethod === 'COD'
                        ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                        : order.paymentMethod || 'Thanh toán trực tuyến'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs md:text-sm border-b pb-2">
                  Chi tiết món ăn ({order.items?.length || 0})
                </h3>
                <div className="space-y-3 text-xs md:text-sm">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden relative shrink-0">
                        {item.itemImage ? (
                          <Image src={item.itemImage} alt={item.itemName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-900">{item.itemName}</p>
                          <p className="font-bold text-gray-900">
                            {Number(item.totalPrice).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                        {item.selectedOptions?.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                            {item.selectedOptions.map((o) => `${o.group}: ${o.option}`).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-3.5 border-t border-dashed border-gray-200 text-xs md:text-sm space-y-2">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Tổng tiền món</span>
                    <span>{Number(order.totalAmount - (order.shippingFee || 0) + (order.discountAmount || 0)).toLocaleString('vi-VN')} ₫</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                      <span>Voucher giảm giá ({order.promotionCode})</span>
                      <span>-{Number(order.discountAmount).toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Phí giao hàng</span>
                    <span>{Number(order.shippingFee || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900 text-base">Tổng thanh toán</span>
                    <span className="font-black text-red-600 text-xl">
                      {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('open-shop-chat', {
                      detail: {
                        shopId: order.shopId,
                        orderId: order.id,
                        shopName: order.shopName,
                        shopLogo: order.shopLogo,
                      },
                    })
                  );
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-xs md:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn tin cho quán</span>
              </button>

              <button
                onClick={() => router.push(`/orders/${order.id}`)}
                className="flex items-center gap-1.5 text-[#002B5E] font-bold hover:text-blue-700 transition-colors text-xs md:text-sm cursor-pointer"
              >
                <span>Xem trang đơn hàng đầy đủ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
