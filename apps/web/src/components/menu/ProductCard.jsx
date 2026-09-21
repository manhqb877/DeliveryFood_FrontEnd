import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductModal from './ProductModal';
import Link from 'next/link';

export default function ProductCard({ product, shopId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group relative flex flex-col h-full p-0 ${product.status === 'SOLD_OUT' ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
        
        {/* Quick View Button (Top Right) */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (product.status !== 'SOLD_OUT') setIsModalOpen(true);
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white hover:scale-110 active:scale-95"
          title="Xem nhanh"
        >
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-700" />
        </button>

        {product.status === 'SOLD_OUT' ? (
          <div className="flex flex-col flex-1 h-full relative cursor-not-allowed">
            {/* Product Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center bg-white border-b border-gray-50">
              <img 
                src={product.imageUrl || '/hc-assets/caphe-1.png'} 
                alt={product.name} 
                className="w-[85%] h-[85%] object-contain" 
                loading="lazy"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                <span className="inline-flex items-center rounded-full bg-gray-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Hết món
                </span>
              </div>
            </div>
            {/* Product Info */}
            <div className="p-3 md:p-4 flex flex-col flex-1 relative bg-white min-h-[110px]">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
                BEFOOD
              </span>
              <h4 className="text-[14px] font-bold text-[#333333] mb-2 leading-snug line-clamp-2">
                {product.name}
              </h4>
              <div className="mt-auto pt-1 flex items-center justify-between pr-8">
                <div className="flex flex-row items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-bold text-gray-500 leading-none">
                    {Number(product.basePrice || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/product/${product.id}`} className="flex flex-col flex-1 h-full relative cursor-pointer">
          {/* Product Image Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center bg-white border-b border-gray-50">
            <img 
              src={product.imageUrl || '/hc-assets/caphe-1.png'} 
              alt={product.name} 
              className="w-[85%] h-[85%] object-contain transition-transform duration-500 group-hover:scale-105" 
              loading="lazy"
            />

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
              {product.priceName && (
                <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  {product.priceName}
                </span>
              )}
              {product.status === 'AVAILABLE' && product.totalReviews > 20 && !product.priceName && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm">
                  Bán chạy
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3 md:p-4 flex flex-col flex-1 relative bg-white min-h-[110px]">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 block">
              BEFOOD
            </span>
            <h4 className="text-[14px] font-bold text-[#333333] mb-2 leading-snug line-clamp-2">
              {product.name}
            </h4>
            
            <div className="mt-auto pt-1 flex items-center justify-between pr-8">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <span className="text-[15px] font-bold text-red-600 leading-none">
                  {Number(product.basePrice || 0).toLocaleString('vi-VN')}đ
                </span>
                {product.originalPrice && (
                  <span className="text-[12px] text-gray-400 line-through leading-none">
                    {Number(product.originalPrice).toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
        )}
          
        {/* Add to Cart / Options button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (product.status !== 'SOLD_OUT') setIsModalOpen(true);
          }}
          disabled={product.status === 'SOLD_OUT'}
          className={`absolute bottom-3 md:bottom-4 right-3 md:right-4 w-7 h-7 rounded-full text-black flex items-center justify-center transition-all shadow-sm z-10 ${
            product.status === 'SOLD_OUT' 
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] hover:scale-110 active:scale-95 cursor-pointer opacity-70 group-hover:opacity-100'
          }`}
          title={product.status === 'SOLD_OUT' ? 'Đã hết món' : 'Thêm vào giỏ'}
        >
          <span className="text-lg font-bold leading-none mb-0.5">+</span>
        </button>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        shopId={shopId}
      />
    </>
  );
}
