import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Order, OrderStatusHistory } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { History, Eye, Clock } from 'lucide-react';

export function OrdersMonitorPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Audit modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [historyLogs, setHistoryLogs] = useState<OrderStatusHistory[]>([]);

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAuditModal = async (order: Order) => {
    setSelectedOrder(order);
    const logs = await dbService.getOrderStatusHistory(order.id);
    setHistoryLogs(logs);
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.shop_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<Order>[] = [
    {
      header: 'Mã đơn / Thời gian',
      cell: (o) => (
        <div>
          <span className="font-mono text-blue-600 font-bold">{o.order_code}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {new Date(o.placed_at).toLocaleString('vi-VN')}
          </p>
        </div>
      ),
    },
    {
      header: 'Gian hàng',
      cell: (o) => <span className="font-semibold text-slate-800">{o.shop_name}</span>,
    },
    {
      header: 'Khách hàng & Địa chỉ',
      cell: (o) => (
        <div>
          <p className="font-semibold text-slate-800">{o.customer_name}</p>
          <p className="text-[11px] text-slate-500">
            {o.delivery_address.building} - {o.delivery_address.unit}
          </p>
        </div>
      ),
    },
    {
      header: 'Tổng tiền',
      cell: (o) => (
        <div>
          <p className="font-bold text-slate-800">{o.total_amount.toLocaleString()} ₫</p>
          <p className="text-[10px] text-slate-400 font-medium">{o.payment_method} ({o.payment_status})</p>
        </div>
      ),
    },
    {
      header: 'Trạng thái đơn (FSM)',
      cell: (o) => <Badge statusText={o.order_status} />,
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      cell: (o) => (
        <button
          onClick={() => handleOpenAuditModal(o)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Audit Log</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Giám Sát Đơn Hàng Toàn Hệ Thống</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi luồng trạng thái FSM đơn hàng realtime và lịch sử vết thay đổi audit trail.
        </p>
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã đơn, tên khách, gian hàng..."
        onRefresh={loadData}
        dropdowns={[
          {
            id: 'status',
            label: 'Trạng thái FSM',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Đã đặt (PLACED)', value: 'PLACED' },
              { label: 'Xác nhận (CONFIRMED)', value: 'CONFIRMED' },
              { label: 'Sẵn sàng (READY_FOR_PICKUP)', value: 'READY_FOR_PICKUP' },
              { label: 'Hoàn tất (COMPLETED)', value: 'COMPLETED' },
              { label: 'Đã hủy (CANCELLED)', value: 'CANCELLED' },
            ],
          },
        ]}
      />

      <Table
        columns={columns}
        data={filteredOrders}
        loading={loading}
        keyExtractor={(o) => o.id}
        emptyMessage="Không tìm thấy đơn hàng nào"
      />

      {/* Audit Log Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Lịch Sử Vết Đơn Hàng (Audit Trail)"
        subtitle={`Mã đơn: ${selectedOrder?.order_code}`}
        maxWidth="xl"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium">Gian hàng:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedOrder.shop_name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Khách hàng:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Dòng thời gian thay đổi trạng thái (order_status_history):
              </h5>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 my-2">
                {historyLogs.map((log, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-2xs" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge statusText={log.new_status} />
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">
                        Tác nhân: <span className="font-bold">{log.actor_type}</span> {log.note ? `— ${log.note}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 cursor-pointer"
              >
                Đóng Audit Log
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
