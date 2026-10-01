'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TagIcon,
  UserGroupIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';

export default function SupportPage() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const isVi = language === 'vi';

  const topics = [
    {
      id: 'order',
      icon: ShoppingBagIcon,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      title: isVi ? 'Đơn hàng & Giao nhận' : 'Orders & Delivery',
      desc: isVi ? 'Theo dõi đơn hàng, thời gian nhận món, hủy đơn' : 'Track orders, delivery ETA, cancellations',
    },
    {
      id: 'payment',
      icon: CreditCardIcon,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: isVi ? 'Thanh toán & Hoàn tiền' : 'Payment & Refunds',
      desc: isVi ? 'VietQR SePay, chuyển khoản ngân hàng, tiền hoàn lại' : 'VietQR SePay, bank transfers, refund process',
    },
    {
      id: 'promo',
      icon: TagIcon,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      title: isVi ? 'Khuyến mãi & Voucher' : 'Promotions & Vouchers',
      desc: isVi ? 'Mã giảm giá, tích điểm, ưu đãi thành viên beFood' : 'Discounts, reward points, beFood member perks',
    },
    {
      id: 'partner',
      icon: UserGroupIcon,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      title: isVi ? 'Đối tác Quán & Tài xế' : 'Merchants & Riders',
      desc: isVi ? 'Đăng ký bán hàng hoặc trở thành tài xế giao hàng' : 'Register your restaurant or become a rider',
    },
  ];

  const faqs = [
    {
      id: 1,
      category: 'payment',
      question: isVi
        ? 'Tôi đã chuyển khoản qua VietQR (SePay) nhưng trạng thái đơn chưa đổi?'
        : 'I transferred via VietQR (SePay) but my order status has not updated yet?',
      answer: isVi
        ? 'Hệ thống beFood tích hợp cổng SePay Webhook tự động xác nhận giao dịch trong vòng 3 - 5 giây. Nếu quá 1 phút đơn hàng chưa chuyển sang "Đã thanh toán", bạn vui lòng kiểm tra xem nội dung chuyển khoản có đúng cú pháp (Mã đơn hàng) hay không. Trong trường hợp cần hỗ trợ khẩn cấp, vui lòng liên hệ hotline 1900 1755 hoặc nhấn vào biểu tượng AI bên dưới.'
        : 'beFood integrates SePay Webhook to verify bank transfers within 3-5 seconds. If your order status is not updated within 1 minute, please verify that your transfer note included the exact Order Code. For urgent support, call 1900 1755 or use our AI assistant below.',
    },
    {
      id: 2,
      category: 'order',
      question: isVi
        ? 'Tôi có thể hủy đơn hàng sau khi đã đặt thành công không?'
        : 'Can I cancel an order after placing it successfully?',
      answer: isVi
        ? 'Bạn chỉ có thể hủy đơn hàng khi trạng thái là "Đã đặt hàng" (quán ăn chưa bắt đầu chế biến). Khi quán ăn đã chuyển sang trạng thái "Đang chuẩn bị" hoặc tài xế "Đang giao", bạn không thể tự hủy trên website/app. Vui lòng gọi ngay hotline để tổng đài viên hỗ trợ kiểm tra.'
        : 'You can cancel an order only while it is in "Pending" status (before the kitchen starts cooking). Once the restaurant marks it as "Preparing" or a rider is "Delivering", cancellations cannot be processed automatically. Please call our hotline immediately for support.',
    },
    {
      id: 3,
      category: 'order',
      question: isVi
        ? 'Đơn hàng của tôi bị giao trễ thì beFood xử lý như thế nào?'
        : 'What should I do if my order is delayed?',
      answer: isVi
        ? 'Thời gian giao hàng dự kiến có thể thay đổi do thời tiết xấu hoặc tắc đường giờ cao điểm. Bạn có thể bấm vào mục "Tra cứu đơn" để xem vị trí trực tiếp của tài xế. Nếu đơn hàng trễ quá 20 phút so với dự kiến, beFood sẽ gửi tặng voucher đền bù vào tài khoản của bạn.'
        : 'Estimated delivery times may fluctuate due to weather or rush-hour traffic. You can track your rider\'s real-time position using "Track Order". If your food is delayed more than 20 minutes past ETA, beFood will issue a compensation voucher to your account.',
    },
    {
      id: 4,
      category: 'order',
      question: isVi
        ? 'Khi nhận món ăn không đúng yêu cầu hoặc bị hỏng, tôi cần làm gì?'
        : 'What should I do if the food is incorrect or damaged?',
      answer: isVi
        ? 'Vui lòng chụp ảnh món ăn và hóa đơn, sau đó liên hệ hotline 1900 1755 hoặc gửi email về hotro@be.com.vn trong vòng 30 phút kể từ lúc nhận hàng. beFood cam kết hoàn tiền 100% hoặc đổi món mới hoàn toàn miễn phí.'
        : 'Please take clear photos of the dish and receipt, then contact hotline 1900 1755 or email hotro@be.com.vn within 30 minutes of delivery. beFood guarantees a 100% refund or free replacement.',
    },
    {
      id: 5,
      category: 'payment',
      question: isVi
        ? 'Thời gian hoàn tiền cho đơn thanh toán trước bị hủy là bao lâu?'
        : 'How long does a refund take for pre-paid cancelled orders?',
      answer: isVi
        ? 'Đối với đơn hàng thanh toán qua VietQR chuyển khoản ngân hàng hoặc Thẻ ATM, tiền sẽ được hoàn trả về tài khoản nguồn trong vòng 24 - 48 giờ làm việc. Đối với thẻ tín dụng quốc tế (Visa/Mastercard), thời gian phụ thuộc vào ngân hàng phát hành (khoảng 3 - 7 ngày làm việc).'
        : 'For orders paid via VietQR or domestic ATM cards, refunds are processed within 24-48 business hours. For international cards (Visa/Mastercard), it takes 3-7 business days depending on your issuing bank.',
    },
    {
      id: 6,
      category: 'promo',
      question: isVi
        ? 'Làm thế nào để áp dụng mã giảm giá và mã freeship cùng lúc?'
        : 'How can I apply both a discount code and free shipping voucher?',
      answer: isVi
        ? 'beFood hỗ trợ cộng dồn mã giảm giá món ăn từ Quán ăn và mã hỗ trợ phí vận chuyển từ sàn beFood. Tại bước Thanh toán (Checkout), hệ thống sẽ tự động chọn mã tối ưu nhất cho bạn, hoặc bạn có thể nhập thủ công mã voucher mình có.'
        : 'beFood allows stacking restaurant discount vouchers with beFood platform shipping discounts. At the Checkout page, our system will automatically select the best voucher combination, or you can manually enter your promo code.',
    },
    {
      id: 7,
      category: 'partner',
      question: isVi
        ? 'Tôi muốn mở quán ăn hoặc đăng ký làm tài xế beFood thì làm thế nào?'
        : 'How do I register a restaurant or join as a delivery rider on beFood?',
      answer: isVi
        ? 'beFood luôn chào đón các đối tác mới! Bạn vui lòng truy cập trang "Liên hệ" hoặc gửi thông tin qua email hotro@be.com.vn với tiêu đề [Đăng ký Quán ăn] hoặc [Đăng ký Tài xế]. Đội ngũ phát triển thị trường của chúng tôi sẽ liên hệ lại trong vòng 24 giờ.'
        : 'We always welcome new partners! Please visit our "Contact" page or email hotro@be.com.vn with subject [Restaurant Partner] or [Driver Partner]. Our team will contact you within 24 hours.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-140px)] pb-24 font-sans">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3.5 px-4 text-sm text-gray-500 w-full mb-6">
        <div className="mx-auto max-w-[1200px] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--color-primary-dark)] transition-colors">
            {t('nav_home', 'Trang chủ')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{t('nav_support', 'Trung tâm hỗ trợ')}</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        {/* HERO BANNER */}
        <div className="bg-gradient-to-br from-[#002B5E] via-[#013b82] to-[#002046] rounded-3xl p-8 md:p-14 text-white text-center shadow-lg relative overflow-hidden mb-12">
          {/* Subtle decoration circles */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[var(--color-primary)] text-black mb-4 shadow-sm">
              <SparklesIcon className="w-4 h-4" />
              beFood Care 24/7
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight mb-3">
              {t('support_title', 'TRUNG TÂM HỖ TRỢ KHÁCH HÀNG BEFOOD')}
            </h1>
            <p className="text-sm md:text-base text-gray-200 mb-8 font-medium">
              {t(
                'support_subtitle',
                'Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn 24/7'
              )}
            </p>

            {/* Quick Search */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'support_search_placeholder',
                  'Nhập vấn đề bạn cần giúp đỡ (ví dụ: hủy đơn, hoàn tiền, thanh toán)...'
                )}
                className="w-full bg-white text-gray-900 placeholder-gray-400 pl-12 pr-4 py-3.5 rounded-full text-sm outline-none shadow-md focus:ring-4 focus:ring-[var(--color-primary)]/40 transition-all font-medium"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-bold"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TOPIC CARDS */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-tight">
              {isVi ? 'Chủ đề hỗ trợ phổ biến' : 'Popular Support Topics'}
            </h2>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="text-xs font-bold text-[var(--color-primary-dark)] hover:underline"
              >
                {isVi ? 'Xem tất cả chủ đề' : 'View all topics'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topics.map((t) => {
              const Icon = t.icon;
              const isSelected = activeCategory === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveCategory(isSelected ? 'all' : t.id)}
                  className={`text-left p-6 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 group relative ${
                    isSelected
                      ? 'border-yellow-400 ring-2 ring-yellow-400/40'
                      : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 transition-transform group-hover:scale-110 ${t.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-[var(--color-primary-dark)] transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-xs mb-14">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-100">
            <QuestionMarkCircleIcon className="w-6 h-6 text-[var(--color-primary-dark)]" />
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase">
              {t('support_faq_title', 'CÂU HỎI THƯỜNG GẶP (FAQ)')}
            </h2>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="font-semibold mb-2">
                {isVi ? 'Không tìm thấy câu hỏi phù hợp với tìm kiếm của bạn.' : 'No matching questions found.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs font-bold text-[var(--color-primary-dark)] underline"
              >
                {isVi ? 'Xóa bộ lọc tìm kiếm' : 'Reset search filter'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="py-4.5 transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
                    >
                      <span
                        className={`text-sm md:text-base font-bold transition-colors ${
                          isOpen ? 'text-[var(--color-primary-dark)]' : 'text-gray-800 group-hover:text-black'
                        }`}
                      >
                        {faq.question}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isOpen
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-black rotate-180'
                            : 'bg-gray-50 border-gray-200 text-gray-500 group-hover:border-gray-300'
                        }`}
                      >
                        <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-3.5 pl-1 pr-4 text-sm text-gray-600 leading-relaxed font-medium animate-in fade-in duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DIRECT CONTACT CARDS */}
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-400/10 to-amber-500/10 border border-yellow-200 rounded-3xl p-8 md:p-10 shadow-xs">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase mb-2">
              {t('support_contact_direct', 'Bạn cần hỗ trợ trực tiếp?')}
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              {isVi
                ? 'Đội ngũ chăm sóc khách hàng và hệ thống AI thông minh của beFood luôn túc trực để hỗ trợ bạn nhanh nhất.'
                : 'Our customer support team and smart AI assistant are always on standby to help you.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Hotline */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <PhoneIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                {t('support_hotline_label', 'Tổng đài chăm sóc khách hàng')}
              </h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                {isVi ? 'Phục vụ 24/7 (Cước 1000đ/phút)' : '24/7 Support (Standard rates)'}
              </p>
              <a
                href="tel:19001755"
                className="mt-auto px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-xs"
              >
                1900 1755
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <EnvelopeIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                {t('support_email_label', 'Hòm thư tiếp nhận khiếu nại')}
              </h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                {isVi ? 'Phản hồi trong vòng 2-4 giờ' : 'Responses within 2-4 hours'}
              </p>
              <a
                href="mailto:hotro@be.com.vn"
                className="mt-auto px-5 py-2 rounded-full bg-[#002B5E] hover:bg-[#002046] text-white font-bold text-sm transition-colors shadow-xs"
              >
                hotro@be.com.vn
              </a>
            </div>

            {/* AI Assistant */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                {t('support_ai_label', 'Trợ lý AI beFood thông minh')}
              </h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                {isVi ? 'Gợi ý món ăn & giải đáp tức thì' : 'Smart recommendations & instant answers'}
              </p>
              <button
                type="button"
                onClick={() => {
                  // Click AI agent bubble on bottom right
                  const aiBtn = document.querySelector('[data-ai-bubble-toggle="true"]');
                  if (aiBtn) aiBtn.click();
                  else {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
                className="mt-auto px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-xs cursor-pointer"
              >
                {t('support_btn_ai', 'Chat với AI ngay')}
              </button>
            </div>
          </div>

          {/* Link to Contact */}
          <div className="mt-8 text-center pt-6 border-t border-yellow-200/70">
            <span className="text-xs md:text-sm text-gray-700 font-medium mr-2">
              {isVi
                ? 'Bạn muốn gửi thư liên hệ công tác hoặc xem vị trí trụ sở văn phòng?'
                : 'Need office address or business inquiries?'}
            </span>
            <Link
              href="/contact"
              className="text-xs md:text-sm font-bold text-[var(--color-primary-dark)] hover:underline inline-flex items-center gap-1"
            >
              <MapPinIcon className="w-4 h-4 inline" />
              {isVi ? 'Đến trang Liên hệ & Bản đồ' : 'Visit Contact & Map page'} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
