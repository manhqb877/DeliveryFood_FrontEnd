import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService } from '@/api/client';
import {
  Store,
  Shield,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  MapPin,
  FileText
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Portal view: 'admin' (default) | 'shop'
  const [portalView, setPortalView] = useState<'admin' | 'shop'>('admin');

  // Tab for Shop portal: 'login' | 'register'
  const [shopTab, setShopTab] = useState<'login' | 'register'>('login');

  // Form states
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Quick Register Shop states
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regLicense, setRegLicense] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Số điện thoại / Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const users = await dbService.getUsers();
      const input = phoneOrEmail.trim().toLowerCase();

      // Find user
      const found = users.find(
        (u) =>
          (u.phone.toLowerCase() === input || (u.email && u.email.toLowerCase() === input)) &&
          (portalView === 'admin' ? u.role === 'ADMIN' : u.role === 'SHOP_MANAGER')
      );

      if (found) {
        if (found.role === 'SHOP_MANAGER' && found.status === 'PENDING') {
          login(found);
          navigate('/pending-approval');
          return;
        }

        login(found);
        if (found.role === 'ADMIN') {
          navigate('/admin/reports');
        } else {
          navigate('/shop/orders');
        }
      } else {
        const anyUser = users.find(
          (u) => u.phone.toLowerCase() === input || (u.email && u.email.toLowerCase() === input)
        );
        if (anyUser) {
          setError(
            `Tài khoản này thuộc quyền ${
              anyUser.role === 'ADMIN' ? 'Admin' : 'Shop Manager'
            }. Vui lòng chuyển sang cổng tương ứng!`
          );
        } else {
          setError('Số điện thoại/Email hoặc mật khẩu không chính xác!');
        }
      }
    } catch {
      setError('Có lỗi xảy ra khi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Shop
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOwnerName.trim() || !regPhone.trim() || !regPassword || !regShopName.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user } = await dbService.registerShop({
        owner_name: regOwnerName.trim(),
        phone: regPhone.trim(),
        email: `${regPhone.trim()}@shop.hyperlocal.vn`,
        shop_name: regShopName.trim(),
        shop_type: 'COM_TRUA',
        shop_description: 'Gian hàng chuyên phục vụ ẩm thực nội khu',
        area_id: 1,
        location_detail: regLocation.trim() || 'Shophouse Tòa S1.01',
        business_license_number: regLicense.trim() || `HKD-${Date.now()}`,
      });

      login(user);
      navigate('/pending-approval');
    } catch {
      setError('Không thể gửi hồ sơ đăng ký. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  // Fast Demo Login
  const handleQuickLogin = async (userId: number, targetPortal: 'admin' | 'shop') => {
    setLoading(true);
    setError('');
    setPortalView(targetPortal);
    const users = await dbService.getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      login(found);
      if (found.role === 'ADMIN') {
        navigate('/admin/reports');
      } else {
        if (found.status === 'PENDING') {
          navigate('/pending-approval');
        } else {
          navigate('/shop/orders');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative bg-cover bg-center font-sans select-none overflow-x-hidden"
      style={{
        backgroundImage: `url('/bg2.jpg')`,
      }}
    >
      {/* Light Overlay to let background be vivid & recognizable */}
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white/92 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-white/60 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        {/* ======================================================== */}
        {/* LEFT TAB: CLEAN VISUAL / ANIMATION (5 COLS)              */}
        {/* ======================================================== */}
        <div className="md:col-span-5 relative flex flex-col justify-between overflow-hidden bg-slate-900 text-white p-6">
          {portalView === 'admin' ? (
            /* Admin Tech Animation (Clean, Elegant, No Clutter) */
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a172e] via-[#0d2243] to-[#081223] overflow-hidden">
                {/* Radar rings */}
                <div className="absolute -top-16 -left-16 w-80 h-80 border border-cyan-500/20 rounded-full animate-[spin_25s_linear_infinite]" />
                <div className="absolute -top-8 -left-8 w-64 h-64 border border-blue-400/20 rounded-full border-dashed animate-[spin_18s_linear_infinite_reverse]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
              </div>

              {/* Top Tag */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ADMIN PLATFORM
                </span>
              </div>

              {/* Center Tech Shield */}
              <div className="relative z-10 my-auto text-center space-y-4">
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/25">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Trung Tâm Quản Trị
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 max-w-[220px] mx-auto">
                    Giám sát đơn hàng, phê duyệt gian hàng & đối soát nội khu
                  </p>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="relative z-10 text-[10px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-3">
                <span>Hệ thống bảo mật 2 lớp</span>
                <span className="text-cyan-400 font-semibold">Hyperlocal Core</span>
              </div>
            </>
          ) : (
            /* Shop Manager Visual (Clean shop image, NO messy text overlay) */
            <>
              <div className="absolute inset-0 z-0">
                <img
                  src="/shop.jpq.webp"
                  alt="Shop Manager Banner"
                  className="w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
              </div>

              {/* Top Tag */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                  <Store className="w-3.5 h-3.5" />
                  KÊNH NGƯỜI BÁN
                </span>
              </div>

              {/* Center Spacer */}
              <div className="relative z-10 my-auto" />

              {/* Bottom Title (Clean & Minimal) */}
              <div className="relative z-10 text-white">
                <h3 className="text-base font-bold drop-shadow-md">
                  Quản Lý Gian Hàng
                </h3>
                <p className="text-[11px] text-slate-200 drop-shadow-sm mt-0.5">
                  Đồng hành cùng ẩm thực nội khu
                </p>
              </div>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT TAB: INTERACTIVE FORMS (7 COLS)                    */}
        {/* ======================================================== */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-800">
          <div>
            {/* ==================================================== */}
            {/* PORTAL 1: ADMIN LOGIN (DEFAULT VIEW)                 */}
            {/* ==================================================== */}
            {portalView === 'admin' && (
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Đăng Nhập Quản Trị Viên
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dành cho Admin vận hành & kiểm duyệt nền tảng
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Tài khoản Admin (SĐT hoặc Email)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={phoneOrEmail}
                        onChange={(e) => setPhoneOrEmail(e.target.value)}
                        placeholder="0901111111 hoặc admin@hyperlocal.vn"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-semibold">Mật khẩu</label>
                      <a href="#forgot" className="text-[11px] text-blue-600 hover:underline">
                        Quên mật khẩu?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 text-[11px]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded-sm border-slate-300 text-blue-600"
                      />
                      <span>Duy trì đăng nhập</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {loading ? 'Đang xác thực...' : 'Đăng Nhập Admin'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Switch to Shop Manager Portal Button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPortalView('shop');
                      setShopTab('login');
                      setError('');
                      setPhoneOrEmail('');
                      setPassword('');
                    }}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 flex items-center justify-between text-xs font-semibold transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>Bạn là Chủ Quán? Vào Kênh Shop Manager</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* PORTAL 2: SHOP MANAGER (LOGIN / REGISTER TABS)       */}
            {/* ==================================================== */}
            {portalView === 'shop' && (
              <div className="space-y-4">
                {/* Header with Switcher between Login & Register */}
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setShopTab('login');
                        setError('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        shopTab === 'login'
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Đăng Nhập Shop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShopTab('register');
                        setError('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        shopTab === 'register'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Đăng Ký Mở Shop
                    </button>
                  </div>

                  {/* Back to Admin Portal */}
                  <button
                    type="button"
                    onClick={() => {
                      setPortalView('admin');
                      setError('');
                      setPhoneOrEmail('');
                      setPassword('');
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cổng Admin</span>
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* TAB 1: SHOP LOGIN */}
                {shopTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        SĐT hoặc Email chủ quán
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phoneOrEmail}
                          onChange={(e) => setPhoneOrEmail(e.target.value)}
                          placeholder="VD: 0902222222 hoặc lan.comnha@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-700 font-semibold">Mật khẩu</label>
                        <a href="#forgot" className="text-[11px] text-emerald-600 hover:underline">
                          Quên mật khẩu?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 text-[11px]">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded-sm border-slate-300 text-emerald-600"
                        />
                        <span>Ghi nhớ</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShopTab('register')}
                        className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Chưa có shop? Đăng ký ngay →
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {loading ? 'Đang xử lý...' : 'Vào Quản Lý Gian Hàng'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* TAB 2: SHOP REGISTRATION (CLEAN & COMPACT) */}
                {shopTab === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Họ tên chủ quán *
                        </label>
                        <input
                          type="text"
                          required
                          value={regOwnerName}
                          onChange={(e) => setRegOwnerName(e.target.value)}
                          placeholder="Lê Hoàng Nam"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0904444444"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Tên gian hàng *
                        </label>
                        <input
                          type="text"
                          required
                          value={regShopName}
                          onChange={(e) => setRegShopName(e.target.value)}
                          placeholder="Bún Bò Huế Xưa"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Mật khẩu đăng nhập *
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Vị trí nội khu (Tòa / Shophouse)
                        </label>
                        <input
                          type="text"
                          value={regLocation}
                          onChange={(e) => setRegLocation(e.target.value)}
                          placeholder="Shophouse Tòa S2.03"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Số ĐKKD / Mã số thuế
                        </label>
                        <input
                          type="text"
                          value={regLicense}
                          onChange={(e) => setRegLicense(e.target.value)}
                          placeholder="HKD-2026-HCM"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Cần nộp giấy VSATTP & giờ mở?</span>
                      <button
                        type="button"
                        onClick={() => navigate('/register-shop')}
                        className="text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Form 4 bước chi tiết →
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {loading ? 'Đang gửi...' : 'Gửi Hồ Sơ Đăng Ký (Chờ Admin Duyệt) 🚀'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Quick Demo Login Chips (Compact at bottom) */}
          <div className="pt-3 border-t border-slate-100 mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Đăng nhập nhanh (Demo 1-Click)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(1, 'admin')}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-all cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800 truncate">Admin</p>
                <p className="text-[9px] text-blue-600 font-semibold">Toàn quyền</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(2, 'shop')}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left transition-all cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800 truncate">Chị Lan</p>
                <p className="text-[9px] text-emerald-600 font-semibold">Shop APPROVED</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(4, 'shop')}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left transition-all cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800 truncate">Bún Bò Huế</p>
                <p className="text-[9px] text-amber-600 font-semibold">Shop PENDING</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
