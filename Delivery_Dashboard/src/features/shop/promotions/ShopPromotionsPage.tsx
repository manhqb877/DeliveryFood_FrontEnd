import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Promotion, PromotionRedemption } from '@/api/mockData';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Ticket,
  Calendar,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Play,
  History,
  Power,
  Search,
  Check,
  X,
  Edit3
} from 'lucide-react';

export function ShopPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create & Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    code: '',
    promo_type: 'FIXED_AMOUNT',
    scope: 'SHOP',
    discount_value: 20000,
    max_discount_amount: 50000,
    min_order_value: 100000,
    total_limit: 20,
    per_user_limit: 1,
    applicable_to: 'ALL',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  // Redemption History Modal
  const [selectedPromoForHistory, setSelectedPromoForHistory] = useState<Promotion | null>(null);
  const [redemptions, setRedemptions] = useState<PromotionRedemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  // Anti-Abuse Sandbox Simulator state
  const [testCode, setTestCode] = useState('LAN20K');
  const [testOrderValue, setTestOrderValue] = useState(120000);
  const [testUserId, setTestUserId] = useState(8);
  const [simResult, setSimResult] = useState<{
    tested: boolean;
    valid: boolean;
    discountAmount?: number;
    finalAmount?: number;
    message: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const list = await dbService.getPromotions('SHOP', 1);
    setPromotions(list.filter((p) => !p.shop_id || p.shop_id === 1));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setNewPromo({
      code: '',
      promo_type: 'FIXED_AMOUNT',
      scope: 'SHOP',
      discount_value: 20000,
      max_discount_amount: 50000,
      min_order_value: 100000,
      total_limit: 20,
      per_user_limit: 1,
      applicable_to: 'ALL',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setNewPromo({
      id: promo.id,
      code: promo.code,
      promo_type: promo.promo_type,
      scope: promo.scope,
      discount_value: promo.discount_value,
      max_discount_amount: promo.max_discount_amount,
      min_order_value: promo.min_order_value,
      total_limit: promo.total_limit,
      per_user_limit: promo.per_user_limit,
      applicable_to: promo.applicable_to,
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
      approval_status: promo.approval_status,
      is_active: promo.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSavePromo = async () => {
    if (!newPromo.code) {
      toast.warning('Vui lòng nhập mã khuyến mãi (Code)!', 'Thiếu Thông Tin');
      return;
    }
    if (!newPromo.total_limit || newPromo.total_limit <= 0) {
      toast.warning('Vui lòng nhập giới hạn tổng số lượng voucher phát hành để chống vượt ngân sách!', 'Hạn Mức Quota');
      return;
    }
    if (!newPromo.min_order_value || newPromo.min_order_value <= 0) {
      toast.warning('Vui lòng đặt giá trị đơn hàng tối thiểu để bảo vệ biên lợi nhuận quán!', 'Đơn Tối Thiểu');
      return;
    }

    if (editingPromo) {
      await dbService.savePromotion({
        ...newPromo,
        id: editingPromo.id,
        shop_id: 1,
        shop_name: 'Cơm Nhà Chị Lan',
      });
      toast.success(
        `Đã cập nhật thành công các thông số mã khuyến mãi "${newPromo.code}"!`,
        'Cập Nhật Thành Công'
      );
    } else {
      await dbService.savePromotion({
        ...newPromo,
        scope: 'SHOP',
        shop_id: 1,
        shop_name: 'Cơm Nhà Chị Lan',
        approval_status: 'PENDING',
        is_active: true,
        used_count: 0,
      });
      toast.success(
        `Đã gửi mã khuyến mãi "${newPromo.code}" lên Quản trị viên (Admin) phê duyệt theo quy định sàn!`,
        'Gửi Duyệt Thành Công'
      );
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleTogglePromo = async (promo: Promotion) => {
    const nextState = !promo.is_active;
    await dbService.togglePromotion(promo.id, nextState);
    toast.info(
      `Đã ${nextState ? 'kích hoạt' : 'tạm ngưng'} mã khuyến mãi "${promo.code}".`,
      'Cập Nhật Trạng Thái'
    );
    loadData();
  };

  const handleOpenHistory = async (promo: Promotion) => {
    setSelectedPromoForHistory(promo);
    setLoadingRedemptions(true);
    const list = await dbService.getPromotionRedemptions(promo.id);
    setRedemptions(list);
    setLoadingRedemptions(false);
  };

  // Run anti-abuse simulator
  const handleRunSimulator = async () => {
    setValidating(true);
    try {
      const result = await dbService.validatePromotion({
        code: testCode.trim(),
        shopId: 1,
        userId: Number(testUserId),
        orderValue: Number(testOrderValue),
      });
      setSimResult({
        tested: true,
        valid: result.valid,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
        message: result.message,
      });
    } catch (e: any) {
      setSimResult({
        tested: true,
        valid: false,
        message: 'Lỗi kiểm tra hệ thống: ' + (e.message || 'Không thể xác thực'),
      });
    } finally {
      setValidating(false);
    }
  };

  // KPIs
  const totalPromos = promotions.length;
  const approvedPromos = promotions.filter((p) => p.approval_status === 'APPROVED');
  const pendingPromos = promotions.filter((p) => p.approval_status === 'PENDING');
  const totalUsed = promotions.reduce((acc, p) => acc + (p.used_count || 0), 0);

  const filteredPromos = promotions.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.approval_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title & Anti-abuse banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" /> Khuyến Mãi & Chống Lạm Dụng Voucher
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mã giảm giá của gian hàng, áp dụng hạn mức ngân sách và kiểm soát chặt chẽ lượt dùng mỗi khách.
          </p>
        </div>
      </div>

      {/* Anti-Abuse Feature Callout */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-sm border border-blue-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-blue-300" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-sm text-blue-100 flex items-center gap-2">
              Bộ Quy Tắc Chống Lạm Dụng Phiếu Giảm Giá (Anti-Voucher Abuse)
            </h3>
            <p className="text-blue-200/90 leading-relaxed">
              Mỗi voucher do gian hàng phát hành đều được kiểm soát bởi 3 chốt chặn: 
              <b> (1) Giới hạn tổng số lượng phát hành</b> (Ví dụ tung 20 mã thì khách thứ 21 sẽ không thể dùng, bảo vệ shop khỏi vượt ngân sách), 
              <b> (2) Giới hạn lượt dùng/khách</b> (Ví dụ 1 lượt/khách để chống gom mã), và 
              <b> (3) Đơn tối thiểu</b> (Ví dụ đơn 100k mới áp dụng giảm 20k, đảm bảo shop có lãi).
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng chương trình</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{totalPromos}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đang chạy (Approved)</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{approvedPromos.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Chờ Admin duyệt</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingPromos.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng lượt khách đã dùng</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">{totalUsed}</p>
          </div>
        </div>
      </div>

      {/* Filter and Create Button */}
      <FilterBar
        onRefresh={loadData}
        primaryAction={{
          label: '+ Tạo Khuyến Mãi Mới',
          icon: <Plus className="w-4 h-4" />,
          onClick: handleOpenCreateModal,
        }}
        dropdowns={[
          {
            id: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Đã duyệt (APPROVED)', value: 'APPROVED' },
              { label: 'Chờ duyệt (PENDING)', value: 'PENDING' },
              { label: 'Bị từ chối (REJECTED)', value: 'REJECTED' },
            ],
          },
        ]}
      />

      {/* Promotion Cards with Anti-Abuse Quota Indicators */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải danh sách khuyến mãi...</div>
      ) : filteredPromos.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Không tìm thấy mã khuyến mãi nào. Hãy bấm "+ Tạo Khuyến Mãi Mới".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map((promo) => {
            const isPercent = promo.promo_type === 'PERCENT';
            const isFreeShip = promo.promo_type === 'FREE_DELIVERY';
            const discountDesc = isFreeShip
              ? 'Freeship giao hàng'
              : isPercent
              ? `Giảm ${promo.discount_value}% (Tối đa ${(promo.max_discount_amount || 0).toLocaleString()} ₫)`
              : `Giảm ${promo.discount_value.toLocaleString()} ₫`;

            const totalLimit = promo.total_limit || 100;
            const usedCount = promo.used_count || 0;
            const isExhausted = usedCount >= totalLimit;
            const usagePercent = Math.min(100, Math.round((usedCount / totalLimit) * 100));

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs flex flex-col justify-between ${
                  isExhausted ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  {/* Card Header Banner */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs tracking-wider">
                        {promo.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          promo.approval_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : promo.approval_status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {promo.approval_status === 'APPROVED'
                          ? 'Đã duyệt'
                          : promo.approval_status === 'PENDING'
                          ? 'Chờ duyệt'
                          : 'Từ chối'}
                      </span>
                    </div>

                    {/* Header actions: Quick Edit & Active toggle */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(promo)}
                        title="Chỉnh sửa & cập nhật khuyến mãi này"
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleTogglePromo(promo)}
                        title={promo.is_active ? 'Bấm để tạm ngưng mã' : 'Bấm để mở lại mã'}
                        className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                          promo.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {promo.is_active ? 'Bật' : 'Tắt'}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 text-xs">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{discountDesc}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Áp dụng đơn từ: <b className="text-slate-700">{promo.min_order_value.toLocaleString()} ₫</b>
                      </p>
                    </div>

                    {/* Anti-Abuse Quota Progress Bar */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-600 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Hạn mức phát hành:
                        </span>
                        <span className="font-bold text-slate-800">
                          {usedCount} / {totalLimit} mã ({usagePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExhausted
                              ? 'bg-rose-500'
                              : usagePercent > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Còn lại: {Math.max(0, totalLimit - usedCount)} mã</span>
                        <span>Giới hạn: {promo.per_user_limit || 1} lượt / khách</span>
                      </div>
                    </div>

                    {/* Quota warning tag */}
                    {isExhausted && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-md text-rose-700 font-bold text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>HẾT LƯỢT PHÁT HÀNH — Đã tự động ngắt để bảo vệ ngân sách shop!</span>
                      </div>
                    )}

                    {/* Details Info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {promo.applicable_to === 'ALL'
                            ? 'Tất cả khách'
                            : promo.applicable_to === 'RESIDENT'
                            ? 'Chỉ cư dân'
                            : 'Khách mới'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hết hạn: {new Date(promo.valid_until).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenHistory(promo)}
                    className="flex-1 py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-2xs"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Lịch sử ({usedCount})
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(promo)}
                    className="py-1.5 px-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="Chỉnh sửa & cập nhật thông số khuyến mãi"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => {
                      setTestCode(promo.code);
                      setTestOrderValue(promo.min_order_value);
                    }}
                    title="Đưa mã vào Hộp Giả lập Chống Lạm Dụng bên dưới"
                    className="py-1.5 px-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 cursor-pointer text-xs"
                  >
                    Thử nghiệm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ANTI-ABUSE LIVE SANDBOX (Hộp thử nghiệm chống gian lận & lạm dụng) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Hộp Kiểm Tra & Mô Phỏng Chống Lạm Dụng Voucher (Anti-Abuse Sandbox)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mô phỏng đặt hàng theo thời gian thực để kiểm chứng: mã có bị khách mua quá số lượt, hoặc đơn dưới mức tối thiểu hay không.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
            Realtime Validation Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mã Voucher kiểm tra:</label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="VD: LAN20K"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Giá trị đơn hàng (₫):</label>
            <input
              type="number"
              step="10000"
              value={testOrderValue}
              onChange={(e) => setTestOrderValue(Number(e.target.value))}
              placeholder="120000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Khách hàng thử nghiệm:</label>
            <select
              value={testUserId}
              onChange={(e) => setTestUserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value={8}>Vũ Minh Bình (ID #8 - Đã dùng 1 lần)</option>
              <option value={9}>Phạm Thị Châu (ID #9 - Đã dùng 1 lần)</option>
              <option value={10}>Trần Văn Dũng (ID #10 - Khách mới tinh)</option>
              <option value={7}>Nguyễn Thị An (ID #7 - Cư dân S1)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSimulator}
              disabled={validating}
              className="w-full py-2 bg-[#0F2540] text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {validating ? 'Đang xác thực...' : 'Kiểm Tra Áp Dụng'}
            </button>
          </div>
        </div>

        {/* Simulator Results Output */}
        {simResult && simResult.tested && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${
              simResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="mt-0.5">
              {simResult.valid ? (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
                  <X className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  {simResult.valid
                    ? '✅ ĐỦ ĐIỀU KIỆN ÁP DỤNG MÃ KHUYẾN MÃI'
                    : '⛔ BỊ HỆ THỐNG CHỐNG LẠM DỤNG TỪ CHỐI'}
                </p>
                {simResult.valid && simResult.discountAmount && (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                    Giảm -{simResult.discountAmount.toLocaleString()} ₫
                  </span>
                )}
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">{simResult.message}</p>
              {simResult.valid && simResult.finalAmount !== undefined && (
                <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                  Khách thực tế thanh toán: {simResult.finalAmount.toLocaleString()} ₫ (Đơn gốc: {testOrderValue.toLocaleString()} ₫)
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Create & Edit Promotion with Anti-Abuse Controls */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? `Chỉnh Sửa Khuyến Mãi: ${editingPromo.code}` : "Tạo Khuyến Mãi Mới (Kiểm Soát Ngân Sách)"}
        subtitle={
          editingPromo
            ? "Cập nhật mức giảm giá, đơn hàng tối thiểu, và hạn mức quota phát hành để bảo vệ ngân sách quán"
            : "Thiết lập giới hạn số lượng và điều kiện để chống khách hàng lạm dụng phiếu giảm giá"
        }
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã khuyến mãi (Code) *:</label>
              <input
                type="text"
                value={newPromo.code || ''}
                onChange={(e) =>
                  setNewPromo((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase().replace(/\s/g, ''),
                  }))
                }
                placeholder="VD: LAN20K, CHAOBANMOI"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Hình thức khuyến mãi:</label>
              <select
                value={newPromo.promo_type}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, promo_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="FIXED_AMOUNT">💵 Giảm số tiền cố định (₫)</option>
                <option value="PERCENT">🏷️ Giảm theo tỷ lệ phần trăm (%)</option>
                <option value="FREE_DELIVERY">🛵 Miễn phí giao hàng (Freeship)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {newPromo.promo_type === 'PERCENT' ? 'Mức giảm (%) *:' : 'Mức giảm (₫) *:'}
              </label>
              <input
                type="number"
                value={newPromo.discount_value || 0}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Đơn hàng tối thiểu (₫) *
                <span className="text-slate-400 font-normal ml-1">(Ví dụ: 100.000₫ mới được giảm)</span>
              </label>
              <input
                type="number"
                step="5000"
                value={newPromo.min_order_value || 0}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, min_order_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          {newPromo.promo_type === 'PERCENT' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Mức trần giảm giá tối đa (₫):
                <span className="text-slate-400 font-normal ml-1">(Bảo vệ không bị giảm quá nhiều trên đơn lớn)</span>
              </label>
              <input
                type="number"
                step="5000"
                value={newPromo.max_discount_amount || 30000}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, max_discount_amount: Number(e.target.value) }))}
                placeholder="VD: 30000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-blue-700"
              />
            </div>
          )}

          {/* Critical Anti-Abuse Limits */}
          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 space-y-3">
            <p className="font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Thiết Lập Chống Vượt Ngân Sách & Chống Gian Lận:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tổng số mã phát hành (Quota) *:
                  <span className="text-slate-400 block text-[10px] font-normal">
                    VD: Đặt 20 mã thì đúng 20 đơn là hết, không bị lỗ
                  </span>
                </label>
                <input
                  type="number"
                  value={newPromo.total_limit || 20}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, total_limit: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-blue-300 bg-white rounded-lg text-xs font-bold text-blue-950"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Giới hạn lượt dùng/mỗi khách *:
                  <span className="text-slate-400 block text-[10px] font-normal">
                    VD: 1 lượt/khách để tránh 1 người gom hết mã
                  </span>
                </label>
                <input
                  type="number"
                  value={newPromo.per_user_limit || 1}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, per_user_limit: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-blue-300 bg-white rounded-lg text-xs font-bold text-blue-950"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Đối tượng khách áp dụng:</label>
              <select
                value={newPromo.applicable_to || 'ALL'}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, applicable_to: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="ALL">Tất cả khách hàng (ALL)</option>
                <option value="RESIDENT">Chỉ cư dân trong khu vực (RESIDENT)</option>
                <option value="NEW_USER">Khách hàng đặt lần đầu (NEW_USER)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Thời hạn hiệu lực đến:</label>
              <input
                type="date"
                value={newPromo.valid_until || ''}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, valid_until: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Mã khuyến mãi của gian hàng sau khi tạo sẽ gửi lên hệ thống ở trạng thái <b>PENDING</b>. Quản trị viên (Admin) sàn sẽ kiểm duyệt trong vòng 2-4 giờ làm việc trước khi mã chính thức hiển thị cho khách đặt.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSavePromo}
              className="px-5 py-2 bg-[#0F2540] text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer shadow-sm transition-colors"
            >
              {editingPromo ? 'Lưu Thay Đổi Khuyến Mãi' : 'Gửi Duyệt Khuyến Mãi'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal View Redemption Audit Trail */}
      <Modal
        isOpen={!!selectedPromoForHistory}
        onClose={() => setSelectedPromoForHistory(null)}
        title={`Lịch Sử Sử Dụng Mã: ${selectedPromoForHistory?.code || ''}`}
        subtitle="Danh sách khách hàng đã áp dụng mã khuyến mãi này vào đơn hàng thực tế"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {loadingRedemptions ? (
            <div className="py-8 text-center text-slate-400">Đang tải lịch sử...</div>
          ) : redemptions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
              Chưa có khách hàng nào sử dụng mã khuyến mãi này.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-2.5 font-semibold text-slate-600">Đơn hàng</th>
                    <th className="text-left p-2.5 font-semibold text-slate-600">Khách hàng</th>
                    <th className="text-right p-2.5 font-semibold text-slate-600">Giá trị đơn</th>
                    <th className="text-right p-2.5 font-semibold text-slate-600 text-emerald-700">Đã giảm</th>
                    <th className="text-center p-2.5 font-semibold text-slate-600">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-blue-600">{r.order_code}</td>
                      <td className="p-2.5">
                        <p className="font-semibold text-slate-800">{r.user_name}</p>
                        <p className="text-[10px] text-slate-400">{r.user_phone}</p>
                      </td>
                      <td className="p-2.5 text-right font-medium text-slate-700">
                        {r.order_value.toLocaleString()} ₫
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">
                        -{r.discount_amount.toLocaleString()} ₫
                      </td>
                      <td className="p-2.5 text-center text-slate-500 text-[10px]">
                        {new Date(r.used_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSelectedPromoForHistory(null)}
              className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
