'use client';

import { useState, useEffect } from 'react';
import { TagIcon, SparklesIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/menu/ProductCard';
import FlashSaleSection from '@/components/menu/FlashSaleSection';
import ShopWelcomeVoucherModal from '@/components/menu/ShopWelcomeVoucherModal';
import Link from 'next/link';

const banners = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
  "https://imgmainsite.be.com.vn/2022/02/58cc93dd-landing-page-phase-2-01_04.jpg",
  "https://imgmainsite.be.com.vn/2022/07/2c763054-810x540_freeship-m%E1%BB%8Di-%C4%91%C6%A1n-h%C3%A0ng.jpg"
];

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState('');
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 1. Lấy danh sách quán
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/core/shops`);
        if (!response.ok) throw new Error("Không thể tải danh sách quán");
        const data = await response.json();
        
        if (data && data.length > 0) {
          setShops(data);
          setSelectedShopId(data[0].id);
        } else {
          setErrorMsg("Hệ thống chưa có quán nào.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách quán:", error);
        setErrorMsg("Lỗi kết nối tới máy chủ.");
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // 2. Lấy chi tiết quán khi selectedShopId thay đổi
  useEffect(() => {
    if (!selectedShopId) return;

    const fetchShopDetails = async () => {
      setLoading(true);
      setErrorMsg('');
      setShopDetails(null);
      try {
        const response = await fetch(`http://localhost:8080/api/v1/core/shops/${selectedShopId}/details`);
        const data = await response.json();

        if (!response.ok || data.error || !data.categories) {
          setErrorMsg(data.message || "Dữ liệu trả về không hợp lệ.");
        } else {
          setShopDetails(data);
          if (data.categories && data.categories.length > 0) {
            setActiveCategory(data.categories[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết quán:", error);
        setErrorMsg("Lỗi mạng khi tải thực đơn.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopDetails();
  }, [selectedShopId]);

  const handleScrollToCategory = (catId) => {
    setActiveCategory(catId.toString());
    const el = document.getElementById(`category-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex w-full mx-auto max-w-[1440px] px-4 lg:px-8 relative bg-white pb-10 pt-6">
      {/* Welcome Voucher Modal with Celebration Confetti */}
      {selectedShopId && (
        <ShopWelcomeVoucherModal 
          key={selectedShopId}
          shopId={selectedShopId} 
          shopName={shopDetails?.shopName} 
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="w-full bg-white">
          
          {/* TOP SECTION: Sidebar & Banner */}
          <div className="w-full mb-10 flex flex-col lg:flex-row items-stretch gap-8">
            
            {/* LEFT SIDEBAR: Shop List */}
            <div className="hidden lg:flex flex-col w-[260px] flex-shrink-0 z-10 bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 shrink-0">
                  <BuildingStorefrontIcon className="w-5 h-5 text-[var(--color-primary-dark)]" />
                  <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Danh sách Quán</h3>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1 pb-2">
                  {shops.map(shop => (
                    <button 
                      key={shop.id}
                      onClick={() => setSelectedShopId(shop.id)}
                      className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                        selectedShopId === shop.id 
                          ? 'border-[var(--color-hc-red)] bg-yellow-50/50 text-[var(--color-hc-red)] font-bold' 
                          : 'border-transparent hover:bg-gray-100 text-gray-600 font-medium'
                      }`}
                    >
                      <div className="text-sm line-clamp-1">{shop.shopName}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: BANNER */}
            <div className="flex-1 min-w-0">
              <div className="w-full h-full rounded-2xl overflow-hidden aspect-[16/7] bg-gray-100 relative shadow-sm group">
                {banners.map((src, idx) => (
                  <img 
                    key={idx}
                    src={src} 
                    alt={`beFood Banner ${idx + 1}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentBanner === idx ? 'opacity-100' : 'opacity-0'}`} 
                    loading={idx === 0 ? "eager" : "lazy"} 
                  />
                ))}
                
                {/* Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {banners.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${currentBanner === idx ? 'bg-[var(--color-primary)] w-8' : 'bg-white/70 hover:bg-white w-2.5'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Content */}
          <div className="w-full">
            {loading ? (
              <div className="w-full min-h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !shopDetails ? (
              <div className="w-full flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-2xl border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-700">Lỗi tải dữ liệu quán</h2>
                <p className="text-gray-500 mt-2">{errorMsg || "Không tìm thấy thông tin quán."}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <div className="mb-2 border-b border-gray-100 pb-6">
                  <h2 className="text-3xl font-black text-gray-900">{shopDetails.shopName}</h2>
                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {shopDetails.locationDetail}
                  </p>
                </div>

                {/* FLASH SALE SECTION */}
                {(() => {
                  const flashSaleItems = shopDetails.categories
                    .flatMap(cat => cat.items)
                    .filter(item => item.priceName);
                  
                  return <FlashSaleSection items={flashSaleItems} shopId={shopDetails.id} />;
                })()}

                {shopDetails.categories.map(cat => (
                  <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-[100px]">
                    <div className="flex items-center justify-between pb-3.5 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-7 rounded-full bg-[var(--color-hc-red)] shrink-0 shadow-2xs"></div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase font-sans tracking-wide">
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                    
                    {cat.items && cat.items.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                          {cat.items.slice(0, 5).map((product) => (
                            <ProductCard key={product.id} product={product} shopId={shopDetails.id} />
                          ))}
                        </div>
                        {cat.items.length > 5 && (
                          <div className="w-full flex justify-center mt-2">
                            <Link 
                              href={`/shop/${shopDetails.id}/category/${cat.id}`}
                              className="px-8 py-2.5 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md transition-all flex items-center gap-2"
                            >
                              Xem tất cả ({cat.items.length})
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Chưa có món ăn nào trong danh mục này.</p>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
