'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  CreditCardIcon, 
  SparklesIcon, 
  TrashIcon,
  TicketIcon,
  ArrowRightIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/solid';

const MOCK_CART = [
  {
    id: 1,
    ma_san_pham: 'P1',
    ten_san_pham: 'Phin Sữa Đá',
    gia_ban: 29000,
    hinh_anh_url: 'https://highlandscoffee.com.vn/vnt_upload/product/04_2023/Phin_Sua_Da_VN.png',
    so_luong: 2,
    size: 'M'
  },
  {
    id: 2,
    ma_san_pham: 'P2',
    ten_san_pham: 'Trà Sen Vàng',
    gia_ban: 45000,
    hinh_anh_url: 'https://highlandscoffee.com.vn/vnt_upload/product/06_2023/TSV_CN.png',
    so_luong: 1,
    size: 'S'
  }
];

export default function CartPage() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(MOCK_CART);
  const total = cart.reduce((acc, item) => acc + item.gia_ban * item.so_luong, 0);

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQ = Math.max(1, item.so_luong + delta);
        return { ...item, so_luong: newQ };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div className="w-full bg-[#faf7f4] min-h-screen py-8 sm:py-12 px-4 md:px-8">
      <div className="max-w-[1240px] mx-auto">
        {/* Breadcrumb */}
        <nav className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Trang chủ</Link>
          <span className="text-gray-300">&gt;</span>
          <span className="text-gray-800">{step === 1 ? 'Giỏ hàng' : 'Thanh toán'}</span>
        </nav>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold uppercase text-[#1a1a1a] tracking-tight font-serif leading-none">
              {step === 1 ? 'Giỏ hàng của bạn' : 'Thông tin thanh toán'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-2">
              {step === 1 
                ? `Bạn đang có ${cart.reduce((s, i) => s + i.so_luong, 0)} món đồ uống & bánh trong giỏ` 
                : 'Hoàn tất địa chỉ và chọn phương thức thanh toán phù hợp'}
            </p>
          </div>
        </div>

        {/* STEP STEPPER HEADER */}
        <div className="mb-8 bg-white rounded-[24px] p-4 sm:p-6 border border-[#e8e2da] shadow-sm">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-amber-500 transition-all duration-500 ease-out" 
                style={{ width: step === 1 ? '0%' : '50%' }}
              />
            </div>

            {/* Step 1 */}
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="flex flex-col items-center gap-2 relative z-10 group cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 shadow-sm ${
                step >= 1 ? 'bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/15' : 'bg-gray-100 text-gray-400'
              }`}>
                <ShoppingBagIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
                1. Giỏ hàng
              </span>
            </button>

            {/* Step 2 */}
            <button 
              type="button"
              onClick={() => cart.length > 0 && setStep(2)}
              disabled={cart.length === 0}
              className="flex flex-col items-center gap-2 relative z-10 group cursor-pointer disabled:cursor-not-allowed"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 shadow-sm ${
                step >= 2 ? 'bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/15' : 'bg-gray-100 text-gray-400'
              }`}>
                <CreditCardIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${step >= 2 ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
                2. Thanh toán
              </span>
            </button>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-extrabold text-sm shadow-sm">
                <SparklesIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-400">
                3. Hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* FREESHIP & PRIVILEGE PROGRESS BAR */}
        <div className="mb-8 bg-gradient-to-r from-yellow-50 via-white to-yellow-50 text-[var(--color-primary-dark)] rounded-[24px] p-5 sm:p-6 shadow-sm border border-yellow-200/80 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-100/60 text-[var(--color-primary-dark)] flex items-center justify-center shrink-0 border border-yellow-200 text-xs font-black tracking-wider uppercase">
                FREE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-yellow-950">
                    Đặc quyền Freeship hạng Thành viên
                  </h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-100 text-yellow-900 rounded-full border border-yellow-200/80">VIP</span>
                </div>
                <p className="text-xs font-semibold text-yellow-900/90 mt-1">
                  Đơn từ 100.000đ sẽ nhận ưu đãi Freeship 15.000đ
                </p>
              </div>
            </div>
            <div className="w-full sm:w-56 shrink-0 space-y-1.5 bg-white/80 p-3 rounded-2xl border border-amber-200/80 shadow-sm">
              <div className="flex justify-between text-[11px] font-bold text-yellow-900">
                <span>Tiến trình Freeship</span>
                <span className="text-emerald-700 font-black">{Math.min(100, Math.round((total / 100000) * 100))}%</span>
              </div>
              <div className="h-2.5 w-full bg-yellow-100 rounded-full overflow-hidden border border-yellow-200">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (total / 100000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái */}
          <div className="lg:col-span-7 xl:col-span-8">
            {step === 1 ? (
              <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[#e8e2da] shadow-sm space-y-6">
                {cart.length === 0 ? (
                  <div className="py-20 text-center">
                    <h3 className="text-xl font-bold text-gray-800 font-serif mb-2">Giỏ hàng của bạn đang trống</h3>
                    <p className="text-gray-500 text-sm mb-6">Hãy khám phá thực đơn cà phê thơm nồng & bánh tươi ra lò nhé!</p>
                    <Link href="/order" className="px-8 py-3.5 bg-[var(--color-primary)] text-white font-extrabold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--color-primary-dark)] transition-all shadow-md">
                      Khám phá Thực đơn
                    </Link>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={item.id} className={`flex flex-col sm:flex-row gap-5 items-start relative ${idx < cart.length - 1 ? 'pb-6 border-b border-gray-100' : ''}`}>
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#f4f0eb] rounded-[20px] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#e8e2da] shadow-inner group">
                        <img src={item.hinh_anh_url} className="w-[80%] h-[80%] object-contain group-hover:scale-105 transition-transform duration-300" alt={item.ten_san_pham} loading="lazy" />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-between pr-0 sm:pr-24 h-full min-h-[7rem]">
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-base sm:text-lg text-[#1a1a1a] leading-tight truncate">{item.ten_san_pham}</h4>
                          <div className="flex flex-wrap gap-1.5 text-xs text-gray-600 font-semibold mt-1">
                            <span className="px-2.5 py-0.5 bg-[#fdf8f3] text-[var(--color-primary-dark)] border border-[#f3e5d8] rounded-full text-[11px] font-bold">
                              Size {item.size}
                            </span>
                          </div>
                          <button type="button" className="mt-2 inline-flex items-center gap-1.5 text-[var(--color-primary-dark)] font-extrabold text-xs hover:underline w-fit bg-[var(--color-primary-dark)]/5 px-2.5 py-1 rounded-lg border border-[var(--color-primary-dark)]/15">
                            <PencilIcon className="w-3.5 h-3.5" /> Chỉnh sửa tùy chọn
                          </button>
                        </div>
                        <div className="mt-3">
                          <p className="text-[#1a1a1a] font-black text-xl">{Number(item.gia_ban).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto sm:absolute sm:right-0 sm:top-0 sm:h-full flex sm:flex-col justify-between items-center sm:items-end py-1 mt-2 sm:mt-0 pt-3 sm:pt-1 border-t sm:border-t-0 border-gray-100">
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-yellow-600 transition-colors p-2 rounded-full hover:bg-yellow-50">
                          <TrashIcon className="h-5 w-5 stroke-[2]" />
                        </button>
                        <div className="flex items-center justify-between bg-[#faf7f4] border border-gray-200 rounded-full py-1.5 px-3 w-[100px] sm:w-[110px] shadow-sm select-none mt-auto">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-white text-gray-600 hover:text-[var(--color-primary)] font-extrabold text-[15px] flex items-center justify-center shadow-sm">-</button>
                          <span className="text-sm font-black text-gray-800">{item.so_luong}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-white text-gray-600 hover:text-[var(--color-primary)] font-extrabold text-[15px] flex items-center justify-center shadow-sm">+</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[#e8e2da] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-gray-800 font-serif mb-4">Thông tin giao hàng</h3>
                <div className="bg-[#faf7f4] p-5 rounded-2xl border border-gray-200">
                  <div className="flex items-start gap-4">
                    <MapPinIcon className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                    <div className="w-full">
                      <h4 className="font-bold text-gray-800 mb-1">Giao tận nơi</h4>
                      <input type="text" placeholder="Nhập địa chỉ nhận hàng của bạn..." className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all mt-2" />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <input type="text" placeholder="Tên người nhận" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]" />
                        <input type="text" placeholder="Số điện thoại" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]" />
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 font-serif mb-4 mt-8">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {['Thanh toán qua VNPAY', 'Tiền mặt khi nhận hàng (COD)', 'Thanh toán qua MoMo'].map((pt, i) => (
                    <label key={i} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                      <input type="radio" name="payment" className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" defaultChecked={i===0} />
                      <span className="font-bold text-gray-700">{pt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-[24px] p-6 border border-[#e8e2da] shadow-sm sticky top-28 space-y-6">
              <h2 className="text-lg font-bold text-[#1a1a1a] tracking-wide border-b border-gray-100 pb-3">
                Tổng cộng giỏ hàng
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-[15px]">
                  <span className="text-gray-500 font-medium">Tạm tính ({cart.length} món)</span>
                  <span className="font-bold text-[#1a1a1a]">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                
                {step === 2 && (
                  <div className="flex justify-between text-[15px]">
                    <span className="text-gray-500 font-medium">Phí giao hàng</span>
                    <span className="font-bold text-[#1a1a1a]">15.000đ</span>
                  </div>
                )}
                
                <div className="flex justify-between text-[15px]">
                  <span className="text-gray-500 font-medium">Giảm giá</span>
                  <span className="font-bold text-emerald-600">-0đ</span>
                </div>
              </div>

              {/* Voucher section */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <TicketIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Mã giảm giá" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] uppercase"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-[var(--color-primary)] text-white font-bold text-sm rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors">
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-base font-extrabold text-gray-800">Tổng thanh toán</span>
                  <div className="text-right">
                    <span className="text-2xl lg:text-3xl font-black text-[var(--color-primary)] block leading-none">
                      {(step === 1 ? total : total + 15000).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">(Đã bao gồm VAT)</span>
                  </div>
                </div>
              </div>

              {step === 1 ? (
                <button 
                  onClick={() => setStep(2)}
                  disabled={cart.length === 0}
                  className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed group"
                >
                  Thanh toán ngay
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  disabled={cart.length === 0}
                  className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Xác nhận đặt hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
