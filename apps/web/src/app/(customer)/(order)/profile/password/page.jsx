'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile/password');
    }
  }, [isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return null; // Return null until mounted and checked auth to avoid hydration mismatch
  }

  const name = user?.fullName || user?.phone || 'Khách hàng';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      window.alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      window.alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      window.alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      await logout();
      router.push('/login');
    } catch (err) {
      window.alert(err.message || 'Không thể đổi mật khẩu, vui lòng kiểm tra lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white min-h-[calc(100vh-140px)] pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 text-sm text-gray-500 w-full">
        <div className="mx-auto max-w-[1200px] flex items-center gap-1.5">
          <Link href="/" className="hover:text-red-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Trang khách hàng</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold text-gray-800 uppercase mb-4 tracking-wide">
              Trang tài khoản
            </h2>
            <div className="mb-6 text-gray-800 font-medium">
              Xin chào, <span className="text-yellow-600 font-bold">{name}</span> !
            </div>

            <nav className="flex flex-col space-y-4">
              <Link href="/profile" className="text-gray-600 hover:text-yellow-600 transition-colors">
                Thông tin tài khoản
              </Link>
              <Link href="/orders" className="text-gray-600 hover:text-yellow-600 transition-colors">
                Đơn hàng của bạn
              </Link>
              <Link href="/profile/password" className="text-yellow-600 font-medium hover:text-yellow-700 transition-colors">
                Đổi mật khẩu
              </Link>
              <Link href="/profile/addresses" className="text-gray-600 hover:text-yellow-600 transition-colors">
                Sổ địa chỉ
              </Link>
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 uppercase mb-4 tracking-wide">
              ĐỔI MẬT KHẨU
            </h2>
            <p className="text-gray-700 mb-8 font-medium">
              Để đảm bảo tính bảo mật vui lòng đặt mật khẩu với ít nhất 6 kí tự
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Mật khẩu cũ <span className="text-yellow-600">*</span>
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Mật khẩu mới <span className="text-yellow-600">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Xác nhận lại mật khẩu <span className="text-yellow-600">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow-400 text-black px-6 py-2.5 rounded font-bold hover:bg-yellow-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? 'Đang đổi...' : 'Đặt lại mật khẩu'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
