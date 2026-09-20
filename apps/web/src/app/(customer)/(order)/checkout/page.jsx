'use client';

import { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/lib/location';
import { 
  MapPinIcon, 
  BanknotesIcon, 
  ChevronLeftIcon,
  ChevronDownIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  LockClosedIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const API = 'http://localhost:8080/api/v1';

export default function CheckoutPage() {
  const router = useRouter();
  const { carts } = useCart();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  // COD payment method only (as required by user)
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Idempotency Key - generated once per checkout session
  const [idempotencyKey, setIdempotencyKey] = useState('');
  useEffect(() => {
    const key = 'idem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    setIdempotencyKey(key);
  }, []);

  // Form states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProv, setSelectedProv] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [note, setNote] = useState('');
  
  // User info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // Promotions & Vouchers (Separated into Shop Vouchers & System/Platform Vouchers)
  const [shopPromotions, setShopPromotions] = useState([]);
  const [platformPromotions, setPlatformPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  
  const [selectedShopPromo, setSelectedShopPromo] = useState(null);
  const [selectedPlatformPromo, setSelectedPlatformPromo] = useState(null);
  const [promoTab, setPromoTab] = useState('ALL'); // 'ALL' | 'SHOP' | 'PLATFORM'
  
  const [customPromoCode, setCustomPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const cartToOrder = carts.find(c => c.items?.length > 0) || { items: [] };
  const subtotal = cartToOrder.items?.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0) || 0;
  const deliveryFee = subtotal > 0 ? 15000 : 0;

  // Setup user profile data
  useEffect(() => {
    if (isAuthenticated && user) {
      setFullName(user.fullName || user.name || '');
      setPhone(user.phoneNumber || user.phone || '');
      setEmail(user.email || '');
    } else if (isAuthenticated) {
      authService.getProfile().then(res => {
        const data = res.data || res;
        setFullName(data.fullName || data.name || '');
        setPhone(data.phoneNumber || data.phone || '');
        setEmail(data.email || '');
      }).catch(console.error);
    }
  }, [isAuthenticated, user]);

  // Init provinces
  useEffect(() => {
    fetchProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProv) fetchDistricts(selectedProv).then(setDistricts).catch(() => {});
    else { setDistricts([]); setSelectedDist(''); setWards([]); setSelectedWard(''); }
  }, [selectedProv]);

  useEffect(() => {
    if (selectedDist) fetchWards(selectedDist).then(setWards).catch(() => {});
    else { setWards([]); setSelectedWard(''); }
  }, [selectedDist]);

  // Load saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingAddr(true);
      authService.getAddresses()
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data || []);
          setSavedAddresses(list);
          if (list.length > 0) {
            const def = list.find(a => a.isDefault) || list[0];
            setSelectedAddressId(def.id);
            parseAndFillAddress(def.addressLine || '');
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAddr(false));
    }
  }, [isAuthenticated, provinces.length]);

  const parseAndFillAddress = (addressStr) => {
    const parts = addressStr.split(',').map(s => s.trim());
    if (parts.length >= 4) {
      const provName = parts[parts.length - 1];
      const distName = parts[parts.length - 2];
      const wardName = parts[parts.length - 3];
      const street = parts.slice(0, parts.length - 3).join(', ');
      
      const p = provinces.find(x => x.name === provName);
      if (p) {
        setSelectedProv(p.code);
        setStreetAddress(street);
        
        fetchDistricts(p.code).then(dList => {
          setDistricts(dList);
          const d = dList.find(x => x.name === distName);
          if (d) {
            setSelectedDist(d.code);
            fetchWards(d.code).then(wList => {
              setWards(wList);
              const w = wList.find(x => x.name === wardName);
              if (w) setSelectedWard(w.code);
            });
          }
        });
      }
    } else {
      setStreetAddress(addressStr);
    }
  };

  // Load promotions: Both Shop-specific vouchers AND Platform/System vouchers
  useEffect(() => {
    if (!cartToOrder.shopId) return;
    setLoadingPromos(true);

    Promise.all([
      // 1. Fetch Shop Promos
      fetch(`${API}/promotions/shop/${cartToOrder.shopId}/active`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => fetch(`${API}/promotions/shop/${cartToOrder.shopId}`).then(r => r.ok ? r.json() : []))
        .catch(() => []),
      // 2. Fetch Platform / System Promos
      fetch(`${API}/promotions/platform`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => fetch(`${API}/promotions/admin?scope=PLATFORM`).then(r => r.ok ? r.json() : []))
        .catch(() => [])
    ])
    .then(([shopData, platformData]) => {
      const activeShop = Array.isArray(shopData) ? shopData.filter(p => p.isActive !== false && p.approvalStatus !== 'REJECTED') : [];
      const activePlatform = Array.isArray(platformData) ? platformData.filter(p => p.isActive !== false && p.approvalStatus !== 'REJECTED') : [];
      
      setShopPromotions(activeShop);
      setPlatformPromotions(activePlatform);

      // Check if user previously claimed a shop voucher via the Welcome modal
      try {
        const saved = JSON.parse(localStorage.getItem('claimed_shop_vouchers') || '{}');
        const claimedCode = saved[cartToOrder.shopId];
        if (claimedCode) {
          const match = activeShop.find(p => p.code === claimedCode);
          if (match && subtotal >= Number(match.minOrderValue || 0)) {
            setSelectedShopPromo(match);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })
    .finally(() => setLoadingPromos(false));
  }, [cartToOrder.shopId, subtotal]);

  // Calculate discount amount for a given promotion
  const calculateSingleDiscount = (promo, currentSubtotal) => {
    if (!promo || currentSubtotal <= 0) return 0;

    // Minimum order check
    if (promo.minOrderValue && currentSubtotal < Number(promo.minOrderValue)) {
      return 0;
    }

    if (promo.promoType === 'PERCENT') {
      const pctDiscount = currentSubtotal * (Number(promo.discountValue) / 100);
      if (promo.maxDiscountAmount && promo.maxDiscountAmount > 0) {
        return Math.min(pctDiscount, Number(promo.maxDiscountAmount));
      }
      return pctDiscount;
    } else if (promo.promoType === 'FIXED_AMOUNT') {
      return Math.min(currentSubtotal, Number(promo.discountValue));
    } else if (promo.promoType === 'FREE_DELIVERY') {
      return deliveryFee;
    }

    return 0;
  };

  const shopDiscount = calculateSingleDiscount(selectedShopPromo, subtotal);
  const platformDiscount = calculateSingleDiscount(selectedPlatformPromo, subtotal);
  const totalDiscount = Math.min(subtotal, shopDiscount + platformDiscount);
  const totalAmount = Math.max(0, subtotal + deliveryFee - totalDiscount);

  // Toggle or Apply Shop Voucher
  const handleToggleShopVoucher = (promo) => {
    setPromoMessage(null);
    if (!promo || selectedShopPromo?.code === promo.code) {
      setSelectedShopPromo(null);
      return;
    }

    if (promo.minOrderValue && subtotal < Number(promo.minOrderValue)) {
      setPromoMessage({
        type: 'error',
        text: `Mã quán "${promo.code}" yêu cầu đơn tối thiểu từ ${Number(promo.minOrderValue).toLocaleString('vi-VN')}đ (Đơn hiện tại: ${subtotal.toLocaleString('vi-VN')}đ).`
      });
      return;
    }

    setSelectedShopPromo(promo);
    const disc = calculateSingleDiscount(promo, subtotal);
    setPromoMessage({
      type: 'success',
      text: `Áp dụng mã Quán "${promo.code}": Giảm ${disc.toLocaleString('vi-VN')}đ!`
    });
  };

  // Toggle or Apply Platform Voucher
  const handleTogglePlatformVoucher = (promo) => {
    setPromoMessage(null);
    if (!promo || selectedPlatformPromo?.code === promo.code) {
      setSelectedPlatformPromo(null);
      return;
    }

    if (promo.minOrderValue && subtotal < Number(promo.minOrderValue)) {
      setPromoMessage({
        type: 'error',
        text: `Mã hệ thống "${promo.code}" yêu cầu đơn tối thiểu từ ${Number(promo.minOrderValue).toLocaleString('vi-VN')}đ (Đơn hiện tại: ${subtotal.toLocaleString('vi-VN')}đ).`
      });
      return;
    }

    setSelectedPlatformPromo(promo);
    const disc = calculateSingleDiscount(promo, subtotal);
    setPromoMessage({
      type: 'success',
      text: `Áp dụng mã Toàn Sàn "${promo.code}": Giảm ${disc.toLocaleString('vi-VN')}đ!`
    });
  };

  // Custom code input validation
  const handleApplyCustomCode = () => {
    const code = customPromoCode.trim().toUpperCase();
    if (!code) return;

    // Check if it matches a shop promo
    const shopMatch = shopPromotions.find(p => p.code.toUpperCase() === code);
    if (shopMatch) {
      handleToggleShopVoucher(shopMatch);
      return;
    }

    // Check if it matches a platform promo
    const platformMatch = platformPromotions.find(p => p.code.toUpperCase() === code);
    if (platformMatch) {
      handleTogglePlatformVoucher(platformMatch);
      return;
    }

    // Validate via backend endpoint
    fetch(`${API}/promotions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        orderAmount: subtotal,
        userId: user?.id || null,
        shopId: cartToOrder.shopId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        const customPromoObj = {
          code,
          promoType: data.promoType,
          discountValue: data.discountValue,
          maxDiscountAmount: data.maxDiscountAmount,
          minOrderValue: data.minOrderValue,
        };

        if (data.scope === 'SHOP') {
          setSelectedShopPromo(customPromoObj);
        } else {
          setSelectedPlatformPromo(customPromoObj);
        }

        setPromoMessage({
          type: 'success',
          text: `Áp dụng mã "${code}" thành công: Giảm ${Number(data.discountAmount).toLocaleString('vi-VN')}đ!`
        });
      } else {
        setPromoMessage({
          type: 'error',
          text: data.message || `Mã "${code}" không hợp lệ hoặc chưa thỏa điều kiện.`
        });
      }
    })
    .catch(() => {
      setPromoMessage({
        type: 'error',
        text: `Mã "${code}" không hợp lệ hoặc không tồn tại.`
      });
    });
  };

  const handlePlaceOrder = async () => {
    setErrorMessage('');

    // 1. Mandatory Login Check
    if (!isAuthenticated) {
      setErrorMessage('Quý khách vui lòng đăng nhập trước khi tiến hành thanh toán đơn hàng!');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!selectedProv || !selectedDist || !selectedWard || !streetAddress) {
      setErrorMessage('Vui lòng chọn và nhập đầy đủ địa chỉ giao hàng!');
      return;
    }
    if (!fullName || !phone) {
      setErrorMessage('Vui lòng nhập họ tên và số điện thoại người nhận hàng!');
      return;
    }

    if (!cartToOrder || !cartToOrder.items || cartToOrder.items.length === 0) {
      setErrorMessage('Giỏ hàng của bạn đang trống. Vui lòng chọn món trước khi đặt!');
      return;
    }

    const pName = provinces.find(p => p.code == selectedProv)?.name || '';
    const dName = districts.find(d => d.code == selectedDist)?.name || '';
    const wName = wards.find(w => w.code == selectedWard)?.name || '';
    const fullAddress = `${streetAddress}, ${wName}, ${dName}, ${pName}`;

    setIsPlacingOrder(true);
    try {
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('fooddelivery_access_token');
      }

      const headers = { 
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const deliveryAddressMap = {
        fullAddress: fullAddress,
        recipientName: fullName,
        recipientPhone: phone,
        note: note || ''
      };

      const appliedCodes = [selectedShopPromo?.code, selectedPlatformPromo?.code].filter(Boolean).join(', ') || null;
      const appliedPromoId = selectedShopPromo?.id || selectedPlatformPromo?.id || null;

      const payload = {
        cartId: cartToOrder.id,
        deliveryAddress: deliveryAddressMap,
        paymentMethod: 'COD', // Locked to COD
        orderNote: note || '',
        idempotencyKey: idempotencyKey,
        promotionCode: appliedCodes,
        promotionId: appliedPromoId,
        discountAmount: totalDiscount || 0
      };

      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessOrder(data.data || data);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || 'Không thể tạo đơn hàng. Xin vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Order error:', err);
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau!');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalItems = cartToOrder.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  // Render require login screen if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
            <LockClosedIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Yêu cầu đăng nhập</h1>
            <p className="text-sm text-slate-600 mt-2">
              Để tiến hành đặt món, áp dụng mã giảm giá và lưu lịch sử giao hàng, vui lòng đăng nhập tài khoản của bạn.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/checkout"
              className="w-full py-3 px-6 bg-[#002B5E] hover:bg-[#001D40] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <UserIcon className="w-5 h-5" />
              Đăng nhập ngay
            </Link>
            <Link
              href="/cart"
              className="w-full py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <Link 
          href={successOrder ? '/order' : '/cart'} 
          className="inline-flex items-center gap-2 text-[#002B5E] hover:text-blue-900 transition-colors mb-6 font-bold text-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Quay lại {successOrder ? 'trang thực đơn' : 'giỏ hàng'}
        </Link>

        {successOrder ? (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Đặt hàng COD thành công!</h1>
            <p className="text-slate-500 mb-6">
              Mã đơn hàng: <strong className="text-slate-900 font-mono text-lg">{successOrder.orderCode}</strong>
            </p>

            <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left space-y-2.5 text-xs text-slate-700 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Chi tiết đơn hàng</h3>
              <p>Người nhận: <strong className="text-slate-900">{successOrder.customerName || fullName}</strong> ({successOrder.customerPhone || phone})</p>
              <p>Địa chỉ giao: <strong className="text-slate-900">{typeof successOrder.deliveryAddress === 'string' ? successOrder.deliveryAddress : (successOrder.deliveryAddress?.fullAddress || '')}</strong></p>
              <p>Hình thức: <strong className="text-emerald-700">Thanh toán khi nhận hàng (COD)</strong></p>
              {selectedShopPromo && (
                <p>Khuyến mãi Quán: <strong className="text-orange-600 font-mono">{selectedShopPromo.code}</strong> (Giảm {shopDiscount.toLocaleString('vi-VN')}đ)</p>
              )}
              {selectedPlatformPromo && (
                <p>Khuyến mãi Sàn / Hệ Thống: <strong className="text-purple-700 font-mono">{selectedPlatformPromo.code}</strong> (Giảm {platformDiscount.toLocaleString('vi-VN')}đ)</p>
              )}
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-bold">
                <span>Số tiền thanh toán khi nhận hàng:</span>
                <span className="text-red-600 text-lg">{Number(successOrder.totalAmount || totalAmount).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href={`/tracking?orderCode=${successOrder.orderCode || ''}`} 
                className="px-8 py-3 bg-[#002B5E] hover:bg-[#001D40] text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                Theo dõi đơn hàng
              </Link>
              <Link 
                href="/order" 
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">Thanh toán đơn hàng</h1>
                <p className="text-xs text-slate-500 mt-1">Vui lòng kiểm tra địa chỉ giao nhận và khuyến mãi trước khi xác nhận đặt món.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheckIcon className="w-4 h-4" />
                Giao hàng COD an toàn
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
              {/* Left Column: Delivery Info, COD Payment */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Delivery Info Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-[#002B5E]" />
                      Thông tin nhận hàng
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">Tài khoản: <b>{user?.fullName || user?.name || 'Khách hàng'}</b></span>
                  </div>

                  {/* Saved addresses selector */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Chọn từ sổ địa chỉ đã lưu:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              parseAndFillAddress(addr.addressLine || '');
                            }}
                            className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                              selectedAddressId === addr.id 
                                ? 'border-[#002B5E] bg-blue-50/50 text-[#002B5E] font-semibold' 
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="block font-bold">{addr.isDefault ? '⭐ Mặc định' : 'Địa chỉ đã lưu'}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{addr.addressLine}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Họ tên người nhận *:</label>
                      <input 
                        type="text" 
                        placeholder="Họ và tên *" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002B5E] focus:bg-white transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại nhận hàng *:</label>
                      <input 
                        type="tel" 
                        placeholder="Số điện thoại *" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002B5E] focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email:</label>
                    <input 
                      type="email" 
                      placeholder="Email nhận thông báo đơn hàng" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002B5E] focus:bg-white transition-colors" 
                    />
                  </div>

                  {/* Province / District / Ward Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tỉnh / Thành phố *:</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#002B5E] appearance-none" 
                          value={selectedProv} 
                          onChange={e => setSelectedProv(e.target.value)}
                        >
                          <option value="">Chọn Tỉnh/Thành</option>
                          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quận / Huyện *:</label>
                      <div className="relative">
                        <select 
                          disabled={!selectedProv} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#002B5E] appearance-none disabled:opacity-50" 
                          value={selectedDist} 
                          onChange={e => setSelectedDist(e.target.value)}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phường / Xã *:</label>
                      <div className="relative">
                        <select 
                          disabled={!selectedDist} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#002B5E] appearance-none disabled:opacity-50" 
                          value={selectedWard} 
                          onChange={e => setSelectedWard(e.target.value)}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi tiết (Số nhà, tên đường, số phòng/tòa nhà) *:</label>
                    <input 
                      type="text" 
                      placeholder="VD: Căn hộ S5.02 Tầng 12, Tòa S5 Vinhomes Grand Park" 
                      value={streetAddress}
                      onChange={e => setStreetAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002B5E] focus:bg-white transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cho tài xế giao hàng:</label>
                    <textarea 
                      placeholder="VD: Giao trước sảnh lễ tân hoặc bấm chuông gọi trước khi tới..." 
                      rows="2" 
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#002B5E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Payment Method - Locked to COD */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                      Phương thức thanh toán
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      COD Tiền Mặt
                    </span>
                  </div>

                  <div className="p-4 border-2 border-emerald-500 bg-emerald-50/50 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <BanknotesIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Thanh toán khi nhận món (COD - Cash On Delivery)</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bạn sẽ thanh toán số tiền cho shipper khi nhận được đúng và đủ món ăn. An toàn 100%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Vouchers & Order Summary */}
              <div className="w-full lg:w-[480px] space-y-6">
                
                {/* Vouchers & Promotions Box with 2 Categories */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-purple-600" />
                        Mã Khuyến Mãi & Giảm Giá
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Áp dụng đồng thời mã Quán và mã Sàn nếu đủ điều kiện</p>
                    </div>
                    {(selectedShopPromo || selectedPlatformPromo) && (
                      <button 
                        onClick={() => {
                          setSelectedShopPromo(null);
                          setSelectedPlatformPromo(null);
                          setPromoMessage(null);
                        }} 
                        className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Bỏ chọn tất cả
                      </button>
                    )}
                  </div>

                  {/* Voucher Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã voucher (Quán hoặc Sàn)..."
                      value={customPromoCode}
                      onChange={e => setCustomPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase outline-none focus:border-purple-600 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomCode}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>

                  {/* Feedback Message */}
                  {promoMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      promoMessage.type === 'success' 
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                      {promoMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
                      )}
                      <span>{promoMessage.text}</span>
                    </div>
                  )}

                  {/* Tab switchers */}
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPromoTab('ALL')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        promoTab === 'ALL' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({shopPromotions.length + platformPromotions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoTab('SHOP')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                        promoTab === 'SHOP' 
                          ? 'bg-white text-orange-600 shadow-2xs' 
                          : 'text-slate-600 hover:text-orange-600'
                      }`}
                    >
                      <span>🏪 Quán</span>
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded-full">
                        {shopPromotions.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoTab('PLATFORM')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                        promoTab === 'PLATFORM' 
                          ? 'bg-white text-blue-600 shadow-2xs' 
                          : 'text-slate-600 hover:text-blue-600'
                      }`}
                    >
                      <span>🌐 Hệ Thống</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full">
                        {platformPromotions.length}
                      </span>
                    </button>
                  </div>

                  {/* Vouchers Container */}
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {loadingPromos ? (
                      <div className="py-8 text-center text-xs text-slate-400 italic">
                        Đang tải danh sách ưu đãi...
                      </div>
                    ) : (
                      <>
                        {/* CATEGORY 1: SHOP VOUCHERS */}
                        {(promoTab === 'ALL' || promoTab === 'SHOP') && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-orange-700 flex items-center gap-1.5 uppercase tracking-wide">
                                🏪 Khuyến Mãi Từ Quán ({shopPromotions.length})
                              </span>
                              {selectedShopPromo && (
                                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Đã chọn: {selectedShopPromo.code}
                                </span>
                              )}
                            </div>

                            {shopPromotions.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                                Quán hiện chưa phát hành voucher độc quyền.
                              </p>
                            ) : (
                              shopPromotions.map((promo) => {
                                const isSelected = selectedShopPromo?.code === promo.code;
                                const isEligible = subtotal >= Number(promo.minOrderValue || 0);
                                const neededMore = Number(promo.minOrderValue || 0) - subtotal;

                                const discountLabel = promo.promoType === 'PERCENT'
                                  ? `Giảm ${promo.discountValue}%`
                                  : promo.promoType === 'FREE_DELIVERY'
                                  ? 'Freeship'
                                  : `Giảm ${Number(promo.discountValue).toLocaleString('vi-VN')}đ`;

                                return (
                                  <div
                                    key={promo.id || promo.code}
                                    onClick={() => isEligible && handleToggleShopVoucher(promo)}
                                    className={`p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                                      isSelected 
                                        ? 'border-orange-500 bg-orange-50/70 shadow-2xs ring-1 ring-orange-400' 
                                        : isEligible 
                                        ? 'border-amber-200 hover:border-orange-400 bg-white cursor-pointer hover:shadow-2xs' 
                                        : 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
                                    }`}
                                  >
                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-xs tracking-wider shrink-0 border border-orange-200">
                                          {promo.code}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-900 truncate">
                                          {discountLabel} {promo.maxDiscountAmount ? `(Tối đa ${Number(promo.maxDiscountAmount).toLocaleString('vi-VN')}đ)` : ''}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500">
                                        Đơn tối thiểu: <b>{Number(promo.minOrderValue || 0).toLocaleString('vi-VN')}đ</b>
                                        {!isEligible && neededMore > 0 && (
                                          <span className="text-amber-700 font-semibold block text-[10px]">
                                            (Mua thêm {neededMore.toLocaleString('vi-VN')}đ để dùng)
                                          </span>
                                        )}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      disabled={!isEligible}
                                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                                        isSelected 
                                          ? 'bg-orange-600 text-white shadow-xs' 
                                          : isEligible 
                                          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' 
                                          : 'bg-slate-200 text-slate-400'
                                      }`}
                                    >
                                      {isSelected ? 'Đang dùng' : 'Chọn'}
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                        {/* CATEGORY 2: PLATFORM / SYSTEM VOUCHERS */}
                        {(promoTab === 'ALL' || promoTab === 'PLATFORM') && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-blue-700 flex items-center gap-1.5 uppercase tracking-wide">
                                🌐 Khuyến Mãi Toàn Sàn / Hệ Thống ({platformPromotions.length})
                              </span>
                              {selectedPlatformPromo && (
                                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Đã chọn: {selectedPlatformPromo.code}
                                </span>
                              )}
                            </div>

                            {platformPromotions.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                                Không có mã khuyến mãi sàn nào khả dụng lúc này.
                              </p>
                            ) : (
                              platformPromotions.map((promo) => {
                                const isSelected = selectedPlatformPromo?.code === promo.code;
                                const isEligible = subtotal >= Number(promo.minOrderValue || 0);
                                const neededMore = Number(promo.minOrderValue || 0) - subtotal;

                                const discountLabel = promo.promoType === 'PERCENT'
                                  ? `Giảm ${promo.discountValue}%`
                                  : promo.promoType === 'FREE_DELIVERY'
                                  ? 'Freeship Toàn Sàn'
                                  : `Giảm ${Number(promo.discountValue).toLocaleString('vi-VN')}đ`;

                                return (
                                  <div
                                    key={promo.id || promo.code}
                                    onClick={() => isEligible && handleTogglePlatformVoucher(promo)}
                                    className={`p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                                      isSelected 
                                        ? 'border-blue-500 bg-blue-50/70 shadow-2xs ring-1 ring-blue-400' 
                                        : isEligible 
                                        ? 'border-blue-200 hover:border-blue-400 bg-white cursor-pointer hover:shadow-2xs' 
                                        : 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
                                    }`}
                                  >
                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs tracking-wider shrink-0 border border-blue-200">
                                          {promo.code}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-900 truncate">
                                          {discountLabel} {promo.maxDiscountAmount ? `(Tối đa ${Number(promo.maxDiscountAmount).toLocaleString('vi-VN')}đ)` : ''}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500">
                                        Đơn tối thiểu: <b>{Number(promo.minOrderValue || 0).toLocaleString('vi-VN')}đ</b>
                                        {!isEligible && neededMore > 0 && (
                                          <span className="text-amber-700 font-semibold block text-[10px]">
                                            (Mua thêm {neededMore.toLocaleString('vi-VN')}đ để dùng)
                                          </span>
                                        )}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      disabled={!isEligible}
                                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white shadow-xs' 
                                          : isEligible 
                                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                                          : 'bg-slate-200 text-slate-400'
                                      }`}
                                    >
                                      {isSelected ? 'Đang dùng' : 'Chọn'}
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Summary Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900">Chi tiết giỏ hàng ({totalItems} món)</h2>
                    <span className="text-xs font-semibold text-slate-500">{cartToOrder.shopName || 'Gian hàng'}</span>
                  </div>
                  
                  {/* Cart items list */}
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {cartToOrder.items?.map(item => (
                      <div key={item.id} className="py-2.5 flex gap-3 text-xs items-start">
                        <div className="relative w-12 h-12 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img 
                            src={item.imageUrl || '/hc-assets/1_1.jpg'} 
                            alt={item.itemName}
                            className="w-full h-full object-cover" 
                            onError={e => e.currentTarget.src = '/hc-assets/1_1.jpg'} 
                          />
                          <span className="absolute bottom-0 right-0 bg-[#002B5E] text-white text-[10px] px-1 font-bold rounded-tl">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-800 truncate">{item.itemName}</span>
                            <span className="font-bold text-slate-900 shrink-0">{Number(item.totalPrice).toLocaleString('vi-VN')} đ</span>
                          </div>
                          {item.selectedOptions?.length > 0 && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.selectedOptions.map(o => `${o.group}: ${o.option}`).join(' · ')}
                            </p>
                          )}
                          {item.itemNote && (
                            <p className="text-[10px] text-amber-700 italic">Ghi chú: {item.itemNote}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Calculations */}
                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Tạm tính tiền món:</span>
                      <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Phí giao hàng:</span>
                      <span className="font-semibold text-slate-900">{deliveryFee.toLocaleString('vi-VN')} đ</span>
                    </div>

                    {/* Shop Discount Breakdown */}
                    {shopDiscount > 0 && (
                      <div className="flex justify-between items-center text-orange-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <SparklesIcon className="w-4 h-4" />
                          Giảm giá Quán ({selectedShopPromo?.code}):
                        </span>
                        <span>- {shopDiscount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    {/* Platform Discount Breakdown */}
                    {platformDiscount > 0 && (
                      <div className="flex justify-between items-center text-purple-700 font-semibold">
                        <span className="flex items-center gap-1">
                          <SparklesIcon className="w-4 h-4" />
                          Giảm giá Hệ Thống ({selectedPlatformPromo?.code}):
                        </span>
                        <span>- {platformDiscount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    {/* Total Savings */}
                    {totalDiscount > 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex justify-between items-center text-[11px] text-emerald-800 font-bold">
                        <span>Tiết kiệm được:</span>
                        <span>- {totalDiscount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 flex justify-between items-end">
                      <div>
                        <span className="block font-bold text-slate-900 text-sm">Tổng thanh toán COD:</span>
                        <span className="text-[10px] text-slate-400">Đã bao gồm thuế và các phí liên quan</span>
                      </div>
                      <span className="text-2xl font-black text-red-600 leading-none">
                        {totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || totalItems === 0}
                    className="w-full py-3.5 bg-[#002B5E] hover:bg-[#001D40] text-white rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm uppercase"
                  >
                    {isPlacingOrder ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ĐANG XỬ LÝ ĐẶT HÀNG...
                      </div>
                    ) : (
                      'XÁC NHẬN ĐẶT HÀNG (COD)'
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                    <span>Chống trùng đơn: Khóa phiên {idempotencyKey.slice(-6)}</span>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
