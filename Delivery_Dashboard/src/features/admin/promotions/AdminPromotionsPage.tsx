import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Promotion } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tag, Plus, Check, X, Calendar, Ticket } from 'lucide-react';

export function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'PLATFORM' | 'PENDING_SHOP'>('PLATFORM');

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    code: '',
    promo_type: 'FIXED_AMOUNT',
    scope: 'PLATFORM',
    discount_value: 15000,
    min_order_value: 80000,
    total_limit: 500,
    per_user_limit: 2,
    applicable_to: 'ALL',
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbService.getPromotions();
    setPromotions(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveShopPromo = async (id: number, approved: boolean) => {
    await dbService.approvePromotion(id, approved);
    alert(`Đã ${approved ? 'duyệt' : 'từ chối'} mã khuyến mãi thành công!`);
    loadData();
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code) {
      alert('Vui lòng nhập mã khuyến mãi!');
      return;
    }
    await dbService.savePromotion(newPromo);
    alert('Đã tạo khuyến mãi nền tảng mới thành công!');
    setIsAddModalOpen(false);
    loadData();
  };

  const platformPromos = promotions.filter((p) => p.scope === 'PLATFORM');
  const pendingShopPromos = promotions.filter(
    (p) => p.scope === 'SHOP' && p.approval_status === 'PENDING'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Quản Lý Khuyến Mãi Nền Tảng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tạo voucher toàn hệ thống và phê duyệt các mã khuyến mãi do gian hàng đăng ký.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PLATFORM')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'PLATFORM'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Khuyến Mãi Nền Tảng ({platformPromos.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING_SHOP')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'PENDING_SHOP'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Duyệt Mã Do Shop Tạo ({pendingShopPromos.length})
        </button>
      </div>

      {activeTab === 'PLATFORM' ? (
        <div className="space-y-6">
          <FilterBar
            onRefresh={loadData}
            primaryAction={{
              label: '+ Tạo Khuyến Mãi Nền Tảng',
              icon: <Plus className="w-4 h-4" />,
              onClick: () => setIsAddModalOpen(true),
            }}
          />

          {/* Card Grid view */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformPromos.map((promo) => (
              <CardGridItem
                key={promo.id}
                image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80"
                categoryOverlay={promo.promo_type}
                statusText={promo.approval_status}
                subBadge={`Đã dùng: ${promo.used_count}/${promo.total_limit || '∞'}`}
                title={`Mã: ${promo.code}`}
                subtitle={`Giảm ${promo.discount_value.toLocaleString()} ₫ cho đơn từ ${promo.min_order_value.toLocaleString()} ₫`}
                metaItems={[
                  { icon: <Ticket className="w-3.5 h-3.5" />, label: `Áp dụng: ${promo.applicable_to}` },
                  { icon: <Calendar className="w-3.5 h-3.5" />, label: `Đến: ${new Date(promo.valid_until).toLocaleDateString('vi-VN')}` },
                ]}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Pending Shop Promos */
        <div className="space-y-6">
          <FilterBar onRefresh={loadData} />
          {pendingShopPromos.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              Không có mã khuyến mãi gian hàng nào đang chờ duyệt.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingShopPromos.map((promo) => (
                <CardGridItem
                  key={promo.id}
                  image="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80"
                  categoryOverlay={`Shop: ${promo.shop_name}`}
                  statusText={promo.approval_status}
                  title={`Mã: ${promo.code}`}
                  subtitle={`Giảm ${promo.discount_value.toLocaleString()} ₫ cho đơn từ ${promo.min_order_value.toLocaleString()} ₫`}
                  actions={[
                    {
                      icon: <Check className="w-4 h-4 text-emerald-600" />,
                      title: 'Duyệt mã',
                      onClick: () => handleApproveShopPromo(promo.id, true),
                    },
                    {
                      icon: <X className="w-4 h-4 text-rose-600" />,
                      title: 'Từ chối mã',
                      onClick: () => handleApproveShopPromo(promo.id, false),
                      danger: true,
                    },
                  ]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Platform Promo Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Khuyến Mãi Nền Tảng Mới"
        subtitle="Voucher áp dụng toàn hệ thống"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã khuyến mãi (code):</label>
              <input
                type="text"
                value={newPromo.code}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="VD: CHUNGCU20K"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Loại khuyến mãi:</label>
              <select
                value={newPromo.promo_type}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, promo_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="FIXED_AMOUNT">Giảm tiền cố định (₫)</option>
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
                value={newPromo.discount_value}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Đơn tối thiểu (₫):</label>
              <input
                type="number"
                value={newPromo.min_order_value}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, min_order_value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tổng số lượt dùng:</label>
              <input
                type="number"
                value={newPromo.total_limit}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, total_limit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Đối tượng áp dụng:</label>
              <select
                value={newPromo.applicable_to}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, applicable_to: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="ALL">Tất cả khách hàng</option>
                <option value="RESIDENT">Chỉ cư dân đã xác thực</option>
                <option value="NEW_USER">Khách hàng mới</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleCreatePromo}
              className="px-4 py-2 bg-[#0F2540] text-white rounded-lg font-medium hover:bg-slate-800 cursor-pointer"
            >
              Tạo Khuyến Mãi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
