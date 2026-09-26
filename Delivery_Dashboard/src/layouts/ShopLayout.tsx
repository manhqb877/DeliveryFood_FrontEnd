import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService, api, API_HOST } from '@/api/client';
import { ShopProfile } from '@/api/mockData';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';
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
  BellOff,
  MessageSquare
} from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';

function playShopNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {}
}

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
  const location = useLocation();
  const { currentUser, setRole, logout } = useAuth();
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const fetchUnread = async (shopId: number) => {
    try {
      const convs = await api.getShopConversations(shopId);
      const total = convs.reduce((acc, c) => acc + (c.unreadShopCount || 0), 0);
      setUnreadMessagesCount(total);
    } catch (e) {}
  };

  useEffect(() => {
    dbService.getMyShop().then((myShop) => {
      if (myShop) {
        setShop(myShop);
        fetchUnread(myShop.id);
      }
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (shop?.id && location.pathname === '/shop/messages') {
      fetchUnread(shop.id);
    }
  }, [location.pathname, shop?.id]);

  // Global STOMP listener for new incoming customer messages
  useEffect(() => {
    if (!shop?.id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`http://${API_HOST}:8086/ws-chat`),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
    });

    client.onConnect = () => {
      client.subscribe(`/topic/shop.${shop.id}`, (payload) => {
        try {
          const newMsg = JSON.parse(payload.body);
          if (newMsg.senderType !== 'SHOP') {
            playShopNotificationChime();
            setUnreadMessagesCount((prev) => prev + 1);
          }
        } catch (e) {}
      });
    };

    client.activate();

    return () => {
      if (client.active) client.deactivate();
    };
  }, [shop?.id]);

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
        { path: '/shop/shippers', label: 'Theo dõi Shipper', icon: <ArrowRightLeft className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'CHĂM SÓC KHÁCH HÀNG',
      items: [
        { path: '/shop/messages', label: 'Tin nhắn khách hàng', icon: <MessageSquare className="w-4 h-4" /> },
        { path: '/shop/reviews', label: 'Đánh giá từ khách', icon: <Star className="w-4 h-4" /> },
      ],
    },
    {
      groupLabel: 'KINH DOANH',
      items: [
        { path: '/shop/promotions', label: 'Khuyến mãi gian hàng', icon: <Tag className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      {/* Sidebar - Dark Navy (#0F2540) */}
      <aside className="w-64 bg-[#0F2540] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-sm text-white truncate">{shop?.shop_name || 'SHOP MANAGER'}</h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">{shop?.location_detail || shop?.area_name || 'Đang cập nhật địa chỉ...'}</p>
            </div>
          </div>
          {shop?.id && (
            <NotificationBell
              recipientId={shop.id}
              role="SHOP"
              onNavigateToOrder={() => navigate('/shop/orders')}
            />
          )}
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
                    {item.path === '/shop/messages' && unreadMessagesCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
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

            {/* Message Notification Button */}
            <div className="pl-6 border-l border-slate-200 flex items-center">
              <button
                onClick={() => navigate('/shop/messages')}
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tin nhắn khách hàng"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md animate-pulse">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
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
