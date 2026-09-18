'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPinIcon, CreditCardIcon, BanknotesIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const MOCK_CART = [
  { id: 1, ten_san_pham: 'Phin Sữa Đá', gia_ban: 29000, quantity: 2 },
  { id: 2, ten_san_pham: 'Trà Sen Vàng', gia_ban: 45000, quantity: 1 }
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const total = MOCK_CART.reduce((acc, item) => acc + item.gia_ban * item.quantity, 0);
  const shippingFee = 15000;

  return (
    <div className="bg-[#f9f4ec] min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-hc-red)] transition-colors mb-6 font-bold">
          <ChevronLeftIcon className="w-5 h-5" />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-3xl font-extrabold text-[#333] mb-8 uppercase border-b border-gray-200 pb-4">Thanh toán</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Form */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <MapPinIcon className="w-6 h-6 text-[var(--color-hc-red)]" />
                <h2 className="text-xl font-bold text-[#333]">Thông tin giao hàng</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Họ và tên" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-hc-red)] transition-colors" />
                <input type="tel" placeholder="Số điện thoại" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-hc-red)] transition-colors" />
              </div>
              <input type="text" placeholder="Địa chỉ nhận hàng chi tiết" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-hc-red)] transition-colors mb-4" />
              <textarea placeholder="Ghi chú thêm cho shipper (không bắt buộc)" rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-hc-red)] transition-colors"></textarea>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CreditCardIcon className="w-6 h-6 text-[var(--color-hc-red)]" />
                <h2 className="text-xl font-bold text-[#333]">Phương thức thanh toán</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[var(--color-hc-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-[var(--color-hc-red)]" />
                  <BanknotesIcon className="w-6 h-6 text-gray-500" />
                  <span className="font-bold text-[#333]">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'ZALOPAY' ? 'border-[var(--color-hc-red)] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="ZALOPAY" checked={paymentMethod === 'ZALOPAY'} onChange={() => setPaymentMethod('ZALOPAY')} className="w-5 h-5 text-[var(--color-hc-red)]" />
                  <img src="https://zalopay.vn/images/logo/ZaloPay-logo-blue.svg" alt="ZaloPay" className="h-6 w-auto" />
                  <span className="font-bold text-[#333]">Thanh toán qua ví ZaloPay</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm sticky top-[110px]">
              <h2 className="text-xl font-bold text-[#333] mb-6">Đơn hàng của bạn</h2>
              
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 mb-6">
                {MOCK_CART.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-700">{item.quantity} x {item.ten_san_pham}</span>
                    <span className="font-semibold text-[#333]">{(item.gia_ban * item.quantity).toLocaleString('vi-VN')} đ</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-4 text-gray-600 text-sm">
                <span>Tạm tính</span>
                <span className="font-bold text-[#333]">{total.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-gray-600 text-sm border-b border-gray-100 pb-6">
                <span>Phí giao hàng</span>
                <span className="font-bold text-[#333]">{shippingFee.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-[#333] uppercase">Tổng cộng</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-[var(--color-hc-red)] block leading-none">{(total + shippingFee).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <button 
                className="w-full h-14 bg-[var(--color-hc-red)] text-white rounded-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#a30f28] transition-colors shadow-md"
              >
                ĐẶT HÀNG NGAY
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
