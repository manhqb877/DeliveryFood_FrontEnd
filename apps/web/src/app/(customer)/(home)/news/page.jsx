'use client';

import React from 'react';
import Link from 'next/link';

export default function NewsPage() {
  return (
    <div className="w-full bg-white font-sans">
      {/* HERO BANNER */}
      <section className="w-full h-[40vh] min-h-[300px] relative flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://imgmainsite.be.com.vn/2026/08/816e57ef-1.png')" }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wide text-[#FECD00]">Tin tức về BeFood</h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto">Cập nhật những thông tin mới nhất về dịch vụ, khuyến mãi và các hoạt động vì cộng đồng.</p>
        </div>
      </section>

      {/* MAIN NEWS SECTION */}
      <section className="w-full bg-[#FCF6E8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-[#FECD00] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#002B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#002B5E]">Tin mới nhất</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* BIG ARTICLE (LEFT) */}
            <div className="flex-1 w-full lg:w-1/2 flex flex-col group cursor-pointer">
              <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-6">
                <img 
                  src="https://imgmainsite.be.com.vn/2026/08/816e57ef-1.png" 
                  alt="News Big" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-black text-[#002B5E] text-2xl md:text-3xl leading-tight mb-4 group-hover:text-[#FF5C39] transition-colors">
                Công - tư kiến quốc: Be Group hợp tác với Hà Nội Metro, xây dựng Giải pháp Giao thông Liên hoàn đầu tiên tại Việt Nam
              </h3>
              <p className="text-gray-700 font-medium leading-relaxed mb-4 line-clamp-3">
                Hà Nội, ngày 14 tháng 8 năm 2026 – CTCP Be Group và Hà Nội Metro chính thức làm lễ ra mắt “Giải pháp Giao thông Liên hoàn”: người dân Hà Nội có thể đặt trọn hành trình BE– Metro – BE ngay trên ứng dụng Hanoi Metro. Đồng thời, hành khách sẽ có thể […]
              </p>
              <p className="text-gray-400 text-sm font-medium mb-4">14 tháng 08, 2026</p>
              <Link href="#" className="text-[#002B5E] font-bold group-hover:text-[#FF5C39] transition-colors">Xem thêm</Link>
            </div>

            {/* SMALL ARTICLES (RIGHT) */}
            <div className="flex-1 w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
              
              {/* Item 1 */}
              <div className="flex flex-col group cursor-pointer">
                <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-4">
                  <img src="https://imgmainsite.be.com.vn/2026/06/546ad4b7-a%CC%89nh-beone-1.png" alt="News 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                </div>
                <h4 className="font-bold text-[#002B5E] text-lg leading-snug mb-3 group-hover:text-[#FF5C39] transition-colors line-clamp-3">
                  Be Group dừng chương trình beLoyalty, ra mắt beOne với cơ chế hoàn 10% beXu và loạt quyền lợi ưu tiên
                </h4>
                <p className="text-gray-400 text-xs font-medium mb-3">24 tháng 06, 2026</p>
                <Link href="#" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col group cursor-pointer">
                <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-4">
                  <img src="https://imgmainsite.be.com.vn/2026/05/ebc4971c-screenshot-2026-05-20-at-15.19.09.png" alt="News 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                </div>
                <h4 className="font-bold text-[#002B5E] text-lg leading-snug mb-3 group-hover:text-[#FF5C39] transition-colors line-clamp-3">
                  Be Group công bố Báo cáo Tác động 5 năm và phát động học bổng beScholar 2026: Mở rộng cam kết đồng hành cùng đối tác và gia đình
                </h4>
                <p className="text-gray-400 text-xs font-medium mb-3">20 tháng 05, 2026</p>
                <Link href="#" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col group cursor-pointer">
                <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-4">
                  <img src="https://imgmainsite.be.com.vn/2025/10/f2e96abc-a.jpg" alt="News 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                </div>
                <h4 className="font-bold text-[#002B5E] text-lg leading-snug mb-3 group-hover:text-[#FF5C39] transition-colors line-clamp-3">
                  Be Group Đạt Lợi Nhuận EBITDA Dương, Được Vinh Danh Doanh Nghiệp Xuất Sắc Châu Á Tại APEA 2025
                </h4>
                <p className="text-gray-400 text-xs font-medium mb-3">14 tháng 10, 2025</p>
                <Link href="#" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col group cursor-pointer">
                <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-4">
                  <img src="https://imgmainsite.be.com.vn/2025/10/8f3ee3df-hinh1.jpg" alt="News 4" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                </div>
                <h4 className="font-bold text-[#002B5E] text-lg leading-snug mb-3 group-hover:text-[#FF5C39] transition-colors line-clamp-3">
                  Be Group khẳng định vị thế công nghệ Việt với chiến thắng kép tại Better Choice Awards 2025
                </h4>
                <p className="text-gray-400 text-xs font-medium mb-3">06 tháng 10, 2025</p>
                <Link href="#" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
              </div>

            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <button className="bg-white border-2 border-[#002B5E] text-[#002B5E] font-bold py-3 px-8 rounded-lg hover:bg-[#002B5E] hover:text-white transition-colors duration-300">
              Tải thêm tin tức
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
