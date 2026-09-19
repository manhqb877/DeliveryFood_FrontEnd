'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import AccountSidebarLayout from '@/components/layout/AccountSidebarLayout';

export default function ProfilePage() {
  const router = useRouter();
  const { user: contextUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        .catch(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, router]);

  const currentData = profile || contextUser;

  if (isLoading || !currentData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[500px]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const name = currentData.fullName || currentData.phone || 'Khách hàng';

  return (
    <AccountSidebarLayout activeTab="profile">
      <h2 className="text-xl font-bold text-gray-800 uppercase mb-6 tracking-wide">
        Thông tin tài khoản
      </h2>
      
      <div className="space-y-4 text-gray-800">
        <div className="flex">
          <span className="font-bold w-32">Họ tên:</span>
          <span>{name}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-32">Email:</span>
          <span>{currentData.email || 'Chưa cập nhật'}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-32">Điện thoại:</span>
          <span>{currentData.phone || 'Chưa cập nhật'}</span>
        </div>
      </div>
    </AccountSidebarLayout>
  );
}
