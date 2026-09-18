'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const router = useRouter();
  const { user: contextUser, isAuthenticated, isLoading: isAuthLoading, logout, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch lại thủ công khi bấm nút làm mới
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorMsg('');
    try {
      const data = await authService.getProfile();
      setProfile(data);
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể làm mới thông tin');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/profile');
        return;
      }

      authService
        .getProfile()
        .then((data) => {
          if (isMounted) {
            setProfile(data);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setErrorMsg(err.message || 'Không thể tải thông tin hồ sơ');
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'CUSTOMER':
        return { label: 'Khách hàng', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SHOP_MANAGER':
        return { label: 'Chủ quán (Shop Manager)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'SHIPPER':
        return { label: 'Tài xế (Shipper)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ADMIN':
        return { label: 'Quản trị viên (Admin)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: role || 'Thành viên', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const currentData = profile || contextUser;

  return (
    <div className="flex flex-col w-full bg-[#f8f9fa] min-h-[calc(100vh-140px)] pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 text-[13px] text-gray-500 w-full shadow-2xs">
        <div className="mx-auto max-w-[1200px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--color-primary-dark)]">Trang chủ</Link>
            <span>/</span>
            <Link href="/order" className="hover:text-[var(--color-primary-dark)]">Đặt món</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Hồ sơ của tôi</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API: /api/v1/auth/me</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500 font-medium">Đang tải hồ sơ của bạn từ máy chủ...</p>
          </div>
        ) : errorMsg && !currentData ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-red-100 shadow-sm max-w-[500px] mx-auto">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Không thể tải thông tin</h2>
            <p className="text-sm text-gray-500 mb-5">{errorMsg}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleRefresh()}
                className="px-5 py-2 rounded-full bg-[var(--color-primary)] text-black font-bold text-xs hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
              >
                Thử lại
              </button>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-50 transition-colors"
              >
                Đăng nhập lại
              </Link>
            </div>
          </div>
        ) : currentData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái: Card tóm tắt user */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center sticky top-24">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-amber-300 flex items-center justify-center text-3xl font-black text-black shadow-md uppercase">
                    {(currentData.fullName || currentData.phone || 'U')[0].toUpperCase()}
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs" title="Tài khoản hoạt động">
                    <CheckBadgeIcon className="w-4 h-4" />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                  {currentData.fullName || 'Chưa đặt tên'}
                </h2>
                <p className="text-xs font-mono text-gray-500 mb-3">{currentData.phone}</p>

                {/* Badge Role */}
                {(() => {
                  const r = getRoleLabel(currentData.role);
                  return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${r.color} mb-6`}>
                      {r.label}
                    </span>
                  );
                })()}

                {/* Quick Actions */}
                <div className="w-full flex flex-col gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href="/order"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>Đặt món ngay</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRefresh()}
                    disabled={isRefreshing}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-gray-200"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới hồ sơ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cột phải: Chi tiết thông tin hồ sơ */}
            <div className="md:col-span-2 space-y-6">
              {/* Header Box */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Dữ liệu thực tế được nạp từ endpoint <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] text-gray-700 font-mono">/api/v1/auth/me</code></p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {currentData.status === 'ACTIVE' ? 'Đang hoạt động' : currentData.status || 'Hoạt động'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <UserCircleIcon className="w-4 h-4 text-gray-400" />
                      <span>Họ và tên</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {currentData.fullName || 'Chưa cập nhật'}
                    </p>
                  </div>

                  {/* Số điện thoại */}
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span>Số điện thoại đăng nhập</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {currentData.phone}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span>Địa chỉ Email</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {currentData.email || 'Chưa liên kết email'}
                    </p>
                  </div>

                  {/* Quyền hạn / Role */}
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                      <span>Vai trò hệ thống</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {getRoleLabel(currentData.role).label}
                    </p>
                  </div>

                  {/* Mã định danh User ID */}
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span>Mã người dùng (User ID)</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      #{currentData.id || 'N/A'}
                    </p>
                  </div>

                  {/* Ngày tham gia */}
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                      <span>Thời gian tạo tài khoản</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(currentData.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin xác thực bổ sung */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Trạng thái bảo mật & Khu vực</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-800">Xác thực Token JWT & Redis Blacklist</p>
                        <p className="text-[11px] text-gray-500">Phiên đăng nhập được mã hóa an toàn qua Spring Security</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700 shrink-0">Bảo vệ</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-gray-500 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-800">Khu vực hoạt động (Area ID)</p>
                        <p className="text-[11px] text-gray-500">
                          {currentData.areaId ? `Mã khu vực: #${currentData.areaId}` : 'Mặc định toàn quốc / Chưa gán khu vực riêng'}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-600 font-medium">
                      {currentData.isAreaVerified ? 'Đã xác minh' : 'Chưa cần xác minh'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
