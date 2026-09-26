import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { ShipperProfile } from '@/api/mockData';
import { User, Phone, Star, Bike, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function ShopShippersPage() {
  const [shippers, setShippers] = useState<ShipperProfile[]>([]);
  const [selectedShipper, setSelectedShipper] = useState<ShipperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shopId, setShopId] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const myShop = await dbService.getMyShop();
      if (myShop) setShopId(myShop.id);

      // Lấy tất cả shipper trong hệ thống (hoặc thuộc khu vực của quán)
      const allShippers = await dbService.getShippers();
      setShippers(allShippers);
      if (allShippers.length > 0) {
        setSelectedShipper(allShippers[0]);
      }
      setLoading(false);
    } catch (e: any) {
      console.error('Failed to fetch data', e);
      setErrorMsg(e.message || 'Lỗi khi tải dữ liệu.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><span className="loading text-blue-600">Đang tải danh sách shipper...</span></div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Sidebar List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800 text-sm">Danh Sách Shipper ({shippers.length})</h2>
          <p className="text-xs text-slate-500 mt-1">Các đối tác giao hàng trong hệ thống</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {errorMsg ? (
            <div className="text-center text-sm text-red-500 py-10 px-4">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              {errorMsg}
            </div>
          ) : shippers.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-10 px-4">
              Chưa có dữ liệu shipper.
            </div>
          ) : (
            shippers.map(shipper => (
              <div 
                key={shipper.id} 
                onClick={() => setSelectedShipper(shipper)}
                className={`p-3 border rounded-xl cursor-pointer transition-all ${
                  selectedShipper?.id === shipper.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/50' 
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800">{shipper.full_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{shipper.phone}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                        <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" /> {shipper.avg_rating}
                      </span>
                      <span className="text-[10px] text-slate-500">{shipper.total_deliveries} đơn hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Shipper Details */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {selectedShipper ? (
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Thông tin chi tiết Shipper</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1: Thông tin cá nhân */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedShipper.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedShipper.approval_status === 'APPROVED' ? (
                        <Badge variant="green" className="text-[10px] py-0">Đã Duyệt</Badge>
                      ) : (
                        <Badge variant="yellow" className="text-[10px] py-0">Đang Chờ</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Số điện thoại</div>
                      <div className="font-semibold text-slate-800">{selectedShipper.phone}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">CMND / CCCD</div>
                      <div className="font-semibold text-slate-800">{selectedShipper.id_card_number}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Đánh giá trung bình</div>
                      <div className="font-semibold text-slate-800">{selectedShipper.avg_rating} / 5.0</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Tổng đơn giao thành công</div>
                      <div className="font-semibold text-slate-800">{selectedShipper.total_deliveries} đơn</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Phương tiện */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Bike className="w-5 h-5 text-blue-600" />
                  Thông tin phương tiện
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Loại phương tiện</div>
                    <div className="font-semibold text-slate-800 bg-slate-100 px-3 py-2 rounded-lg inline-block">
                      {selectedShipper.vehicle_type === 'MOTORBIKE' ? 'Xe máy' : 
                       selectedShipper.vehicle_type === 'EBIKE' ? 'Xe đạp điện' : 
                       selectedShipper.vehicle_type === 'BICYCLE' ? 'Xe đạp' : 'Đi bộ'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Biển số xe</div>
                    <div className="font-mono font-bold text-lg text-slate-800 border-2 border-slate-300 rounded-lg px-4 py-2 inline-block text-center uppercase tracking-widest bg-white shadow-sm">
                      {selectedShipper.vehicle_plate}
                    </div>
                  </div>

                  {selectedShipper.vehicle_photo_url && (
                    <div className="mt-4">
                      <div className="text-xs text-slate-500 mb-2">Ảnh phương tiện</div>
                      <img 
                        src={selectedShipper.vehicle_photo_url} 
                        alt="Vehicle" 
                        className="w-full h-40 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                  )}

                  {/* Thống kê đơn hàng */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Bike className="w-4 h-4 text-slate-400" />
                      Hiệu suất giao hàng
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Giao thành công</span>
                        <span className="font-semibold text-emerald-600">{selectedShipper.total_deliveries || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200">
                        <span className="text-slate-500">Tỷ lệ hoàn thành</span>
                        <span className="font-bold text-blue-600">
                          {selectedShipper.total_deliveries ? 100 : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COD Remittances */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Quản lý đối soát thu hộ (COD)
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <ShipperRemittancesList shopId={shopId} shipperId={selectedShipper.user_id} />
              </div>
            </div>

            {/* Lịch sử đơn hàng */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Lịch sử đơn hàng giao cho quán
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                <ShipperDeliveredOrdersList shopId={shopId} shipperId={selectedShipper.user_id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <p>Chọn một shipper từ danh sách để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShipperRemittancesList({ shopId, shipperId }: { shopId: number, shipperId: number }) {
  const [remittances, setRemittances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dbService.getShopRemittances(shopId).then(data => {
      // Filter for the selected shipper
      const filtered = data.filter((r: any) => r.shipperId === shipperId);
      setRemittances(filtered);
      setLoading(false);
    });
  }, [shopId, shipperId]);

  if (loading) return <div className="p-4 text-center text-slate-500">Đang tải dữ liệu...</div>;
  if (remittances.length === 0) return <div className="p-4 text-center text-slate-500">Shipper này chưa có khoản nợ COD nào.</div>;

  return (
    <table className="w-full text-left text-sm text-slate-600">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="p-4 font-semibold text-slate-700">Mã đơn</th>
          <th className="p-4 font-semibold text-slate-700">Số tiền (COD)</th>
          <th className="p-4 font-semibold text-slate-700">Trạng thái</th>
          <th className="p-4 font-semibold text-slate-700">Ngày tạo</th>
          <th className="p-4 font-semibold text-slate-700">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {remittances.map(r => (
          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
            <td className="p-4 font-medium text-slate-800">{r.orderCode}</td>
            <td className="p-4 font-bold text-amber-600">{r.amount.toLocaleString()}đ</td>
            <td className="p-4">
              {r.status === 'PENDING' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-semibold">
                  <AlertCircle className="w-3 h-3" /> Chưa nộp
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Đã nộp
                </span>
              )}
            </td>
            <td className="p-4 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
            <td className="p-4">
              {r.status === 'PENDING' && (
                <button 
                  onClick={async () => {
                    if(confirm('Xác nhận Shipper đã nộp tiền COD cho đơn này?')) {
                      await fetch(`http://localhost:8080/api/v1/remittances/${r.id}/complete`, { method: 'POST' });
                      // Reload
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                >
                  Xác nhận nộp
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ShipperDeliveredOrdersList({ shopId, shipperId }: { shopId: number, shipperId: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dbService.getOrders({ shop_id: shopId }),
      fetch(`http://localhost:8080/api/v1/tracking/shippers/${shipperId}/history`).then(res => res.json())
    ]).then(([shopOrders, shipperHistory]) => {
      if (!Array.isArray(shipperHistory)) shipperHistory = [];
      const historyOrderIds = new Set(shipperHistory.map((h: any) => h.orderId));
      
      const filtered = shopOrders.filter(o => historyOrderIds.has(o.id));
      setOrders(filtered);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [shopId, shipperId]);

  if (loading) return <div className="p-4 text-center text-slate-500">Đang tải dữ liệu...</div>;
  if (orders.length === 0) return <div className="p-4 text-center text-slate-500">Shipper này chưa giao đơn nào cho quán.</div>;

  return (
    <table className="w-full text-left text-sm text-slate-600">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="p-4 font-semibold text-slate-700">Mã đơn</th>
          <th className="p-4 font-semibold text-slate-700">Tổng tiền</th>
          <th className="p-4 font-semibold text-slate-700">Phương thức TT</th>
          <th className="p-4 font-semibold text-slate-700">Ngày tạo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {orders.map(o => (
          <tr key={o.id} className="hover:bg-slate-50 transition-colors">
            <td className="p-4 font-medium text-slate-800">{o.order_code}</td>
            <td className="p-4 font-bold text-blue-600">{o.total_amount.toLocaleString()}đ</td>
            <td className="p-4">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${o.payment_method === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {o.payment_method}
              </span>
            </td>
            <td className="p-4 text-slate-500">{new Date(o.placed_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
