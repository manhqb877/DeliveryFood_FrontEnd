'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Clock, MapPin, Package, RefreshCcw, Search, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AccountSidebarLayout from '@/components/layout/AccountSidebarLayout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
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

      const res = await fetch(`${API}/orders`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || data); // Xử lý nếu bọc qua ApiResponse
      } else {
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PLACED':
        return { text: 'Chờ xác nhận', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock };
      case 'CONFIRMED':
        return { text: 'Đang chuẩn bị', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package };
      case 'DELIVERING':
        return { text: 'Đang giao hàng', color: 'text-[var(--color-primary)]', bg: 'bg-yellow-100', icon: Truck };
      case 'COMPLETED':
        return { text: 'Thành công', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };
      case 'CANCELLED':
        return { text: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: Search }; 
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Package };
    }
  };

  if (loading) {
    return (
      <AccountSidebarLayout activeTab="orders">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#FECD00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AccountSidebarLayout activeTab="orders">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          Đơn hàng của tôi
        </h2>
        <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded-2xl text-center border border-gray-100 mt-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-6">Bạn chưa đặt đơn hàng nào trên beFood.</p>
            <Link 
              href="/"
              className="inline-flex h-12 items-center px-8 bg-[#FECD00] hover:bg-[#e6b800] text-[#002B5E] transition-colors font-bold rounded-xl"
            >
              Bắt đầu đặt món
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.orderStatus);
              const StatusIcon = statusInfo.icon;
              const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
              const extraItemsCount = order.items ? order.items.length - 1 : 0;

              return (
                <div 
                  key={order.id} 
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:border-[#FECD00] hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-lg">{order.shopName || 'Nhà hàng beFood'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        Mã đơn: <span className="font-semibold text-gray-700">{order.orderCode}</span>
                      </p>
                      {order.placedAt && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.placedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-xs font-bold">{statusInfo.text}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-xl mb-4 group-hover:bg-yellow-50 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      {firstItem?.itemImage ? (
                        <Image src={firstItem.itemImage} alt={firstItem.itemName} fill className="object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {firstItem?.quantity}x {firstItem?.itemName || 'Món ăn'}
                      </p>
                      {extraItemsCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          và {extraItemsCount} món khác...
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-0.5">Tổng tiền</p>
                      <p className="font-black text-gray-900">
                        {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 max-w-[60%]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : (order.deliveryAddress?.fullAddress || order.deliveryAddress?.addressLine || 'Không rõ địa chỉ')}
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-[#FECD00] text-[#002B5E] hover:bg-[#e6b800] rounded-lg text-sm font-semibold transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 pt-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-sm font-medium text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AccountSidebarLayout>
  );
}
