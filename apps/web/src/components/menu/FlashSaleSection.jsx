import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function FlashSaleSection({ items, shopId }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate time until midnight tonight
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = endOfDay - now;

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-white p-6 shadow-md border border-yellow-200">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-yellow-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-red-100 opacity-30 blur-2xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div className="flex flex-col">
          <h3 className="text-3xl font-black text-red-600 uppercase tracking-wider flex items-center gap-3 drop-shadow-sm">
            <span className="animate-pulse">⚡</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
              FLASH SALE
            </span> 
            <span className="animate-pulse">⚡</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">Kết thúc trong hôm nay. Nhanh tay kẻo lỡ!</p>
        </div>
        
        {/* Real Timer UI */}
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-red-50 shadow-sm border border-red-100 text-red-600">
            <span className="text-xl font-black leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold uppercase mt-1">Giờ</span>
          </div>
          <span className="text-2xl font-black text-red-400 animate-pulse">:</span>
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-red-50 shadow-sm border border-red-100 text-red-600">
            <span className="text-xl font-black leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold uppercase mt-1">Phút</span>
          </div>
          <span className="text-2xl font-black text-red-400 animate-pulse">:</span>
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-red-50 shadow-sm border border-red-100 text-red-600">
            <span className="text-xl font-black leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold uppercase mt-1">Giây</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {items.map((product) => (
          <div key={`fs-${product.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <ProductCard product={product} shopId={shopId} />
          </div>
        ))}
      </div>
    </section>
  );
}
