import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { CodRecord } from '@/api/mockData';
import { CheckSquare, Receipt, ShieldCheck, RefreshCw, DollarSign, Truck, Store, Check } from 'lucide-react';

export function ReconciliationPage() {
  const [codRecords, setCodRecords] = useState<CodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED'>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    const cods = await dbService.getCodRecords();
    setCodRecords(cods);
    setLoading(false);
    setSelectedIds([]);
  };

  useEffect(() => { load(); }, []);

  const filtered = codRecords.filter(r =>
    statusFilter === 'ALL' || 
    (statusFilter === 'PENDING' && r.reconcile_status !== 'CONFIRMED') ||
    (statusFilter === 'CONFIRMED' && r.reconcile_status === 'CONFIRMED')
  );

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendingIds = filtered.filter(r => r.reconcile_status !== 'CONFIRMED').map(r => r.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const handleBulkReconcile = async () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dòng COD để đối soát!');
      return;
    }
    setIsProcessing(true);
    await dbService.reconcileCodBulk(selectedIds);
    alert(`✅ Đã xác nhận đối soát ${selectedIds.length} dòng COD thành công!`);
    setSelectedIds([]);
    await load();
    setIsProcessing(false);
  };

  const totalAmount = codRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const confirmedAmount = codRecords.filter(r => r.reconcile_status === 'CONFIRMED').reduce((s, r) => s + (r.amount || 0), 0);
  const pendingAmount = totalAmount - confirmedAmount;
  const pendingCount = codRecords.filter(r => r.reconcile_status !== 'CONFIRMED').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Receipt className="w-7 h-7 text-blue-600" />
            Đối soát & Tra soát COD
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi và xác nhận tiền thu hộ (COD) của tài xế giao hàng</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Tổng tiền COD</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="text-xs text-slate-500 mt-1">{codRecords.length} giao dịch</div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Chờ đối soát</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="text-xs text-slate-500 mt-1">{pendingCount} giao dịch</div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Đã đối soát</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{confirmedAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="text-xs text-slate-500 mt-1">{codRecords.length - pendingCount} giao dịch</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'CONFIRMED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? '🕐 Chờ đối soát' : '✅ Đã xong'}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkReconcile}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Đang xử lý...' : `Xác nhận đối soát (${selectedIds.length})`}
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          Đang tải dữ liệu...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
          <p className="text-xl font-bold text-slate-700">Không có dữ liệu COD nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.filter(r => r.reconcile_status !== 'CONFIRMED').length}
                    onChange={toggleSelectAll}
                    className="rounded cursor-pointer"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-slate-600">Mã đơn hàng</th>
                <th className="p-4 text-left font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Shipper</span>
                </th>
                <th className="p-4 text-left font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" /> Quán</span>
                </th>
                <th className="p-4 text-right font-semibold text-slate-600">Số tiền COD</th>
                <th className="p-4 text-center font-semibold text-slate-600">Trạng thái</th>
                <th className="p-4 text-left font-semibold text-slate-600">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => {
                const r = item;
                const isConfirmed = r.status === 'CONFIRMED' || r.status === 'COMPLETED' || r.reconcile_status === 'CONFIRMED';
                return (
                  <tr key={r.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isConfirmed ? 'opacity-60' : ''}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        disabled={isConfirmed}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-blue-600 font-bold text-xs">{r.orderCode || r.order_code}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-800">{r.shipperName || r.shipper_name}</p>
                        <p className="text-xs text-slate-400">ID #{r.shipperId || r.shipper_id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-800">{r.shopName || r.shop_name}</p>
                        <p className="text-xs text-slate-400">ID #{r.shopId || r.shop_id}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-slate-800 text-base">
                        {(r.amount || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          <ShieldCheck className="w-3 h-3" /> Đã đối soát
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          🕐 Chờ xác nhận
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <div>{new Date(r.createdAt || r.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })}</div>
                      <div className="text-slate-400">{new Date(r.createdAt || r.created_at).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
