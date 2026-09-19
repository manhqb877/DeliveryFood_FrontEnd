'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, MapPin, Truck, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const API_GATEWAY = 'http://localhost:8080/api/v1';

export default function TrackingPage() {
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderCode.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_GATEWAY}/orders/code/${orderCode.trim()}`);
      if (!res.ok) {
        throw new Error('Không tìm thấy đơn hàng hoặc mã không hợp lệ');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Đã đặt hàng', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock, progress: 1 };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: CheckCircle2, progress: 2 };
      case 'PREPARING':
        return { label: 'Đang chuẩn bị', color: 'text-amber-600', bg: 'bg-amber-50', icon: Package, progress: 3 };
      case 'DELIVERING':
        return { label: 'Đang giao hàng', color: 'text-orange-600', bg: 'bg-orange-50', icon: Truck, progress: 4 };
      case 'DELIVERED':
        return { label: 'Giao thành công', color: 'text-green-600', bg: 'bg-green-50', icon: MapPin, progress: 5 };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: CheckCircle2, progress: 0 };
      default:
        return { label: 'Chờ xử lý', color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock, progress: 0 };
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-140px)]">
      {/* Banner */}
      <div className="bg-[#FECD00] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-[#002B5E] mb-4 uppercase">Tra Cứu Đơn Hàng</h1>
          <p className="text-gray-800 font-medium mb-8">Nhập mã đơn hàng của bạn để kiểm tra tình trạng giao hàng</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Ví dụ: ORD-12345678"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-transparent focus:border-[#002B5E] focus:outline-none shadow-sm text-gray-800 text-lg uppercase transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !orderCode.trim()}
              className="bg-[#002B5E] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#001a38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Tra cứu ngay'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-6 rounded-2xl text-center shadow-sm">
            <p className="font-bold mb-1">Không tìm thấy đơn hàng!</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!order && !error && !loading && (
          <div className="text-center py-20 opacity-50 flex flex-col items-center">
            <Package className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Nhập mã đơn hàng để xem chi tiết</p>
          </div>
        )}

        {order && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">#{order.orderCode}</h2>
                <p className="text-gray-500 text-sm">{new Date(order.placedAt).toLocaleString('vi-VN')}</p>
              </div>
              
              {(() => {
                const statusInfo = getStatusDisplay(order.orderStatus);
                const StatusIcon = statusInfo.icon;
                return (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    {statusInfo.label}
                  </div>
                );
              })()}
            </div>

            {/* Tracking Progress */}
            {order.orderStatus !== 'CANCELLED' && (
              <div className="mb-12">
                <div className="relative flex justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#FECD00] rounded-full z-0 transition-all duration-500"
                    style={{ width: `${((getStatusDisplay(order.orderStatus).progress - 1) / 4) * 100}%` }}
                  ></div>
                  
                  {[
                    { label: 'Đã đặt', icon: Clock, step: 1 },
                    { label: 'Xác nhận', icon: CheckCircle2, step: 2 },
                    { label: 'Chuẩn bị', icon: Package, step: 3 },
                    { label: 'Giao hàng', icon: Truck, step: 4 },
                    { label: 'Hoàn thành', icon: MapPin, step: 5 }
                  ].map((s, i) => {
                    const currentProgress = getStatusDisplay(order.orderStatus).progress;
                    const isActive = s.step <= currentProgress;
                    const isCurrent = s.step === currentProgress;
                    const Icon = s.icon;
                    return (
                      <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-[#FECD00] border-[#FECD00] text-[#002B5E]' : 'bg-white border-gray-200 text-gray-300'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs md:text-sm font-bold absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm border-b pb-2">Thông tin giao hàng</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Người nhận</p>
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-gray-600">{order.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : (order.deliveryAddress?.fullAddress || order.deliveryAddress?.addressLine)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Phương thức thanh toán</p>
                    <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm border-b pb-2">Chi tiết món ({order.items?.length})</h3>
                <div className="space-y-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden relative shrink-0">
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
                          <p className="font-bold text-gray-900">{Number(item.totalPrice).toLocaleString('vi-VN')}đ</p>
                        </div>
                        <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                        {item.selectedOptions?.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {item.selectedOptions.map(o => `${o.group}: ${o.option}`).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-500">Tổng tiền món</p>
                    <p className="font-medium text-gray-900">{Number(order.totalAmount - (order.shippingFee || 0)).toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-500">Phí giao hàng</p>
                    <p className="font-medium text-gray-900">{Number(order.shippingFee || 0).toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900 text-lg">Tổng thanh toán</p>
                    <p className="font-black text-red-600 text-xl">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => router.push(`/orders/${order.id}`)}
                className="flex items-center gap-2 text-[#002B5E] font-bold hover:text-blue-700 transition-colors"
              >
                Xem chi tiết đầy đủ
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
