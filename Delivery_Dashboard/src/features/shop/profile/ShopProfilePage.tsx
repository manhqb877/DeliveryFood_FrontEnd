import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { ShopProfile } from '@/api/mockData';
import {
  AlertCircle, Clock, MapPin, Save, Store, CheckCircle, ShieldAlert,
  Phone, Mail, Globe, FileText, Building2, Layers, Hash,
  Users, Timer, ShoppingCart, Percent, Info, ChevronDown, ChevronUp,
  Upload, Trash2, Link as LinkIcon, Camera, X
} from 'lucide-react';

// ---- Form Section wrapper ----
function FormSection({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Icon className="w-4 h-4" /></div>}
          <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ---- Image Upload Field (from Computer / File & URL) ----
function ImageUploadField({
  label,
  value,
  onChange,
  aspect = 'square',
  hint,
  required
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  aspect?: 'square' | 'banner';
  hint?: string;
  required?: boolean;
}) {
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa là 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          {isUrlMode ? (
            <>
              <Upload className="w-3 h-3" /> Tải từ máy tính
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" /> Nhập link URL
            </>
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {isUrlMode ? (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          {value && (
            <div className="relative group inline-block">
              <img
                src={value}
                alt="Preview"
                className={`rounded-xl object-cover border border-slate-200 shadow-xs ${
                  aspect === 'square' ? 'w-24 h-24' : 'w-full h-32'
                }`}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa ảnh"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
              <div
                className={`relative overflow-hidden ${
                  aspect === 'square' ? 'w-32 h-32 mx-auto sm:mx-0' : 'w-full h-40'
                }`}
              >
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-50 hover:scale-105"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" /> Đổi ảnh từ máy
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragOver
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
              } ${aspect === 'banner' ? 'h-40' : 'h-36'}`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                {aspect === 'square' ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700">
                  <span className="text-blue-600 underline">Chọn ảnh từ máy tính</span> hoặc kéo thả vào đây
                </p>
                <p className="text-[10px] text-slate-400">
                  {aspect === 'square'
                    ? 'Ảnh vuông (1:1), tối thiểu 300×300px, PNG, JPG, WEBP (tối đa 5MB)'
                    : 'Ảnh banner ngang (16:9), tối thiểu 800×450px, PNG, JPG, WEBP (tối đa 5MB)'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ---- Input field ----
function InputField({
  label, value, onChange, type = 'text', placeholder, hint, required, icon: Icon
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; required?: boolean; icon?: React.ElementType;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon className="w-3.5 h-3.5" /></div>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all ${Icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5'}`}
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ---- Select field ----
function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// =============================================
export function ShopProfilePage() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // === Basic Info ===
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zaloLink, setZaloLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');

  // === Location ===
  const [locationDetail, setLocationDetail] = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [floor, setFloor] = useState('');
  const [unitNumber, setUnitNumber] = useState('');

  // === Media ===
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // === Legal Docs ===
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState('');
  const [foodSafetyCertNumber, setFoodSafetyCertNumber] = useState('');
  const [taxId, setTaxId] = useState('');

  // === Operations ===
  const [maxConcurrentOrders, setMaxConcurrentOrders] = useState('');
  const [avgPrepTime, setAvgPrepTime] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [shipperModel, setShipperModel] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  // === Hours ===
  const [businessHours, setBusinessHours] = useState<
    Array<{ day: number; open: string; close: string; is_closed: boolean }>
  >([]);

  useEffect(() => {
    dbService.getShopById(1).then((s) => {
      setShop(s);
      setShopName(s.shop_name);
      setShopType(s.shop_type || '');
      setDescription(s.shop_description);
      setPhone(s.phone);
      setEmail(s.email || '');
      setZaloLink(s.zalo_link || '');
      setFacebookLink(s.facebook_link || '');
      setLocationDetail(s.location_detail);
      setBuildingCode(s.building_code || '');
      setFloor(s.floor || '');
      setUnitNumber(s.unit_number || '');
      setLogoUrl(s.logo_url);
      setCoverUrl(s.cover_image_url);
      setBusinessLicenseNumber(s.business_license_number || '');
      setFoodSafetyCertNumber(s.food_safety_cert_number || '');
      setTaxId(s.tax_id || '');
      setMaxConcurrentOrders(String(s.max_concurrent_orders || ''));
      setAvgPrepTime(String(s.avg_prep_time_minutes || ''));
      setMinOrderValue(String(s.min_order_value || ''));
      setShipperModel(s.shipper_model || 'PLATFORM');
      setIsOpen(s.is_open ?? true);
      setIsAcceptingOrders(s.is_accepting_orders);
      setBusinessHours(s.business_hours || []);
      setLoading(false);
    });
  }, []);

  const handleHourToggle = (dayIndex: number) => {
    setBusinessHours(prev => prev.map(h => h.day === dayIndex ? { ...h, is_closed: !h.is_closed } : h));
  };

  const handleHourChange = (dayIndex: number, field: 'open' | 'close', val: string) => {
    setBusinessHours(prev => prev.map(h => h.day === dayIndex ? { ...h, [field]: val } : h));
  };

  const handleToggleOpen = async (val: boolean) => {
    setIsOpen(val);
    if (shop) {
      await dbService.toggleShopOpenStatus(shop.id, val);
    }
  };

  const handleToggleAccepting = async (val: boolean) => {
    setIsAcceptingOrders(val);
    if (shop) {
      await dbService.toggleShopAcceptingOrders(shop.id, val);
    }
  };

  const handleSaveProfile = async () => {
    if (!shop) return;
    setSaving(true);
    const updated = await dbService.updateShopProfile(shop.id, {
      shop_name: shopName,
      shop_type: shopType as ShopProfile['shop_type'],
      shop_description: description,
      phone,
      email,
      zalo_link: zaloLink,
      facebook_link: facebookLink,
      location_detail: locationDetail,
      building_code: buildingCode,
      floor,
      unit_number: unitNumber,
      logo_url: logoUrl,
      cover_image_url: coverUrl,
      business_license_number: businessLicenseNumber,
      food_safety_cert_number: foodSafetyCertNumber,
      tax_id: taxId,
      max_concurrent_orders: Number(maxConcurrentOrders) || undefined,
      avg_prep_time_minutes: Number(avgPrepTime) || undefined,
      min_order_value: Number(minOrderValue) || undefined,
      shipper_model: shipperModel as ShopProfile['shipper_model'],
      is_open: isOpen,
      is_accepting_orders: isAcceptingOrders,
      business_hours: businessHours,
    });
    setSaving(false);
    if (updated) {
      setShop(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading || !shop) {
    return <div className="p-8 text-center text-slate-400 text-xs">Đang tải hồ sơ gian hàng...</div>;
  }

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  return (
    <div className="space-y-6">
      {/* Status Banners */}
      {shop.approval_status === 'PENDING' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Hồ sơ gian hàng đang chờ Admin kiểm duyệt</h4>
            <p className="mt-0.5 text-amber-700">Gian hàng của bạn hiện chưa được mở bán chính thức. Vui lòng chờ Admin xác minh thông tin và giấy tờ.</p>
          </div>
        </div>
      )}
      {shop.approval_status === 'APPROVED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Gian hàng đã được duyệt và đang hoạt động</h4>
            <p className="mt-0.5">Duyệt lúc: {shop.approved_at ? new Date(shop.approved_at).toLocaleDateString('vi-VN') : '—'} — Hoa hồng: <strong>{shop.commission_rate}%</strong></p>
          </div>
        </div>
      )}
      {shop.approval_status === 'REJECTED' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Hồ sơ bị từ chối</h4>
            <p className="mt-0.5">{shop.rejection_reason || 'Liên hệ Admin để biết lý do chi tiết.'}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" /> Hồ Sơ Gian Hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cập nhật thông tin quán, giờ mở cửa và giấy tờ pháp lý</p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu thành công!' : 'Lưu Thay Đổi'}
        </button>
      </div>

      {/* ---- Section 1: Thông tin cơ bản ---- */}
      <FormSection title="Thông Tin Cơ Bản" icon={Store}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <InputField label="Tên gian hàng" value={shopName} onChange={setShopName} required placeholder="VD: Cơm Nhà Chị Lan - Chuẩn Vị Bắc" />
          </div>
          <SelectField
            label="Loại hình kinh doanh"
            value={shopType}
            onChange={setShopType}
            options={[
              { value: '', label: '— Chọn loại hình —' },
              { value: 'COM_TRUA', label: '🍚 Cơm Trưa Văn Phòng' },
              { value: 'THUC_UONG', label: '🧋 Thức Uống & Đồ Uống' },
              { value: 'AN_VUNG', label: '🍜 Ăn Vặt & Bún Phở' },
              { value: 'BANH', label: '🥐 Bánh & Dessert' },
              { value: 'KHAC', label: '🍽 Khác' },
            ]}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mô tả gian hàng</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về quán, đặc điểm, phong cách nấu..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </FormSection>

      {/* ---- Section 2: Liên hệ ---- */}
      <FormSection title="Thông Tin Liên Hệ" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField label="Số điện thoại" value={phone} onChange={setPhone} required icon={Phone} placeholder="0901234567" hint="Dùng để khách hàng và shipper liên hệ trực tiếp" />
          <InputField label="Email liên hệ" value={email} onChange={setEmail} type="email" icon={Mail} placeholder="quanlan@gmail.com" hint="Nhận thông báo hệ thống và hóa đơn" />
          <InputField label="Zalo / Link Zalo" value={zaloLink} onChange={setZaloLink} icon={Globe} placeholder="https://zalo.me/0901234567" hint="Hỗ trợ khách chat trực tiếp qua Zalo" />
          <InputField label="Facebook / Fanpage" value={facebookLink} onChange={setFacebookLink} icon={Globe} placeholder="https://facebook.com/quanlan" hint="Tùy chọn — hiển thị trong hồ sơ quán" />
        </div>
      </FormSection>

      {/* ---- Section 3: Vị trí ---- */}
      <FormSection title="Vị Trí Trong Khu Vực" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <InputField label="Mô tả vị trí chi tiết" value={locationDetail} onChange={setLocationDetail} required icon={MapPin} placeholder="VD: Tầng 1 Tòa S1.02, Shophouse 05" />
          </div>
          <InputField label="Mã tòa nhà / khu" value={buildingCode} onChange={setBuildingCode} icon={Building2} placeholder="VD: TOA_S1" hint="Mã nội bộ theo sơ đồ khu vực" />
          <InputField label="Tầng" value={floor} onChange={setFloor} icon={Layers} placeholder="VD: Tầng 1, B1, Shophouse..." />
          <InputField label="Số căn / phòng / ô" value={unitNumber} onChange={setUnitNumber} icon={Hash} placeholder="VD: SH-05, P.101" />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <span>Địa chỉ trên bản đồ hiện tại: <strong>{shop.area_name}</strong>. Để thay đổi khu vực, vui lòng liên hệ Admin.</span>
          </div>
        </div>
      </FormSection>

      {/* ---- Section 4: Hình ảnh ---- */}
      <FormSection title="Hình Ảnh Gian Hàng" icon={Store}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <ImageUploadField
            label="Logo / Avatar Gian Hàng"
            value={logoUrl}
            onChange={setLogoUrl}
            aspect="square"
            hint="Hiển thị đại diện cho gian hàng trên danh sách quán, thực đơn và hóa đơn khách hàng"
          />
          <ImageUploadField
            label="Ảnh Bìa Gian Hàng (Banner)"
            value={coverUrl}
            onChange={setCoverUrl}
            aspect="banner"
            hint="Hiển thị trên đầu trang chi tiết gian hàng và thẻ giới thiệu nổi bật"
          />
        </div>
      </FormSection>

      {/* ---- Section 5: Giấy tờ pháp lý ---- */}
      <FormSection title="Giấy Tờ Pháp Lý & Kinh Doanh" icon={FileText} defaultOpen={false}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2 mt-4 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Thông tin pháp lý bắt buộc để Admin duyệt gian hàng. Đảm bảo tên chủ hộ khớp với CMND/CCCD đăng ký.</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Số giấy phép kinh doanh" value={businessLicenseNumber} onChange={setBusinessLicenseNumber} icon={FileText} placeholder="VD: HKD-2025-HCM-123456" hint="Giấy phép ĐKKD hộ kinh doanh hoặc doanh nghiệp" />
          <InputField label="Số chứng nhận VSATTP" value={foodSafetyCertNumber} onChange={setFoodSafetyCertNumber} icon={FileText} placeholder="VD: VSATTP-2025-012345" hint="Giấy chứng nhận vệ sinh an toàn thực phẩm" />
          <InputField label="Mã số thuế (nếu có)" value={taxId} onChange={setTaxId} icon={Hash} placeholder="VD: 012345678" hint="MST hộ cá thể kinh doanh" />
        </div>
      </FormSection>

      {/* ---- Section 6: Vận hành ---- */}
      <FormSection title="Cài Đặt Vận Hành" icon={Users} defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField
            label="Số đơn tối đa cùng lúc"
            value={maxConcurrentOrders}
            onChange={setMaxConcurrentOrders}
            type="number"
            icon={ShoppingCart}
            placeholder="VD: 15"
            hint="Khi đủ số đơn này, quán sẽ tự động tạm ngưng nhận đơn mới"
          />
          <InputField
            label="Thời gian chuẩn bị TB (phút)"
            value={avgPrepTime}
            onChange={setAvgPrepTime}
            type="number"
            icon={Timer}
            placeholder="VD: 12"
            hint="Thời gian ước tính trung bình để chuẩn bị 1 đơn hàng"
          />
          <InputField
            label="Giá trị đơn tối thiểu (₫)"
            value={minOrderValue}
            onChange={setMinOrderValue}
            type="number"
            icon={ShoppingCart}
            placeholder="VD: 30000"
            hint="Khách cần đặt tối thiểu số này mới được xác nhận đơn"
          />
          <SelectField
            label="Mô hình shipper"
            value={shipperModel}
            onChange={setShipperModel}
            options={[
              { value: 'PLATFORM', label: '🚀 PLATFORM — Dùng shipper của nền tảng' },
              { value: 'SHOP_OWN', label: '🛵 SHOP_OWN — Tự có đội giao riêng' },
              { value: 'HYBRID', label: '🔀 HYBRID — Kết hợp cả hai' },
            ]}
          />
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
              <div
                onClick={() => handleToggleOpen(!isOpen)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {isOpen ? '🟢 Quán đang Mở Cửa' : '🔴 Quán đang Đóng Cửa'}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Mở/Đóng quán tạm thời (ngoài giờ hoạt động hoặc nghỉ đột xuất)
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
              <div
                onClick={() => handleToggleAccepting(!isAcceptingOrders)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${isAcceptingOrders ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isAcceptingOrders ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {isAcceptingOrders ? '⚡ Đang Nhận Đơn Hàng' : '⛔ Tạm Ngưng Nhận Đơn'}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Bật/tắt để tạm ngưng nhận đơn khi quán quá tải hoặc chuẩn bị đồ
                </p>
              </div>
            </label>
          </div>
        </div>
      </FormSection>

      {/* ---- Section 7: Giờ hoạt động ---- */}
      <FormSection title="Giờ Hoạt Động (7 ngày/tuần)" icon={Clock}>
        <div className="space-y-3 mt-4">
          {businessHours.map((h) => (
            <div key={h.day} className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border transition-colors ${h.is_closed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-blue-50/30 border-blue-100'}`}>
              <span className="w-20 text-xs font-semibold text-slate-700 shrink-0">{dayNames[h.day]}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!h.is_closed}
                  onChange={() => handleHourToggle(h.day)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <span className={`text-xs font-medium ${h.is_closed ? 'text-slate-400' : 'text-blue-700'}`}>
                  {h.is_closed ? 'Nghỉ' : 'Mở cửa'}
                </span>
              </label>
              {!h.is_closed && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={h.open}
                    onChange={e => handleHourChange(h.day, 'open', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">→</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={e => handleHourChange(h.day, 'close', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </FormSection>

      {/* Info bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-slate-400" />
        <span>
          Tỉ lệ hoa hồng hiện tại: <strong className="text-slate-700">{shop.commission_rate}%</strong> — Để thay đổi tỉ lệ, vui lòng liên hệ Admin qua mục hỗ trợ.
          Mã khu vực: <strong className="text-slate-700">{shop.area_name}</strong>.
        </span>
      </div>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
            saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu Thay Đổi'}
        </button>
      </div>
    </div>
  );
}
