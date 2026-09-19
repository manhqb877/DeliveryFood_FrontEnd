'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/lib/location';
import { 
  MapPinIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  ChevronLeftIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const API = 'http://localhost:8080/api/v1';

export default function CheckoutPage() {
  const router = useRouter();
  const { carts, totalAmount } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

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
  
  const [loadingAddr, setLoadingAddr] = useState(false);

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

  // Load saved address
  useEffect(() => {
    if (isAuthenticated && provinces.length > 0) {
      setLoadingAddr(true);
      authService.getAddresses()
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data || []);
          if (list.length > 0) {
            const def = list.find(a => a.isDefault) || list[0];
            const addressStr = def.addressLine || ''; 
            
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
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAddr(false));
    }
  }, [isAuthenticated, provinces.length]);

  const handlePlaceOrder = async () => {
    if (!selectedProv || !selectedDist || !selectedWard || !streetAddress) {
      alert("Vui lòng chọn và nhập đầy đủ địa chỉ giao hàng!");
      return;
    }
    if (!fullName || !phone) {
      alert("Vui lòng nhập tên và số điện thoại người nhận!");
      return;
    }

    const cartToOrder = carts.find(c => c.items?.length > 0);
    if (!cartToOrder) {
      alert("Giỏ hàng trống!");
      return;
    }

    const pName = provinces.find(p => p.code == selectedProv)?.name || '';
    const dName = districts.find(d => d.code == selectedDist)?.name || '';
    const wName = wards.find(w => w.code == selectedWard)?.name || '';
    const fullAddress = `${streetAddress}, ${wName}, ${dName}, ${pName}`;

    setIsPlacingOrder(true);
    try {
      let token = null;
      let guestId = null;

      if (typeof window !== 'undefined') {
        token = localStorage.getItem('fooddelivery_access_token');
        guestId = localStorage.getItem('befood_guest_session_id');
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (guestId) {
        headers['X-Guest-Session-Id'] = guestId;
      }

      const deliveryAddressMap = {
        fullAddress: fullAddress,
        recipientName: fullName,
        recipientPhone: phone,
        note: note || ''
      };

      const payload = {
        cartId: cartToOrder.id,
        deliveryAddress: deliveryAddressMap,
        paymentMethod: paymentMethod, // 'COD' or 'ONLINE'
        orderNote: note || ''
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
        alert(`Lỗi đặt hàng: ${errorData.message || 'Xin thử lại sau'}`);
      }
    } catch (err) {
      console.error("Order error", err);
      alert('Không thể kết nối đến máy chủ để đặt hàng!');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalItems = carts.reduce((sum, c) => sum + (c.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);
  const cartToRender = carts.find(c => c.items?.length > 0) || { items: [] };

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <Link href="/cart" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors mb-6 font-bold">
          <ChevronLeftIcon className="w-5 h-5" />
          Quay lại {successOrder ? 'trang chủ' : 'giỏ hàng'}
        </Link>

        {successOrder ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-500 mb-8">Mã đơn hàng của bạn là: <strong className="text-gray-900">{successOrder.orderCode}</strong></p>
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Thông tin giao hàng</h3>
              <p className="text-sm text-gray-600 mb-2">Người nhận: <strong>{successOrder.customerName}</strong> - {successOrder.customerPhone}</p>
              <p className="text-sm text-gray-600 mb-2">Địa chỉ: <strong>{typeof successOrder.deliveryAddress === 'string' ? successOrder.deliveryAddress : (successOrder.deliveryAddress?.fullAddress || '')}</strong></p>
              <p className="text-sm text-gray-600">Tổng thanh toán: <strong className="text-red-600 text-lg">{Number(successOrder.totalAmount).toLocaleString('vi-VN')}đ</strong></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/tracking?orderCode=${successOrder.orderCode || ''}`} className="px-8 py-3 bg-[#FECD00] hover:bg-[#FECD00]/80 text-[#002B5E] font-bold rounded-full transition-colors">
                Theo dõi tiến trình
              </Link>
              <Link href="/order" className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-colors">
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        ) : (
          <>
          <h1 className="text-3xl font-extrabold text-[var(--color-primary-dark)] mb-8 pb-4">Thanh toán</h1>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Left Column: Form */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Delivery Info */}
            <div className="bg-white">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-bold text-[#333]">Thông tin nhận hàng</h2>
                {!isAuthenticated && (
                  <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Đăng nhập
                  </Link>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Họ và tên người nhận *" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-sm px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors" 
                />
                <input 
                  type="tel" 
                  placeholder="Số điện thoại *" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-sm px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors" 
                />
              </div>
              <div className="mb-4">
                <input 
                  type="email" 
                  placeholder="Địa chỉ Email (không bắt buộc)" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-sm px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors" 
                />
              </div>

              {loadingAddr && <div className="text-xs text-[var(--color-primary)] italic mb-2">Đang tải địa chỉ...</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="relative">
                  <select className="w-full bg-gray-50 border border-gray-300 rounded-sm px-3 py-3 outline-none focus:border-[var(--color-primary)] appearance-none" value={selectedProv} onChange={e => setSelectedProv(e.target.value)}>
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                  <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select disabled={!selectedProv} className="w-full bg-gray-50 border border-gray-300 rounded-sm px-3 py-3 outline-none focus:border-[var(--color-primary)] appearance-none disabled:opacity-50" value={selectedDist} onChange={e => setSelectedDist(e.target.value)}>
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                  <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select disabled={!selectedDist} className="w-full bg-gray-50 border border-gray-300 rounded-sm px-3 py-3 outline-none focus:border-[var(--color-primary)] appearance-none disabled:opacity-50" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                  <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Địa chỉ nhận hàng chi tiết (Tên đường, số nhà)" 
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-sm px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors mb-4" 
              />
              <textarea 
                placeholder="Ghi chú thêm cho shipper (không bắt buộc)" 
                rows="3" 
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-sm px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white mt-4">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-bold text-[#333]">Thanh toán</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[var(--color-primary)] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 accent-[var(--color-primary)]" />
                  <BanknotesIcon className="w-6 h-6 text-[#14569f]" />
                  <span className="font-medium text-[#333]">Thanh toán khi giao hàng (COD)</span>
                </label>
                <label className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-[var(--color-primary)] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} className="w-5 h-5 accent-[var(--color-primary)]" />
                  <CreditCardIcon className="w-6 h-6 text-[#14569f]" />
                  <span className="font-medium text-[#333]">Thanh toán qua ví ZaloPay / VNPay</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-[#fafafa] border border-gray-200 rounded-sm p-6">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#333]">Đơn hàng ({totalItems} sản phẩm)</h2>
              </div>
              
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 mb-6">
                {cartToRender.items.map(item => (
                  <div key={item.id} className="flex gap-4 text-sm items-start">
                    <div className="relative w-16 h-16 shrink-0 bg-white border border-gray-200 rounded overflow-hidden">
                      <img src={item.imageUrl || '/hc-assets/1_1.jpg'} className="w-full h-full object-contain" onError={e => e.currentTarget.src = '/hc-assets/1_1.jpg'} />
                      <span className="absolute -top-2 -right-2 bg-[#14569f] text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[#333] leading-snug">{item.itemName}</span>
                        <span className="text-[#333] shrink-0">{Number(item.totalPrice).toLocaleString('vi-VN')} đ</span>
                      </div>
                      {item.selectedOptions?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{item.selectedOptions.map(o => `${o.group}: ${o.option}`).join(' · ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-4 text-[#333] text-sm">
                <span>Tạm tính</span>
                <span>{Number(totalAmount).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-[#333] text-sm border-b border-gray-200 pb-6">
                <span>Phí vận chuyển</span>
                <span>-</span>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-[#333]">Tổng cộng</span>
                <span className="text-2xl font-bold text-[#0089cf] block leading-none">{Number(totalAmount).toLocaleString('vi-VN')} đ</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || totalItems === 0}
                className="w-full h-12 bg-[#337ab7] text-white rounded-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#286090] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isPlacingOrder ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ĐANG XỬ LÝ...
                  </div>
                ) : (
                  'ĐẶT HÀNG'
                )}
              </button>
            </div>
          </div>

        </div>
      </>
    )}
  </div>
</div>
  );
}
