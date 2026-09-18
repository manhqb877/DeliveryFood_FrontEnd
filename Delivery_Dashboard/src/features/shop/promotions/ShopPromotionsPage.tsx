import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Promotion } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Plus, Ticket, Calendar, Users, DollarSign, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export function ShopPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    code: '',
    promo_type: 'FIXED_AMOUNT',
    scope: 'SHOP',
    discount_value: 15000,
    max_discount_amount: 30000,
    min_order_value: 60000,
    total_limit: 100,
    per_user_limit: 1,
    applicable_to: 'ALL',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbService.getPromotions('SHOP');
    setPromotions(list.filter((p) => p.shop_id === 1)); // current shop 1
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePromo = async () => {
    if (!newPromo.code) {
      alert('Vui lòng nhập mã khuyến mãi!');
      return;
    }
    await dbService.savePromotion({
      ...newPromo,
      scope: 'SHOP',
      shop_id: 1,
      shop_name: 'Cơm Nhà Chị Lan',
      approval_status: 'PENDING',
      is_active: true,
      used_count: 0,
    });
    alert('Đã gửi mã khuyến mãi lên Quản trị viên (Admin) phê duyệt!');
    setIsModalOpen(false);
    loadData();
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
      <div>
        <h1 className="text-xl font-bold text-slate-800">Khuyến Mãi Gian Hàng Của Tôi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tạo mã giảm giá riêng thu hút khách đặt đơn. Theo quy định sàn, khuyến mãi của Shop cần Admin duyệt trước khi hiển thị cho khách hàng.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng số chương trình</p>
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
            <p className="text-xs text-slate-500 font-medium">Tổng lượt đã dùng</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">{totalUsed}</p>
          </div>
        </div>
      </div>

      <FilterBar
        onRefresh={loadData}
        primaryAction={{
          label: '+ Tạo Khuyến Mãi Mới',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsModalOpen(true),
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

      {/* Card Grid view */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải khuyến mãi...</div>
      ) : filteredPromos.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Không tìm thấy mã khuyến mãi nào. Hãy bấm "Tạo Khuyến Mãi Mới".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map((promo) => {
            const isPercent = promo.promo_type === 'PERCENT';
            const isFreeShip = promo.promo_type === 'FREE_DELIVERY';
            const discountDesc = isFreeShip
              ? 'Freeship đơn hàng'
              : isPercent
              ? `Giảm ${promo.discount_value}% (Tối đa ${(promo.max_discount_amount || 0).toLocaleString()} ₫)`
              : `Giảm ${promo.discount_value.toLocaleString()} ₫`;

            return (
              <CardGridItem
                key={promo.id}
                image="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80"
                categoryOverlay={
                  promo.promo_type === 'FIXED_AMOUNT'
                    ? 'Giảm Tiền Mặt'
                    : promo.promo_type === 'PERCENT'
                    ? 'Giảm Theo %'
                    : 'Freeship'
                }
                statusText={promo.approval_status}
                subBadge={`Đã sử dụng: ${promo.used_count}/${promo.total_limit || '∞'} lượt`}
                title={`Mã: ${promo.code}`}
                subtitle={`${discountDesc} • Đơn tối thiểu ${promo.min_order_value.toLocaleString()} ₫`}
                metaItems={[
                  {
                    icon: <Users className="w-3.5 h-3.5 text-blue-500" />,
                    label:
                      promo.applicable_to === 'ALL'
                        ? 'Tất cả khách'
                        : promo.applicable_to === 'RESIDENT'
                        ? 'Chỉ cư dân tòa'
                        : promo.applicable_to === 'NEW_USER'
                        ? 'Khách hàng mới'
                        : promo.applicable_to,
                  },
                  {
                    icon: <Calendar className="w-3.5 h-3.5 text-slate-400" />,
                    label: `Hạn: ${new Date(promo.valid_until).toLocaleDateString('vi-VN')}`,
                  },
                ]}
              />
            );
          })}
        </div>
      )}

      {/* Modal form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Khuyến Mãi Gian Hàng Mới"
        subtitle="Mã sau khi tạo sẽ gửi về ban quản trị (Admin) kiểm duyệt trước khi phát hành"
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã khuyến mãi (Code) *:</label>
              <input
                type="text"
                value={newPromo.code || ''}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
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
              <label className="block font-medium text-slate-700 mb-1">Đơn hàng tối thiểu (₫) *:</label>
              <input
                type="number"
                step="5000"
                value={newPromo.min_order_value || 0}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, min_order_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {newPromo.promo_type === 'PERCENT' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giảm tối đa không vượt quá (₫):</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tổng số lượng phát hành (lượt):</label>
              <input
                type="number"
                value={newPromo.total_limit || 100}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, total_limit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giới hạn/mỗi khách hàng (lượt):</label>
              <input
                type="number"
                value={newPromo.per_user_limit || 1}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, per_user_limit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Đối tượng áp dụng:</label>
              <select
                value={newPromo.applicable_to || 'ALL'}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, applicable_to: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="ALL">Tất cả khách hàng (ALL)</option>
                <option value="RESIDENT">Cư dân tòa nhà (RESIDENT)</option>
                <option value="NEW_USER">Khách hàng mới (NEW_USER)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Thời hạn kết thúc:</label>
              <input
                type="date"
                value={newPromo.valid_until || ''}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, valid_until: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Mã khuyến mãi của gian hàng sau khi tạo sẽ có trạng thái <b>PENDING</b>. Quản trị viên sàn sẽ duyệt trong vòng 2-4 giờ làm việc trước khi mã có hiệu lực.
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
              onClick={handleCreatePromo}
              className="px-5 py-2 bg-[#0F2540] text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              Gửi Duyệt Khuyến Mãi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
