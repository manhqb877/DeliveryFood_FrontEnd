'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotView, setShowForgotView] = useState(false);

  return (
    <div className="flex flex-col w-full bg-white min-h-screen">
      
      {/* Breadcrumb */}
      <div className="bg-[#f5f5f5] py-2 px-4 text-[13px] text-gray-500 w-full">
        <div className="mx-auto max-w-[1380px] px-4 md:px-6">
          <Link href="/" className="hover:text-[var(--color-primary-dark)]">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">
            {showForgotView ? 'Khôi phục mật khẩu' : isLoginView ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản'}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 mx-auto w-full max-w-[520px] px-4 md:px-6 py-10">
        <h1 className="text-center text-[22px] font-medium uppercase text-[#333] mb-1">
          {showForgotView ? 'KHÔI PHỤC MẬT KHẨU' : isLoginView ? 'ĐĂNG NHẬP TÀI KHOẢN' : 'ĐĂNG KÝ TÀI KHOẢN'}
        </h1>

        <div className="text-center text-[13px] text-gray-600 mb-8">
          {showForgotView ? (
            <span>Quay lại <button onClick={() => setShowForgotView(false)} className="text-[#337ab7] hover:underline font-bold">đăng nhập</button></span>
          ) : isLoginView ? (
            <span>Bạn chưa có tài khoản ? <button onClick={() => setIsLoginView(false)} className="text-[#333] font-bold border-b border-[#333]">Đăng ký tại đây</button></span>
          ) : (
            <span>Đã có tài khoản? <button onClick={() => setIsLoginView(true)} className="text-[#333] font-bold border-b border-[#333]">Đăng nhập tại đây</button></span>
          )}
        </div>

        {showForgotView ? (
          /* Quên mật khẩu form */
          <form className="max-w-[450px] mx-auto">
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#333] mb-1">Email <span className="text-yellow-500">*</span></label>
              <input
                type="text"
                placeholder="Email hoặc tên đăng nhập"
                required
                className="w-full border border-gray-200 rounded-[3px] px-4 py-2 text-[13px] outline-none focus:border-[#a5a5a5]"
              />
            </div>
            <button className="w-full rounded-[20px] bg-[#d7ccc8] py-2 font-medium text-[#795548] transition-all hover:opacity-90 mt-4">
              Khôi phục mật khẩu
            </button>
          </form>
        ) : (
          /* Đăng nhập / Đăng ký form */
          <form className="max-w-[450px] mx-auto">
            {!isLoginView && (
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#333] mb-1">Họ tên <span className="text-yellow-500">*</span></label>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  className="w-full border border-gray-200 rounded-[3px] px-4 py-2 text-[13px] outline-none focus:border-[#a5a5a5]"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#333] mb-1">Email <span className="text-yellow-500">*</span></label>
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full border border-gray-200 rounded-[3px] px-4 py-2 text-[13px] outline-none focus:border-[#a5a5a5]"
              />
            </div>

            <div className="mb-2">
              <label className="block text-[13px] font-bold text-[#333] mb-1">Mật khẩu <span className="text-yellow-500">*</span></label>
              <input
                type="password"
                placeholder="Mật khẩu"
                required
                className="w-full border border-gray-200 rounded-[3px] px-4 py-2 text-[13px] outline-none focus:border-[#a5a5a5]"
              />
            </div>

            {isLoginView && (
              <div className="text-left mb-6 text-[13px]">
                <span className="text-gray-500">Quên mật khẩu? Nhấn vào </span>
                <button
                  type="button"
                  onClick={() => setShowForgotView(true)}
                  className="text-[#337ab7] hover:underline"
                >
                  đây
                </button>
              </div>
            )}

            <button
              className="w-full rounded-[20px] bg-[#dfd6ce] py-2 text-[14px] font-medium text-[var(--color-primary-dark)] transition-all hover:bg-[#c9bea7] mt-2"
            >
              {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
            </button>

            {/* Social Logins */}
            <div className="mt-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px bg-gray-300 w-12"></div>
                <span className="text-[13px] text-[#333]">Hoặc {isLoginView ? 'đăng nhập' : 'đăng ký'} bằng</span>
                <div className="h-px bg-gray-300 w-12"></div>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 bg-[#4b66a9] hover:bg-[#2d4373] text-white py-[6px] px-4 w-[140px] transition-colors"
                >
                  <span className="font-bold text-lg leading-none" style={{ fontFamily: 'serif' }}>f</span>
                  <span className="text-[13px]">Facebook</span>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 bg-[#e14b33] hover:bg-[#c23321] text-white py-[6px] px-4 w-[140px] transition-colors"
                >
                  <span className="font-bold text-lg leading-none">G+</span>
                  <span className="text-[13px]">Google</span>
                </button>
              </div>
            </div>

          </form>
        )}
      </div>

    </div>
  );
}
