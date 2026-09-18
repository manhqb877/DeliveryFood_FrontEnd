import React, { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, initialUsers } from '@/api/mockData';

interface AuthContextType {
  currentUser: User;
  setRole: (role: User['role']) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Admin or Shop Manager
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // User 1 = Admin

  const setRole = (role: User['role']) => {
    const found = initialUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    } else {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
  };

  const logout = () => {
    alert('Đã đăng xuất tài khoản!');
  };

  return (
    <AuthContext.Provider value={{ currentUser, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthGuardProps {
  allowedRoles: Array<User['role']>;
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect logic
    if (currentUser.role === 'SHOP_MANAGER') {
      return <Navigate to="/shop/orders" replace state={{ from: location }} />;
    } else if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/reports" replace state={{ from: location }} />;
    } else {
      return <Navigate to="/admin/reports" replace state={{ from: location }} />;
    }
  }

  return <>{children}</>;
}
