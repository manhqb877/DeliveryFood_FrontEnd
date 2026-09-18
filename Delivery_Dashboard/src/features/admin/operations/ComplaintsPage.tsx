import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Complaint } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, CheckCircle, Image as ImageIcon } from 'lucide-react';

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getComplaints();
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (newStatus: Complaint['status']) => {
    if (!selectedComplaint) return;
    if (!resolutionInput.trim()) {
      alert('Vui lòng nhập phương án xử lý khiếu nại!');
      return;
    }
    await dbService.resolveComplaint(selectedComplaint.id, resolutionInput, newStatus);
    alert('Cập nhật xử lý khiếu nại thành công!');
    setSelectedComplaint(null);
    setResolutionInput('');
    loadData();
  };

  const filteredComplaints = complaints.filter(
    (c) => statusFilter === 'ALL' || c.status === statusFilter
  );

  const columns: Column<Complaint>[] = [
    {
      header: 'Mã đơn / Người khiếu nại',
      cell: (c) => (
        <div>
          <span className="font-mono text-blue-600 font-bold">{c.order_code}</span>
          <p className="font-semibold text-slate-800 mt-0.5">{c.complainant_name}</p>
        </div>
      ),
    },
    {
      header: 'Nguyên nhân khiếu nại',
      cell: (c) => {
        const reasonLabels: Record<string, string> = {
          WRONG_ITEM: 'Giao sai món',
          MISSING_ITEM: 'Thiếu món',
          FOOD_QUALITY: 'Chất lượng kém',
          LATE_DELIVERY: 'Giao trễ SLA',
          RUDE_SHIPPER: 'Thái độ Shipper',
          PAYMENT_ISSUE: 'Lỗi thanh toán',
          OTHER: 'Khác',
        };
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            {reasonLabels[c.reason_type] || c.reason_type}
          </span>
        );
      },
    },
    {
      header: 'Nội dung mô tả',
      cell: (c) => <p className="text-xs text-slate-600 line-clamp-2 max-w-xs">{c.description}</p>,
    },
    {
      header: 'Trạng thái',
      cell: (c) => <Badge statusText={c.status} />,
    },
    {
      header: 'Thời gian gửi',
      cell: (c) => <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString('vi-VN')}</span>,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      cell: (c) => (
        <button
          onClick={() => {
            setSelectedComplaint(c);
            setResolutionInput(c.resolution || '');
          }}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          <span>Xử lý</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Quản Lý Khiếu Nại Đơn Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tiếp nhận, kiểm tra bằng chứng hình ảnh và ra quyết định bồi hoàn/giải quyết.
        </p>
      </div>

      <FilterBar
        onRefresh={loadData}
        dropdowns={[
          {
            id: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Mới gửi (OPEN)', value: 'OPEN' },
              { label: 'Đang xử lý (IN_REVIEW)', value: 'IN_REVIEW' },
              { label: 'Đã giải quyết (RESOLVED)', value: 'RESOLVED' },
              { label: 'Đóng (CLOSED)', value: 'CLOSED' },
            ],
          },
        ]}
      />

      <Table
        columns={columns}
        data={filteredComplaints}
        loading={loading}
        keyExtractor={(c) => c.id}
        emptyMessage="Không có khiếu nại nào"
      />

      {/* Complaint detail & resolution modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Xử Lý Khiếu Nại Đơn Hàng"
        subtitle={`Đơn hàng: ${selectedComplaint?.order_code}`}
        maxWidth="xl"
      >
        {selectedComplaint && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-sm">
                  Người khiếu nại: {selectedComplaint.complainant_name}
                </span>
                <Badge statusText={selectedComplaint.status} />
              </div>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 mt-2">
                "{selectedComplaint.description}"
              </p>
            </div>

            {/* Proof images */}
            {selectedComplaint.image_urls.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Ảnh bằng chứng khách gửi:
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {selectedComplaint.image_urls.map((url, idx) => (
                    <img key={idx} src={url} alt="Bằng chứng" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  ))}
                </div>
              </div>
            )}

            {/* Resolution form */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Nội dung / Kết quả giải quyết:</label>
              <textarea
                rows={4}
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                placeholder="Nhập phương án giải quyết (ví dụ: Đồng ý hoàn tiền 15,000đ cho suất thiếu vào ví khách)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleResolve('IN_REVIEW')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 cursor-pointer"
              >
                Đánh Giá (In Review)
              </button>
              <button
                onClick={() => handleResolve('RESOLVED')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 cursor-pointer"
              >
                Đã Giải Quyết (Resolved)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
