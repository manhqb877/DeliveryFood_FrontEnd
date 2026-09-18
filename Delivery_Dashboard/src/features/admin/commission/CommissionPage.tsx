import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { CommissionConfig } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Percent, Plus } from 'lucide-react';

export function CommissionPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED_PER_ORDER'>('PERCENT');
  const [newRate, setNewRate] = useState<number>(15);
  const [newTargetShopName, setNewTargetShopName] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getCommissionConfigs();
    setConfigs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateConfig = async () => {
    if (!newRate || newRate <= 0) {
      alert('Vui lòng nhập tỉ lệ / mức tiền hoa hồng hợp lệ!');
      return;
    }
    await dbService.saveCommissionConfig({
      shop_name: newTargetShopName || 'Gian hàng áp dụng',
      commission_type: newType,
      rate: newRate,
    });
    alert('Đã tạo cấu hình hoa hồng mới thành công!');
    setIsAddModalOpen(false);
    setNewTargetShopName('');
    setNewRate(15);
    loadData();
  };

  const columns: Column<CommissionConfig>[] = [
    {
      header: 'Đối tượng áp dụng',
      cell: (c) => (
        <div>
          <span className="font-bold text-slate-800">
            {c.shop_name || c.area_name || 'Mặc định toàn hệ thống'}
          </span>
          <p className="text-[11px] text-slate-400">
            {c.shop_id ? `Shop ID #${c.shop_id}` : c.area_id ? `Area ID #${c.area_id}` : 'Áp dụng chung'}
          </p>
        </div>
      ),
    },
    {
      header: 'Loại hoa hồng',
      cell: (c) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {c.commission_type === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền cố định/đơn'}
        </span>
      ),
    },
    {
      header: 'Tỉ lệ / Mức thu',
      cell: (c) => (
        <span className="font-bold text-slate-800 text-sm">
          {c.commission_type === 'PERCENT' ? `${c.rate}%` : `${c.rate.toLocaleString()} ₫/đơn`}
        </span>
      ),
    },
    {
      header: 'Hiệu lực từ ngày',
      cell: (c) => <span className="text-xs text-slate-500">{new Date(c.valid_from).toLocaleDateString('vi-VN')}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Cấu Hình Hoa Hồng Gian Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập tỉ lệ chiết khấu (%) hoặc mức phí cố định thu từ doanh thu gian hàng.
        </p>
      </div>

      <FilterBar
        onRefresh={loadData}
        primaryAction={{
          label: '+ Tạo Cấu Hình Mới',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsAddModalOpen(true),
        }}
      />

      <Table
        columns={columns}
        data={configs}
        loading={loading}
        keyExtractor={(c) => c.id}
        emptyMessage="Chưa có cấu hình hoa hồng nào"
      />

      {/* Add Config Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Cấu Hình Hoa Hồng Mới"
        subtitle="Áp dụng chiết khấu doanh thu gian hàng"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Tên gian hàng áp dụng (tùy chọn):</label>
            <input
              type="text"
              value={newTargetShopName}
              onChange={(e) => setNewTargetShopName(e.target.value)}
              placeholder="Để trống nếu áp dụng cho tất cả shop..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Loại hoa hồng:</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="PERCENT">Phần trăm (% doanh thu)</option>
                <option value="FIXED_PER_ORDER">Tiền cố định (₫ / đơn)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {newType === 'PERCENT' ? 'Tỉ lệ %:' : 'Số tiền (₫):'}
              </label>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
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
              onClick={handleCreateConfig}
              className="px-4 py-2 bg-[#0F2540] text-white rounded-lg font-medium hover:bg-slate-800 cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
