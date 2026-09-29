import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Order, ShopProfile } from '@/api/mockData';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  Receipt,
  Search,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Printer,
  Calendar,
  User,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Store,
  FileCheck,
  Check,
  Download
} from 'lucide-react';

export function ShopInvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Invoice Detail Modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const myShop = await dbService.getMyShop();
      if (myShop) {
        setShop(myShop);
        const data = await dbService.getOrders({ shop_id: myShop.id });
        // Sắp xếp đơn mới nhất lên đầu
        const sorted = [...data].sort(
          (a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime()
        );
        setOrders(sorted);
      }
    } catch (e) {
      console.error('Failed to load shop orders for invoices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, paymentMethodFilter, paymentStatusFilter, orderStatusFilter]);

  // KPIs
  const totalInvoices = orders.length;
  const paidOrders = orders.filter(
    (o) => o.payment_status === 'PAID' && o.order_status !== 'CANCELLED'
  );
  const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pendingPaymentOrders = orders.filter(
    (o) => o.payment_status !== 'PAID' && o.order_status !== 'CANCELLED'
  );
  const pendingRevenue = pendingPaymentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const cancelledOrdersCount = orders.filter((o) => o.order_status === 'CANCELLED').length;

  // Filtered List
  const filteredOrders = orders.filter((o) => {
    const s = search.trim().toLowerCase();
    const invoiceCode = `hd-${o.order_code}`.toLowerCase();
    const matchSearch =
      !s ||
      invoiceCode.includes(s) ||
      o.order_code.toLowerCase().includes(s) ||
      o.customer_name.toLowerCase().includes(s) ||
      o.customer_phone.includes(s);

    const matchMethod =
      paymentMethodFilter === 'ALL' || o.payment_method === paymentMethodFilter;

    const matchPaymentStatus =
      paymentStatusFilter === 'ALL'
        ? true
        : paymentStatusFilter === 'PAID'
        ? o.payment_status === 'PAID'
        : paymentStatusFilter === 'PENDING'
        ? o.payment_status !== 'PAID' && o.order_status !== 'CANCELLED'
        : o.order_status === 'CANCELLED' || o.payment_status === 'FAILED';

    const matchOrderStatus =
      orderStatusFilter === 'ALL' || o.order_status === orderStatusFilter;

    return matchSearch && matchMethod && matchPaymentStatus && matchOrderStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>Quản Lý Hóa Đơn & Giao Dịch Bán Hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi hóa đơn điện tử, trạng thái thanh toán (VietQR SePay / COD), thông tin khách hàng và lịch sử thu tiền.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          Làm Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng số hóa đơn</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{totalInvoices}</p>
            <p className="text-[11px] text-slate-400">Tất cả giao dịch phát sinh</p>
          </div>
        </div>

        {/* Card 2: Paid Revenue */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-3.5 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-800 font-semibold">Đã thanh toán (Thành công)</p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">
              {paidRevenue.toLocaleString()} ₫
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              {paidOrders.length} hóa đơn đã nhận tiền
            </p>
          </div>
        </div>

        {/* Card 3: Pending Collection */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-3.5 bg-gradient-to-br from-white to-amber-50/30">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-amber-800 font-semibold">Chờ thu tiền / Xác nhận</p>
            <p className="text-xl font-black text-amber-700 mt-0.5">
              {pendingRevenue.toLocaleString()} ₫
            </p>
            <p className="text-[11px] text-amber-600 font-medium">
              {pendingPaymentOrders.length} đơn COD / CK chờ
            </p>
          </div>
        </div>

        {/* Card 4: Cancelled */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đơn hủy / Thất bại</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{cancelledOrdersCount}</p>
            <p className="text-[11px] text-slate-400">Không ghi nhận doanh thu</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo mã HĐ, mã đơn, tên khách, số điện thoại..."
        onRefresh={loadData}
        dropdowns={[
          {
            id: 'paymentMethod',
            label: 'Phương thức',
            value: paymentMethodFilter,
            onChange: setPaymentMethodFilter,
            options: [
              { label: 'Tất cả phương thức', value: 'ALL' },
              { label: '💳 VietQR SePay (Online)', value: 'ONLINE' },
              { label: '💵 Tiền mặt khi nhận (COD)', value: 'COD' },
            ],
          },
          {
            id: 'paymentStatus',
            label: 'Trạng thái thanh toán',
            value: paymentStatusFilter,
            onChange: setPaymentStatusFilter,
            options: [
              { label: 'Tất cả trạng thái TT', value: 'ALL' },
              { label: '✓ Đã thanh toán (PAID)', value: 'PAID' },
              { label: '⏳ Chờ thanh toán (PENDING)', value: 'PENDING' },
              { label: '✕ Đã hủy / Thất bại', value: 'CANCELLED' },
            ],
          },
          {
            id: 'orderStatus',
            label: 'Trạng thái đơn hàng',
            value: orderStatusFilter,
            onChange: setOrderStatusFilter,
            options: [
              { label: 'Tất cả trạng thái đơn', value: 'ALL' },
              { label: 'Đã hoàn tất (COMPLETED)', value: 'COMPLETED' },
              { label: 'Đã giao (DELIVERED)', value: 'DELIVERED' },
              { label: 'Đang nấu / Chuẩn bị', value: 'PREPARING' },
              { label: 'Đang giao hàng', value: 'DELIVERING' },
              { label: 'Đã hủy (CANCELLED)', value: 'CANCELLED' },
            ],
          },
        ]}
      />

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Đang tải danh sách hóa đơn...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-sm text-slate-700">Không tìm thấy hóa đơn nào phù hợp.</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa hoặc điều kiện lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
                  <th className="p-3.5 font-bold">Mã Hóa Đơn</th>
                  <th className="p-3.5 font-bold">Mã Đơn Hàng</th>
                  <th className="p-3.5 font-bold">Khách Hàng</th>
                  <th className="p-3.5 font-bold">Thời Gian</th>
                  <th className="p-3.5 font-bold">Phương Thức</th>
                  <th className="p-3.5 font-bold text-center">Trạng Thái Giao Dịch</th>
                  <th className="p-3.5 font-bold text-right">Tổng Tiền</th>
                  <th className="p-3.5 font-bold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => {
                  const isPaid = order.payment_status === 'PAID';
                  const isCancelled = order.order_status === 'CANCELLED';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Mã Hóa Đơn */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          HD-{order.order_code}
                        </span>
                      </td>

                      {/* Mã Đơn Hàng */}
                      <td className="p-3.5 font-mono font-bold text-blue-600">
                        {order.order_code}
                      </td>

                      {/* Khách hàng */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {order.customer_phone}
                        </div>
                      </td>

                      {/* Thời Gian */}
                      <td className="p-3.5 text-slate-600">
                        <div>
                          {new Date(order.placed_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(order.placed_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Phương Thức */}
                      <td className="p-3.5">
                        {order.payment_method === 'ONLINE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            VietQR (SePay)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Banknote className="w-3.5 h-3.5 text-amber-600" />
                            Tiền mặt (COD)
                          </span>
                        )}
                      </td>

                      {/* Trạng Thái Giao Dịch */}
                      <td className="p-3.5 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Đã hủy đơn
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ĐÃ THANH TOÁN
                          </span>
                        ) : order.payment_method === 'ONLINE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Chờ xác nhận CK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Chờ thu COD
                          </span>
                        )}
                      </td>

                      {/* Tổng Tiền */}
                      <td className="p-3.5 text-right font-black text-sm text-slate-800">
                        {order.total_amount.toLocaleString()} ₫
                      </td>

                      {/* Thao Tác */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] border border-blue-200 transition-colors cursor-pointer"
                            title="Xem chi tiết hóa đơn Full HD"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedInvoiceOrder(order);
                              setTimeout(() => handlePrint(), 250);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="In hóa đơn bán hàng"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* FULL HD INVOICE MODAL */}
      <Modal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        title="HÓA ĐƠN BÁN HÀNG ĐIỆN TỬ"
        subtitle={selectedInvoiceOrder ? `Số hóa đơn: HD-${selectedInvoiceOrder.order_code}` : ''}
        maxWidth="4xl"
      >
        {selectedInvoiceOrder && (
          <div className="space-y-6 text-xs text-slate-800 print:text-black">
            {/* Header Voucher Template */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs relative overflow-hidden">
              {/* PAID Watermark Stamp */}
              {selectedInvoiceOrder.payment_status === 'PAID' &&
                selectedInvoiceOrder.order_status !== 'CANCELLED' && (
                  <div className="absolute right-6 top-6 pointer-events-none opacity-85 transform rotate-[-8deg] border-4 border-emerald-600 text-emerald-700 px-4 py-2 rounded-2xl text-center font-black tracking-widest uppercase shadow-sm">
                    <div className="text-base">✓ ĐÃ THANH TOÁN</div>
                    <div className="text-[10px] font-bold text-emerald-600">PAID VIA SEPAY</div>
                  </div>
                )}

              {/* CANCELLED Watermark */}
              {selectedInvoiceOrder.order_status === 'CANCELLED' && (
                <div className="absolute right-6 top-6 pointer-events-none opacity-85 transform rotate-[-8deg] border-4 border-rose-600 text-rose-700 px-4 py-2 rounded-2xl text-center font-black tracking-widest uppercase shadow-sm">
                  <div className="text-base">✕ ĐÃ HỦY ĐƠN</div>
                  <div className="text-[10px] font-bold text-rose-600">CANCELLED</div>
                </div>
              )}

              {/* Shop Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                  {shop?.logo_url ? (
                    <img src={shop.logo_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <Store className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {shop?.shop_name || selectedInvoiceOrder.shop_name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Địa chỉ: {shop?.location_detail || 'Khu vực đô thị Vinhomes Grand Park'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Hotline quán: <span className="font-semibold text-slate-700">{shop?.phone || '0901 000 065'}</span>
                  </p>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Mã hóa đơn:</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    HD-{selectedInvoiceOrder.order_code}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mã đơn hàng:</span>
                  <p className="font-mono font-bold text-blue-600 mt-0.5">
                    {selectedInvoiceOrder.order_code}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Thời gian lập:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {new Date(selectedInvoiceOrder.placed_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Ký hiệu mẫu:</span>
                  <p className="font-bold text-slate-800 mt-0.5">HD-FOOD/2026</p>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Người Mua Hàng
                  </h3>
                  <p className="text-sm font-bold text-slate-900">{selectedInvoiceOrder.customer_name}</p>
                  <p className="text-xs text-slate-600 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedInvoiceOrder.customer_phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Địa Chỉ Giao Hàng
                  </h3>
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedInvoiceOrder.delivery_address
                      ? `${selectedInvoiceOrder.delivery_address.unit || ''} ${selectedInvoiceOrder.delivery_address.building || ''}`
                      : 'Khu vực Vinhomes Grand Park'}
                  </p>
                  {selectedInvoiceOrder.delivery_address?.note && (
                    <p className="text-[11px] text-amber-700 italic">
                      Ghi chú: "{selectedInvoiceOrder.delivery_address.note}"
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div className="py-4">
                <h3 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wide">
                  Chi Tiết Món Ăn & Dịch Vụ
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
                        <th className="p-3 w-10 text-center font-bold">#</th>
                        <th className="p-3 font-bold">Tên món & Tùy chọn</th>
                        <th className="p-3 text-center font-bold">SL</th>
                        <th className="p-3 text-right font-bold">Đơn giá</th>
                        <th className="p-3 text-right font-bold">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoiceOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{item.item_name}</p>
                            {item.selected_options && item.selected_options.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                + {item.selected_options.map((opt) => opt.option).join(', ')}
                              </p>
                            )}
                            {item.item_note && (
                              <p className="text-[11px] text-amber-600 italic mt-0.5">
                                Ghi chú: {item.item_note}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-800">{item.quantity}</td>
                          <td className="p-3 text-right text-slate-600">
                            {item.unit_price.toLocaleString()} ₫
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {(item.total_price || item.unit_price * item.quantity).toLocaleString()} ₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t border-slate-200">
                {/* Payment Method Details & Status Banner */}
                <div className="w-full sm:w-1/2 space-y-2.5">
                  <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Phương thức & Trạng thái thanh toán
                    </span>
                    <div className="flex items-center gap-2 mb-1.5">
                      {selectedInvoiceOrder.payment_method === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-700">
                          <CreditCard className="w-4 h-4" /> Chuyển khoản VietQR SePay
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-bold text-xs text-amber-800">
                          <Banknote className="w-4 h-4" /> Tiền mặt khi nhận món (COD)
                        </span>
                      )}
                    </div>

                    {selectedInvoiceOrder.order_status === 'CANCELLED' ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 shrink-0" />
                        Giao dịch đã hủy / Hoàn tiền
                      </div>
                    ) : selectedInvoiceOrder.payment_status === 'PAID' ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Giao dịch đã thanh toán thành công qua ngân hàng
                      </div>
                    ) : selectedInvoiceOrder.payment_method === 'ONLINE' ? (
                      <div className="p-2 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-lg text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        Đang chờ hệ thống SePay đối soát chuyển khoản
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-lg text-xs flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                        Tài xế thu tiền mặt khi giao món tận nơi
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtotals Table */}
                <div className="w-full sm:w-1/2 max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính tiền món:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedInvoiceOrder.subtotal?.toLocaleString()} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí giao hàng:</span>
                    <span className="font-semibold text-slate-800">
                      {(selectedInvoiceOrder.delivery_fee || 15000).toLocaleString()} ₫
                    </span>
                  </div>
                  {selectedInvoiceOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Voucher giảm giá ({selectedInvoiceOrder.promotion_code || 'PROMO'}):</span>
                      <span>- {selectedInvoiceOrder.discount_amount.toLocaleString()} ₫</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-black text-slate-900 text-sm">TỔNG CỘNG:</span>
                    <span className="font-black text-rose-600 text-lg">
                      {selectedInvoiceOrder.total_amount.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer note */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
                <p>Cảm ơn quý khách đã tin dùng dịch vụ của {shop?.shop_name || 'quán'}!</p>
                <p className="font-mono">Hệ thống phân phối HyperLocal Food Delivery</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                In Hóa Đơn Này
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
