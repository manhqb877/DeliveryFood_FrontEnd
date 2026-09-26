'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  UserCircleIcon,
  Bars3Icon,
  ShoppingCartIcon,
  TruckIcon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import NotificationBell from '@/components/common/NotificationBell';

export default function OrderHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();

  const [isMounted, setIsMounted] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const searchRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng user menu khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng search dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutsideSearch(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`http://localhost:8080/api/v1/core/items/search?keyword=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(Array.isArray(data) ? data : (data.data || []));
        })
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 200); // 200ms debounce for faster loading

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header
        className={`w-full bg-white flex items-center px-4 lg:px-6 sticky top-0 z-[60] shadow-sm gap-4 border-b border-gray-100 relative transition-all duration-300 ${
          isScrolled ? 'h-[64px]' : 'h-[84px]'
        }`}
      >
        {/* Logo or Hamburger Menu depending on Scroll */}
        <div className="flex items-center h-full relative">
          <div
            className={`flex items-center transition-all duration-300 absolute left-0 h-full ${
              isScrolled
                ? 'opacity-100 translate-x-0 pointer-events-auto'
                : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}
          >
            <button
              type="button"
              className="group flex items-center gap-3 cursor-pointer w-full relative h-full select-none bg-transparent border-0"
            >
              <Bars3Icon className="w-6 h-6 text-gray-800 shrink-0" />
              <span className="text-[15px] font-bold text-[#333333] hidden sm:block whitespace-nowrap">
                Danh mục sản phẩm
              </span>
            </button>
          </div>

          <div
            className={`flex-shrink-0 h-full flex items-center lg:ml-6 lg:w-[260px] transition-all duration-300 absolute left-0 ${
              !isScrolled
                ? 'opacity-100 translate-x-0 pointer-events-auto'
                : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
          >
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-black tracking-tighter text-[#1a1a1a]">
                be<span className="text-[var(--color-primary)]">Food</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Spacer */}
        <div className="w-[100px] lg:w-[260px] h-full invisible"></div>

        {/* Search */}
        <div className="flex-1 max-w-[500px] hidden md:block" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              placeholder="Tìm kiếm theo sản phẩm..."
              className="w-full bg-[#f3f4f6] rounded-[20px] pl-6 pr-12 py-2 text-[13px] text-gray-700 outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all border border-gray-200"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-[var(--color-primary)]/20 rounded-full text-[var(--color-primary-dark)] shadow-sm hover:bg-[var(--color-primary)] hover:text-black transition-colors z-10">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 font-bold" />
            </button>

            {/* Search Dropdown */}
            {showSearch && searchQuery.trim().length >= 2 && (
              <div className="absolute top-[calc(100%+12px)] left-0 w-[550px] bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] transform -translate-x-4">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">Đang tìm kiếm...</div>
                ) : (
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-500 text-[16px]">
                          Kết quả tìm kiếm cho <span className="text-[#b31414]">{searchQuery}</span>
                        </h3>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setViewMode('list')}
                            className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'list' ? 'border-2 border-gray-800 bg-white' : 'border-2 border-transparent bg-transparent hover:bg-gray-100'}`}
                          >
                            <svg className={`w-5 h-5 ${viewMode === 'list' ? 'text-gray-800' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                          </button>
                          <button 
                            onClick={() => setViewMode('grid')}
                            className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'grid' ? 'border-2 border-gray-800 bg-white' : 'border-2 border-transparent bg-transparent hover:bg-gray-100'}`}
                          >
                            <svg className={`w-5 h-5 ${viewMode === 'grid' ? 'text-gray-800' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-black text-[15px]">Hiển thị kết quả theo:</span>
                        <button className="bg-[#999999] text-white px-5 py-1.5 rounded-full text-[13px] font-bold">Sản phẩm</button>
                      </div>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto p-4">
                      {searchResults.length > 0 ? (
                        viewMode === 'list' ? (
                          <div className="flex flex-col gap-4">
                            {searchResults.map(item => (
                              <Link
                                key={item.id}
                                href={`/product/${item.id}`}
                                onClick={() => setShowSearch(false)}
                                className="flex gap-4 group"
                              >
                                <div className="w-[85px] h-[85px] rounded border border-gray-100 overflow-hidden shrink-0">
                                  <img 
                                    src={item.imageUrl || '/hc-assets/1_1.jpg'} 
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => e.currentTarget.src = '/hc-assets/1_1.jpg'}
                                  />
                                </div>
                                <div className="flex flex-col pt-1">
                                  <h4 className="font-bold text-[#333] text-[17px] mb-1 group-hover:text-[var(--color-primary-dark)] transition-colors">{item.name}</h4>
                                  <span className="font-bold text-[#b31414] text-[16px]">{Number(item.basePrice).toLocaleString('vi-VN')}đ</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                            {searchResults.map((item, index) => (
                              <Link
                                key={item.id}
                                href={`/product/${item.id}`}
                                onClick={() => setShowSearch(false)}
                                className={`flex flex-col group ${index % 2 === 0 && searchResults.length > 1 ? 'border-r border-gray-100 pr-6' : ''}`}
                              >
                                <div className="w-full aspect-square rounded border border-gray-100 overflow-hidden mb-3">
                                  <img 
                                    src={item.imageUrl || '/hc-assets/1_1.jpg'} 
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => e.currentTarget.src = '/hc-assets/1_1.jpg'}
                                  />
                                </div>
                                <h4 className="font-bold text-[#333] text-[16px] mb-1 group-hover:text-[var(--color-primary-dark)] transition-colors line-clamp-2">{item.name}</h4>
                                <span className="font-bold text-[#b31414] text-[16px]">{Number(item.basePrice).toLocaleString('vi-VN')}đ</span>
                              </Link>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-center text-sm text-gray-500 py-4">Không tìm thấy sản phẩm nào</div>
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                      <Link href={`/search?q=${searchQuery}`} onClick={() => setShowSearch(false)} className="text-[#333] text-[14px] hover:underline">
                        Xem thêm sản phẩm có chứa <span className="text-[#b31414]">{searchQuery}</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 lg:gap-6 ml-auto mr-0 lg:mr-8">
          {/* Language Switchers */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              className="transition-all hover:scale-110 ring-2 ring-gray-200 opacity-100 rounded-[2px]"
            >
              <img
                src="https://flagcdn.com/w40/vn.png"
                alt="VN"
                className="h-[20px] rounded-[2px] shadow-sm w-auto block"
              />
            </button>
            <button
              type="button"
              className="transition-all hover:scale-110 opacity-40 hover:opacity-100"
            >
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt="EN"
                className="h-[20px] rounded-[2px] shadow-sm w-auto block"
              />
            </button>
          </div>

          {/* Hotline */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">
                Giao tận nơi
              </span>
              <span className="text-[14px] font-black text-gray-800 leading-tight">1900 1755</span>
            </div>
          </div>

          {/* Notification Bell */}
          {isMounted && isAuthenticated && user && (
            <NotificationBell />
          )}

          {/* User Account — đã đăng nhập hoặc chưa */}
          {isMounted && isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black font-black text-[13px] uppercase shadow-sm">
                  {(user.fullName || user.phone || '?')[0].toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[11px] text-gray-700 font-bold leading-tight max-w-[90px] truncate">
                    {user.fullName || user.phone}
                  </span>
                  <span className="text-[11px] font-normal text-gray-500 leading-tight">
                    {user.role === 'CUSTOMER'
                      ? 'Khách hàng'
                      : user.role === 'SHOP_MANAGER'
                      ? 'Chủ quán'
                      : user.role === 'SHIPPER'
                      ? 'Tài xế'
                      : user.role}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100]">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-[12px] font-bold text-gray-800 truncate">
                      {user.fullName || user.phone}
                    </p>
                    <p className="text-[11px] text-gray-500">{user.phone}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    Tài khoản của tôi
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-yellow-600 hover:bg-yellow-50 transition-colors cursor-pointer"
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 group relative cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 group-hover:bg-gray-100 transition-colors">
                <UserCircleIcon className="w-5 h-5" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] text-gray-700 font-bold leading-tight">Tài khoản</span>
                <span className="text-[11px] font-normal text-gray-500 leading-tight">Đăng nhập</span>
              </div>
            </Link>
          )}

          {/* Track Order Button */}
          <Link
            href="/tracking"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[#1a1a1a] rounded-full font-bold text-[13px] transition-all h-[36px] cursor-pointer shadow-sm group"
          >
            <TruckIcon className="w-4 h-4" />
            <span>Tra cứu đơn</span>
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[#1a1a1a] rounded-full transition-colors h-[36px] cursor-pointer shadow-sm group"
          >
            <ShoppingCartIcon className="w-4 h-4 text-[#1a1a1a]" />
            <span className="text-[13px] font-bold text-[#1a1a1a] hidden sm:inline">Giỏ hàng</span>
            <span className="bg-white/80 group-hover:bg-white text-black text-[12px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center transition-colors">
              {totalItemCount}
            </span>
          </Link>
        </div>
      </header>

      {/* FULL WIDTH YELLOW BAR */}
      <div className="w-full h-[50px] bg-[var(--color-primary)] border-b border-[var(--color-primary-dark)] relative z-20">
        <div className="mx-auto flex h-full w-full max-w-[1440px] px-4 lg:px-8 items-center gap-6 lg:gap-8">
          {/* Categories Header */}
          <div className="hidden lg:flex h-full w-[260px] shrink-0 items-center bg-white px-6 select-none relative cursor-pointer group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-primary-dark)]"></div>
            <div className="w-5 flex flex-col gap-[3px] mr-3">
              <span className="w-full h-[2px] bg-black block"></span>
              <span className="w-full h-[2px] bg-black block"></span>
              <span className="w-full h-[2px] bg-black block"></span>
            </div>
            <span className="text-[14px] font-bold text-black capitalize">Danh mục sản phẩm</span>
          </div>

          <Link href="/policy" className="flex items-center text-black hover:opacity-80 transition-opacity">
            <span className="text-[13px] font-bold">Chính sách đặt hàng</span>
          </Link>

          <Link href="/contact" className="flex items-center text-black hover:opacity-80 transition-opacity">
            <span className="text-[13px] font-bold">Liên hệ</span>
          </Link>
        </div>
      </div>
    </>
  );
}
