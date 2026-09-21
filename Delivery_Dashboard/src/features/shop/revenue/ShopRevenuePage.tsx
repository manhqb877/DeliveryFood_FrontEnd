import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  Award,
  Percent,
  TrendingUp,
  Clock,
  Users,
  Star,
  ChevronRight,
  Ticket,
  UserCheck,
  UserPlus,
  Calendar,
  Building2,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  CommissionRecord,
  CustomerPurchaseRecord,
  PlatformPayoutSchedule,
  Promotion,
  Order,
  ShopProfile,
  HourlyOrderAnalysis,
} from '@/api/mockData';
import { dbService } from '@/api/client';

// ============ Metric Card ============
function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1 truncate">{value}</h3>
        {trend && (
          <p className={`text-[11px] font-semibold mt-1 ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
        {sub && !trend && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

// ============ Section Header ============
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ============ Commission Table ============
function CommissionTable({
  records,
  periodFilter,
  onPeriodChange,
}: {
  records: CommissionRecord[];
  periodFilter: string;
  onPeriodChange: (val: string) => void;
}) {
  const statusBadge = (s: CommissionRecord['settlement_status']) => {
    if (s === 'SETTLED')
      return (
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
          Đã đối soát
        </span>
      );
    if (s === 'DISPUTED')
      return (
        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
          Tranh chấp
        </span>
      );
    return (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
        Chờ đối soát
      </span>
    );
  };

  const filtered =
    periodFilter === 'ALL'
      ? records
      : records.filter((r) => r.settlement_period === periodFilter);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800">
            Chi Tiết Khấu Trừ Hoa Hồng Từng Đơn Hàng (15%)
          </h3>
          <p className="text-[11px] text-slate-400">
            Hoa hồng được tự động tính và giữ lại theo từng đơn hàng thành công để quyết toán kỳ đối soát.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Lọc theo kỳ:</span>
          <select
            value={periodFilter}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500"
          >
            <option value="ALL">Tất cả kỳ đối soát</option>
            <option value="2026-09-W3">Kỳ 2026-09-W3 (Đã thanh toán)</option>
            <option value="2026-09-W4">Kỳ 2026-09-W4 (Đang đối soát)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left p-3 font-semibold text-slate-500">Mã đơn</th>
              <th className="text-right p-3 font-semibold text-slate-500">Doanh Thu Đơn</th>
              <th className="text-right p-3 font-semibold text-slate-500">Hoa Hồng Sàn (15%)</th>
              <th className="text-right p-3 font-semibold text-slate-500 text-emerald-700">DT Thuần Quán Nhận</th>
              <th className="text-center p-3 font-semibold text-slate-500">Kỳ Đối Soát</th>
              <th className="text-center p-3 font-semibold text-slate-500">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rec) => (
              <tr key={rec.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="p-3 font-mono font-bold text-blue-600">{rec.order_code}</td>
                <td className="p-3 text-right text-slate-700">{rec.order_revenue.toLocaleString()} ₫</td>
                <td className="p-3 text-right text-rose-600 font-semibold">
                  -{rec.commission_amount.toLocaleString()} ₫
                </td>
                <td className="p-3 text-right text-emerald-700 font-bold">
                  {rec.shop_net_revenue.toLocaleString()} ₫
                </td>
                <td className="p-3 text-center text-slate-500 font-medium">{rec.settlement_period}</td>
                <td className="p-3 text-center">{statusBadge(rec.settlement_status)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t border-slate-200">
              <td className="p-3 text-slate-700">Tổng Cộng ({filtered.length} đơn)</td>
              <td className="p-3 text-right text-slate-700">
                {filtered.reduce((a, r) => a + r.order_revenue, 0).toLocaleString()} ₫
              </td>
              <td className="p-3 text-right text-rose-600">
                -{filtered.reduce((a, r) => a + r.commission_amount, 0).toLocaleString()} ₫
              </td>
              <td className="p-3 text-right text-emerald-700">
                {filtered.reduce((a, r) => a + r.shop_net_revenue, 0).toLocaleString()} ₫
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ============ Platform Payout Schedule Table (Lịch Chi Trả Nền Tảng) ============
function PayoutScheduleView({ schedules }: { schedules: PlatformPayoutSchedule[] }) {
  const [selectedReceipt, setSelectedReceipt] = useState<PlatformPayoutSchedule | null>(null);

  const statusBadge = (s: PlatformPayoutSchedule['payout_status']) => {
    if (s === 'PAID')
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit mx-auto">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Đã chuyển khoản
        </span>
      );
    if (s === 'PROCESSING')
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit mx-auto">
          <Clock className="w-3 h-3 text-amber-600" />
          Đang xử lý đối soát
        </span>
      );
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit mx-auto">
        <Calendar className="w-3 h-3 text-slate-400" />
        Dự kiến kỳ tới
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Payout Policy Info Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xs flex items-start justify-between gap-4">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" /> Chính Sách Chi Trả Thu Nhập Từ Nền Tảng (Platform Payout)
          </p>
          <p className="text-slate-300 leading-relaxed">
            Hệ thống tự động chốt kỳ đối soát 2 lần mỗi tháng (<b>Kỳ 1: Ngày 01-15</b>, chi trả vào ngày 18; <b>Kỳ 2: Ngày 16-30/31</b>, chi trả vào ngày 03 tháng tiếp theo).
            Tiền thực nhận = Tổng doanh thu đơn hoàn thành - 15% hoa hồng nền tảng.
          </p>
          <p className="text-emerald-400 font-semibold text-[11px] pt-1">
            Tài khoản thụ hưởng: MB Bank • Số tài khoản: **** **** 8899 • Chủ tài khoản: TRẦN THỊ LAN
          </p>
        </div>
      </div>

      {/* Payout Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-3 font-semibold text-slate-600">Kỳ Đối Soát</th>
                <th className="text-center p-3 font-semibold text-slate-600">Chu Kỳ Bán</th>
                <th className="text-center p-3 font-semibold text-slate-600">Ngày Chi Trả</th>
                <th className="text-center p-3 font-semibold text-slate-600">Số Đơn</th>
                <th className="text-right p-3 font-semibold text-slate-600">Doanh Thu Gộp</th>
                <th className="text-right p-3 font-semibold text-slate-600 text-rose-600">Hoa Hồng (15%)</th>
                <th className="text-right p-3 font-semibold text-slate-600 text-emerald-700">Thực Nhận Chuyển Khoản</th>
                <th className="text-center p-3 font-semibold text-slate-600">Trạng Thái</th>
                <th className="text-center p-3 font-semibold text-slate-600">Chứng Từ</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sc) => (
                <tr key={sc.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{sc.period_name}</p>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">{sc.period_code}</p>
                  </td>
                  <td className="p-3 text-center text-slate-600 text-[11px]">
                    {sc.start_date} → {sc.end_date}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">{sc.payout_date}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{sc.total_orders} đơn</td>
                  <td className="p-3 text-right text-slate-700 font-medium">{sc.order_revenue.toLocaleString()} ₫</td>
                  <td className="p-3 text-right text-rose-600 font-semibold">
                    -{sc.commission_deducted.toLocaleString()} ₫
                  </td>
                  <td className="p-3 text-right font-black text-emerald-700 text-sm">
                    {sc.net_payout.toLocaleString()} ₫
                  </td>
                  <td className="p-3 text-center">{statusBadge(sc.payout_status)}</td>
                  <td className="p-3 text-center">
                    {sc.payout_status === 'PAID' ? (
                      <button
                        onClick={() => setSelectedReceipt(sc)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold hover:bg-blue-100 cursor-pointer text-[10px] flex items-center gap-1 mx-auto"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        Sao kê
                      </button>
                    ) : (
                      <span className="text-slate-300 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Statement Modal (No native alert) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-xs">
            <div className="p-4 bg-linear-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Sao Kê Chi Trả Thu Nhập Gian Hàng</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <p className="text-[11px] text-emerald-700 font-medium">Số tiền thực chuyển thành công</p>
                <p className="text-2xl font-black text-emerald-800 mt-0.5">
                  {selectedReceipt.net_payout.toLocaleString()} ₫
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-bold">
                  GIAO DỊCH THÀNH CÔNG
                </span>
              </div>

              <div className="space-y-2 border-t border-b border-slate-100 py-3 text-slate-600">
                <div className="flex justify-between">
                  <span>Kỳ đối soát:</span>
                  <b className="text-slate-800">{selectedReceipt.period_name}</b>
                </div>
                <div className="flex justify-between">
                  <span>Mã giao dịch ngân hàng:</span>
                  <b className="font-mono text-blue-600">{selectedReceipt.transaction_ref}</b>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian tất toán:</span>
                  <b className="text-slate-800">{new Date(selectedReceipt.paid_at || '').toLocaleString('vi-VN')}</b>
                </div>
                <div className="flex justify-between">
                  <span>Ngân hàng thụ hưởng:</span>
                  <b className="text-slate-800">{selectedReceipt.bank_name} ({selectedReceipt.bank_account_mask})</b>
                </div>
                <div className="flex justify-between">
                  <span>Tổng số đơn hoàn tất:</span>
                  <b className="text-slate-800">{selectedReceipt.total_orders} đơn</b>
                </div>
                <div className="flex justify-between">
                  <span>Doanh thu gộp:</span>
                  <b className="text-slate-800">{selectedReceipt.order_revenue.toLocaleString()} ₫</b>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Hoa hồng sàn (15%):</span>
                  <b>-{selectedReceipt.commission_deducted.toLocaleString()} ₫</b>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Customer Table ============
function CustomerTable({ customers }: { customers: CustomerPurchaseRecord[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left p-3 font-semibold text-slate-500">Khách Hàng</th>
              <th className="text-center p-3 font-semibold text-slate-500">Số Đơn</th>
              <th className="text-right p-3 font-semibold text-slate-500">Tổng Chi</th>
              <th className="text-right p-3 font-semibold text-slate-500">TB/Đơn</th>
              <th className="text-left p-3 font-semibold text-slate-500">Món Hay Gọi</th>
              <th className="text-left p-3 font-semibold text-slate-500">Voucher Đã Dùng</th>
              <th className="text-center p-3 font-semibold text-slate-500">Loại KH</th>
              <th className="text-center p-3 font-semibold text-slate-500">Đánh Giá</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.user_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.user_avatar || `https://i.pravatar.cc/32?u=${c.user_id}`}
                      alt={c.user_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{c.user_name}</p>
                      <p className="text-slate-400">{c.user_phone}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-bold text-slate-800">{c.total_orders}</td>
                <td className="p-3 text-right font-semibold text-emerald-700">{c.total_spent.toLocaleString()} ₫</td>
                <td className="p-3 text-right text-slate-600">{c.avg_order_value.toLocaleString()} ₫</td>
                <td className="p-3 text-slate-700">{c.favorite_item || '—'}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {c.used_vouchers.length > 0 ? (
                      c.used_vouchers.map((v) => (
                        <span
                          key={v}
                          className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold"
                        >
                          {v}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-center">
                  {c.is_repeat_customer ? (
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full text-[10px] font-bold flex items-center gap-0.5 w-fit mx-auto">
                      <UserCheck className="w-3 h-3" /> Quen
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-0.5 w-fit mx-auto">
                      <UserPlus className="w-3 h-3" /> Mới
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {c.avg_rating_given != null ? (
                    <span className="flex items-center justify-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current" /> {c.avg_rating_given.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-[10px]">Chưa đánh giá</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ Peak Hour Heatmap ============
function HourlyHeatmap({ data }: { data?: HourlyOrderAnalysis[] }) {
  const hours = data || [];
  const max = Math.max(...hours.map((h) => h.order_count), 1);

  return (
    <div className="space-y-2">
      {hours.map((h) => {
        const ratio = h.order_count / max;
        return (
          <div key={h.hour} className="flex items-center gap-3 group">
            <span className="text-[11px] font-mono text-slate-500 w-8 shrink-0 text-right">
              {h.hour.toString().padStart(2, '0')}h
            </span>
            <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2
                  ${ratio > 0.8 ? 'bg-red-500' : ratio > 0.5 ? 'bg-orange-400' : ratio > 0.2 ? 'bg-blue-400' : 'bg-slate-300'}`}
                style={{ width: `${Math.max(ratio * 100, 5)}%` }}
              />
              <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-semibold text-slate-700">
                {h.order_count} đơn
              </span>
            </div>
            <span className="text-[11px] text-slate-500 w-24 shrink-0">{h.revenue.toLocaleString()} ₫</span>
            {h.peak_label && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                {h.peak_label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ Voucher Usage Table ============
function VoucherUsageTable({ promotions, shopId }: { promotions?: Promotion[]; shopId?: number }) {
  const list = promotions || [];
  const shopPromos = list.filter((p) => !p.shop_id || p.shop_id === shopId);
  const platformPromos = list.filter((p) => p.scope === 'PLATFORM');
  const allVisible = [...shopPromos, ...platformPromos.filter((p) => (p.used_count || 0) > 0)];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left p-3 font-semibold text-slate-500">Mã Voucher</th>
            <th className="text-center p-3 font-semibold text-slate-500">Loại</th>
            <th className="text-center p-3 font-semibold text-slate-500">Phạm Vi</th>
            <th className="text-right p-3 font-semibold text-slate-500">Đã Dùng</th>
            <th className="text-right p-3 font-semibold text-slate-500">Tổng Giới Hạn</th>
            <th className="text-right p-3 font-semibold text-slate-500">Tỷ Lệ Dùng</th>
            <th className="text-center p-3 font-semibold text-slate-500">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {allVisible.map((promo) => {
            const usageRate = promo.total_limit ? (promo.used_count / promo.total_limit) * 100 : 0;
            return (
              <tr key={promo.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-mono font-bold text-slate-800">{promo.code}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Giảm{' '}
                    {promo.promo_type === 'PERCENT'
                      ? `${promo.discount_value}%`
                      : `${promo.discount_value.toLocaleString()} ₫`}
                    {' — '}Đơn tối thiểu {promo.min_order_value.toLocaleString()} ₫
                  </p>
                </td>
                <td className="p-3 text-center">
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-semibold">
                    {promo.promo_type}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      promo.scope === 'SHOP' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {promo.scope === 'SHOP' ? 'Quán' : 'Nền tảng'}
                  </span>
                </td>
                <td className="p-3 text-right font-bold text-slate-800">{promo.used_count}</td>
                <td className="p-3 text-right text-slate-500">{promo.total_limit ?? '∞'}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          usageRate > 70 ? 'bg-red-500' : usageRate > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(usageRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600">{usageRate.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  {promo.is_active && promo.approval_status === 'APPROVED' ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      Hoạt động
                    </span>
                  ) : promo.approval_status === 'PENDING' ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                      Chờ duyệt
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                      Tạm dừng
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#94A3B8'];

const TABS = ['overview', 'commission', 'payout', 'customers', 'peaktime', 'vouchers'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  overview: '📊 Tổng Quan Doanh Thu',
  commission: '💰 Hoa Hồng & Đối Soát Đơn',
  payout: '📅 Lịch Chi Trả Nền Tảng',
  customers: '👥 Khách Hàng',
  peaktime: '⏰ Giờ Mua Hàng',
  vouchers: '🎟 Khuyến Mãi',
};

export function ShopRevenuePage() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const myShop = await dbService.getMyShop();
      setShop(myShop);
      const currentShopId = myShop?.id || 1;
      const [shopOrders, shopPromos] = await Promise.all([
        dbService.getOrders({ shop_id: currentShopId }),
        dbService.getPromotions('SHOP'),
      ]);
      setOrders(shopOrders);
      setPromotions(shopPromos.filter(p => !p.shop_id || p.shop_id === currentShopId));
    } catch (err) {
      console.error('Error fetching shop revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  // Compute metrics from REAL database orders
  const validOrders = orders.filter((o) => o.order_status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = validOrders.length;
  const totalCommission = Math.round(totalRevenue * 0.15);
  const netRevenue = totalRevenue - totalCommission;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const cancelledOrders = orders.filter((o) => o.order_status === 'CANCELLED').length;
  const completionRate = orders.length > 0 ? ((validOrders.length / orders.length) * 100).toFixed(1) : '100';

  // Dynamic datasets computed from real orders
  const dynamicTimeframeDatasets = {
    daily: {
      title: `Doanh Thu Hôm Nay (${shop?.shop_name || 'Gian Hàng'})`,
      sub: 'Biểu đồ doanh số và hoa hồng theo các mốc giờ từ đơn hàng thực tế',
      data: [
        { label: '07h', hour: 7 },
        { label: '09h', hour: 9 },
        { label: '11h', hour: 11 },
        { label: '12h', hour: 12 },
        { label: '13h', hour: 13 },
        { label: '15h', hour: 15 },
        { label: '18h', hour: 18 },
        { label: '20h', hour: 20 },
      ].map((slot) => {
        const slotOrders = validOrders.filter((o) => {
          const ordDate = new Date(o.placed_at);
          const h = ordDate.getHours();
          return h >= slot.hour - 1 && h <= slot.hour + 1;
        });
        const rev = slotOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
        return {
          label: slot.label,
          revenue: rev,
          orders: slotOrders.length,
          commission: Math.round(rev * 0.15),
        };
      }),
      trend: totalOrders > 0 ? `Tổng ${totalOrders} đơn từ database` : 'Chưa có đơn phát sinh',
      trendUp: totalRevenue > 0,
    },
    weekly: {
      title: 'Doanh Thu Tuần Này (Thứ 2 — Chủ Nhật)',
      sub: 'Doanh thu tổng 7 ngày thực tế — thanh màu nhạt là hoa hồng 15% đã khấu trừ',
      data: [
        { label: 'T2', day: 1 },
        { label: 'T3', day: 2 },
        { label: 'T4', day: 3 },
        { label: 'T5', day: 4 },
        { label: 'T6', day: 5 },
        { label: 'T7', day: 6 },
        { label: 'CN', day: 0 },
      ].map((d) => {
        const dayOrders = validOrders.filter((o) => new Date(o.placed_at).getDay() === d.day);
        const rev = dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
        return {
          label: d.label,
          revenue: rev,
          orders: dayOrders.length,
          commission: Math.round(rev * 0.15),
        };
      }),
      trend: `Thực nhận quán: ${netRevenue.toLocaleString()} ₫`,
      trendUp: totalRevenue > 0,
    },
    monthly: {
      title: 'Doanh Thu Tháng Này',
      sub: 'Doanh thu phân bổ theo các tuần trong tháng',
      data: [
        { label: 'Tuần 1 (01-07)', start: 1, end: 7 },
        { label: 'Tuần 2 (08-14)', start: 8, end: 14 },
        { label: 'Tuần 3 (15-21)', start: 15, end: 21 },
        { label: 'Tuần 4 (22-31)', start: 22, end: 31 },
      ].map((w) => {
        const weekOrders = validOrders.filter((o) => {
          const dt = new Date(o.placed_at).getDate();
          return dt >= w.start && dt <= w.end;
        });
        const rev = weekOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
        return {
          label: w.label,
          revenue: rev,
          orders: weekOrders.length,
          commission: Math.round(rev * 0.15),
        };
      }),
      trend: `${validOrders.length} đơn hoàn thành`,
      trendUp: true,
    },
  };

  const currentDataset = dynamicTimeframeDatasets[timeframe];

  // Item sales data aggregated from real items
  const itemMap = new Map<string, { name: string; quantity: number; amount: number }>();
  validOrders.forEach((o) => {
    (o.items || []).forEach((it: any) => {
      const existing = itemMap.get(it.item_name) || { name: it.item_name, quantity: 0, amount: 0 };
      existing.quantity += (it.quantity || 1);
      existing.amount += (it.total_price || 0);
      itemMap.set(it.item_name, existing);
    });
  });

  const totalQty = Array.from(itemMap.values()).reduce((a, b) => a + b.quantity, 0);
  const realItemSales = Array.from(itemMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((it) => ({
      name: it.name,
      value: totalQty > 0 ? Math.round((it.quantity / totalQty) * 100) : 0,
      quantity: it.quantity,
      amount: it.amount,
    }));

  const itemSalesData =
    realItemSales.length > 0 ? realItemSales : [{ name: 'Chưa có dữ liệu món', value: 100, quantity: 0, amount: 0 }];

  // Commission records computed from valid orders
  const commissionRecords: CommissionRecord[] = validOrders.map((ord) => {
    const comm = Math.round((ord.total_amount || 0) * 0.15);
    const net = (ord.total_amount || 0) - comm;
    const isCompleted = ['DELIVERED', 'COMPLETED'].includes(ord.order_status);
    return {
      id: ord.id,
      shop_id: shop?.id || ord.shop_id || 1,
      order_id: ord.id,
      order_code: ord.order_code,
      order_revenue: ord.total_amount || 0,
      commission_rate: 15,
      commission_amount: comm,
      shop_net_revenue: net,
      settlement_status: isCompleted ? 'SETTLED' : 'PENDING',
      settlement_period: '2026-09-W3',
      created_at: ord.placed_at,
      settled_at: ord.completed_at,
    };
  });

  // Customer records aggregated from orders
  const customerMap = new Map<string, CustomerPurchaseRecord>();
  orders.forEach((o) => {
    const phone = o.customer_phone || o.customer_name || `Khách #${o.id}`;
    const existing = customerMap.get(phone);
    if (existing) {
      existing.total_orders += 1;
      existing.total_spent += o.total_amount || 0;
      existing.avg_order_value = Math.round(existing.total_spent / existing.total_orders);
      if (o.promotion_code && !existing.used_vouchers.includes(o.promotion_code)) {
        existing.used_vouchers.push(o.promotion_code);
      }
      existing.is_repeat_customer = existing.total_orders >= 2;
    } else {
      customerMap.set(phone, {
        user_id: o.user_id || o.id,
        user_name: o.customer_name || 'Khách vãng lai',
        user_phone: o.customer_phone || '—',
        total_orders: 1,
        total_spent: o.total_amount || 0,
        avg_order_value: o.total_amount || 0,
        favorite_item: o.items?.[0]?.item_name || 'Món ngon quán',
        used_vouchers: o.promotion_code ? [o.promotion_code] : [],
        is_repeat_customer: false,
        review_count: 1,
        last_order_at: o.placed_at,
        last_order_code: o.order_code,
        avg_rating_given: 5.0,
      });
    }
  });
  const customerRecords: CustomerPurchaseRecord[] = Array.from(customerMap.values());

  // Hourly analysis from real orders
  const hourlyAnalysis: HourlyOrderAnalysis[] = Array.from({ length: 16 }, (_, i) => {
    const h = i + 7; // 07h to 22h
    const slotOrders = validOrders.filter((o) => new Date(o.placed_at).getHours() === h);
    const rev = slotOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    return {
      hour: h,
      order_count: slotOrders.length,
      revenue: rev,
      avg_prep_time: 15,
      peak_label: slotOrders.length >= 5 ? 'Giờ cao điểm' : undefined,
    };
  });

  // Payout schedule with real numbers
  const payoutSchedules: PlatformPayoutSchedule[] = [
    {
      id: 1,
      period_code: '2026-09-K1',
      period_name: 'Kỳ 1 (01/09 — 15/09/2026)',
      start_date: '2026-09-01',
      end_date: '2026-09-15',
      payout_date: '2026-09-18',
      total_orders: totalOrders,
      order_revenue: totalRevenue,
      commission_deducted: totalCommission,
      net_payout: netRevenue,
      payout_status: totalRevenue > 0 ? 'PAID' : 'SCHEDULED',
      bank_name: (shop as any)?.bank_name || 'MB Bank - Chi nhánh TP.HCM',
      bank_account_mask: (shop as any)?.bank_account ? `••••${(shop as any).bank_account.slice(-4)}` : '••••8888',
      transaction_ref: 'FT26258' + (shop?.id || 42) + '99',
      paid_at: '2026-09-18T10:30:00Z',
    },
    {
      id: 2,
      period_code: '2026-09-K2',
      period_name: 'Kỳ 2 (16/09 — 30/09/2026)',
      start_date: '2026-09-16',
      end_date: '2026-09-30',
      payout_date: '2026-10-03',
      total_orders: totalOrders,
      order_revenue: totalRevenue,
      commission_deducted: totalCommission,
      net_payout: netRevenue,
      payout_status: 'PROCESSING',
      bank_name: (shop as any)?.bank_name || 'MB Bank - Chi nhánh TP.HCM',
      bank_account_mask: (shop as any)?.bank_account ? `••••${(shop as any).bank_account.slice(-4)}` : '••••8888',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Doanh Thu & Đối Soát: {shop?.shop_name || 'Gian Hàng'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu đồng bộ trực tiếp từ Database • Khấu trừ hoa hồng 15% tự động theo FSM đơn hàng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRevenueData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs shadow-xs">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  timeframe === tf ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf === 'daily' ? 'Hôm nay' : tf === 'weekly' ? 'Tuần này' : 'Tháng này'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic KPI Summary based on timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Doanh thu thuần (Shop nhận về)"
          value={
            netRevenue >= 10000000
              ? `${(netRevenue / 1000000).toFixed(2)}M ₫`
              : `${netRevenue.toLocaleString()} ₫`
          }
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600"
          trend={currentDataset.trend}
          trendUp={currentDataset.trendUp}
        />
        <MetricCard
          label="Tổng đơn hàng thành công"
          value={`${totalOrders.toLocaleString()} đơn`}
          icon={ShoppingBag}
          iconBg="bg-blue-50 text-blue-600"
          trend={`Tỷ lệ hoàn tất ${completionRate}%`}
          trendUp
        />
        <MetricCard
          label="Giá trị trung bình / đơn"
          value={`${avgOrderValue.toLocaleString()} ₫`}
          icon={Award}
          iconBg="bg-purple-50 text-purple-600"
          sub={itemSalesData[0]?.name ? `Món nổi bật: ${itemSalesData[0].name}` : 'Chưa có món nổi bật'}
        />
        <MetricCard
          label="Hoa hồng nền tảng (15%)"
          value={
            totalCommission >= 10000000
              ? `${(totalCommission / 1000000).toFixed(2)}M ₫`
              : `${totalCommission.toLocaleString()} ₫`
          }
          icon={Percent}
          iconBg="bg-amber-50 text-amber-600"
          sub="Khấu trừ tự động theo kỳ đối soát"
        />
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === tab ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue + Commission Area Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <SectionHeader title={currentDataset.title} sub={currentDataset.sub} />
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentDataset.data}>
                    <defs>
                      <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="#94A3B8"
                      tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}K`)}
                    />
                    <Tooltip
                      formatter={(val: any, name?: any) => [
                        `${Number(val).toLocaleString()} ₫`,
                        name === 'revenue' ? 'Doanh thu' : 'Hoa hồng',
                      ]}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }}
                    />
                    <Legend
                      formatter={(v) => (v === 'revenue' ? 'Doanh thu gộp' : 'Hoa hồng khấu trừ (15%)')}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      fill="url(#gRevenue)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stroke="#F59E0B"
                      fill="url(#gCommission)"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Item Sales Pie */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <SectionHeader title="Phân Bổ Doanh Thu Theo Món" sub="Top món bán chạy nhất của quán" />
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={itemSalesData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {itemSalesData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Tỷ lệ']}
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    />
                    <Legend formatter={(v) => v} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Orders bar chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <SectionHeader
              title={`Số Lượng Đơn Hàng (${timeframe === 'daily' ? 'Hôm nay' : timeframe === 'weekly' ? 'Tuần này' : 'Tháng này'})`}
              sub="Tần suất phát sinh đơn theo từng mốc thời gian thực tế"
            />
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentDataset.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip
                    formatter={(v: any) => [`${v} đơn`, 'Số đơn']}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Bar dataKey="orders" fill="#3B82F6" radius={[5, 5, 0, 0]}>
                    {currentDataset.data.map((_, i) => (
                      <Cell key={i} fill={i === currentDataset.data.length - 2 ? '#1D4ED8' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSION & RECONCILIATION */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Doanh Thu Thuần Quán Nhận (85%)</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">
                {netRevenue.toLocaleString()} ₫
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Đã khấu trừ 15% hoa hồng sàn</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Tổng Đơn Đang Chờ Quyết Toán</p>
              <p className="text-xl font-bold mt-1 text-amber-700">
                {validOrders.length} đơn
              </p>
              <p className="text-[11px] text-amber-600 mt-1">Dự kiến chi trả chu kỳ tiếp theo</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Tổng Hoa Hồng Đã Khấu Trừ (15%)</p>
              <p className="text-xl font-bold mt-1 text-rose-700">
                {totalCommission.toLocaleString()} ₫
              </p>
              <p className="text-[11px] text-rose-600 mt-1">Phí sử dụng hạ tầng, shipper & thanh toán</p>
            </div>
          </div>

          <CommissionTable
            records={commissionRecords}
            periodFilter={periodFilter}
            onPeriodChange={setPeriodFilter}
          />
        </div>
      )}

      {/* TAB 3: PLATFORM PAYOUT SCHEDULE */}
      {activeTab === 'payout' && (
        <PayoutScheduleView schedules={payoutSchedules} />
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Tổng Khách Hàng</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {customerRecords.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Khách Quen (≥2 đơn)</p>
              <p className="text-2xl font-bold text-violet-700 mt-1">
                {customerRecords.filter((c) => c.is_repeat_customer).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Tổng Doanh Thu Khách</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {totalRevenue.toLocaleString()} ₫
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Đơn Hoàn Tất</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {totalOrders} đơn
              </p>
            </div>
          </div>

          <SectionHeader
            title="Danh Sách Khách Hàng Đã Mua"
            sub="Tất cả khách hàng đã đặt món tại quán, sắp xếp theo tổng chi tiêu thực tế"
          />
          <CustomerTable
            customers={[...customerRecords].sort((a, b) => b.total_spent - a.total_spent)}
          />
        </div>
      )}

      {/* TAB 5: PEAK TIME */}
      {activeTab === 'peaktime' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '🔥 Giờ Phát Sinh Đơn', value: `${hourlyAnalysis.find(h => h.order_count > 0)?.hour || 12}:00`, sub: `${totalOrders} đơn ghi nhận`, color: 'red' },
              { label: '📦 Tổng Đơn Hàng', value: `${totalOrders} đơn`, sub: 'Ghi nhận từ database', color: 'blue' },
              { label: '⏰ Tỷ Lệ Hoàn Tất', value: `${completionRate}%`, sub: `${cancelledOrders} đơn hủy`, color: 'slate' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{item.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <SectionHeader
              title="Phân Phối Đơn Hàng Theo Giờ (Toàn Ngày)"
              sub="Số đơn đặt tại từng khung giờ từ hệ thống"
            />
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}h`} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip
                    formatter={(val: any, name?: any) => [
                      name === 'order_count' ? `${val} đơn` : `${Number(val).toLocaleString()} ₫`,
                      name === 'order_count' ? 'Số đơn' : 'Doanh thu',
                    ]}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }}
                  />
                  <Legend
                    formatter={(v) => (v === 'order_count' ? 'Số đơn' : 'Doanh thu')}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Bar dataKey="order_count" radius={[4, 4, 0, 0]}>
                    {hourlyAnalysis.map((h, i) => (
                      <Cell
                        key={i}
                        fill={
                          h.order_count >= 5
                            ? '#EF4444'
                            : h.order_count >= 2
                            ? '#F97316'
                            : h.order_count >= 1
                            ? '#3B82F6'
                            : '#CBD5E1'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <SectionHeader
              title="Heatmap Số Đơn & Doanh Thu Theo Giờ"
              sub="Mức độ bận rộn theo từng mốc giờ từ dữ liệu thực tế"
            />
            <HourlyHeatmap data={hourlyAnalysis} />
          </div>
        </div>
      )}

      {/* TAB 6: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Voucher Đang Hoạt Động',
                value: promotions.filter(
                  (p) => p.is_active && p.approval_status === 'APPROVED'
                ).length,
                icon: '✅',
              },
              {
                label: 'Tổng Mã Khuyến Mãi',
                value: promotions.length,
                icon: '🎟',
              },
              {
                label: 'Tổng Đơn Dùng Voucher',
                value: validOrders.filter((o) => !!o.promotion_code).length,
                icon: '💸',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xl font-bold text-slate-800">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <SectionHeader
            title="Phân Tích Sử Dụng Voucher"
            sub="Danh sách mã ưu đãi của quán và nền tảng"
          />
          <VoucherUsageTable promotions={promotions} shopId={shop?.id} />
        </div>
      )}
    </div>
  );
}
