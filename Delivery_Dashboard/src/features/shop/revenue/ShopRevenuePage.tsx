import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import {
  initialCommissionRecords,
  initialCustomerPurchaseRecords,
  initialHourlyAnalysis,
  initialPromotions,
  initialPayoutSchedules,
  CommissionRecord,
  CustomerPurchaseRecord,
  PlatformPayoutSchedule,
} from '@/api/mockData';

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
function HourlyHeatmap() {
  const max = Math.max(...initialHourlyAnalysis.map((h) => h.order_count));
  const hours = initialHourlyAnalysis;

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
function VoucherUsageTable() {
  const shopPromos = initialPromotions.filter((p) => p.shop_id === 1);
  const platformPromos = initialPromotions.filter((p) => p.scope === 'PLATFORM');
  const allVisible = [...shopPromos, ...platformPromos.filter((p) => p.used_count > 0)];

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

// =============================================
// Timeframe Datasets for Dynamic Switcher
// =============================================
const timeframeDatasets = {
  daily: {
    title: 'Doanh Thu Hôm Nay (Theo Khung Giờ)',
    sub: 'Biểu đồ doanh số và hoa hồng theo các mốc giờ trong ngày hôm nay',
    data: [
      { label: '07h', revenue: 540000, orders: 12, commission: 81000 },
      { label: '09h', revenue: 675000, orders: 15, commission: 101250 },
      { label: '11h', revenue: 2025000, orders: 45, commission: 303750 },
      { label: '12h', revenue: 3060000, orders: 68, commission: 459000 },
      { label: '13h', revenue: 2340000, orders: 52, commission: 351000 },
      { label: '15h', revenue: 450000, orders: 10, commission: 67500 },
      { label: '18h', revenue: 2475000, orders: 55, commission: 371250 },
      { label: '20h', revenue: 1350000, orders: 30, commission: 202500 },
    ],
    trend: '+12.4% so với hôm qua',
    trendUp: true,
  },
  weekly: {
    title: 'Doanh Thu Tuần Này (Thứ 2 — Chủ Nhật)',
    sub: 'Doanh thu tổng 7 ngày — thanh màu nhạt là hoa hồng đã khấu trừ',
    data: [
      { label: 'T2', revenue: 8500000, orders: 150, commission: 1275000 },
      { label: 'T3', revenue: 9200000, orders: 165, commission: 1380000 },
      { label: 'T4', revenue: 7800000, orders: 138, commission: 1170000 },
      { label: 'T5', revenue: 10500000, orders: 192, commission: 1575000 },
      { label: 'T6', revenue: 11200000, orders: 203, commission: 1680000 },
      { label: 'T7', revenue: 13800000, orders: 248, commission: 2070000 },
      { label: 'CN', revenue: 12600000, orders: 225, commission: 1890000 },
    ],
    trend: '+18.2% so với tuần trước',
    trendUp: true,
  },
  monthly: {
    title: 'Doanh Thu Tháng Này (Tháng 09/2026)',
    sub: 'Doanh thu phân bổ theo 4 tuần trong tháng',
    data: [
      { label: 'Tuần 1 (01-07/09)', revenue: 68500000, orders: 1240, commission: 10275000 },
      { label: 'Tuần 2 (08-14/09)', revenue: 72100000, orders: 1310, commission: 10815000 },
      { label: 'Tuần 3 (15-21/09)', revenue: 74600000, orders: 1321, commission: 11190000 },
      { label: 'Tuần 4 (22-30/09)', revenue: 83200000, orders: 1480, commission: 12480000 },
    ],
    trend: '+24.5% so với tháng trước',
    trendUp: true,
  },
};

const itemSalesData = [
  { name: 'Cơm Sườn Nướng', value: 38 },
  { name: 'Cơm Cá Kho Tộ', value: 22 },
  { name: 'Thịt Kho Trứng', value: 18 },
  { name: 'Trứng Chiên', value: 14 },
  { name: 'Khác', value: 8 },
];
const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#94A3B8'];

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
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');

  const currentDataset = timeframeDatasets[timeframe];
  const totalRevenue = currentDataset.data.reduce((a, d) => a + d.revenue, 0);
  const totalOrders = currentDataset.data.reduce((a, d) => a + d.orders, 0);
  const totalCommission = currentDataset.data.reduce((a, d) => a + d.commission, 0);
  const netRevenue = totalRevenue - totalCommission;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Doanh Thu & Đối Soát Gian Hàng (M-SHOP-04)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thống kê doanh số theo ngày/tuần/tháng, khấu trừ hoa hồng đơn hàng và lịch chi trả từ nền tảng.
          </p>
        </div>
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

      {/* Dynamic KPI Summary based on timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Doanh thu thuần (Shop nhận về)"
          value={
            totalRevenue >= 10000000
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
          trend="Tỷ lệ hoàn tất 98.6%"
          trendUp
        />
        <MetricCard
          label="Giá trị trung bình / đơn"
          value={`${Math.round(totalOrders > 0 ? totalRevenue / totalOrders : 0).toLocaleString()} ₫`}
          icon={Award}
          iconBg="bg-purple-50 text-purple-600"
          sub="Phổ biến: Cơm Sườn + Canh"
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
              <SectionHeader title="Phân Bổ Doanh Thu Theo Món" sub="Top món bán chạy nhất quán" />
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
              sub="Tần suất phát sinh đơn theo từng mốc thời gian"
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
              <p className="text-xs text-slate-500 font-medium">Kỳ 2026-09-W3 (Đã Đối Soát & Chuyển Tiền)</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">
                {initialCommissionRecords
                  .filter((r) => r.settlement_period === '2026-09-W3')
                  .reduce((a, r) => a + r.shop_net_revenue, 0)
                  .toLocaleString()}{' '}
                ₫
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Đã tất toán chuyển khoản MB Bank</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Kỳ 2026-09-W4 (Đang Gom & Chờ Đối Soát)</p>
              <p className="text-xl font-bold mt-1 text-amber-700">
                {initialCommissionRecords
                  .filter((r) => r.settlement_period === '2026-09-W4')
                  .reduce((a, r) => a + r.shop_net_revenue, 0)
                  .toLocaleString()}{' '}
                ₫
              </p>
              <p className="text-[11px] text-amber-600 mt-1">Dự kiến chi trả ngày 03/10/2026</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Tổng Hoa Hồng Đã Khấu Trừ (15%)</p>
              <p className="text-xl font-bold mt-1 text-rose-700">
                {initialCommissionRecords.reduce((a, r) => a + r.commission_amount, 0).toLocaleString()} ₫
              </p>
              <p className="text-[11px] text-rose-600 mt-1">Phí sử dụng hạ tầng, shipper & thanh toán</p>
            </div>
          </div>

          <CommissionTable
            records={initialCommissionRecords}
            periodFilter={periodFilter}
            onPeriodChange={setPeriodFilter}
          />
        </div>
      )}

      {/* TAB 3: PLATFORM PAYOUT SCHEDULE (M-SHOP-04 Lịch Chi Trả Nền Tảng) */}
      {activeTab === 'payout' && (
        <PayoutScheduleView schedules={initialPayoutSchedules} />
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Tổng Khách Hàng</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{initialCustomerPurchaseRecords.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Khách Quen (≥3 đơn)</p>
              <p className="text-2xl font-bold text-violet-700 mt-1">
                {initialCustomerPurchaseRecords.filter((c) => c.is_repeat_customer).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Tổng Doanh Thu Khách</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {(initialCustomerPurchaseRecords.reduce((a, c) => a + c.total_spent, 0) / 1000).toFixed(0)}K ₫
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-xs text-slate-500">Điểm Đánh Giá TB</p>
              <p className="text-2xl font-bold text-amber-600 mt-1 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-current" />
                {(
                  initialCustomerPurchaseRecords
                    .filter((c) => c.avg_rating_given)
                    .reduce((a, c) => a + (c.avg_rating_given || 0), 0) /
                  initialCustomerPurchaseRecords.filter((c) => c.avg_rating_given).length
                ).toFixed(1)}
              </p>
            </div>
          </div>

          <SectionHeader
            title="Danh Sách Khách Hàng Đã Mua"
            sub="Tất cả khách đã đặt hàng tại quán, sắp xếp theo tổng chi tiêu"
          />
          <CustomerTable
            customers={[...initialCustomerPurchaseRecords].sort((a, b) => b.total_spent - a.total_spent)}
          />
        </div>
      )}

      {/* TAB 5: PEAK TIME */}
      {activeTab === 'peaktime' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '🔥 Giờ Cao Điểm Nhất', value: '12:00 — 13:00', sub: '68 đơn/giờ', color: 'red' },
              { label: '🌙 Buổi Tối Cao Điểm', value: '18:00 — 19:00', sub: '55 đơn/giờ', color: 'blue' },
              { label: '⏰ Giờ Thấp Điểm', value: '15:00 — 16:00', sub: '10 đơn/giờ', color: 'slate' },
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
              sub="Số đơn đặt tại từng khung giờ trong ngày"
            />
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={initialHourlyAnalysis}>
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
                    {initialHourlyAnalysis.map((h, i) => (
                      <Cell
                        key={i}
                        fill={
                          h.order_count >= 50
                            ? '#EF4444'
                            : h.order_count >= 30
                            ? '#F97316'
                            : h.order_count >= 15
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
              sub="Độ đậm của bar thể hiện mức độ bận rộn — đỏ = rất đông, xanh = vừa, xám = thưa"
            />
            <HourlyHeatmap />
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
                value: initialPromotions.filter((p) => p.is_active && p.approval_status === 'APPROVED').length,
                icon: '✅',
              },
              {
                label: 'Tổng Lượt Dùng (tất cả)',
                value: initialPromotions.reduce((a, p) => a + p.used_count, 0),
                icon: '🎟',
              },
              {
                label: 'Tổng Giảm Giá Phát Ra',
                value: `${initialPromotions
                  .reduce(
                    (a, p) =>
                      a + p.used_count * (p.promo_type === 'FIXED_AMOUNT' ? p.discount_value : 0),
                    0
                  )
                  .toLocaleString()} ₫`,
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
            sub="Tỷ lệ dùng, lượt áp dụng và hiệu quả của từng mã khuyến mãi"
          />
          <VoucherUsageTable />
        </div>
      )}
    </div>
  );
}
