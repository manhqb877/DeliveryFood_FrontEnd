import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { ShopProfile } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { MapPin, Phone, UserCheck, Check, X, FileText } from 'lucide-react';

export function ShopApprovalsPage() {
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Modals
  const [selectedShop, setSelectedShop] = useState<ShopProfile | null>(null);
  const [rejectModalShop, setRejectModalShop] = useState<ShopProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hyperlocal_access_token');
      const res = await fetch(`http://localhost:8080/api/v1/auth/admin/shops${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        // Cần map response data từ API thành dạng ShopProfile
        const apiShops = result.data || [];
        const mappedShops: ShopProfile[] = apiShops.map((s: any) => ({
          id: s.id,
          owner_id: s.ownerId || 0,
          owner_name: s.ownerName || 'Chưa cập nhật',
          area_id: s.areaId || 1,
          area_name: s.areaName || 'Khu vực chung',
          shop_name: s.shopName,
          shop_description: s.shopDescription || '',
          location_detail: s.locationDetail || '',
          phone: s.phone || '',
          logo_url: s.logoUrl || 'https://via.placeholder.com/150',
          cover_image_url: s.coverImageUrl || 'https://via.placeholder.com/600x300',
          documents: s.documents ? s.documents.map((d: any) => d.url) : [],
          approval_status: s.approvalStatus,
          rejection_reason: s.rejectionReason,
          is_open: s.isOpen || false,
          is_accepting_orders: s.isAcceptingOrders || false,
          created_at: s.createdAt || new Date().toISOString()
        }));
        setShops(mappedShops);
      } else {
        setShops([]);
      }
    } catch (e) {
      console.error(e);
      setShops([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleApprove = async (shop: ShopProfile) => {
    if (confirm(`Bạn có chắc chắn muốn DUYỆT cho gian hàng "${shop.shop_name}" hoạt động?`)) {
      try {
        const token = localStorage.getItem('hyperlocal_access_token');
        await fetch(`http://localhost:8080/api/v1/auth/admin/shops/${shop.id}/approve`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ approved: true })
        });
        alert('Đã duyệt gian hàng thành công!');
        loadData();
      } catch (e) {
        alert('Lỗi khi duyệt gian hàng');
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalShop) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối gian hàng!');
      return;
    }
    try {
      const token = localStorage.getItem('hyperlocal_access_token');
      await fetch(`http://localhost:8080/api/v1/auth/admin/shops/${rejectModalShop.id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ approved: false, rejectionReason: rejectionReason.trim() })
      });
      alert(`Đã từ chối gian hàng "${rejectModalShop.shop_name}".`);
      setRejectModalShop(null);
      setRejectionReason('');
      loadData();
    } catch (e) {
      alert('Lỗi khi từ chối gian hàng');
    }
  };

  // Not filtering here because we fetch by status directly from API
  const filteredShops = shops;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Duyệt Đăng Ký Gian Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kiểm duyệt thông tin, giấy tờ pháp lý và phê duyệt gian hàng bán trên hệ thống.
        </p>
      </div>

      {/* Filter bar */}
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

      {/* Card Grid view */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải danh sách gian hàng...</div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Không có gian hàng nào thuộc trạng thái này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <CardGridItem
              key={shop.id}
              image={shop.cover_image_url || shop.logo_url}
              categoryOverlay={shop.area_name}
              statusText={shop.approval_status}
              subBadge={`Chủ quán: ${shop.owner_name}`}
              title={shop.shop_name}
              subtitle={shop.shop_description}
              metaItems={[
                { icon: <MapPin className="w-3.5 h-3.5" />, label: shop.location_detail },
                { icon: <Phone className="w-3.5 h-3.5" />, label: shop.phone },
              ]}
              detailAction={{
                label: 'Xem hồ sơ & giấy tờ →',
                onClick: () => setSelectedShop(shop),
              }}
              actions={
                shop.approval_status === 'PENDING'
                  ? [
                      {
                        icon: <Check className="w-4 h-4 text-emerald-600" />,
                        title: 'Duyệt gian hàng',
                        onClick: () => handleApprove(shop),
                      },
                      {
                        icon: <X className="w-4 h-4 text-rose-600" />,
                        title: 'Từ chối',
                        onClick: () => setRejectModalShop(shop),
                        danger: true,
                      },
                    ]
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Shop Detail & Documents Modal */}
      <Modal
        isOpen={!!selectedShop}
        onClose={() => setSelectedShop(null)}
        title="Hồ Sơ Đăng Ký Gian Hàng"
        subtitle={selectedShop?.shop_name}
        maxWidth="2xl"
      >
        {selectedShop && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedShop.logo_url}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800">{selectedShop.shop_name}</h4>
                <p className="text-slate-500">{selectedShop.shop_description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-slate-600">Chủ sở hữu: {selectedShop.owner_name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-medium text-slate-600">SĐT: {selectedShop.phone}</span>
                </div>
              </div>
            </div>

            {/* Document list */}
            <div>
              <h5 className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Giấy tờ đăng ký kinh doanh & VSATTP:
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {selectedShop.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc}
                    target="_blank"
                    rel="noreferrer"
                    className="block border border-slate-200 rounded-lg overflow-hidden bg-slate-100 hover:border-blue-400 transition-colors"
                  >
                    <img src={doc} alt={`Bản phôtô giấy tờ ${idx + 1}`} className="w-full h-32 object-cover" />
                    <p className="p-1.5 text-[10px] text-center text-slate-600 font-medium bg-white border-t border-slate-100">
                      Ảnh giấy tờ #{idx + 1}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {selectedShop.rejection_reason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                <span className="font-bold">Lý do từ chối trước đó:</span> {selectedShop.rejection_reason}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              {selectedShop.approval_status === 'PENDING' && (
                <button
                  onClick={() => {
                    const s = selectedShop;
                    setSelectedShop(null);
                    handleApprove(s);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 cursor-pointer"
                >
                  Phê Duyệt Ngay
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModalShop}
        onClose={() => setRejectModalShop(null)}
        title="Từ Chối Gian Hàng"
        subtitle={rejectModalShop?.shop_name}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Lý do từ chối (bắt buộc):</label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập chi tiết lý do từ chối (ví dụ: Thiếu giấy chứng nhận VSATTP...)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectModalShop(null)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleRejectConfirm}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 cursor-pointer"
            >
              Xác Nhận Từ Chối
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
