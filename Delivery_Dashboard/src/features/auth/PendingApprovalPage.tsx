import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService } from '@/api/client';
import { ShopProfile } from '@/api/mockData';
import { Clock, CheckCircle2, XCircle, RefreshCw, LogOut, Store, PhoneCall, ShieldAlert } from 'lucide-react';

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const { currentUser, logout, login } = useAuth();
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    const shops = await dbService.getShops();
    const userShops = shops.filter((s) => s.owner_id === currentUser.id);
    const currentShop = userShops.length > 0 ? userShops[0] : null;

    if (currentShop) {
      setShop(currentShop);
      // If approved in real-time, update user state & redirect
      if (currentShop.approval_status === 'APPROVED') {
        const users = await dbService.getUsers();
        const updatedUser = users.find((u) => u.id === currentUser.id);
        if (updatedUser) login(updatedUser);
        navigate('/shop/orders');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, [currentUser.id]);

  return (
    <div
      className="min-h-screen text-slate-800 flex items-center justify-center p-4 font-sans relative bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url('/bg2.jpg')` }}
    >
      {/* Dark Ambient Backdrop Filter */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" />

      <div className="w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-white/20 overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white text-center border-b border-slate-800">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mb-2">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">TRẠNG THÁI XÉT DUYỆT GIAN HÀNG</h1>
          <p className="text-xs text-slate-400">Hồ sơ đăng ký Shop Manager đang được xem xét</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 text-xs">
          {/* Status Alert Box */}
          {shop?.approval_status === 'REJECTED' ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Hồ sơ gian hàng đã bị từ chối phê duyệt</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                <strong>Lý do từ chối:</strong> {shop.rejection_reason || 'Thông tin giấy tờ không khớp hoặc thiếu ảnh gian hàng.'}
              </p>
            </div>
          ) : shop?.approval_status === 'APPROVED' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Chúc mừng! Gian hàng của bạn đã được phê duyệt!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Bạn đã có thể truy cập Portal Shop Manager để bắt đầu tạo thực đơn và tiếp nhận đơn hàng.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                <span>Hồ sơ đang chờ Admin kiểm duyệt (PENDING)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Hệ thống đang kiểm tra thông tin giấy phép kinh doanh, VSATTP và địa điểm gian hàng của bạn. Thời gian thẩm định trung bình từ 10 phút - 24 giờ làm việc.
              </p>
            </div>
          )}

          {/* Registered Details Summary */}
          {shop && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                {shop.shop_name}
              </h4>
              <p className="text-slate-600">{shop.shop_description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <div>Chủ gian hàng: <strong>{shop.owner_name}</strong></div>
                <div>SĐT: <strong>{shop.phone}</strong></div>
                <div>Khu vực: <strong>{shop.area_name}</strong></div>
                <div>Địa điểm: <strong>{shop.location_detail}</strong></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={checkStatus}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Đang kiểm tra...' : 'Kiểm tra lại trạng thái duyệt'}</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Footer Support */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
          <span>Cần duyệt gấp? Hotline Ban Quản Trị: <strong>1900 6868</strong></span>
        </div>
      </div>
    </div>
  );
}
