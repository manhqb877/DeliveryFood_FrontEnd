'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AccountSidebarLayout({ children, activeTab = 'profile' }) {
  const { user: contextUser } = useAuth();

  let name = 'Khách hàng';
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('fooddelivery_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        name = parsed.fullName || parsed.username || parsed.phone || 'Khách hàng';
      } catch (e) {}
    }
  } else if (contextUser) {
    name = contextUser.fullName || contextUser.username || contextUser.phone || 'Khách hàng';
  }

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
              Xin chào, <span className="text-red-600 font-bold">{name}</span> !
            </div>

            <nav className="flex flex-col space-y-4">
              <Link 
                href="/profile" 
                className={activeTab === 'profile' ? "text-red-600 font-medium hover:text-red-700 transition-colors" : "text-gray-600 hover:text-red-600 transition-colors"}
              >
                Thông tin tài khoản
              </Link>
              <Link 
                href="/orders" 
                className={activeTab === 'orders' ? "text-red-600 font-medium hover:text-red-700 transition-colors" : "text-gray-600 hover:text-red-600 transition-colors"}
              >
                Đơn hàng của bạn
              </Link>
              <Link 
                href="/profile/password" 
                className={activeTab === 'password' ? "text-red-600 font-medium hover:text-red-700 transition-colors" : "text-gray-600 hover:text-red-600 transition-colors"}
              >
                Đổi mật khẩu
              </Link>
              <Link 
                href="/profile/addresses" 
                className={activeTab === 'addresses' ? "text-red-600 font-medium hover:text-red-700 transition-colors" : "text-gray-600 hover:text-red-600 transition-colors"}
              >
                Sổ địa chỉ
              </Link>
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
