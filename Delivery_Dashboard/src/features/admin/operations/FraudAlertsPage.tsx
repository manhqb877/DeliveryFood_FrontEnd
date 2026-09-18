import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { FraudAlert } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShieldAlert, Code, CheckCircle, AlertTriangle } from 'lucide-react';

export function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getFraudAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewAction = async (newStatus: FraudAlert['status']) => {
    if (!selectedAlert) return;
    await dbService.reviewFraudAlert(selectedAlert.id, newStatus, reviewNoteInput);
    alert('Đã cập nhật trạng thái xử lý cảnh báo gian lận!');
    setSelectedAlert(null);
    setReviewNoteInput('');
    loadData();
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchStat = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSev && matchStat;
  });

  const columns: Column<FraudAlert>[] = [
    {
      header: 'Mã Cảnh Báo / Loại Gian Lận',
      cell: (a) => (
        <div>
          <span className="font-mono text-rose-600 font-bold">{a.id}</span>
          <p className="font-semibold text-slate-800 mt-0.5">{a.alert_type}</p>
        </div>
      ),
    },
    {
      header: 'Mức độ nghiêm trọng',
      cell: (a) => {
        const sevColors: Record<string, string> = {
          LOW: 'bg-slate-100 text-slate-700',
          MEDIUM: 'bg-amber-100 text-amber-800',
          HIGH: 'bg-orange-100 text-orange-800 font-bold',
          CRITICAL: 'bg-rose-600 text-white font-bold animate-pulse',
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] uppercase ${sevColors[a.severity]}`}>
            {a.severity}
          </span>
        );
      },
    },
    {
      header: 'Thiết bị & IP',
      cell: (a) => (
        <div>
          <p className="font-mono text-xs text-slate-700">IP: {a.ip_address}</p>
          <p className="text-[10px] text-slate-400 font-mono">Fingerprint: {a.device_fingerprint}</p>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (a) => <Badge statusText={a.status} />,
    },
    {
      header: 'Thời gian phát hiện',
      cell: (a) => <span className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString('vi-VN')}</span>,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      cell: (a) => (
        <button
          onClick={() => {
            setSelectedAlert(a);
            setReviewNoteInput(a.review_note || '');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Kiểm tra JSON</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Cảnh Báo Gian Lận (AI Fraud Detection)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Giám sát hành vi tạo đơn ảo, lạm dụng mã khuyến mãi và lừa đảo theo IP/Fingerprint.
        </p>
      </div>

      <FilterBar
        onRefresh={loadData}
        dropdowns={[
          {
            id: 'severity',
            label: 'Mức độ',
            value: severityFilter,
            onChange: setSeverityFilter,
            options: [
              { label: 'Tất cả mức độ', value: 'ALL' },
              { label: 'CRITICAL (Nghiêm trọng nhất)', value: 'CRITICAL' },
              { label: 'HIGH (Cao)', value: 'HIGH' },
              { label: 'MEDIUM (Trung bình)', value: 'MEDIUM' },
              { label: 'LOW (Thấp)', value: 'LOW' },
            ],
          },
          {
            id: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Mới phát hiện (OPEN)', value: 'OPEN' },
              { label: 'Đang điều tra (INVESTIGATING)', value: 'INVESTIGATING' },
              { label: 'Đã xác nhận gian lận (CONFIRMED)', value: 'CONFIRMED' },
              { label: 'Báo nhầm (FALSE_POSITIVE)', value: 'FALSE_POSITIVE' },
            ],
          },
        ]}
      />

      <Table
        columns={columns}
        data={filteredAlerts}
        loading={loading}
        keyExtractor={(a) => a.id}
        emptyMessage="Không có cảnh báo gian lận nào"
      />

      {/* Detail JSON & Review Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Chi Tiết Cảnh Báo Gian Lận"
        subtitle={`ID: ${selectedAlert?.id} — Loại: ${selectedAlert?.alert_type}`}
        maxWidth="xl"
      >
        {selectedAlert && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium">IP Address:</span>
                <p className="font-mono font-bold text-slate-800">{selectedAlert.ip_address}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Device Fingerprint:</span>
                <p className="font-mono font-bold text-slate-800 truncate">{selectedAlert.device_fingerprint}</p>
              </div>
            </div>

            {/* Clean Key-Value JSON renderer */}
            <div>
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-600" />
                Dữ liệu phát hiện chi tiết (Details JSON):
              </h5>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(selectedAlert.details, null, 2)}</pre>
              </div>
            </div>

            {/* Review Note */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Ghi chú điều tra / Xử lý:</label>
              <textarea
                rows={3}
                value={reviewNoteInput}
                onChange={(e) => setReviewNoteInput(e.target.value)}
                placeholder="Nhập ghi chú điều tra hoặc lý do khóa tài khoản..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReviewAction('FALSE_POSITIVE')}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 cursor-pointer"
              >
                Cảnh Báo Nhầm (False Positive)
              </button>
              <button
                onClick={() => handleReviewAction('CONFIRMED')}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 cursor-pointer"
              >
                Xác Nhận Gian Lận (Khóa TK)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
