'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  RefreshCcw, 
  Search, 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  X, 
  RotateCcw,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import AccountSidebarLayout from '@/components/layout/AccountSidebarLayout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PLACED', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đang chuẩn bị' },
  { key: 'DELIVERING', label: 'Đang giao hàng' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter & Search states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL | TODAY | 7_DAYS | 30_DAYS | CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
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

      const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
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
        setOrders(data.data || data);
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
        return { text: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: X }; 
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Package };
    }
  };

  // Status counts (based on all orders)
  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length };
    orders.forEach(o => {
      const s = o.orderStatus;
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      if (selectedStatus !== 'ALL' && order.orderStatus !== selectedStatus) {
        return false;
      }

      // 2. Search Keyword (Code, Shop Name, Item Names)
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const matchCode = (order.orderCode || '').toLowerCase().includes(q);
        const matchShop = (order.shopName || '').toLowerCase().includes(q);
        const matchItems = (order.items || []).some(item => 
          (item.itemName || '').toLowerCase().includes(q)
        );
        if (!matchCode && !matchShop && !matchItems) {
          return false;
        }
      }

      // 3. Date Filter
      const orderDateStr = order.placedAt || order.createdAt;
      if (orderDateStr && dateFilter !== 'ALL') {
        const orderDate = new Date(orderDateStr);
        const now = new Date();

        if (dateFilter === 'TODAY') {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (orderDate < todayStart) return false;
        } else if (dateFilter === '7_DAYS') {
          const past7 = new Date();
          past7.setDate(past7.getDate() - 7);
          past7.setHours(0, 0, 0, 0);
          if (orderDate < past7) return false;
        } else if (dateFilter === '30_DAYS') {
          const past30 = new Date();
          past30.setDate(past30.getDate() - 30);
          past30.setHours(0, 0, 0, 0);
          if (orderDate < past30) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (orderDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (orderDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [orders, selectedStatus, searchKeyword, dateFilter, startDate, endDate]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchKeyword, dateFilter, startDate, endDate]);

  const hasActiveFilter = searchKeyword.trim() !== '' || selectedStatus !== 'ALL' || dateFilter !== 'ALL' || startDate !== '' || endDate !== '';

  const resetAllFilters = () => {
    setSearchKeyword('');
    setSelectedStatus('ALL');
    setDateFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <AccountSidebarLayout activeTab="orders">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#FECD00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  return (
    <AccountSidebarLayout activeTab="orders">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
            Đơn hàng của tôi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý và tra cứu trạng thái toàn bộ đơn đặt hàng của bạn
          </p>
        </div>
        <button 
          onClick={fetchOrders} 
          title="Làm mới danh sách"
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-800 flex items-center gap-1.5 text-xs font-medium border border-gray-200"
        >
          <RefreshCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {STATUS_TABS.map(tab => {
            const isActive = selectedStatus === tab.key;
            const count = statusCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isActive
                    ? 'bg-[#FECD00] text-[#002B5E] shadow-sm font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive 
                      ? 'bg-white/80 text-[#002B5E]' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Date Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn, tên quán hoặc món ăn..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm rounded-xl border border-gray-200 focus:border-[#FECD00] focus:ring-2 focus:ring-[#FECD00]/30 outline-none transition-all placeholder:text-gray-400 text-gray-800"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 font-medium">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer pr-1 text-gray-800 font-semibold"
                >
                  <option value="ALL">Tất cả ngày</option>
                  <option value="TODAY">Hôm nay</option>
                  <option value="7_DAYS">7 ngày gần đây</option>
                  <option value="30_DAYS">30 ngày gần đây</option>
                  <option value="CUSTOM">Tùy chọn ngày...</option>
                </select>
              </div>
            </div>

            {hasActiveFilter && (
              <button
                onClick={resetAllFilters}
                className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-200 transition flex items-center gap-1 flex-shrink-0"
                title="Đặt lại tất cả bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker (shown when CUSTOM selected) */}
        {dateFilter === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-dashed border-gray-200 text-xs text-gray-600">
            <span className="font-semibold flex items-center gap-1 text-gray-700">
              <Filter className="w-3.5 h-3.5" /> Khoảng ngày:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#FECD00]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#FECD00]"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-red-600 hover:underline ml-auto"
              >
                Xóa ngày
              </button>
            )}
          </div>
        )}

        {/* Results summary bar when filters are applied */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between pt-1 text-xs text-gray-500 border-t border-gray-100">
            <span>
              Tìm thấy <strong className="text-[#002B5E]">{filteredOrders.length}</strong> đơn hàng phù hợp
            </span>
          </div>
        )}
      </div>

      {/* Orders List Content */}
      <div className="space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
            {error}
          </div>
        ) : orders.length === 0 ? (
          /* User has 0 orders at all */
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
        ) : filteredOrders.length === 0 ? (
          /* Filter/Search yielded 0 results */
          <div className="bg-white p-10 rounded-2xl text-center border border-gray-200 shadow-sm mt-4">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Không tìm thấy đơn hàng phù hợp</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Không có đơn hàng nào khớp với từ khóa hoặc bộ lọc đã chọn. Hãy thử tìm từ khóa khác hoặc xóa bộ lọc.
            </p>
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Xóa tất cả bộ lọc
            </button>
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
                      {(order.placedAt || order.createdAt) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.placedAt || order.createdAt).toLocaleString('vi-VN')}
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
                        <Image src={firstItem.itemImage} alt={firstItem.itemName || 'Món'} fill className="object-cover" />
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
                        {Number(order.totalAmount || 0).toLocaleString('vi-VN')}đ
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
