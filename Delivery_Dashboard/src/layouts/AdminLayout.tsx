import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import {
  BarChart3,
  Users,
  Store,
  Bike,
  ClipboardList,
  AlertTriangle,
  ShieldAlert,
  Percent,
  Receipt,
  MapPin,
  Tag,
  LogOut,
  Shield,
  ArrowRightLeft
} from 'lucide-react';

interface MenuSubItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  groupLabel: string;
  items: MenuSubItem[];
}

export function AdminLayout() {
  const { currentUser, setRole, logout } = useAuth();

  const menuGroups: MenuGroup[] = [
    {
      groupLabel: 'TỔNG QUAN',
      items: [
        { path: '/admin/reports', label: 'Dashboard tổng quan', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'TÀI KHOẢN & DUYỆT',
      items: [
        { path: '/admin/accounts', label: 'Tài khoản người dùng', icon: <Users className="w-4 h-4" /> },
        { path: '/admin/shop-approvals', label: 'Duyệt gian hàng', icon: <Store className="w-4 h-4" /> },
        { path: '/admin/shipper-approvals', label: 'Duyệt Shipper', icon: <Bike className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'VẬN HÀNH',
      items: [
        { path: '/admin/orders-monitor', label: 'Giám sát đơn hàng', icon: <ClipboardList className="w-4 h-4" /> },
        { path: '/admin/complaints', label: 'Khiếu nại khách hàng', icon: <AlertTriangle className="w-4 h-4" /> },
        { path: '/admin/fraud-alerts', label: 'Cảnh báo gian lận', icon: <ShieldAlert className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'TÀI CHÍNH',
      items: [
        { path: '/admin/commission', label: 'Cấu hình hoa hồng', icon: <Percent className="w-4 h-4" /> },
        { path: '/admin/reconciliation', label: 'Đối soát & Tra soát', icon: <Receipt className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'CẤU HÌNH HỆ THỐNG',
      items: [
        { path: '/admin/areas', label: 'Khu vực & Nội khu', icon: <MapPin className="w-4 h-4" /> },
        { path: '/admin/promotions', label: 'Khuyến mãi nền tảng', icon: <Tag className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      {/* Sidebar - Dark Navy (#0F2540) */}
      <aside className="w-64 bg-[#0F2540] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide">HYPERLOCAL</h1>
            <p className="text-[11px] text-slate-400 font-medium">Admin Portal System</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2">
                {group.groupLabel}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Role Switcher & User Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => setRole('SHOP_MANAGER')}
            className="w-full mb-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="Chuyển sang Shop Manager Portal để test"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Chuyển Portal Shop Manager</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-blue-400 font-medium">ADMIN HỆ THỐNG</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
