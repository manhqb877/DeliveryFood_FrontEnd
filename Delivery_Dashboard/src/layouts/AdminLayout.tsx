import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService } from '@/api/client';
import { useToast } from '@/components/ui/Toast';
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
  Ticket,
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
  const navigate = useNavigate();
  const toast = useToast();
  const [pendingPromoCount, setPendingPromoCount] = useState<number>(0);

  const fetchPendingPromoCount = async () => {
    try {
      const promos = await dbService.getPromotions('SHOP');
      const pending = promos.filter((p) => p.approval_status === 'PENDING').length;
      setPendingPromoCount(pending);
    } catch (e) {}
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.00, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPendingPromoCount();

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('hyperlocal_promotions');
      bc.onmessage = (event) => {
        if (event.data?.type === 'PROMOTION_CREATED') {
          fetchPendingPromoCount();
          playChime();
          const shopName = event.data.shopName || 'Gian hàng';
          const promoCode = event.data.promo?.code || 'Mã mới';
          toast.warning(
            `🔔 Gian hàng "${shopName}" vừa gửi duyệt mã "${promoCode}". Bấm "Duyệt khuyến mãi Shop" để kiểm duyệt ngay!`,
            'Yêu Cầu Phê Duyệt Khuyến Mãi'
          );
        } else if (
          event.data?.type === 'PROMOTION_APPROVED' ||
          event.data?.type === 'PROMOTION_REJECTED' ||
          event.data?.type === 'PROMOTION_UPDATED' ||
          event.data?.type === 'PROMOTION_TOGGLED'
        ) {
          fetchPendingPromoCount();
        }
      };
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hyperlocal_promo_event') {
        fetchPendingPromoCount();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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
        { path: '/admin/promotion-approvals', label: 'Duyệt khuyến mãi Shop', icon: <Ticket className="w-4 h-4" /> },
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
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.path === '/admin/promotion-approvals' && pendingPromoCount > 0 && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
                        {pendingPromoCount}
                      </span>
                    )}
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
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.full_name || 'Quản trị viên'}</p>
                <p className="text-[10px] text-blue-400 font-medium">ADMIN HỆ THỐNG</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
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
