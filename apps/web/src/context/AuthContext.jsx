'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Khởi tạo state từ cache localStorage để UI không bị giật
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined' && authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.role === 'CUSTOMER') {
        return currentUser;
      }
      authService.logout();
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Cập nhật thông tin profile mới nhất từ backend (/auth/me)
  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const profile = await authService.getProfile();
        if (profile.role !== 'CUSTOMER') {
          throw new Error('Tài khoản không có quyền truy cập trang khách hàng');
        }
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      authService.logout();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Tự động đồng bộ profile mới nhất khi mở app
    if (authService.isAuthenticated()) {
      authService
        .getProfile()
        .then((profile) => {
          if (profile.role !== 'CUSTOMER') {
            throw new Error('Tài khoản không có quyền truy cập trang khách hàng');
          }
          if (isMounted) setUser(profile);
        })
        .catch(() => {
          if (isMounted) setUser(null);
          authService.logout();
        });
    }

    // Lắng nghe sự kiện nếu bị 401 không thể refresh token
    const handleUnauthorized = () => {
      setUser(null);
      authService.logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      if (data.user.role !== 'CUSTOMER') {
        await authService.logout();
        throw new Error('Tài khoản không có quyền truy cập trang khách hàng.');
      }
      setUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await authService.register(userData);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
