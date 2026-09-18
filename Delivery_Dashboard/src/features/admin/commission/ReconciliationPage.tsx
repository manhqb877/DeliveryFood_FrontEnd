import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { CodRecord, Transaction } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { CheckSquare, Receipt, ShieldCheck } from 'lucide-react';

export function ReconciliationPage() {
  const [activeTab, setActiveTab] = useState<'COD' | 'TRANSACTIONS'>('COD');

  const [codRecords, setCodRecords] = useState<CodRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCodIds, setSelectedCodIds] = useState<number[]>([]);

  const loadData = async () => {
    setLoading(true);
    const cods = await dbService.getCodRecords();
    const txs = await dbService.getTransactions();
    setCodRecords(cods);
    setTransactions(txs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSelectCod = (id: number) => {
    setSelectedCodIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkReconcile = async () => {
    if (selectedCodIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dòng ghi nhận COD để đối soát!');
      return;
    }
    await dbService.reconcileCodBulk(selectedCodIds);
    alert(`Đã xác nhận đối soát hàng loạt cho ${selectedCodIds.length} dòng COD thành công!`);
    setSelectedCodIds([]);
    loadData();
  };

  const codColumns: Column<CodRecord>[] = [
    {
      header: 'Chọn',
      cell: (r) => (
        <input
          type="checkbox"
          checked={selectedCodIds.includes(r.id)}
          disabled={r.reconcile_status === 'CONFIRMED'}
          onChange={() => handleToggleSelectCod(r.id)}
          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    {
      header: 'Mã đơn hàng',
      cell: (r) => <span className="font-mono text-blue-600 font-bold">{r.order_code}</span>,
    },
    {
      header: 'Shipper thu tiền',
      cell: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.shipper_name}</p>
          <p className="text-[11px] text-slate-400">Shipper ID #{r.shipper_id}</p>
        </div>
      ),
    },
    {
      header: 'Gian hàng thụ hưởng',
      accessorKey: 'shop_name',
    },
    {
      header: 'Số tiền COD',
      cell: (r) => <span className="font-bold text-slate-800">{r.amount.toLocaleString()} ₫</span>,
    },
    {
      header: 'Trạng thái đối soát',
      cell: (r) => <Badge statusText={r.reconcile_status} />,
    },
    {
      header: 'Thời gian thu tiền',
      cell: (r) => <span className="text-xs text-slate-500">{new Date(r.collected_at).toLocaleString('vi-VN')}</span>,
    },
  ];

  const txColumns: Column<Transaction>[] = [
    {
      header: 'Mã GD Cổng / Đơn',
      cell: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{t.gateway_transaction_id}</span>
          <p className="font-mono text-[11px] text-blue-600">{t.order_code}</p>
        </div>
      ),
    },
    {
      header: 'Loại giao dịch',
      cell: (t) => (
        <span className="font-medium text-xs text-slate-700">{t.transaction_type}</span>
      ),
    },
    {
      header: 'Cổng thanh toán',
      cell: (t) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {t.payment_gateway}
        </span>
      ),
    },
    {
      header: 'Số tiền',
      cell: (t) => <span className="font-bold text-slate-800">{t.amount.toLocaleString()} ₫</span>,
    },
    {
      header: 'Trạng thái',
      cell: (t) => <Badge statusText={t.status} />,
    },
    {
      header: 'Thời gian khởi tạo',
      cell: (t) => <span className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString('vi-VN')}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Đối Soát COD & Lịch Sử Giao Dịch</h1>
        <p className="text-xs text-slate-500 mt-1">
          Xác nhận đối soát tiền mặt Shipper đã thu và tra cứu nhật ký giao dịch ngân lượng.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('COD')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'COD'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Đối Soát Tiền COD Thu Bởi Shipper ({codRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'TRANSACTIONS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Nhật Ký Giao Dịch Cổng Thanh Toán ({transactions.length})
        </button>
      </div>

      {activeTab === 'COD' ? (
        <div className="space-y-4">
          <FilterBar
            onRefresh={loadData}
            primaryAction={
              selectedCodIds.length > 0
                ? {
                    label: `Xác Nhận Đối Soát (${selectedCodIds.length})`,
                    icon: <ShieldCheck className="w-4 h-4" />,
                    onClick: handleBulkReconcile,
                  }
                : undefined
            }
          />
          <Table
            columns={codColumns}
            data={codRecords}
            loading={loading}
            keyExtractor={(r) => r.id}
            emptyMessage="Không có dữ liệu COD"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <FilterBar onRefresh={loadData} />
          <Table
            columns={txColumns}
            data={transactions}
            loading={loading}
            keyExtractor={(t) => t.id}
            emptyMessage="Không có lịch sử giao dịch"
          />
        </div>
      )}
    </div>
  );
}
