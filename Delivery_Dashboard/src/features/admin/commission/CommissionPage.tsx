import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { CommissionConfig, ShopProfile } from '@/api/mockData';
import { Modal } from '@/components/ui/Modal';
import { Percent, Plus, RefreshCw, Store, Edit, Trash2, DollarSign, Tag, Save, X } from 'lucide-react';

export function CommissionPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form for Creating / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED_PER_ORDER'>('PERCENT');
  const [newRate, setNewRate] = useState<number>(15);
  const [selectedShopId, setSelectedShopId] = useState<number | ''>('');
  const [newTargetShopName, setNewTargetShopName] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [data, shopList] = await Promise.all([
      dbService.getCommissionConfigs(),
      dbService.getShops(),
    ]);
    setConfigs(data);
    setShops(shopList);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingConfigId(null);
    setNewType('PERCENT');
    setNewRate(15);
    setSelectedShopId('');
    setNewTargetShopName('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: CommissionConfig) => {
    setModalMode('edit');
    setEditingConfigId(c.id);
    setNewType(c.commission_type);
    setNewRate(c.rate);
    setSelectedShopId(c.shop_id || '');
    setNewTargetShopName(c.shop_name || '');
    setIsModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!newRate || newRate <= 0) {
      alert('Vui lòng nhập tỉ lệ / mức tiền hoa hồng hợp lệ!');
      return;
    }

    const selectedShop = shops.find(s => s.id === Number(selectedShopId));
    
    if (modalMode === 'create') {
      await dbService.saveCommissionConfig({
        shop_id: selectedShop?.id,
        shop_name: selectedShop?.shop_name || newTargetShopName || 'Áp dụng chung',
        commission_type: newType,
        rate: newRate,
      });
      alert('Đã tạo cấu hình hoa hồng mới thành công!');
    } else if (modalMode === 'edit' && editingConfigId) {
      const configToUpdate = configs.find(c => c.id === editingConfigId);
      if (configToUpdate) {
        const success = await dbService.updateCommissionConfig(editingConfigId, {
          ...configToUpdate,
          shop_id: selectedShop?.id,
          shop_name: selectedShop?.shop_name || newTargetShopName || 'Áp dụng chung',
          commission_type: newType,
          rate: newRate
        });
        if (!success) {
          alert('Lỗi cập nhật cấu hình!');
          return;
        }
        alert('Đã cập nhật cấu hình thành công!');
      }
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình này không?')) {
      const success = await dbService.deleteCommissionConfig(id);
      if (success) {
        loadData();
      } else {
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  // Summary stats
  const percentConfigs = configs.filter(c => c.commission_type === 'PERCENT');
  const avgRate = percentConfigs.length > 0
    ? (percentConfigs.reduce((s, c) => s + c.rate, 0) / percentConfigs.length).toFixed(1)
    : '0';
  const percentCount = configs.filter(c => c.commission_type === 'PERCENT').length;
  const fixedCount = configs.filter(c => c.commission_type === 'FIXED_PER_ORDER').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Percent className="w-7 h-7 text-blue-600" />
            Cấu Hình Hoa Hồng
          </h1>
          <p className="text-slate-500 text-sm mt-1">Thiết lập tỉ lệ chiết khấu thu từ doanh thu gian hàng</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo cấu hình mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng cấu hình', value: configs.length, icon: Tag, color: 'bg-blue-50 text-blue-600' },
          { label: 'Hoa hồng TB', value: avgRate + '%', icon: Percent, color: 'bg-amber-50 text-amber-600' },
          { label: 'Theo tỉ lệ / Cố định', value: `${percentCount} / ${fixedCount}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${color.split(' ')[0]} rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Config Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          Đang tải...
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Percent className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-xl font-bold text-slate-700">Chưa có cấu hình nào</p>
          <p className="text-sm text-slate-400 mt-2">Nhấn "Tạo cấu hình mới" để bắt đầu</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" /> Đối tượng áp dụng</span>
                </th>
                <th className="p-4 text-left font-semibold text-slate-600">Loại hoa hồng</th>
                <th className="p-4 text-center font-semibold text-slate-600">Tỉ lệ / Mức thu</th>
                <th className="p-4 text-left font-semibold text-slate-600">Hiệu lực từ ngày</th>
                <th className="p-4 text-right font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(c => {
                // Match with real shop if available
                const shop = shops.find(s => s.id === c.shop_id);

                return (
                  <tr key={c.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800">
                          {shop?.shop_name || c.shop_name || c.area_name || 'Mặc định toàn hệ thống'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {shop ? `Quán #${shop.id}` : c.shop_id ? `Shop ID #${c.shop_id}` : c.area_id ? `Khu vực #${c.area_id}` : 'Áp dụng cho tất cả'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        c.commission_type === 'PERCENT' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {c.commission_type === 'PERCENT' ? (
                          <><Percent className="w-3 h-3" /> Phần trăm</>
                        ) : (
                          <><DollarSign className="w-3 h-3" /> Số tiền cố định</>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xl font-extrabold text-blue-600">
                        {c.commission_type === 'PERCENT' ? `${c.rate}%` : `${c.rate.toLocaleString('vi-VN')} ₫`}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {c.valid_from ? new Date(c.valid_from).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Config Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tạo Cấu Hình Hoa Hồng" : "Chỉnh Sửa Cấu Hình Hoa Hồng"} subtitle="Thiết lập mức chiết khấu cho gian hàng">
        <div className="space-y-4">
          {/* Shop Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn Gian hàng áp dụng</label>
            <select
              value={selectedShopId}
              onChange={e => {
                setSelectedShopId(e.target.value as any);
                const s = shops.find(sh => sh.id === Number(e.target.value));
                setNewTargetShopName(s?.shop_name || '');
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">🌐 Áp dụng cho tất cả gian hàng</option>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.shop_name} (ID #{s.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Loại hoa hồng</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENT">% Phần trăm doanh thu</option>
                <option value="FIXED_PER_ORDER">₫ Số tiền cố định / đơn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {newType === 'PERCENT' ? 'Tỉ lệ (%)' : 'Số tiền (₫/đơn)'}
              </label>
              <input
                type="number"
                min={1}
                value={newRate}
                onChange={e => setNewRate(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">Xem trước</p>
            <p className="text-sm text-slate-700">
              <span className="font-bold">{newTargetShopName || 'Tất cả gian hàng'}</span> sẽ bị thu{' '}
              <span className="text-blue-600 font-extrabold">
                {newType === 'PERCENT' ? `${newRate}%` : `${newRate.toLocaleString('vi-VN')} ₫/đơn`}
              </span>
              {' '}hoa hồng.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveConfig}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
