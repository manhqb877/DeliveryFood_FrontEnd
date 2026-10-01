'use client';

import Link from 'next/link';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, PaperAirplaneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';

export default function OrderFooter() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#18181b] text-gray-300 font-sans border-t border-gray-800 relative z-10">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* COL 1: BRAND INFO */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <span className="text-3xl font-black tracking-tighter text-white">
                  be<span className="text-[var(--color-primary)]">Food</span>
                </span>
              </Link>
            </div>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              {t('footer_about_desc', 'Ứng dụng đặt đồ ăn trực tuyến hàng đầu, giao hàng nhanh chóng, hương vị tuyệt hảo tận tay.')}
            </p>
            <ul className="space-y-2.5 text-xs text-gray-300 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>285 Cách Mạng Tháng Tám, Phường 12, Quận 10, TP. Hồ Chí Minh.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-white font-extrabold">Hotline: 1900 1755 / 1900 23 23 45</span>
              </li>
              <li className="flex items-center gap-2.5">
                <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <span>hotro@be.com.vn</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <Link href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#1877f2] text-white flex items-center justify-center text-xs font-black transition-colors shadow-2xs">
                FB
              </Link>
              <Link href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#0068ff] text-white flex items-center justify-center text-xs font-black transition-colors shadow-2xs">
                Zalo
              </Link>
              <Link href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#e4405f] text-white flex items-center justify-center transition-colors shadow-2xs">
                IG
              </Link>
            </div>
          </div>

          {/* COL 2: CHÍNH SÁCH */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              {t('footer_policies', 'Chính sách')}
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-gray-400">
              <li><Link href="/policy" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('nav_policy', 'Chính sách đặt hàng')}</Link></li>
              <li><Link href="/policy" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('support_topic_payment', 'Chính sách thanh toán')}</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('nav_contact', 'Liên hệ hợp tác')}</Link></li>
              <li><Link href="/support" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('nav_support', 'Trung tâm hỗ trợ')}</Link></li>
            </ul>
          </div>

          {/* COL 3: HỖ TRỢ */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              {t('footer_support', 'Hỗ trợ')}
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-gray-400">
              <li><Link href="/tracking" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('header_track_order', 'Tra cứu đơn hàng')}</Link></li>
              <li><Link href="/support" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('nav_support', 'Trung tâm hỗ trợ')}</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:translate-x-1 transition-all inline-block">{t('nav_contact', 'Liên hệ & Bản đồ')}</Link></li>
            </ul>
          </div>
          
          {/* COL 4: ĐĂNG KÝ NHẬN TIN */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              {t('footer_newsletter', 'Đăng ký nhận tin')}
            </h4>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              {t('footer_newsletter_desc', 'Nhận ngay các ưu đãi giảm giá và voucher hấp dẫn hàng tuần.')}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký!'); }} className="space-y-2 pt-1">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-500 outline-none focus:border-[var(--color-primary)] transition-all"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 p-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <p>© 2026 beFood - Be Group. {t('footer_rights', 'Mọi quyền được bảo lưu.')}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              100% An toàn & Bảo mật
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
