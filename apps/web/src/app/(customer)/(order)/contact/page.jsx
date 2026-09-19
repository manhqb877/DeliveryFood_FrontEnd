'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="bg-white min-h-[calc(100vh-140px)] pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 text-sm text-gray-500 w-full mb-8">
        <div className="mx-auto max-w-[1200px] flex items-center gap-1.5">
          <a href="/" className="hover:text-[var(--color-primary-dark)]">Trang chủ</a>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Liên hệ</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Info & Form */}
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#333] mb-8 uppercase leading-tight">
              beFood Order thuộc CÔNG TY CỔ PHẦN BE GROUP
            </h1>
            
            <div className="space-y-4 text-[14px] text-[#333] mb-10">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                <p>
                  <strong>Địa chỉ:</strong> Tầng 16, Tháp B, Tòa nhà Viettel, Số 285 Cách Mạng Tháng Tám, Phường 12, Quận 10, Thành phố Hồ Chí Minh. MSDN: 0315053000 do Sở Kế hoạch & Đầu tư TP.HCM cấp lần đầu ngày 11/05/2018.
                </p>
              </div>
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <p><strong>Số điện thoại:</strong> 1900 23 23 45</p>
              </div>
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <p><strong>Email:</strong> hotro@be.com.vn</p>
              </div>
            </div>

            <h2 className="text-[15px] font-bold text-[#333] mb-6 uppercase">Liên hệ với chúng tôi</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Họ và tên"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[var(--color-primary-dark)]"
              />
              <input
                type="email"
                required
                placeholder="Email của bạn"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[var(--color-primary-dark)]"
              />
              <input
                type="tel"
                required
                placeholder="Số điện thoại *"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[var(--color-primary-dark)]"
              />
              <textarea
                required
                placeholder="Nhập nội dung *"
                rows={6}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[var(--color-primary-dark)] resize-none"
              ></textarea>
              <div className="text-right">
                <button type="submit" className="bg-[#FECD00] hover:bg-[#FECD00]/80 text-[#002B5E] px-8 py-2.5 rounded-full font-bold text-[14px] transition-colors">
                  Gửi đi
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Map */}
          <div className="h-[400px] lg:h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.467406326693!2d106.67756187602058!3d10.775464159213197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2603810f79%3A0xe54fb7dc5fef0922!2sViettel%20Complex%20Building!5e0!3m2!1svi!2s!4v1716262441961!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
