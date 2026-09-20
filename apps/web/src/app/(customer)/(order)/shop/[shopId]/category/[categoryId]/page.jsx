'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/menu/ProductCard';
import ShopWelcomeVoucherModal from '@/components/menu/ShopWelcomeVoucherModal';

export default function CategoryPage() {
  const { shopId, categoryId } = useParams();
  const router = useRouter();
  
  const [shopDetails, setShopDetails] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [sortOption, setSortOption] = useState('Mặc định');

  useEffect(() => {
    if (!shopId || !categoryId) return;

    const fetchShopDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/core/shops/${shopId}/details`);
        const data = await response.json();

        if (!response.ok || data.error || !data.categories) {
          setErrorMsg(data.message || "Dữ liệu trả về không hợp lệ.");
        } else {
          setShopDetails(data);
          // Tìm danh mục được chọn
          const cat = data.categories.find(c => c.id.toString() === categoryId);
          if (cat) {
            setCategory(cat);
          } else {
            setErrorMsg("Không tìm thấy danh mục này.");
          }
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết quán:", error);
        setErrorMsg("Lỗi mạng khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopDetails();
  }, [shopId, categoryId]);

  const sortedItems = useMemo(() => {
    if (!category || !category.items) return [];
    const items = [...category.items];
    switch (sortOption) {
      case 'Tên A → Z':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'Tên Z → A':
        return items.sort((a, b) => b.name.localeCompare(a.name));
      case 'Giá tăng dần':
        return items.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
      case 'Giá giảm dần':
        return items.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      case 'Hàng mới':
        return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default:
        return items;
    }
  }, [category, sortOption]);

  return (
    <div className="flex w-full mx-auto max-w-[1440px] px-4 lg:px-8 relative bg-gray-50/50 pb-16 pt-6 min-h-[80vh]">
      {shopId && (
        <ShopWelcomeVoucherModal 
          key={shopId}
          shopId={shopId} 
          shopName={shopDetails?.shopName} 
        />
      )}
      <main className="flex-1 w-full flex flex-col">
        
        {/* Nút Quay Lại */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] transition mb-6 w-fit font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại {shopDetails ? shopDetails.shopName : 'danh sách món'}
        </button>

        {loading ? (
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : errorMsg || !category ? (
          <div className="w-full flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-700">Lỗi tải danh mục</h2>
            <p className="text-gray-500 mt-2">{errorMsg || "Không tìm thấy danh mục này."}</p>
          </div>
        ) : (
          <div className="w-full pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-4 mb-8">
              <div className="flex flex-col items-start mb-4 md:mb-0">
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                  {category.name}
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Tất cả {category.items.length} món ăn</p>
              </div>

              <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <span className="font-bold text-gray-800 shrink-0">Sắp xếp:</span>
                {['Mặc định', 'Tên A → Z', 'Tên Z → A', 'Giá tăng dần', 'Giá giảm dần', 'Hàng mới'].map(option => (
                  <button 
                    key={option}
                    onClick={() => setSortOption(option)}
                    className={`shrink-0 font-medium text-[14px] transition-colors ${
                      sortOption === option 
                        ? 'text-red-600 font-bold border-b-2 border-red-600 pb-1' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
              {sortedItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
