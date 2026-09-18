import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group relative flex flex-col h-full cursor-pointer p-0">
        
        {/* Product Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center bg-white border-b border-gray-50">
          <img 
            src={product.hinh_anh_url || '/hc-assets/caphe-1.png'} 
            alt={product.ten_san_pham} 
            className="w-[85%] h-[85%] object-contain transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
          />
          
          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.la_hot && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm">
                Bán chạy
              </span>
            )}
            {!product.la_hot && product.la_moi && (
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Món mới
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
            {product.ten_san_pham}
          </h4>
          
          <div className="mt-auto pt-1 flex items-center justify-between pr-8">
            <div className="flex flex-row items-center gap-2 flex-wrap">
              <span className="text-[15px] font-bold text-[var(--color-primary-dark)] leading-none">
                {Number(product.gia_ban || 39000).toLocaleString('vi-VN')}đ
              </span>
              {product.gia_niem_yet && (
                <span className="text-[12px] text-gray-400 line-through">
                  {Number(product.gia_niem_yet).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>
          
          {/* Absolute positioned + button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              alert('Đã thêm ' + product.ten_san_pham);
            }}
            className="absolute bottom-3 md:bottom-4 right-3 md:right-4 w-7 h-7 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center hover:bg-[var(--color-primary-dark)] hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer z-10 opacity-70 group-hover:opacity-100"
            title="Thêm vào giỏ"
          >
            <span className="text-lg font-bold leading-none mb-0.5">+</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
