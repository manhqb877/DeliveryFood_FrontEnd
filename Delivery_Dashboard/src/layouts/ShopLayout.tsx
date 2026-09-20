import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService } from '@/api/client';
import { ShopProfile } from '@/api/mockData';
import {
  TrendingUp,
  Store,
  Layers,
  Utensils,
  ShoppingBag,
  Tag,
  Star,
  LogOut,
  ArrowRightLeft,
  Power,
  BellOff
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

export function ShopLayout() {
  const navigate = useNavigate();
  const { currentUser, setRole, logout } = useAuth();
  const [shop, setShop] = useState<ShopProfile | null>(null);

  useEffect(() => {
    dbService.getMyShop().then((myShop) => {
      if (myShop) setShop(myShop);
    });
  }, [currentUser?.id]);

  const toggleIsOpen = async () => {
    if (!shop) return;
    const updated = await dbService.updateShopProfile(shop.id, { is_open: !shop.is_open });
    if (updated) setShop(updated);
  };

  const toggleIsAccepting = async () => {
    if (!shop) return;
    const updated = await dbService.updateShopProfile(shop.id, { is_accepting_orders: !shop.is_accepting_orders });
    if (updated) setShop(updated);
  };

  const menuGroups: MenuGroup[] = [
    {
      groupLabel: 'TỔNG QUAN',
      items: [
        { path: '/shop/revenue', label: 'Dashboard doanh thu', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'GIAN HÀNG',
      items: [
        { path: '/shop/profile', label: 'Hồ sơ & Giờ mở cửa', icon: <Store className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'THỰC ĐƠN',
      items: [
        { path: '/shop/menu/categories', label: 'Danh mục thực đơn', icon: <Layers className="w-4 h-4" /> },
        { path: '/shop/menu/items', label: 'Món ăn & Bảng giá', icon: <Utensils className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'ĐƠN HÀNG',
      items: [
        { path: '/shop/orders', label: 'Xử lý đơn hàng (Kanban)', icon: <ShoppingBag className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'KINH DOANH',
      items: [
        { path: '/shop/promotions', label: 'Khuyến mãi gian hàng', icon: <Tag className="w-4 h-4" /> },
        { path: '/shop/reviews', label: 'Đánh giá từ khách', icon: <Star className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      {/* Sidebar - Dark Navy (#0F2540) */}
      <aside className="w-64 bg-[#0F2540] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-sm text-white truncate">{shop?.shop_name || 'SHOP MANAGER'}</h1>
            <p className="text-[11px] text-slate-400 font-medium truncate">{shop?.area_name || 'Vinhomes Grand Park'}</p>
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
            onClick={() => setRole('ADMIN')}
            className="w-full mb-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="Chuyển sang Admin Portal để test"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chuyển Portal Admin</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.full_name || 'Chủ gian hàng'}</p>
                <p className="text-[10px] text-emerald-400 font-medium">CHỦ GIAN HÀNG</p>
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

      {/* Main Content Area + Topbar */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
        {/* Topbar with operational toggles */}
        <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Trạng thái quán:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                shop?.approval_status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              ● {shop?.approval_status === 'APPROVED' ? 'Đã được duyệt' : 'Chờ Admin duyệt'}
            </span>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-6">
            {/* Toggle 1: is_open */}
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${shop?.is_open ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-700">Mở cửa quán:</span>
              <button
                onClick={toggleIsOpen}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  shop?.is_open ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    shop?.is_open ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: is_accepting_orders */}
            <div className="flex items-center gap-2 pl-6 border-l border-slate-200">
              <BellOff className={`w-4 h-4 ${shop?.is_accepting_orders ? 'text-blue-500' : 'text-amber-500'}`} />
              <span className="text-xs font-medium text-slate-700">Nhận đơn hàng:</span>
              <button
                onClick={toggleIsAccepting}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  shop?.is_accepting_orders ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    shop?.is_accepting_orders ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
