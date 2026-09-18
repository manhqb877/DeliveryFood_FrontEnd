import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { ShipperProfile } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Bike, Check, X, Eye, FileText } from 'lucide-react';

export function ShipperApprovalsPage() {
  const [shippers, setShippers] = useState<ShipperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const [selectedShipper, setSelectedShipper] = useState<ShipperProfile | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getShippers();
    setShippers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (s: ShipperProfile, approved: boolean) => {
    const actionName = approved ? 'DUYỆT' : 'TỪ CHỐI';
    if (confirm(`Bạn có chắc chắn muốn ${actionName} cho tài xế "${s.full_name}"?`)) {
      await dbService.approveShipper(s.id, approved);
      alert(`Đã ${actionName.toLowerCase()} tài xế thành công!`);
      loadData();
    }
  };

  const filteredShippers = shippers.filter((s) => statusFilter === 'ALL' || s.approval_status === statusFilter);

  const columns: Column<ShipperProfile>[] = [
    {
      header: 'Tài xế / SĐT',
      cell: (s) => (
        <div>
          <p className="font-semibold text-slate-800">{s.full_name}</p>
          <p className="text-xs text-slate-500 font-mono">{s.phone}</p>
        </div>
      ),
    },
    {
      header: 'CMND / CCCD',
      accessorKey: 'id_card_number',
      cell: (s) => <span className="font-mono text-xs text-slate-700">{s.id_card_number}</span>,
    },
    {
      header: 'Phương tiện',
      cell: (s) => {
        const vehicleLabels: Record<string, string> = {
          MOTORBIKE: 'Xe máy',
          EBIKE: 'Xe đạp điện',
          BICYCLE: 'Xe đạp',
          WALKING: 'Đi bộ',
        };
        return (
          <div>
            <span className="font-medium text-slate-800 text-xs">
              {vehicleLabels[s.vehicle_type] || s.vehicle_type}
            </span>
            {s.vehicle_plate && <p className="text-[11px] text-slate-400 font-mono">{s.vehicle_plate}</p>}
          </div>
        );
      },
    },
    {
      header: 'Khu vực đăng ký',
      cell: (s) => (
        <span className="text-xs text-slate-600 font-medium">
          {s.registered_area_ids.map((id) => `Khu #${id}`).join(', ')}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (s) => <Badge statusText={s.approval_status} />,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedShipper(s)}
            title="Xem chi tiết ảnh phương tiện"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {s.approval_status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(s, true)}
                title="Duyệt Shipper"
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleApprove(s, false)}
                title="Từ chối"
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Duyệt Đăng Ký Shipper Nội Khu</h1>
        <p className="text-xs text-slate-500 mt-1">
          Xác minh thông tin bằng lái, phương tiện và duyệt tài xế giao nhận.
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
              { label: 'Chờ duyệt (PENDING)', value: 'PENDING' },
              { label: 'Đã duyệt (APPROVED)', value: 'APPROVED' },
              { label: 'Bị từ chối (REJECTED)', value: 'REJECTED' },
              { label: 'Tất cả', value: 'ALL' },
            ],
          },
        ]}
      />

      <Table
        columns={columns}
        data={filteredShippers}
        loading={loading}
        keyExtractor={(s) => s.id}
        emptyMessage="Không có tài xế thỏa điều kiện"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedShipper}
        onClose={() => setSelectedShipper(null)}
        title="Chi Tiết Đăng Ký Shipper"
        subtitle={selectedShipper?.full_name}
      >
        {selectedShipper && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-400 font-medium">Họ và tên tài xế:</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedShipper.full_name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Số điện thoại liên hệ:</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedShipper.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Số CMND / CCCD:</p>
                <p className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedShipper.id_card_number}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Biển số phương tiện:</p>
                <p className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedShipper.vehicle_plate || 'Không có'}</p>
              </div>
            </div>

            {selectedShipper.vehicle_photo_url && (
              <div>
                <h5 className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-blue-600" />
                  Ảnh chụp phương tiện di chuyển:
                </h5>
                <img
                  src={selectedShipper.vehicle_photo_url}
                  alt="Ảnh phương tiện"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedShipper(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
