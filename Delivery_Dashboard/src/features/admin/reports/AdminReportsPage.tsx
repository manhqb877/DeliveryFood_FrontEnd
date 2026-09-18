import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { ShoppingBag, DollarSign, Clock, AlertTriangle, Filter } from 'lucide-react';

export function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedArea, setSelectedArea] = useState('ALL');

  const revenueTrendData = [
    { date: '12/09', revenue: 14200000, orders: 180, cancelled: 4 },
    { date: '13/09', revenue: 16800000, orders: 210, cancelled: 6 },
    { date: '14/09', revenue: 19500000, orders: 245, cancelled: 3 },
    { date: '15/09', revenue: 15100000, orders: 190, cancelled: 5 },
    { date: '16/09', revenue: 22400000, orders: 280, cancelled: 8 },
    { date: '17/09', revenue: 25800000, orders: 315, cancelled: 2 },
    { date: '18/09', revenue: 28400000, orders: 350, cancelled: 5 },
  ];

  const topShopsData = [
    { name: 'Cơm Nhà Chị Lan', revenue: 8500000, orders: 120 },
    { name: 'Trà Sữa KOI', revenue: 6200000, orders: 155 },
    { name: 'Bún Bò Huế Xưa', revenue: 5400000, orders: 98 },
    { name: 'Gà Rán Crispy', revenue: 4800000, orders: 85 },
    { name: 'Tiệm Bánh Mì Sài Gòn', revenue: 3500000, orders: 140 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Tổng Quan Hệ Thống</h1>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo doanh thu, đơn hàng và chỉ số vận hành toàn bộ nền tảng Hyperlocal.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Khu vực:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent focus:outline-hidden text-blue-600 font-semibold cursor-pointer"
            >
              <option value="ALL">Tất cả khu vực (3)</option>
              <option value="1">Vinhomes Grand Park Q9</option>
              <option value="2">KCN Linh Trung 1</option>
              <option value="3">Sunrise City Q7</option>
            </select>
          </div>

          <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs shadow-2xs">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  dateRange === range
                    ? 'bg-[#0F2540] text-white shadow-2xs'
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng doanh thu hệ thống</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">142,200,000 ₫</h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">↑ +14.2% so với kỳ trước</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng đơn hoàn thành</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">1,770 đơn</h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">↑ +8.5% hoàn thành đúng SLA</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Thời gian giao TB (Nội khu)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">14.5 phút</h3>
            <p className="text-[11px] font-semibold text-blue-600 mt-1">⚡ Nhanh hơn 2.1p so với SLA</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tỉ lệ đơn hủy</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">2.1%</h3>
            <p className="text-[11px] font-semibold text-rose-600 mt-1">↓ 36 đơn hủy (chủ yếu từ khách)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend line chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Xu Hướng Doanh Thu Theo Ngày</h3>
              <p className="text-xs text-slate-500">Đơn vị: VNĐ</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} ₫`, 'Doanh thu']} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Shops bar chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top 5 Gian Hàng Doanh Thu</h3>
              <p className="text-xs text-slate-500">Kỳ báo cáo hiện tại</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topShopsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748B" tickFormatter={(v) => `${v / 1000000}M`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#64748B" width={110} />
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} ₫`, 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#0F2540" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
