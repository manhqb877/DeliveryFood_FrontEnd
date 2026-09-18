'use client';

import { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const MOCK_PRODUCT = {
  ma_san_pham: 'P1',
  ten_san_pham: 'Phin Sữa Đá',
  gia_ban: 29000,
  hinh_anh_url: 'https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/Phin_Sua_Da_VN.png',
  mo_ta: 'Hương vị cà phê Việt Nam đích thực! Từng giọt cà phê đậm đà hòa quyện cùng sữa đặc béo ngậy.',
  danhMuc: { ten_danh_muc: 'Cà Phê' },
};

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('S');

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 md:py-16">
        
        <div className="flex flex-col md:flex-row gap-10 lg:gap-20 items-start max-w-[1000px] mx-auto">
          
          {/* Left: Image */}
          <div className="w-full md:w-1/2 flex items-center justify-center relative">
            <img 
              src={MOCK_PRODUCT.hinh_anh_url} 
              alt={MOCK_PRODUCT.ten_san_pham} 
              className="w-full max-w-[400px] h-auto object-contain transition-transform hover:scale-105 duration-300"
              onError={(e) => { e.currentTarget.src = 'https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/Phin_Sua_Da_VN.png' }}
            />
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col pt-4">
            <h1 className="text-3xl md:text-[40px] font-bold text-[#333] mb-3 leading-tight">
              {MOCK_PRODUCT.ten_san_pham}
            </h1>
            
            <p className="text-2xl md:text-[28px] font-bold text-[#333] mb-6">
              {MOCK_PRODUCT.gia_ban.toLocaleString('vi-VN')} đ
            </p>
            
            <p className="text-[#333] text-[15px] mb-8 leading-relaxed max-w-[450px]">
              {MOCK_PRODUCT.mo_ta}
            </p>

            {/* Size selection */}
            <div className="mb-8">
              <h3 className="font-bold text-[#333] mb-3 uppercase text-[13px] tracking-wide">CHỌN SIZE</h3>
              <div className="flex gap-3">
                {['S', 'M', 'L'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-[52px] h-[52px] rounded-[10px] font-bold text-[15px] flex items-center justify-center transition-colors border ${
                      size === s 
                        ? 'bg-[var(--color-primary-dark)] text-white border-[var(--color-primary-dark)]' 
                        : 'bg-white text-[#333] border-gray-200 hover:border-[var(--color-primary-dark)]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center bg-[#f3f4f6] rounded-full h-[52px] px-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-[#333] text-[15px]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Add to cart */}
              <button className="h-[52px] px-8 bg-[var(--color-primary-dark)] text-white rounded-full text-[14px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#8e1c23] transition-colors shadow-sm cursor-pointer whitespace-nowrap flex-1 md:flex-none">
                <ShoppingBagIcon className="w-5 h-5" />
                THÊM VÀO GIỎ - {(MOCK_PRODUCT.gia_ban * quantity).toLocaleString('vi-VN')} đ
              </button>
            </div>

          </div>
        </div>

        {/* PRODUCT DESCRIPTION & SIDE WIDGET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 pb-14 border-b border-gray-200">
          {/* Left Description */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-black text-[#222222] border-b-2 border-gray-800 pb-3 mb-6 uppercase">
              Mô tả sản phẩm
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-[15px]">
              <p>
                Sự kết hợp hoàn hảo giữa hạt cà phê Robusta & Arabica đậm đà chất lượng cao của vùng đất cao nguyên Việt Nam cùng dòng sữa thơm béo sánh mịn. Phin Sữa Đá mang lại trải nghiệm sảng khoái tràn đầy năng lượng cho ngày mới.
              </p>
              <p>
                Được tuyển chọn kỹ lưỡng và rang xay theo công thức độc quyền từ Highlands Coffee, giữ trọn hương vị truyền thống đậm đà khó quên.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Thành phần tự nhiên, đảm bảo vệ sinh an toàn thực phẩm.</li>
                <li>Thơm ngon đậm vị cà phê Việt Nam truyền thống.</li>
                <li>Tiện lợi thưởng thức mọi lúc mọi nơi.</li>
              </ul>
            </div>
          </div>

          {/* Right Pastry Add-on Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-[#fffcf7] rounded-2xl border border-orange-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-orange-200/60">
                <h3 className="font-black text-base text-[#8B4513] uppercase">
                  Bánh ngon đừng bỏ lỡ 🍰
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { id: '1', name: 'Bánh Phô Mai Trà Xanh', price: 35000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/Banh_Pho_Mai_Tra_Xanh_Highlands_Coffee_2.png' },
                  { id: '2', name: 'Bánh Chuối', price: 29000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/Banh_Chuoi_Highlands_Coffee_2.png' },
                ].map((pastry) => (
                  <div key={pastry.id} className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <img src={pastry.img} alt={pastry.name} className="w-12 h-12 object-contain rounded bg-gray-50 p-1" loading="lazy" />
                      <div>
                        <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{pastry.name}</h4>
                        <span className="font-black text-xs text-[var(--color-primary-dark)]">
                          {pastry.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                    <button type="button" className="w-8 h-8 rounded-full bg-[#ff6b6b] text-white flex items-center justify-center hover:bg-[#e31837] transition-colors shadow-sm" title="Thêm nhanh">
                      <PlusIcon className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT REVIEWS SECTION */}
        <div className="mt-12 pb-14 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black text-[#222222] uppercase">
              Đánh giá từ khách hàng
            </h2>
            <span className="bg-[var(--color-primary-dark)]/10 text-[var(--color-primary-dark)] text-sm font-black px-3 py-1 rounded-full">
              2 đánh giá
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Summary Bar */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-b from-[#fff9f9] to-white border border-yellow-50 rounded-2xl p-6 shadow-sm sticky top-24">
                <div className="text-center mb-5">
                  <div className="text-6xl font-black text-[var(--color-primary-dark)] leading-none">
                    4.5
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
                    {'★★★★☆'}
                  </div>
                  <p className="text-sm text-gray-500 font-semibold mt-1">
                    2 lượt đánh giá
                  </p>
                </div>

                {/* Rating distribution bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = star === 5 ? 1 : star === 4 ? 1 : 0;
                    const pct = (count / 2) * 100;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-4">{star}</span>
                        <span className="w-3 h-3 text-amber-400 flex-shrink-0">★</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-semibold w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Review list */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0 bg-rose-100 text-rose-600">
                      T
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Thái An</p>
                      <p className="text-xs text-gray-400">18/09/2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 text-amber-400">
                    {'★★★★★'}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  “Cà phê rất ngon, giao hàng siêu nhanh, shipper thân thiện!”
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0 bg-indigo-100 text-indigo-600">
                      H
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Hoàng Minh</p>
                      <p className="text-xs text-gray-400">17/09/2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 text-amber-400">
                    {'★★★★☆'}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  “Mùi vị đậm đà đúng chuẩn Highlands, nhưng đá hơi nhiều chút xíu. Tuy nhiên vẫn cho 4 sao vì ngon.”
                </p>
                <div className="bg-[#fdf8f4] border-l-4 border-[var(--color-primary-dark)] rounded-r-xl p-3 mt-2">
                  <p className="text-xs font-black text-[var(--color-primary-dark)] mb-1 uppercase tracking-wider">
                    ☕ Phản hồi của Highlands Coffee
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Chào bạn Hoàng Minh, cảm ơn bạn đã ủng hộ và góp ý. Lần tới bạn có thể ghi chú "Ít đá" để cửa hàng chuẩn bị đúng gu của bạn nhé!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-[#222222] mb-6 uppercase">
            Sản phẩm cùng loại
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[
              { id: '1', name: 'Phin Đen Đá', price: 29000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/Phin_Den_Da_Highlands_Coffee.png' },
              { id: '2', name: 'Trà Sen Vàng', price: 45000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/06_2024/TSV.png' },
              { id: '3', name: 'Freeze Trà Xanh', price: 55000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/Freeze_Tra_Xanh_Highlands_Coffee_2.png' },
              { id: '4', name: 'Trà Thanh Đào', price: 45000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/Tra_Thanh_Dao_Highlands_Coffee.png' },
              { id: '5', name: 'Trà Thạch Đào', price: 45000, img: 'https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/Tra_Thach_Dao_Highlands_Coffee.png' },
            ].map((prod) => (
              <div key={prod.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer p-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center bg-white border-b border-gray-50">
                  <img src={prod.img} alt={prod.name} className="w-[85%] h-[85%] object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1 relative bg-white min-h-[110px]">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
                    HIGHLANDS COFFEE
                  </span>
                  <h4 className="text-[14px] font-bold text-[#333333] mb-2 leading-snug line-clamp-2">
                    {prod.name}
                  </h4>
                  <div className="mt-auto pt-1 flex items-center justify-between">
                    <span className="text-[15px] font-bold text-[var(--color-primary-dark)] leading-none">
                      {prod.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button type="button" className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-[var(--color-primary-dark)] text-white flex items-center justify-center hover:bg-[#8e1c23] hover:scale-110 transition-all shadow-sm cursor-pointer z-10 opacity-70 group-hover:opacity-100">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
