import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, initialUsers } from '@/api/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  setRole: (role: User['role']) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const USER_KEY = 'hyperlocal_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading current user:', e);
    }
    return initialUsers[0]; // Default to Admin
  });

  const login = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error storing user:', e);
    }
  };

  const setRole = (role: User['role']) => {
    const found = initialUsers.find((u) => u.role === role);
    const updated = found || (currentUser ? { ...currentUser, role } : { ...initialUsers[0], role });
    setCurrentUser(updated);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, setRole, logout }}>
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

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if Shop Manager is still pending approval
  if (currentUser.role === 'SHOP_MANAGER' && currentUser.status === 'PENDING') {
    if (location.pathname !== '/pending-approval') {
      return <Navigate to="/pending-approval" replace state={{ from: location }} />;
    }
  }

  if (!allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'SHOP_MANAGER') {
      return <Navigate to="/shop/orders" replace state={{ from: location }} />;
    } else if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/reports" replace state={{ from: location }} />;
    } else {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  return <>{children}</>;
}
