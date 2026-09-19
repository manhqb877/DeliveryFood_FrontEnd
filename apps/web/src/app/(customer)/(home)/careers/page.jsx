'use client';

import React from 'react';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="w-full bg-white font-sans">
      {/* HERO BANNER */}
      <section className="w-full h-[50vh] min-h-[400px] relative flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://imgmainsite.be.com.vn/2022/02/76fc939a-landing-page-phase-2-01_13.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wide text-[#FECD00]">Nghề nghiệp tại BeFood</h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8">Trở thành một phần của hệ sinh thái giao đồ ăn nhanh chóng, mang lại niềm vui cho hàng triệu người Việt mỗi ngày.</p>
          <button className="bg-[#FF5C39] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#e04522] transition-colors duration-300">
            Xem vị trí tuyển dụng
          </button>
        </div>
      </section>

      {/* WHY JOIN US */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#002B5E] mb-16">Tại sao nên chọn BeFood?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-[#fef6e5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#FF5C39]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B5E] mb-3">Thu nhập hấp dẫn</h3>
              <p className="text-gray-600 leading-relaxed">Chế độ đãi ngộ cạnh tranh, thưởng KPIs và các khoản hỗ trợ đa dạng giúp bạn an tâm phát triển sự nghiệp.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-[#fef6e5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#FF5C39]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B5E] mb-3">Lộ trình thăng tiến</h3>
              <p className="text-gray-600 leading-relaxed">Môi trường làm việc năng động, luôn khuyến khích sáng tạo và cơ hội thăng tiến rõ ràng cho từng cá nhân.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-[#fef6e5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#FF5C39]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B5E] mb-3">Văn hóa doanh nghiệp</h3>
              <p className="text-gray-600 leading-relaxed">Tập thể gắn kết, chia sẻ và luôn quan tâm đến đời sống tinh thần cũng như sức khỏe của cán bộ nhân viên.</p>
            </div>
          </div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#002B5E] mb-8 border-b-2 border-[#FECD00] pb-4 inline-block">Vị trí đang tuyển</h2>
          
          <div className="flex flex-col gap-4 mt-8">
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:border-[#FF5C39] hover:shadow-md transition-all cursor-pointer group">
              <div>
                <h3 className="text-xl font-bold text-[#002B5E] group-hover:text-[#FF5C39] mb-2">Chuyên viên Vận hành Đối tác (Merchant Operations)</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Hồ Chí Minh</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Full-time</span>
                </div>
              </div>
              <button className="mt-4 md:mt-0 text-[#FF5C39] font-bold px-4 py-2 border border-[#FF5C39] rounded-lg group-hover:bg-[#FF5C39] group-hover:text-white transition-colors">
                Ứng tuyển
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:border-[#FF5C39] hover:shadow-md transition-all cursor-pointer group">
              <div>
                <h3 className="text-xl font-bold text-[#002B5E] group-hover:text-[#FF5C39] mb-2">Nhân viên Chăm sóc khách hàng (Customer Service)</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Hà Nội</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Full-time</span>
                </div>
              </div>
              <button className="mt-4 md:mt-0 text-[#FF5C39] font-bold px-4 py-2 border border-[#FF5C39] rounded-lg group-hover:bg-[#FF5C39] group-hover:text-white transition-colors">
                Ứng tuyển
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:border-[#FF5C39] hover:shadow-md transition-all cursor-pointer group">
              <div>
                <h3 className="text-xl font-bold text-[#002B5E] group-hover:text-[#FF5C39] mb-2">Lập trình viên Frontend (ReactJS/NextJS)</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Hồ Chí Minh / Hà Nội</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Remote</span>
                </div>
              </div>
              <button className="mt-4 md:mt-0 text-[#FF5C39] font-bold px-4 py-2 border border-[#FF5C39] rounded-lg group-hover:bg-[#FF5C39] group-hover:text-white transition-colors">
                Ứng tuyển
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
