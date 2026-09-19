'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Clock, MapPin, Package, Receipt, Truck } from 'lucide-react';
import Image from 'next/image';
import AccountSidebarLayout from '@/components/layout/AccountSidebarLayout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails(params.id);
    }
  }, [params.id]);

  const fetchOrderDetails = async (orderId) => {
    try {
      // Lấy từ authService hoặc TOKEN_KEYS
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

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        if (userId) {
          headers['X-User-Id'] = userId;
        }
      } else if (guestId) {
        headers['X-Guest-Session-Id'] = guestId;
      }

      const res = await fetch(`${API}/orders/${orderId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        // Assuming ApiResponse wrapper or direct object
        setOrder(data.data || data);
      } else {
        setError('Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AccountSidebarLayout activeTab="orders">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountSidebarLayout activeTab="orders">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Oops!</h2>
            <p className="text-gray-500 mb-6">{error || 'Không tìm thấy đơn hàng'}</p>
            <button 
              onClick={() => router.push('/orders')}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </AccountSidebarLayout>
    );
  }

  return (
    <AccountSidebarLayout activeTab="orders">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/orders')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          Chi tiết đơn hàng
        </h2>
      </div>

      <div className="space-y-4">
        {/* Status Banner */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Đặt hàng thành công!
          </h2>
          <p className="text-gray-500 text-sm">
            Mã đơn: <span className="font-bold text-gray-900">{order.orderCode}</span>
          </p>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            Trạng thái giao hàng
          </h3>
          <div className="flex items-center text-sm font-semibold text-gray-700">
            {order.orderStatus === 'PLACED' && "Đang chờ nhà hàng xác nhận..."}
            {order.orderStatus === 'CONFIRMED' && "Nhà hàng đang chuẩn bị món..."}
            {order.orderStatus === 'DELIVERING' && "Shipper đang giao hàng đến bạn!"}
            {order.orderStatus === 'COMPLETED' && "Giao hàng thành công!"}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Thông tin giao hàng
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 leading-relaxed">
              {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : (order.deliveryAddress?.fullAddress || order.deliveryAddress?.addressLine || 'Không có địa chỉ')}
            </p>
            {order.deliveryAddress?.note && (
              <p className="text-gray-500 italic mt-2">
                Ghi chú: {order.deliveryAddress.note}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-red-600" />
            Danh sách món ăn
          </h3>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.itemImage ? (
                    <img src={item.itemImage} alt={item.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 text-sm">{item.itemName}</p>
                    <p className="font-bold text-gray-900 text-sm ml-4">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice || (item.unitPrice * item.quantity))}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                  </p>
                  {item.selectedOptions && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {typeof item.selectedOptions === 'string' 
                        ? item.selectedOptions 
                        : Array.isArray(item.selectedOptions) 
                          ? item.selectedOptions.map(opt => `${opt.groupName}: ${opt.optionName}`).join(', ')
                          : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí giao hàng</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.deliveryFee || 0)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Khuyến mãi</span>
                <span className="font-medium">
                  -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountAmount)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-3">
              <span className="font-bold text-gray-900">Tổng thanh toán</span>
              <span className="font-black text-xl text-red-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
              </span>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-xl flex items-center gap-3 border border-yellow-100">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black flex-shrink-0">
                $
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt' : 'Thanh toán online'}
                </p>
                <p className="text-xs text-gray-600">
                  Vui lòng thanh toán cho tài xế khi nhận hàng
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AccountSidebarLayout>
  );
}
