import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { ViewfinderCircleIcon } from '@heroicons/react/24/outline';

export default function CustomerHome() {
  return (
    <>
      {/* ── 1. HERO BANNER SLIDER ── */}
      <section className="w-full overflow-hidden bg-white">
        <div className="w-full h-[300px] md:h-[500px] lg:h-[700px] bg-[#f4f0eb] relative">
          <img 
            src="https://food.be.com.vn/placeholder-hero.webp?dpl=food-frontend-v2-1-0-428-production-0c12e565b511" 
            alt="beFood Banner" 
            className="w-full h-full object-cover" 
          />
          
          {/* Floating Address Box */}
          <div className="absolute top-1/2 left-4 md:left-12 lg:left-24 -translate-y-1/2 w-[90%] md:w-[450px] bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
            <h1 className="text-[26px] md:text-[32px] font-black text-gray-900 mb-6 leading-tight">
              Địa chỉ bạn muốn giao món
            </h1>
            
            <div className="relative flex items-center">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Nhập địa chỉ của bạn"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-gray-800 placeholder-gray-500 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
                title="Sử dụng vị trí hiện tại"
              >
                <ViewfinderCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Khoảng trắng giữa slider và promo */}
      <div className="w-full h-[50px] bg-white"></div>

      {/* ── 2. APP PROMO — 50/50 ── */}
      <section className="w-full bg-[#f4f0eb]">
        <div className="flex flex-col md:flex-row w-full">
          {/* Left: App promo image */}
          <div className="flex-1">
            <img 
              src="/hc-assets/Website_bannerr.png" 
              alt="App Member" 
              className="h-full w-full object-cover min-h-[400px]"
              loading="lazy"
            />
          </div>
          {/* Right: text in cream background */}
          <div className="flex flex-1 flex-col items-center justify-center bg-[#f4f0eb] px-10 py-16 md:py-24 text-center">
            <h2 className="text-[38px] font-bold leading-tight text-[#333333] md:text-[42px] whitespace-pre-line">
              Dành riêng cho<br/>Thành viên
            </h2>
            <p className="mt-4 text-base font-medium text-gray-700">
              Đăng ký thành viên để nhận ngay hàng ngàn ưu đãi đặc biệt!
            </p>
            <Link
              href="/order"
              className="mt-8 rounded-full border border-gray-400 bg-transparent px-10 py-3 text-[14px] font-medium tracking-wide text-[#333333] transition-all hover:bg-gray-100"
            >
              TẢI APP NGAY
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. ĐỒNG HÀNH — 3 ảnh ── */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold font-sans text-[#333333] md:text-[38px]">
            Luôn đồng hành cùng bạn
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { label: 'ĐẶT HÀNG NGAY', link: '/order', img: '/hc-assets/WEB_Banner_2.png' },
              { label: 'TÌM CỬA HÀNG', link: '/stores', img: '/hc-assets/505392773_1120548066764868_2724070916068790506_n.jpg' },
              { label: 'TIN TỨC MỚI', link: '/news', img: '/hc-assets/WEB_Banner_1.png' },
            ].map((item, idx) => (
              <Link href={item.link} key={idx} className="flex flex-col items-center cursor-pointer group">
                <div className="overflow-hidden rounded-2xl w-full">
                  <img src={item.img} alt={item.label} className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <p className="mt-6 text-center text-[15px] font-black uppercase tracking-wide text-[#333333] group-hover:text-[var(--color-hc-red)] transition-colors">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. NƯỚC NGON / BÁNH NGON ── */}
      <section className="w-full bg-white pb-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-6 lg:gap-10 md:grid-cols-2">
            <Link href="/order?category=drinks" className="group flex flex-col overflow-hidden shadow-sm">
              <div className="overflow-hidden rounded-t-[20px] w-full">
                <img src="/hc-assets/web_banner_2000x2000.jpg" alt="THỨC UỐNG ĐẬM ĐÀ" className="h-[460px] md:h-[550px] lg:h-[650px] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="bg-[var(--color-hc-red)] group-hover:bg-[var(--color-hc-red-dark)] transition-colors duration-300 rounded-b-[20px] py-10 w-full flex items-center justify-center">
                <p className="text-center text-xl font-bold uppercase tracking-wide text-white transition-colors duration-300">THỨC UỐNG ĐẬM ĐÀ</p>
              </div>
            </Link>
            <Link href="/order?category=food" className="group flex flex-col overflow-hidden shadow-sm">
              <div className="overflow-hidden rounded-t-[20px] w-full">
                <img src="/hc-assets/2.png" alt="MÓN ĂN HẤP DẪN" className="h-[460px] md:h-[550px] lg:h-[650px] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="bg-[var(--color-hc-red)] group-hover:bg-[var(--color-hc-red-dark)] transition-colors duration-300 rounded-b-[20px] py-10 w-full flex items-center justify-center">
                <p className="text-center text-xl font-bold uppercase tracking-wide text-white transition-colors duration-300">MÓN ĂN HẤP DẪN</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. CỬA HÀNG GẦN BẠN ── */}
      <section className="w-full bg-white mt-10">
        <div className="flex flex-col md:flex-row w-full">
          {/* Text side */}
          <div className="flex flex-1 flex-col items-center justify-center px-10 py-16 md:py-24 text-center bg-[#f9f4ec]">
            <h2 className="text-[38px] font-bold leading-tight text-[#333333] md:text-[42px] whitespace-pre-line">
              Cửa hàng gần bạn
            </h2>
            <p className="mt-4 text-[15px] font-medium text-[#555555]">
              Tìm ngay cửa hàng gần nhất để thưởng thức đồ uống ngon tuyệt!
            </p>
            <Link
              href="/stores"
              className="mt-8 rounded-full border border-gray-400 bg-transparent px-10 py-3 text-[14px] font-medium tracking-wide text-[#333333] transition-all hover:bg-white"
            >
              TÌM CỬA HÀNG
            </Link>
          </div>
          {/* Image side */}
          <div className="flex-1 overflow-hidden">
            <img src="/hc-assets/1_1.jpg" alt="Store Image" className="h-[400px] w-full object-cover md:h-full md:min-h-[500px]" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Khoảng trắng trước footer */}
      <div className="w-full h-[50px] bg-white"></div>
    </>
  );
}
