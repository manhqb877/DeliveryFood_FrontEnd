import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Promotion, ShopProfile } from '@/api/mockData';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Check,
  X,
  Calendar,
  Ticket,
  ShieldCheck,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Power,
  Users,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Info,
  Edit3
} from 'lucide-react';

interface AdminPromotionsPageProps {
  initialTab?: 'PLATFORM' | 'PENDING_SHOP' | 'ALL';
}

export function AdminPromotionsPage({ initialTab = 'PLATFORM' }: AdminPromotionsPageProps) {
  const [activeTab, setActiveTab] = useState<'PLATFORM' | 'PENDING_SHOP' | 'ALL'>(initialTab);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<Promotion | null>(null);
  const [rejectReason, setRejectReason] = useState('Khuyến mãi chưa đáp ứng tỷ lệ đơn tối thiểu theo quy định bảo vệ ngân sách của sàn.');

  // Add & Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoForm, setPromoForm] = useState<Partial<Promotion>>({
    code: '',
    promo_type: 'FIXED_AMOUNT',
    scope: 'PLATFORM',
    discount_value: 20000,
    min_order_value: 100000,
    max_discount_amount: 50000,
    total_limit: 500,
    per_user_limit: 2,
    applicable_to: 'ALL',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    const [promoList, shopList] = await Promise.all([
      dbService.getPromotions(),
      dbService.getShops()
    ]);
    setPromotions(promoList);
    setShops(shopList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const getShopInfo = (shopId?: number) => {
    if (!shopId) return null;
    return shops.find((s) => s.id === shopId);
  };

  const handleApproveShopPromo = async (promo: Promotion, approved: boolean, reason?: string) => {
    const shop = getShopInfo(promo.shop_id);
    const shopName = shop?.shop_name || promo.shop_name || 'Gian hàng';

    await dbService.approvePromotion(promo.id, approved, reason);

    if (approved) {
      toast.success(
        `Đã phê duyệt mã "${promo.code}" của gian hàng "${shopName}". Mã hiện đã có hiệu lực để khách đặt đơn!`,
        'Phê Duyệt Thành Công'
      );
    } else {
      toast.error(
        `Đã từ chối mã "${promo.code}" của gian hàng "${shopName}". Lý do: ${reason}`,
        'Đã Từ Chối Khuyến Mãi'
      );
    }

    setRejectTarget(null);
    loadData();
  };

  const handleTogglePromo = async (promo: Promotion) => {
    const nextState = !promo.is_active;
    await dbService.togglePromotion(promo.id, nextState);
    toast.info(
      `Đã ${nextState ? 'kích hoạt hoạt động' : 'tạm ngưng phát hành'} mã khuyến mãi "${promo.code}".`,
      'Cập Nhật Trạng Thái'
    );
    loadData();
  };

  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      promo_type: 'FIXED_AMOUNT',
      scope: 'PLATFORM',
      discount_value: 20000,
      min_order_value: 100000,
      max_discount_amount: 50000,
      total_limit: 500,
      per_user_limit: 2,
      applicable_to: 'ALL',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setPromoForm({
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
    if (!promoForm.code) {
      toast.warning('Vui lòng nhập mã khuyến mãi (Code)!', 'Thiếu Thông Tin');
      return;
    }
    if (!promoForm.total_limit || promoForm.total_limit <= 0) {
      toast.warning('Vui lòng đặt tổng hạn mức phát hành để chống thâm hụt ngân sách sàn!', 'Thiếu Hạn Mức');
      return;
    }

    if (editingPromo) {
      await dbService.savePromotion({
        ...editingPromo,
        ...promoForm,
      } as Promotion);

      toast.success(
        `Đã cập nhật thành công các thông số mã khuyến mãi "${promoForm.code}"!`,
        'Cập Nhật Thành Công'
      );
    } else {
      await dbService.savePromotion({
        ...promoForm,
        scope: 'PLATFORM',
        approval_status: 'APPROVED',
        is_active: true,
        used_count: 0
      } as Promotion);

      toast.success(
        `Đã tạo và kích hoạt mã khuyến mãi toàn sàn "${promoForm.code}" với hạn mức ${promoForm.total_limit} lượt!`,
        'Tạo Thành Công'
      );
    }

    setIsModalOpen(false);
    loadData();
  };

  const rejectionTemplates = [
    'Khuyến mãi chưa đáp ứng tỷ lệ đơn tối thiểu theo quy định bảo vệ ngân sách của sàn.',
    'Mức giảm giá vượt quá trần quy định cho phép của danh mục món ăn (tối đa 30%).',
    'Số lượng phát hành (quota) quá lớn, tiềm ẩn nguy cơ thiếu hụt nguồn lực phục vụ.',
    'Thời hạn áp dụng quá dài hoặc trùng lặp với chiến dịch đại tiệc sàn đã được lên lịch.',
    'Thông tin điều kiện áp dụng cho cư dân chưa rõ ràng.'
  ];

  const platformPromos = promotions.filter((p) => p.scope === 'PLATFORM');
  const pendingShopPromos = promotions.filter(
    (p) => p.scope === 'SHOP' && p.approval_status === 'PENDING'
  );
  const allShopPromos = promotions.filter((p) => p.scope === 'SHOP');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-600" /> Quản Lý Khuyến Mãi Nền Tảng & Kiểm Duyệt Gian Hàng (M-ADM-05)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kiểm duyệt mã khuyến mãi do các Shop Manager gửi lên và phát hành voucher cấp sàn toàn hệ thống.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('PLATFORM')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
            activeTab === 'PLATFORM' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Voucher Sàn Đang Chạy</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{platformPromos.length}</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('PENDING_SHOP')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
            activeTab === 'PENDING_SHOP' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Mã Shop Chờ Kiểm Duyệt</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingShopPromos.length}</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
            activeTab === 'ALL' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Mã Khuyến Mãi Shop</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{allShopPromos.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PENDING_SHOP')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'PENDING_SHOP'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          Duyệt Khuyến Mãi Shop
          {pendingShopPromos.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
              {pendingShopPromos.length} chờ duyệt
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('PLATFORM')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'PLATFORM'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          Khuyến Mãi Nền Tảng ({platformPromos.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          Tất Cả Khuyến Mãi Hệ Thống ({promotions.length})
        </button>
      </div>

      {/* TAB 1: PENDING SHOP PROMOTIONS APPROVAL */}
      {activeTab === 'PENDING_SHOP' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Danh sách các mã giảm giá do <b>Shop Manager</b> gửi lên. Ban quản trị cần kiểm tra tính hợp lệ và điều kiện chống lạm dụng trước khi phê duyệt.
            </p>
            <button
              onClick={loadData}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
            >
              Làm mới danh sách
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Đang tải danh sách chờ duyệt...</div>
          ) : pendingShopPromos.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Tất cả khuyến mãi đã được kiểm duyệt xong!</p>
              <p className="text-xs text-slate-400">
                Hiện tại không có gian hàng nào đang chờ ban quản trị phê duyệt mã giảm giá.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingShopPromos.map((promo) => {
                const shop = getShopInfo(promo.shop_id);
                const shopName = shop?.shop_name || promo.shop_name || `Gian Hàng #${promo.shop_id || '—'}`;
                const ownerName = shop?.owner_name || 'Chủ gian hàng';
                const shopPhone = shop?.phone || 'Chưa cập nhật';
                const shopLocation = shop?.location_detail
                  ? `${shop.location_detail} • ${shop.area_name || 'Vinhomes Grand Park'}`
                  : promo.area_name || 'Vinhomes Grand Park Q9';
                const shopLogo = shop?.logo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';

                return (
                  <div
                    key={promo.id}
                    className="bg-white rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Shop Header Bar (Hiển thị rõ shop nào) */}
                      <div className="p-4 bg-amber-50/70 border-b border-amber-100 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={shopLogo}
                            alt={shopName}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-200 shadow-2xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm">{shopName}</h3>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                                Shop #{promo.shop_id || 1}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <User className="w-3 h-3 text-slate-400" />
                                {ownerName}
                              </span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {shopPhone}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {shopLocation}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0">
                          Chờ duyệt
                        </span>
                      </div>

                      {/* Promotion Details */}
                      <div className="p-4 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs tracking-wider">
                              {promo.code}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {promo.promo_type === 'PERCENT' ? 'Giảm %' : 'Giảm tiền mặt'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Gửi lúc: {new Date(promo.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        <div>
                          <p className="text-base font-bold text-slate-800">
                            {promo.promo_type === 'PERCENT'
                              ? `Giảm ${promo.discount_value}% (Tối đa ${(promo.max_discount_amount || 0).toLocaleString()} ₫)`
                              : `Giảm ${promo.discount_value.toLocaleString()} ₫`}
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Áp dụng cho đơn hàng tối thiểu: <b className="text-slate-700">{promo.min_order_value.toLocaleString()} ₫</b>
                          </p>
                        </div>

                        {/* Anti-Abuse Criteria Box */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-[11px]">
                          <p className="font-bold text-slate-700 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Điều kiện bảo vệ ngân sách & chống lạm dụng của Shop:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-slate-600">
                            <div className="bg-white p-2 rounded border border-slate-200/80">
                              <span className="text-slate-400 block text-[10px]">Hạn mức phát hành (Quota):</span>
                              <b className="text-slate-800 text-xs">{promo.total_limit || 20} mã</b>
                              <span className="text-[10px] text-emerald-600 block mt-0.5">Tự khóa khi đủ lượt</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-200/80">
                              <span className="text-slate-400 block text-[10px]">Giới hạn mỗi khách:</span>
                              <b className="text-slate-800 text-xs">{promo.per_user_limit || 1} lượt / khách</b>
                              <span className="text-[10px] text-emerald-600 block mt-0.5">Chống spam nick</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Đối tượng: <b>{promo.applicable_to === 'ALL' ? 'Tất cả khách hàng' : promo.applicable_to}</b></span>
                            <span>Hạn kết thúc: <b>{new Date(promo.valid_until).toLocaleDateString('vi-VN')}</b></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleApproveShopPromo(promo, true)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Phê Duyệt
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(promo)}
                        className="py-2.5 px-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs hover:bg-amber-100 cursor-pointer flex items-center justify-center gap-1 transition-colors"
                        title="Chỉnh sửa thông số khuyến mãi này trước khi duyệt"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        Chỉnh Sửa
                      </button>
                      <button
                        onClick={() => setRejectTarget(promo)}
                        className="py-2.5 px-3 bg-white text-rose-600 border border-rose-200 rounded-lg font-bold text-xs hover:bg-rose-50 cursor-pointer flex items-center justify-center gap-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Từ Chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLATFORM PROMOTIONS */}
      {activeTab === 'PLATFORM' && (
        <div className="space-y-6">
          <FilterBar
            onRefresh={loadData}
            primaryAction={{
              label: '+ Tạo Khuyến Mãi Nền Tảng',
              icon: <Plus className="w-4 h-4" />,
              onClick: handleOpenCreateModal,
            }}
          />

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Đang tải khuyến mãi sàn...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformPromos.map((promo) => {
                const totalLimit = promo.total_limit || 500;
                const used = promo.used_count || 0;
                const pct = Math.min(100, Math.round((used / totalLimit) * 100));

                return (
                  <div
                    key={promo.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="p-4 bg-linear-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
                        <div>
                          <span className="font-mono text-base font-black tracking-wider text-amber-300">
                            {promo.code}
                          </span>
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-700/60 font-bold text-white uppercase">
                            Toàn Sàn
                          </span>
                        </div>
                        <button
                          onClick={() => handleTogglePromo(promo)}
                          className={`text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            promo.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {promo.is_active ? 'ĐANG CHẠY' : 'TẠM NGƯNG'}
                        </button>
                      </div>

                      <div className="p-4 space-y-3 text-xs">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {promo.promo_type === 'PERCENT'
                              ? `Giảm ${promo.discount_value}% (Tối đa ${(promo.max_discount_amount || 0).toLocaleString()} ₫)`
                              : promo.promo_type === 'FREE_DELIVERY'
                              ? 'Miễn phí giao hàng (Freeship)'
                              : `Giảm ${promo.discount_value.toLocaleString()} ₫`}
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Đơn tối thiểu: <b>{promo.min_order_value.toLocaleString()} ₫</b>
                          </p>
                        </div>

                        {/* Quota Progress */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-semibold">Lượt dùng thực tế:</span>
                            <span className="font-bold text-slate-800">
                              {used} / {totalLimit} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Giới hạn: {promo.per_user_limit} lượt/khách</span>
                            <span>Đối tượng: {promo.applicable_to}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Hạn dùng: {new Date(promo.valid_until).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditModal(promo)}
                        className="py-1.5 px-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold hover:bg-amber-100 cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        Chỉnh sửa
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Hạn mức: {totalLimit}
                        </span>
                        <button
                          onClick={() => handleTogglePromo(promo)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            promo.is_active
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {promo.is_active ? 'Tạm Ngưng' : 'Kích Hoạt'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL PROMOTIONS TABLE */}
      {activeTab === 'ALL' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-3 font-semibold text-slate-600">Mã Voucher</th>
                <th className="text-left p-3 font-semibold text-slate-600">Gian Hàng / Phạm Vi</th>
                <th className="text-right p-3 font-semibold text-slate-600">Mức Giảm</th>
                <th className="text-right p-3 font-semibold text-slate-600">Đơn Tối Thiểu</th>
                <th className="text-center p-3 font-semibold text-slate-600">Lượt Dùng / Quota</th>
                <th className="text-center p-3 font-semibold text-slate-600">Trạng Thái</th>
                <th className="text-center p-3 font-semibold text-slate-600">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const shop = getShopInfo(p.shop_id);
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-600">{p.code}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">
                        {p.scope === 'PLATFORM'
                          ? 'Toàn Sàn (Platform)'
                          : shop?.shop_name || p.shop_name || 'Shop Manager'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700">
                      {p.promo_type === 'PERCENT'
                        ? `${p.discount_value}%`
                        : `${p.discount_value.toLocaleString()} ₫`}
                    </td>
                    <td className="p-3 text-right text-slate-600">{p.min_order_value.toLocaleString()} ₫</td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-800">{p.used_count || 0}</span> / {p.total_limit || '∞'}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.approval_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.approval_status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.approval_status === 'APPROVED'
                          ? 'Đã duyệt'
                          : p.approval_status === 'PENDING'
                          ? 'Chờ duyệt'
                          : 'Từ chối'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                          title="Chỉnh sửa thông số khuyến mãi"
                        >
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          Sửa
                        </button>
                        {p.approval_status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setActiveTab('PENDING_SHOP');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Duyệt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTogglePromo(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                          >
                            {p.is_active ? 'Tắt' : 'Bật'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add & Edit Promotion */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? `Chỉnh Sửa Khuyến Mãi: ${editingPromo.code}` : 'Tạo Khuyến Mãi Cấp Nền Tảng (M-ADM-05)'}
        subtitle={
          editingPromo
            ? `Cập nhật thông số ngân sách, hạn mức phát hành (quota) và thời hạn áp dụng (${editingPromo.scope === 'PLATFORM' ? 'Toàn Sàn' : 'Gian Hàng'})`
            : 'Voucher áp dụng toàn bộ người dùng và hệ thống cửa hàng trên sàn'
        }
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã khuyến mãi (Code) *:</label>
              <input
                type="text"
                value={promoForm.code || ''}
                onChange={(e) =>
                  setPromoForm((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase().replace(/\s/g, ''),
                  }))
                }
                placeholder="VD: SIEUTIEC50K, FREESHIP2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Loại khuyến mãi:</label>
              <select
                value={promoForm.promo_type}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, promo_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="FIXED_AMOUNT">Giảm số tiền cố định (₫)</option>
                <option value="PERCENT">Giảm phần trăm (%)</option>
                <option value="FREE_DELIVERY">Miễn phí giao hàng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mức giảm (₫ hoặc %):</label>
              <input
                type="number"
                value={promoForm.discount_value || 0}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-blue-700"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Đơn tối thiểu (₫):</label>
              <input
                type="number"
                step="10000"
                value={promoForm.min_order_value || 0}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, min_order_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tổng số lượng phát hành (Quota) *:
              </label>
              <input
                type="number"
                value={promoForm.total_limit || 500}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, total_limit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giới hạn/mỗi tài khoản (lượt):</label>
              <input
                type="number"
                value={promoForm.per_user_limit || 1}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, per_user_limit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Đối tượng áp dụng:</label>
              <select
                value={promoForm.applicable_to || 'ALL'}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, applicable_to: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="ALL">Tất cả khách hàng</option>
                <option value="RESIDENT">Chỉ cư dân đã xác thực</option>
                <option value="NEW_USER">Khách hàng mới</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Thời hạn kết thúc:</label>
              <input
                type="date"
                value={promoForm.valid_until || ''}
                onChange={(e) => setPromoForm((prev) => ({ ...prev, valid_until: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSavePromo}
              className="px-5 py-2 bg-[#0F2540] text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              {editingPromo ? 'Lưu Thay Đổi Khuyến Mãi' : 'Phát Hành Toàn Sàn'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Reason Modal (Custom dialog, no native prompt/alert) */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={`Từ Chối Mã: ${rejectTarget?.code || ''}`}
        subtitle={`Gian hàng: ${getShopInfo(rejectTarget?.shop_id)?.shop_name || rejectTarget?.shop_name || 'Shop'}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Chọn lý do mẫu hoặc tự nhập phản hồi cho Shop:
            </label>
            <div className="space-y-1.5 mb-2.5">
              {rejectionTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectReason(template)}
                  className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                    rejectReason === template
                      ? 'border-rose-400 bg-rose-50 text-rose-800 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  • {template}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do chi tiết từ chối..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:border-rose-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setRejectTarget(null)}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => rejectTarget && handleApproveShopPromo(rejectTarget, false, rejectReason)}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
            >
              Xác Nhận Từ Chối
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
