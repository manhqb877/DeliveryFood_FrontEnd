import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService } from '@/api/client';
import { Area } from '@/api/mockData';
import {
  Store,
  User,
  MapPin,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  Image,
  ShieldCheck,
  Upload
} from 'lucide-react';

export function RegisterShopPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);

  // Step counter (1 to 4)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    // Step 1: Owner Info
    owner_name: '',
    phone: '',
    email: '',
    password: '',

    // Step 2: Shop Details & Location
    shop_name: '',
    shop_type: 'COM_TRUA' as 'COM_TRUA' | 'THUC_UONG' | 'AN_VUNG' | 'BANH' | 'KHAC',
    shop_description: '',
    area_id: 1,
    building_code: 'TOA_S1',
    floor: 'Tầng 1 (Shophouse)',
    unit_number: 'SH-01',
    location_detail: 'Shophouse Tòa S1.01, gần cổng chính',

    // Step 3: Images & Legal Docs
    logo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    cover_image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    business_license_number: '',
    food_safety_cert_number: '',
    tax_id: '',
    doc1: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    doc2: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',

    // Step 4: Hours & Ops
    open_time: '07:00',
    close_time: '21:30',
    avg_prep_time_minutes: 15,
    min_order_value: 30000,
  });

  useEffect(() => {
    dbService.getAreas().then(setAreas);
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    setError('');
    if (step === 1) {
      if (!form.owner_name.trim()) return 'Vui lòng nhập Họ và tên chủ gian hàng!';
      if (!form.phone.trim()) return 'Vui lòng nhập Số điện thoại liên hệ!';
      if (!form.email.trim()) return 'Vui lòng nhập Email!';
      if (!form.password.trim() || form.password.length < 6) return 'Mật khẩu phải từ 6 ký tự!';
    } else if (step === 2) {
      if (!form.shop_name.trim()) return 'Vui lòng nhập Tên gian hàng!';
      if (!form.shop_description.trim()) return 'Vui lòng nhập Mô tả gian hàng!';
      if (!form.location_detail.trim()) return 'Vui lòng nhập Vị trí chi tiết của quán!';
    } else if (step === 3) {
      if (!form.business_license_number.trim()) return 'Vui lòng nhập Số Giấy phép đăng ký kinh doanh!';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const selectedArea = areas.find((a) => a.id === Number(form.area_id));

      const { user, shop } = await dbService.registerShop({
        owner_name: form.owner_name,
        phone: form.phone,
        email: form.email,
        shop_name: form.shop_name,
        shop_type: form.shop_type,
        shop_description: form.shop_description,
        area_id: Number(form.area_id),
        area_name: selectedArea?.area_name,
        location_detail: form.location_detail,
        building_code: form.building_code,
        floor: form.floor,
        unit_number: form.unit_number,
        logo_url: form.logo_url,
        cover_image_url: form.cover_image_url,
        business_license_number: form.business_license_number,
        food_safety_cert_number: form.food_safety_cert_number,
        tax_id: form.tax_id,
        documents: [form.doc1, form.doc2].filter(Boolean),
        business_hours: [
          { day: 0, open: form.open_time, close: form.close_time, is_closed: false },
          { day: 1, open: form.open_time, close: form.close_time, is_closed: false },
          { day: 2, open: form.open_time, close: form.close_time, is_closed: false },
          { day: 3, open: form.open_time, close: form.close_time, is_closed: false },
          { day: 4, open: form.open_time, close: form.close_time, is_closed: false },
          { day: 5, open: form.open_time, close: form.close_time, is_closed: false },
          { day: 6, open: form.open_time, close: form.close_time, is_closed: false },
        ],
        avg_prep_time_minutes: Number(form.avg_prep_time_minutes),
        min_order_value: Number(form.min_order_value),
      });

      // Login registered user & navigate to pending page
      login(user);
      navigate('/pending-approval');
    } catch (err) {
      setError('Đã có lỗi xảy ra khi gửi hồ sơ đăng ký. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-800 py-10 px-4 flex justify-center items-center font-sans relative bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url('/bg2.jpg')` }}
    >
      {/* Dark Ambient Backdrop Filter */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" />

      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-white/20 overflow-hidden z-10">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ĐĂNG KÝ GIAN HÀNG MỚI (M-SHOP-01)</h1>
              <p className="text-xs text-slate-400">Gửi hồ sơ gian hàng chờ Admin xét duyệt trước khi bán hàng</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-1.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            Quay về Đăng nhập
          </button>
        </div>

        {/* Step Wizard Indicator */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          {[
            { stepNum: 1, label: 'Chủ Gian Hàng', icon: <User className="w-3.5 h-3.5" /> },
            { stepNum: 2, label: 'Thông Tin Shop', icon: <Building className="w-3.5 h-3.5" /> },
            { stepNum: 3, label: 'Pháp Lý & Ảnh', icon: <FileText className="w-3.5 h-3.5" /> },
            { stepNum: 4, label: 'Vận Hành & Giờ Mở', icon: <Clock className="w-3.5 h-3.5" /> },
          ].map((item) => (
            <div
              key={item.stepNum}
              onClick={() => {
                if (item.stepNum < step) setStep(item.stepNum);
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                step === item.stepNum
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : step > item.stepNum
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {step > item.stepNum ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : item.icon}
                <span className="text-[11px]">Bước {item.stepNum}</span>
              </div>
              <span className="text-[10px] font-medium hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ================= STEP 1: OWNER INFO ================= */}
            {step === 1 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Bước 1: Thông tin người đại diện (Shop Manager)
                </h3>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Họ và tên chủ gian hàng *</label>
                  <input
                    type="text"
                    value={form.owner_name}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    placeholder="VD: Nguyễn Văn Anh"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số điện thoại đăng nhập *</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="VD: 0909123456"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email liên hệ *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="VD: quan.an@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mật khẩu đăng nhập *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* ================= STEP 2: SHOP DETAILS & LOCATION ================= */}
            {step === 2 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Bước 2: Thông tin chi tiết Gian hàng & Vị trí
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tên gian hàng hiển thị *</label>
                    <input
                      type="text"
                      value={form.shop_name}
                      onChange={(e) => handleChange('shop_name', e.target.value)}
                      placeholder="VD: Phở Bò Gia Truyền Nam Định"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Loại hình kinh doanh *</label>
                    <select
                      value={form.shop_type}
                      onChange={(e) => handleChange('shop_type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="COM_TRUA">Cơm trưa / Cơm phần</option>
                      <option value="THUC_UONG">Trà sữa / Cà phê / Đồ uống</option>
                      <option value="AN_VUNG">Ăn vặt / Đồ nướng / Phố lẩu</option>
                      <option value="BANH">Bánh mì / Bánh ngọt</option>
                      <option value="KHAC">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mô tả gian hàng *</label>
                  <textarea
                    rows={3}
                    value={form.shop_description}
                    onChange={(e) => handleChange('shop_description', e.target.value)}
                    placeholder="Mô tả món ăn chủ đạo, cam kết vệ sinh an toàn thực phẩm..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Khu vực phục vụ (Nội khu) *</label>
                    <select
                      value={form.area_id}
                      onChange={(e) => handleChange('area_id', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-semibold text-emerald-800"
                    >
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.area_name} ({area.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tòa / Cụm / Khu vực nội bộ</label>
                    <input
                      type="text"
                      value={form.building_code}
                      onChange={(e) => handleChange('building_code', e.target.value)}
                      placeholder="VD: Tòa S1 - Rainbow"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tầng / Vị trí cụ thể</label>
                    <input
                      type="text"
                      value={form.floor}
                      onChange={(e) => handleChange('floor', e.target.value)}
                      placeholder="VD: Tầng 1 (Shophouse)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số căn / Mã lô gian hàng</label>
                    <input
                      type="text"
                      value={form.unit_number}
                      onChange={(e) => handleChange('unit_number', e.target.value)}
                      placeholder="VD: SH-05"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mô tả địa chỉ chính xác cho Shipper *</label>
                  <input
                    type="text"
                    value={form.location_detail}
                    onChange={(e) => handleChange('location_detail', e.target.value)}
                    placeholder="VD: Shophouse Tòa S1.01, bên cạnh sảnh thang máy A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* ================= STEP 3: LEGAL & MEDIA ================= */}
            {step === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Bước 3: Giấy tờ pháp lý & Hình ảnh quán (Duyệt Admin)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số ĐKKD Hộ Cá Thể *</label>
                    <input
                      type="text"
                      value={form.business_license_number}
                      onChange={(e) => handleChange('business_license_number', e.target.value)}
                      placeholder="VD: HKD-2026-0123"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số Chứng Nhận VSATTP</label>
                    <input
                      type="text"
                      value={form.food_safety_cert_number}
                      onChange={(e) => handleChange('food_safety_cert_number', e.target.value)}
                      placeholder="VD: ATTP-2026-99"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mã số thuế</label>
                    <input
                      type="text"
                      value={form.tax_id}
                      onChange={(e) => handleChange('tax_id', e.target.value)}
                      placeholder="VD: 012345678"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-semibold">Logo gian hàng</label>
                      <label className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3 h-3" /> Chọn từ máy
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) handleChange('logo_url', ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={form.logo_url}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
                      placeholder="Hoặc dán URL ảnh..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                    {form.logo_url && <img src={form.logo_url} alt="Logo Preview" className="mt-2 w-16 h-16 rounded-xl object-cover border" />}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-semibold">Ảnh bìa gian hàng</label>
                      <label className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3 h-3" /> Chọn từ máy
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) handleChange('cover_image_url', ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={form.cover_image_url}
                      onChange={(e) => handleChange('cover_image_url', e.target.value)}
                      placeholder="Hoặc dán URL ảnh bìa..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                    {form.cover_image_url && <img src={form.cover_image_url} alt="Cover Preview" className="mt-2 w-full h-16 rounded-xl object-cover border" />}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ảnh chụp Giấy chứng nhận & Mặt tiền quán (Gửi Admin kiểm tra)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-500">Giấy chứng nhận ĐKKD</span>
                        <label className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" /> Tải từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) handleChange('doc1', ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={form.doc1}
                        onChange={(e) => handleChange('doc1', e.target.value)}
                        placeholder="URL Giấy chứng nhận ĐKKD"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-500">Ảnh mặt tiền quán</span>
                        <label className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" /> Tải từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) handleChange('doc2', ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={form.doc2}
                        onChange={(e) => handleChange('doc2', e.target.value)}
                        placeholder="URL Ảnh thực tế gian hàng"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: HOURS & OPERATIONS ================= */}
            {step === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Bước 4: Giờ hoạt động & Thiết lập vận hành
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Giờ mở cửa chuẩn</label>
                    <input
                      type="time"
                      value={form.open_time}
                      onChange={(e) => handleChange('open_time', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Giờ đóng cửa chuẩn</label>
                    <input
                      type="time"
                      value={form.close_time}
                      onChange={(e) => handleChange('close_time', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Thời gian chuẩn bị món TB (Phút)</label>
                    <input
                      type="number"
                      value={form.avg_prep_time_minutes}
                      onChange={(e) => handleChange('avg_prep_time_minutes', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      step={5000}
                      value={form.min_order_value}
                      onChange={(e) => handleChange('min_order_value', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed">
                  <span className="font-bold block mb-1">📌 Cam kết quy định nền tảng:</span>
                  Hồ sơ sau khi gửi sẽ chuyển sang trạng thái <strong>CHỜ DUYỆT (PENDING)</strong>. Admin hệ thống sẽ thẩm định giấy phép kinh doanh và ảnh gian hàng trong vòng 24h làm việc.
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <span>Tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {loading ? 'Đang gửi hồ sơ...' : 'Gửi Hồ Sơ Đăng Ký Gian Hàng 🚀'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
