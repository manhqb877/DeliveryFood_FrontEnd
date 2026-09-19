'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="w-full bg-white font-sans">
      
      {/* SECTION 0: Tầm nhìn, Sứ mệnh, Giá trị thương hiệu */}
      <section className="w-full h-[600px] flex flex-col md:flex-row">
        {/* 1. Tầm nhìn */}
        <div className="flex-1 relative group overflow-hidden cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://imgmainsite.be.com.vn/2022/11/f1e88f2d-640-x-990-2.png')" }}
          ></div>
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 mt-28 group-hover:mt-0">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mb-4 group-hover:bg-white transition-colors duration-500">
              <svg className="w-12 h-12 text-[#002B5E] group-hover:text-[#002B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-10 py-3 rounded-xl group-hover:bg-white transition-colors duration-500 w-full max-w-[300px] text-center">
              <h3 className="text-3xl font-black text-[#002B5E]">Tầm nhìn</h3>
            </div>
            
            <div className="w-full max-w-[300px] overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-[200px] mt-0 group-hover:mt-4 opacity-0 group-hover:opacity-100">
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg w-full mx-auto text-center">
                <p className="text-[#002B5E] font-medium leading-relaxed">Nền tảng tiêu dùng số phục vụ mọi nhu cầu hàng ngày của người Việt</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sứ mệnh */}
        <div className="flex-1 relative group overflow-hidden cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://imgmainsite.be.com.vn/2022/11/5614625a-640-x-990-3.png')" }}
          ></div>
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 mt-28 group-hover:mt-0">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mb-4 group-hover:bg-white transition-colors duration-500">
              <svg className="w-12 h-12 text-[#002B5E] group-hover:text-[#002B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="7" />
              </svg>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-10 py-3 rounded-xl group-hover:bg-white transition-colors duration-500 w-full max-w-[300px] text-center">
              <h3 className="text-3xl font-black text-[#002B5E]">Sứ mệnh</h3>
            </div>
            
            <div className="w-full max-w-[300px] overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-[200px] mt-0 group-hover:mt-4 opacity-0 group-hover:opacity-100">
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg w-full mx-auto text-center">
                <p className="text-[#002B5E] font-medium leading-relaxed">Đáp ứng mọi nhu cầu tiêu dùng hàng ngày với một trải nghiệm hài lòng chu đáo, dựa vào hệ sinh thái mở đa đối tác.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Giá trị thương hiệu */}
        <div className="flex-1 relative group overflow-hidden cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://imgmainsite.be.com.vn/2022/11/5e28c20e-640-x-990-1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 mt-36 group-hover:mt-0">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mb-4 group-hover:bg-white transition-colors duration-500">
              <svg className="w-12 h-12 text-[#002B5E] group-hover:text-[#002B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl group-hover:bg-white transition-colors duration-500 w-full max-w-[300px] text-center">
              <h3 className="text-3xl font-black text-[#002B5E]">Giá trị thương hiệu</h3>
            </div>
            
            <div className="w-full max-w-[300px] overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-[300px] mt-0 group-hover:mt-4 opacity-0 group-hover:opacity-100">
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg w-full mx-auto text-center">
                <ul className="text-[#002B5E] font-medium leading-relaxed space-y-2 text-left">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF5C39]"></div> Vì Cộng Đồng</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF5C39]"></div> Không Ngừng Đổi Mới</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF5C39]"></div> Tạo Điều Kiện Phát Triển</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* SECTION 1: Văn hóa & Con người */}
      <section className="w-full bg-[#FECD00] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#002B5E] mb-12 lg:mb-20 tracking-tight">
            Văn hóa & Con người
          </h1>
          
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            {/* Left Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#FF5C39] mb-2">Bà Vũ Hoàng Yến</h3>
              <p className="text-lg font-bold text-[#002B5E] mb-6">CEO Be Group</p>
              <p className="text-[#002B5E] text-lg leading-relaxed mb-8">
                "Giá trị kinh doanh cốt lõi mà Be Group xây dựng là Không Ngừng Đổi Mới, Tạo Điều Kiện Phát Triển, và Vì Cộng Đồng. Be mong muốn góp phần tích cực vào việc xây dựng văn hóa giao thông hiện đại tại Việt Nam, và mang Việt Nam vươn tầm trở thành một trong những quốc gia dẫn đầu về phát triển nền tảng công nghệ vận tải trên thế giới."
              </p>
              
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-[#002B5E] font-bold hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#002B5E] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                Công việc tại Be
              </Link>
            </div>
            
            {/* Right Image */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <img 
                src="https://imgmainsite.be.com.vn/2020/08/388c3d6a-logo-be.jpeg" 
                alt="be logo" 
                className="w-full max-w-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Quá trình phát triển */}
      <section className="w-full bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#002B5E] mb-16 text-center">
            Quá trình phát triển
          </h2>
          
          <div className="max-w-4xl mx-auto relative border-l-4 border-[#FECD00] ml-4 md:mx-auto md:border-l-0">
            {/* Timeline Line (Center for md+) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-[#FECD00] -translate-x-1/2"></div>
            
            {/* Item 1 */}
            <div className="relative pl-8 md:pl-0 mb-12 md:flex md:justify-between md:items-center w-full">
              <div className="md:w-5/12 md:text-right pr-8 hidden md:block">
                <span className="text-xl font-black text-gray-400">01 tháng 06, 2018</span>
              </div>
              <div className="absolute left-[-10px] md:left-1/2 top-1 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#002B5E] border-4 border-white shadow-sm z-10"></div>
              <div className="md:w-5/12 md:pl-8">
                <span className="text-lg font-black text-gray-400 block md:hidden mb-2">01 tháng 06, 2018</span>
                <p className="text-gray-700 font-medium">Be hình thành với tên gọi VEEP Technology</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="relative pl-8 md:pl-0 mb-12 md:flex md:justify-between md:items-center md:flex-row-reverse w-full">
              <div className="md:w-5/12 md:text-left pl-8 hidden md:block">
                <span className="text-xl font-black text-gray-400">25 tháng 10, 2018</span>
              </div>
              <div className="absolute left-[-10px] md:left-1/2 top-1 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#002B5E] border-4 border-white shadow-sm z-10"></div>
              <div className="md:w-5/12 md:pr-8 md:text-right">
                <span className="text-lg font-black text-gray-400 block md:hidden mb-2">25 tháng 10, 2018</span>
                <p className="text-gray-700 font-medium">Chính thức sử dụng tên Be Group</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="relative pl-8 md:pl-0 mb-12 md:flex md:justify-between md:items-center w-full">
              <div className="md:w-5/12 md:text-right pr-8 hidden md:block">
                <span className="text-xl font-black text-gray-400">17 tháng 12, 2018</span>
              </div>
              <div className="absolute left-[-10px] md:left-1/2 top-1 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#002B5E] border-4 border-white shadow-sm z-10"></div>
              <div className="md:w-5/12 md:pl-8">
                <span className="text-lg font-black text-gray-400 block md:hidden mb-2">17 tháng 12, 2018</span>
                <p className="text-gray-700 font-medium">
                  Be chính thức lăn bánh với cả hai dịch vụ <span className="text-[#FF5C39] font-bold">#beBike</span> và <span className="text-[#FF5C39] font-bold">#beCar</span> ở cả hai thành phố: TP.HCM và Hà Nội
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="relative pl-8 md:pl-0 mb-12 md:flex md:justify-between md:items-center md:flex-row-reverse w-full">
              <div className="md:w-5/12 md:text-left pl-8 hidden md:block">
                <span className="text-xl font-black text-gray-400">Năm Nay</span>
              </div>
              <div className="absolute left-[-10px] md:left-1/2 top-1 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#FF5C39] border-4 border-white shadow-sm z-10"></div>
              <div className="md:w-5/12 md:pr-8 md:text-right">
                <span className="text-lg font-black text-gray-400 block md:hidden mb-2">Hiện tại</span>
                <p className="text-gray-700 font-medium">
                  Phát triển mạnh mẽ với hệ sinh thái bao gồm giao hàng, giao đồ ăn <span className="text-[#FF5C39] font-bold">#beFood</span> và thanh toán số.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Tin tức về be */}
      <section className="w-full bg-[#FCF6E8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-[#FECD00] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#002B5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#002B5E]">Tin tức về be</h2>
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
              <Link href="/" className="text-[#002B5E] font-bold group-hover:text-[#FF5C39] transition-colors">Xem thêm</Link>
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
                <Link href="/" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
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
                <Link href="/" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
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
                <Link href="/" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
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
                <Link href="/" className="text-[#002B5E] font-bold text-sm group-hover:text-[#FF5C39] transition-colors mt-auto">Xem thêm</Link>
              </div>

            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <Link 
              href="/" 
              className="bg-[#002B5E] hover:bg-[#FF5C39] text-white font-black text-sm uppercase tracking-wider py-4 px-12 rounded-lg transition-colors duration-300"
            >
              XEM THÊM
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
