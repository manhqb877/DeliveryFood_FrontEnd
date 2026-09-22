import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  Filter,
  RefreshCw,
  Search,
  Store,
  TrendingUp,
  Percent,
  CheckCircle2,
  Building2,
  ChevronRight
} from 'lucide-react';
import { dbService } from '@/api/client';
import { Order, ShopProfile, initialShops, initialOrders } from '@/api/mockData';
import { Badge } from '@/components/ui/Badge';

interface ShopRevenueStat {
  shopId: number;
  shopName: string;
  ownerName: string;
  areaName: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  gmv: number;
  commission: number;
  netPayout: number;
  contributionPercent: number;
  status: string;
  logoUrl?: string;
}

export function AdminReportsPage() {
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hyperlocal_access_token');
      
      const [shopsRes, ordersRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/auth/admin/shops', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        dbService.getAllOrders(),
      ]);
      
      let shopsList = [];
      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        const apiShops = shopsData.data || [];
        shopsList = apiShops.map((s: any) => ({
          id: s.id,
          owner_id: s.ownerId || 0,
          owner_name: s.ownerName || 'Chưa cập nhật',
          area_id: s.areaId || 1,
          area_name: s.areaName || 'Khu vực chung',
          shop_name: s.shopName,
          shop_description: s.shopDescription || '',
          location_detail: s.locationDetail || '',
          phone: s.phone || '',
          logo_url: s.logoUrl || 'https://via.placeholder.com/150',
          cover_image_url: s.coverImageUrl || 'https://via.placeholder.com/600x300',
          documents: s.documents ? s.documents.map((d: any) => d.url) : [],
          approval_status: s.approvalStatus,
          rejection_reason: s.rejectionReason,
          is_open: s.isOpen || false,
          is_accepting_orders: s.isAcceptingOrders || false,
          created_at: s.createdAt || new Date().toISOString()
        }));
      }

      setShops(shopsList.length > 0 ? shopsList : initialShops);
      setOrders(ordersRes.length > 0 ? ordersRes : initialOrders);
    } catch (err) {
      console.error('Error fetching admin reports data:', err);
      setShops(initialShops);
      setOrders(initialOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders and shops by area
  const filteredOrders = useMemo(() => {
    if (selectedArea === 'ALL') return orders;
    return orders.filter(o => o.area_id === Number(selectedArea));
  }, [orders, selectedArea]);

  const filteredShops = useMemo(() => {
    if (selectedArea === 'ALL') return shops;
    return shops.filter(s => s.area_id === Number(selectedArea));
  }, [shops, selectedArea]);

  // Overall platform metrics
  const validOrders = useMemo(() => filteredOrders.filter(o => o.order_status !== 'CANCELLED'), [filteredOrders]);
  const totalGMV = useMemo(() => validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0), [validOrders]);
  const platformCommission = useMemo(() => Math.round(totalGMV * 0.15), [totalGMV]);
  const totalCompletedOrders = useMemo(() => filteredOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.order_status)).length, [filteredOrders]);
  const totalCancelledOrders = useMemo(() => filteredOrders.filter(o => o.order_status === 'CANCELLED').length, [filteredOrders]);
  const cancelRate = useMemo(() => {
    if (filteredOrders.length === 0) return '0.0';
    return ((totalCancelledOrders / filteredOrders.length) * 100).toFixed(1);
  }, [filteredOrders, totalCancelledOrders]);

  // Per-shop revenue statistics
  const shopStats: ShopRevenueStat[] = useMemo(() => {
    return filteredShops.map((shop) => {
      const shopOrders = filteredOrders.filter(o => o.shop_id === shop.id);
      const shopValid = shopOrders.filter(o => o.order_status !== 'CANCELLED');
      const gmv = shopValid.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const commission = Math.round(gmv * 0.15);
      const netPayout = gmv - commission;
      const completed = shopOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.order_status)).length;
      const cancelled = shopOrders.filter(o => o.order_status === 'CANCELLED').length;
      const contribution = totalGMV > 0 ? Number(((gmv / totalGMV) * 100).toFixed(1)) : 0;

      return {
        shopId: shop.id,
        shopName: shop.shop_name,
        ownerName: shop.owner_name || `Chủ shop #${shop.owner_id}`,
        areaName: shop.area_name || 'Vinhomes Grand Park Q9',
        totalOrders: shopValid.length,
        completedOrders: completed,
        cancelledOrders: cancelled,
        gmv,
        commission,
        netPayout,
        contributionPercent: contribution,
        status: shop.approval_status,
        logoUrl: shop.logo_url,
      };
    }).sort((a, b) => b.gmv - a.gmv);
  }, [filteredShops, filteredOrders, totalGMV]);

  // Filter shop stats by search query
  const searchedShopStats = useMemo(() => {
    if (!searchQuery.trim()) return shopStats;
    const q = searchQuery.toLowerCase();
    return shopStats.filter(s =>
      s.shopName.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q) ||
      s.shopId.toString().includes(q)
    );
  }, [shopStats, searchQuery]);

  // Top 5 shops for BarChart
  const topShopsData = useMemo(() => {
    const list = shopStats.filter(s => s.gmv > 0).slice(0, 5);
    if (list.length === 0) {
      return shopStats.slice(0, 5).map(s => ({ name: s.shopName, revenue: s.gmv, orders: s.totalOrders }));
    }
    return list.map(s => ({
      name: s.shopName.length > 18 ? s.shopName.slice(0, 18) + '...' : s.shopName,
      revenue: s.gmv,
      orders: s.totalOrders,
    }));
  }, [shopStats]);

  // Revenue trend by date (last 7 days)
  const revenueTrendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const isoPrefix = d.toISOString().slice(0, 10);

      const dayOrders = validOrders.filter(o => o.placed_at?.startsWith(isoPrefix));
      const dayCancelled = filteredOrders.filter(o => o.order_status === 'CANCELLED' && o.placed_at?.startsWith(isoPrefix));
      const dayRev = dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        date: dateStr,
        revenue: dayRev,
        orders: dayOrders.length,
        cancelled: dayCancelled.length,
      };
    });
  }, [validOrders, filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <span>Dashboard Doanh Thu Hệ Thống & Từng Shop</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo GMV toàn sàn, hoa hồng khấu trừ và phân rã doanh thu chi tiết cho từng gian hàng.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Khu vực:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent focus:outline-hidden text-blue-600 font-semibold cursor-pointer"
            >
              <option value="ALL">Tất cả khu vực ({shops.length} shop)</option>
              <option value="1">Vinhomes Grand Park Q9</option>
              <option value="2">KCN Linh Trung 1</option>
              <option value="3">Sunrise City Q7</option>
            </select>
          </div>

          <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs shadow-xs">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  dateRange === range
                    ? 'bg-[#0F2540] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : '90 ngày'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng GMV Toàn Sàn</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {totalGMV >= 10000000
                ? `${(totalGMV / 1000000).toFixed(2)}M ₫`
                : `${totalGMV.toLocaleString()} ₫`}
            </h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">
              {validOrders.length} đơn hàng thành công
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Hoa Hồng Nền Tảng (15%)</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">
              {platformCommission >= 10000000
                ? `${(platformCommission / 1000000).toFixed(2)}M ₫`
                : `${platformCommission.toLocaleString()} ₫`}
            </h3>
            <p className="text-[11px] font-semibold text-blue-500 mt-1">Thu nhập sàn thực tế</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng Gian Hàng Hoạt Động</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {filteredShops.length} Shop
            </h3>
            <p className="text-[11px] font-semibold text-purple-600 mt-1">
              {filteredShops.filter(s => s.approval_status === 'APPROVED').length} shop đã duyệt
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tỉ Lệ Đơn Hủy</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{cancelRate}%</h3>
            <p className="text-[11px] font-semibold text-rose-600 mt-1">
              {totalCancelledOrders} đơn hủy trên toàn sàn
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend line chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Xu Hướng Doanh Thu Toàn Hệ Thống</h3>
              <p className="text-xs text-slate-500">Dữ liệu doanh số 7 ngày gần nhất từ Database</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748B"
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}K`)}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ₫`, 'Doanh thu']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Shops bar chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top 5 Gian Hàng Doanh Thu</h3>
              <p className="text-xs text-slate-500">Xếp hạng theo tổng GMV thực tế</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topShopsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  stroke="#64748B"
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}K`)}
                />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#64748B" width={110} />
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} ₫`, 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#0F2540" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CORE FEATURE: Bảng Doanh Thu Từng Gian Hàng */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>Bảng Thống Kê Doanh Thu Từng Gian Hàng</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chi tiết doanh số gộp (GMV), khấu trừ hoa hồng sàn (15%) và số tiền thực trả cho từng chủ shop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên shop, chủ quán, ID..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
              {searchedShopStats.length} Shop
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="p-3.5 pl-5">Gian Hàng</th>
                <th className="p-3.5">Khu Vực</th>
                <th className="p-3.5 text-center">Đơn Hoàn Tất / Tổng</th>
                <th className="p-3.5 text-right">Doanh Số GMV</th>
                <th className="p-3.5 text-right">Hoa Hồng Sàn (15%)</th>
                <th className="p-3.5 text-right">Thực Trả Shop (85%)</th>
                <th className="p-3.5 text-center">Đóng Góp (% GMV)</th>
                <th className="p-3.5 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchedShopStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    Không tìm thấy gian hàng phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                searchedShopStats.map((s) => (
                  <tr key={s.shopId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Shop Info */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden font-bold text-slate-700 text-xs">
                          {s.logoUrl ? (
                            <img src={s.logoUrl} alt={s.shopName} className="w-full h-full object-cover" />
                          ) : (
                            s.shopName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {s.shopName}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            ID: #{s.shopId} • {s.ownerName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Area */}
                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{s.areaName}</span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-slate-800">{s.completedOrders}</span>
                      <span className="text-slate-400"> / {s.totalOrders} đơn</span>
                      {s.cancelledOrders > 0 && (
                        <p className="text-[10px] text-rose-500">({s.cancelledOrders} hủy)</p>
                      )}
                    </td>

                    {/* GMV */}
                    <td className="p-3.5 text-right font-bold text-emerald-700 text-[13px]">
                      {s.gmv.toLocaleString()} ₫
                    </td>

                    {/* Commission */}
                    <td className="p-3.5 text-right text-blue-600 font-semibold">
                      {s.commission.toLocaleString()} ₫
                    </td>

                    {/* Net Payout */}
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {s.netPayout.toLocaleString()} ₫
                    </td>

                    {/* Contribution % */}
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(s.contributionPercent, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-600 text-[11px] w-10 text-right">
                          {s.contributionPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <Badge statusText={s.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span>
              Tổng GMV: <b className="text-emerald-700 font-bold">{totalGMV.toLocaleString()} ₫</b>
            </span>
            <span>
              Hoa hồng sàn: <b className="text-blue-700 font-bold">{platformCommission.toLocaleString()} ₫</b>
            </span>
            <span>
              Thực trả các shop: <b className="text-slate-800 font-bold">{(totalGMV - platformCommission).toLocaleString()} ₫</b>
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Tự động khấu trừ 15% hoa hồng trên từng đơn thành công.
          </p>
        </div>
      </div>
    </div>
  );
}
