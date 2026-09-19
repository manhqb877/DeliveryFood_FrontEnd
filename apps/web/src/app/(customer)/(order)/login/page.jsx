'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, user, logout } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotView, setShowForgotView] = useState(false);

  // Form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: OTP, 3: Password
  const regRole = 'CUSTOMER';

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tự động chuyển trang nếu đã đăng nhập từ trước
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      const redirectUrl = searchParams.get('redirect') || '/order';
      // Chỉ redirect nếu không có hành động nào khác
    }
  }, [isAuthenticated, isSubmitting, searchParams]);

  // Xóa thông báo lỗi khi đổi view
  const switchView = (toLogin) => {
    setIsLoginView(toLogin);
    setShowForgotView(false);
    setErrorMsg('');
    setSuccessMsg('');
    setRegStep(1);
    setRegOtp('');
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPassword('');
  };

  // Xử lý Submit Đăng nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginPhone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login({
        phone: loginPhone.trim(),
        password: loginPassword,
      });

      const redirectUrl = searchParams.get('redirect') || '/order';
      router.push(redirectUrl);
    } catch (err) {
      setErrorMsg(err.message || 'Số điện thoại hoặc mật khẩu không chính xác');
      setIsSubmitting(false);
    }
  };

  // Xử lý gửi OTP Đăng ký
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regPhone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại (10 chữ số)');
      return;
    }
    const phoneClean = regPhone.trim();
    if (!/^(0|\+84)[0-9]{9}$/.test(phoneClean)) {
      setErrorMsg('Số điện thoại không hợp lệ (phải gồm 10 số, bắt đầu bằng 0)');
      return;
    }
    if (!regFullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Vui lòng nhập Email để nhận mã xác nhận');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.sendRegisterOtp({ email: regEmail.trim() });
      setRegStep(2);
      setSuccessMsg('Mã OTP đã được gửi đến email của bạn.');
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Email hoặc SĐT có thể đã tồn tại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xác nhận OTP đăng ký
  const handleRegisterVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regOtp.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyRegisterOtp({ email: regEmail.trim(), otp: regOtp.trim() });
      setRegStep(3);
      setSuccessMsg('Mã OTP hợp lệ. Vui lòng tạo mật khẩu cho tài khoản.');
    } catch (err) {
      setErrorMsg(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý Submit Đăng ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const phoneClean = regPhone.trim();
      await register({
        phone: phoneClean,
        email: regEmail.trim(),
        otp: regOtp.trim(),
        fullName: regFullName.trim(),
        password: regPassword,
        role: regRole,
      });

      setSuccessMsg('Đăng ký tài khoản thành công! Đang tự động đăng nhập...');

      // Tự động đăng nhập luôn sau khi đăng ký
      try {
        await login({ phone: phoneClean, password: regPassword });
        setTimeout(() => {
          const redirectUrl = searchParams.get('redirect') || '/order';
          router.push(redirectUrl);
        }, 1000);
      } catch {
        // Nếu tự động login lỗi, chuyển sang tab login cho user tự nhập
        setTimeout(() => {
          setLoginPhone(phoneClean);
          switchView(true);
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng ký thất bại. Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý gửi OTP Quên mật khẩu
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotEmail.trim()) {
      setErrorMsg('Vui lòng nhập Email để nhận mã OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.sendForgotPasswordOtp({ email: forgotEmail });
      setForgotStep(2);
      setSuccessMsg('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại Email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xác nhận OTP khôi phục mật khẩu
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotOtp.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyForgotPasswordOtp({ email: forgotEmail, otp: forgotOtp });
      setForgotStep(3);
      setSuccessMsg('Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.');
    } catch (err) {
      setErrorMsg(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý Đặt lại mật khẩu
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword
      });
      setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      setTimeout(() => {
        setLoginPhone(forgotEmail);
        switchView(true);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        
        {/* Nếu đã đăng nhập thì hiển thị thông tin profile hiện tại */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-center">
            <div className="flex justify-center items-center gap-2 text-green-700 font-bold mb-1">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Bạn đang đăng nhập</span>
            </div>
            <p className="text-[13px] text-gray-600 mb-3">
              Tài khoản: <span className="font-semibold text-gray-800">{user.fullName || user.phone}</span> ({user.role})
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/order"
                className="px-4 py-1.5 rounded-full bg-[var(--color-primary)] text-[13px] font-bold text-black hover:opacity-90 transition-all shadow-xs"
              >
                Vào đặt món ngay
              </Link>
              <button
                onClick={logout}
                className="px-4 py-1.5 rounded-full bg-white border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        <h1 className="text-center text-[22px] font-medium uppercase text-[#333] mb-1">
          {showForgotView ? 'KHÔI PHỤC MẬT KHẨU' : isLoginView ? 'ĐĂNG NHẬP TÀI KHOẢN' : 'ĐĂNG KÝ TÀI KHOẢN'}
        </h1>

        <div className="text-center text-[13px] text-gray-600 mb-6">
          {showForgotView ? (
            <span>Quay lại <button type="button" onClick={() => switchView(true)} className="text-[#337ab7] hover:underline font-bold">đăng nhập</button></span>
          ) : isLoginView ? (
            <span>Bạn chưa có tài khoản ? <button type="button" onClick={() => switchView(false)} className="text-[#333] font-bold border-b border-[#333] hover:text-[var(--color-primary-dark)]">Đăng ký tại đây</button></span>
          ) : (
            <span>Đã có tài khoản? <button type="button" onClick={() => switchView(true)} className="text-[#333] font-bold border-b border-[#333] hover:text-[var(--color-primary-dark)]">Đăng nhập tại đây</button></span>
          )}
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Thông báo thành công */}
        {successMsg && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[13px]">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {showForgotView ? (
          /* Quên mật khẩu form */
          forgotStep === 1 ? (
            <form className="max-w-[450px] mx-auto" onSubmit={handleForgotSendOtp}>
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#333] mb-1">
                  Email đã đăng ký <span className="text-yellow-500">*</span>
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="VD: user@example.com"
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-[20px] bg-[#d7ccc8] py-2.5 font-medium text-[#795548] transition-all hover:bg-[#c2b5b0] mt-4 flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isSubmitting ? 'Đang gửi mã...' : 'Nhận mã OTP qua Email'}
              </button>
            </form>
          ) : forgotStep === 2 ? (
            <form className="max-w-[450px] mx-auto" onSubmit={handleForgotVerifyOtp}>
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#333] mb-1">
                  Mã OTP (gửi qua {forgotEmail}) <span className="text-yellow-500">*</span>
                </label>
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="Nhập mã 6 số"
                  required
                  maxLength={6}
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
                />
                <div className="text-right mt-1 text-[12px]">
                  <button type="button" onClick={handleForgotSendOtp} disabled={isSubmitting} className="text-[#337ab7] hover:underline cursor-pointer">
                    Gửi lại mã OTP
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setForgotStep(1)}
                  className="w-1/3 rounded-[20px] bg-gray-200 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-300 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-2/3 rounded-[20px] bg-[var(--color-primary)] py-2.5 font-bold text-black transition-all hover:bg-[var(--color-primary-dark)] shadow-sm flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
                </button>
              </div>
            </form>
          ) : (
            <form className="max-w-[450px] mx-auto" onSubmit={handleForgotResetPassword}>
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#333] mb-1">
                  Mật khẩu mới <span className="text-yellow-500">*</span>
                </label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-[20px] bg-[var(--color-primary)] py-2.5 font-bold text-black transition-all hover:bg-[var(--color-primary-dark)] shadow-sm flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </div>
            </form>
          )
        ) : isLoginView ? (
          /* ĐĂNG NHẬP FORM */
          <form className="max-w-[450px] mx-auto" onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#333] mb-1">
                SĐT hoặc Email <span className="text-yellow-500">*</span>
              </label>
              <input
                type="text"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="Nhập SĐT hoặc Email"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
              />
            </div>

            <div className="mb-2">
              <label className="block text-[13px] font-bold text-[#333] mb-1">
                Mật khẩu <span className="text-yellow-500">*</span>
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
              />
            </div>

            <div className="text-left mb-6 text-[13px]">
              <span className="text-gray-500">Quên mật khẩu? Nhấn vào </span>
              <button
                type="button"
                onClick={() => setShowForgotView(true)}
                className="text-[#337ab7] hover:underline cursor-pointer"
              >
                đây
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-[20px] bg-[var(--color-primary)] py-2.5 text-[14px] font-bold text-black transition-all hover:bg-[var(--color-primary-dark)] shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Social Logins */}
            <div className="mt-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px bg-gray-300 w-12"></div>
                <span className="text-[13px] text-[#333]">Hoặc đăng nhập bằng</span>
                <div className="h-px bg-gray-300 w-12"></div>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setErrorMsg('Đăng nhập Facebook sẽ sớm được tích hợp qua Gateway')}
                  className="flex items-center justify-center gap-3 bg-[#4b66a9] hover:bg-[#2d4373] text-white py-[6px] px-4 w-[140px] transition-colors cursor-pointer rounded-xs"
                >
                  <span className="font-bold text-lg leading-none" style={{ fontFamily: 'serif' }}>f</span>
                  <span className="text-[13px]">Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setErrorMsg('Đăng nhập Google sẽ sớm được tích hợp qua Gateway')}
                  className="flex items-center justify-center gap-3 bg-[#e14b33] hover:bg-[#c23321] text-white py-[6px] px-4 w-[140px] transition-colors cursor-pointer rounded-xs"
                >
                  <span className="font-bold text-lg leading-none">G+</span>
                  <span className="text-[13px]">Google</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ĐĂNG KÝ FORM */
          regStep === 1 ? (
          <form className="max-w-[450px] mx-auto" onSubmit={handleRegisterSendOtp}>
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#333] mb-1">
                Họ và tên <span className="text-yellow-500">*</span>
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#333] mb-1">
                Số điện thoại <span className="text-yellow-500">*</span>
              </label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="VD: 0912345678 (10 số)"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#333] mb-1">
                Email <span className="text-yellow-500">*</span>
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="VD: user@example.com"
                required
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-[20px] bg-[var(--color-primary)] py-2.5 text-[14px] font-bold text-black transition-all hover:bg-[var(--color-primary-dark)] shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Tiếp tục'
              )}
            </button>
          </form>
          ) : regStep === 2 ? (
            <form className="max-w-[450px] mx-auto" onSubmit={handleRegisterVerifyOtp}>
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#333] mb-1">
                  Mã OTP (gửi qua {regEmail}) <span className="text-yellow-500">*</span>
                </label>
                <input
                  type="text"
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value)}
                  placeholder="Nhập mã 6 số"
                  required
                  maxLength={6}
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
                />
                <div className="text-right mt-1 text-[12px]">
                  <button type="button" onClick={handleRegisterSendOtp} disabled={isSubmitting} className="text-[#337ab7] hover:underline cursor-pointer">
                    Gửi lại mã OTP
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setRegStep(1)}
                  className="w-1/3 rounded-[20px] bg-gray-200 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-300 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-2/3 rounded-[20px] bg-[var(--color-primary)] py-2.5 font-bold text-black transition-all hover:bg-[var(--color-primary-dark)] shadow-sm flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}
                </button>
              </div>
            </form>
          ) : (
            <form className="max-w-[450px] mx-auto" onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#333] mb-1">
                  Tạo mật khẩu cho tài khoản <span className="text-yellow-500">*</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 rounded-[4px] px-4 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-all"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-[20px] bg-[var(--color-primary)] py-2.5 font-bold text-black transition-all hover:bg-[var(--color-primary-dark)] shadow-sm flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
