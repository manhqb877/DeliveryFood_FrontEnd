'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { MinusIcon, PlusIcon, ShoppingBagIcon, ChevronDownIcon, ChevronUpIcon, BuildingStorefrontIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, totalItemCount } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successItem, setSuccessItem] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/core/items/${id}`, { cache: 'no-store' });
        if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm");
        const data = await response.json();
        setProduct(data);
        
        // Initialize default options and expanded state
        const initialOptions = {};
        const initialExpanded = {};
        const optionGroups = groupBy(data.options || [], 'groupName');
        
        Object.keys(optionGroups).forEach((groupName, idx) => {
          const group = optionGroups[groupName];
          if (group.length > 0 && group[0].isRequired && !group[0].isMultiple) {
            initialOptions[groupName] = [group[0].id];
          } else {
            initialOptions[groupName] = [];
          }
          // Expand the first group by default
          initialExpanded[groupName] = idx === 0;
        });
        
        setSelectedOptions(initialOptions);
        setExpandedGroups(initialExpanded);

        // Save to recently viewed
        const currentRecentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updatedRecentlyViewed = currentRecentlyViewed.filter(p => p.id !== data.id);
        updatedRecentlyViewed.unshift({
          id: data.id,
          name: data.name,
          imageUrl: data.imageUrl,
          basePrice: data.basePrice
        });
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed.slice(0, 10)));
        setRecentlyViewed(updatedRecentlyViewed.slice(1, 6)); // Show others

      } catch (error) {
        console.error("Lỗi:", error);
        setErrorMsg(error.message || "Lỗi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  };

  const handleOptionChange = (groupName, option, isRadio) => {
    setSelectedOptions(prev => {
      const current = prev[groupName] || [];
      if (isRadio) return { ...prev, [groupName]: [option.id] };
      if (current.includes(option.id)) return { ...prev, [groupName]: current.filter(id => id !== option.id) };
      return { ...prev, [groupName]: [...current, option.id] };
    });
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    let total = product.basePrice || 0;
    
    // Add extra prices from selected options
    Object.values(selectedOptions).flat().forEach(optionId => {
      const option = product.options?.find(opt => opt.id === optionId);
      if (option && option.extraPrice) {
        total += option.extraPrice;
      }
    });
    
    return total * quantity;
  };

  const isFormValid = () => {
    if (!product || !product.options) return true;
    
    const optionGroups = groupBy(product.options, 'groupName');
    
    // Check all required groups
    for (const [groupName, options] of Object.entries(optionGroups)) {
      if (options[0].isRequired) {
        const selectedInGroup = selectedOptions[groupName] || [];
        if (selectedInGroup.length === 0) {
          return false;
        }
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!isFormValid()) {
      alert("Vui lòng chọn đầy đủ các tùy chọn bắt buộc!");
      return;
    }

    const selectedOptionsDetails = product.options.filter(opt => 
      Object.values(selectedOptions).flat().includes(opt.id)
    ).map(opt => ({
      id: opt.id,
      option: opt.name,
      extraPrice: opt.extraPrice || 0
    }));

    setIsAdding(true);
    const res = await addToCart({
      shopId: product.shopId || 1,
      areaId: 1,
      item: { id: product.id, name: product.name, basePrice: product.basePrice },
      quantity,
      selectedOptions: selectedOptionsDetails,
      itemNote: ''
    });
    setIsAdding(false);

    if (res && res.success) {
      setSuccessItem({
        name: product.name,
        imageUrl: product.imageUrl,
        totalPrice: calculateTotalPrice(),
      });
      setShowSuccessModal(true);
    } else {
      alert(res?.message || 'Lỗi thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold text-gray-700">Lỗi</h2>
        <p className="text-gray-500 mt-2">{errorMsg || "Sản phẩm không tồn tại"}</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-gray-100 rounded-full text-gray-700 font-medium hover:bg-gray-200">
          Quay lại
        </button>
      </div>
    );
  }

  const optionGroups = groupBy(product.options || [], 'groupName');

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 md:py-16">
        
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary-dark)] font-medium transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại
        </button>

        <div className="flex flex-col md:flex-row gap-10 lg:gap-20 items-start max-w-[1000px] mx-auto">
          
          {/* Left: Image */}
          <div className="w-full md:w-1/2 flex items-center justify-center relative bg-gray-50/50 rounded-3xl p-8">
            <img 
              src={product.imageUrl || '/hc-assets/caphe-1.png'} 
              alt={product.name} 
              className="w-full max-w-[400px] h-auto object-contain transition-transform hover:scale-105 duration-300 relative z-10"
              onError={(e) => { e.currentTarget.src = '/hc-assets/caphe-1.png' }}
            />
            {product.priceName && (
              <div className="absolute top-6 left-6 z-20">
                <span className="inline-flex items-center rounded-full bg-red-500 px-4 py-1.5 text-[12px] font-black uppercase tracking-wider text-white shadow-md">
                  {product.priceName}
                </span>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col pt-4">
            {/* Shop Info */}
            {product.shopName && (
              <Link href={`/shop/${product.shopId || 1}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--color-primary)] transition w-fit mb-3 bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-100">
                <BuildingStorefrontIcon className="w-4 h-4" />
                {product.shopName}
              </Link>
            )}
            <h1 className="text-3xl md:text-[40px] font-bold text-[#333] mb-3 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <p className="text-2xl md:text-[28px] font-bold text-red-600">
                {Number(product.basePrice || 0).toLocaleString('vi-VN')} đ
              </p>
              {product.originalPrice && (
                <p className="text-xl md:text-[22px] font-medium text-gray-400 line-through">
                  {Number(product.originalPrice).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>
            
            <p className="text-[#333] text-[15px] mb-8 leading-relaxed max-w-[450px]">
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>

            {/* Options Selection (Accordion) */}
            {Object.keys(optionGroups).length > 0 && (
              <div className="mb-8 w-full border-t border-gray-100">
                {Object.keys(optionGroups).map((groupName, idx) => {
                  const group = optionGroups[groupName];
                  const isRadio = group[0].isRequired && !group[0].isMultiple;
                  const isExpanded = expandedGroups[groupName];

                  return (
                    <div key={idx} className="w-full border-b border-gray-100">
                      <button 
                        onClick={() => toggleGroup(groupName)}
                        className="w-full flex items-center justify-between py-4 focus:outline-none hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-[#333] uppercase text-[13px] tracking-wide">{groupName}</h3>
                          {group[0].isRequired && (
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">Bắt buộc</span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="space-y-2 pb-4 px-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {group.map((option) => (
                            <label key={option.id} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                <input 
                                  type={isRadio ? "radio" : "checkbox"} 
                                  name={`group-${groupName}`}
                                  checked={(selectedOptions[groupName] || []).includes(option.id)}
                                  onChange={() => handleOptionChange(groupName, option, isRadio)}
                                  className={isRadio 
                                    ? "w-4 h-4 text-[var(--color-primary-dark)] border-gray-300 focus:ring-[var(--color-primary-dark)]" 
                                    : "w-4 h-4 rounded text-[var(--color-primary-dark)] border-gray-300 focus:ring-[var(--color-primary-dark)]"}
                                />
                                <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition">
                                  {option.optionName}
                                </span>
                              </div>
                              {option.extraPrice > 0 && (
                                <span className="text-[15px] text-gray-500 font-medium">
                                  +{Number(option.extraPrice).toLocaleString('vi-VN')}đ
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-2 flex flex-col sm:flex-row items-center gap-4 w-full">
              {/* Quantity */}
              <div className="flex items-center bg-[#f3f4f6] rounded-full h-[52px] px-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-[#333] text-[16px]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Add to cart */}
              <button 
                onClick={handleAddToCart}
                disabled={!isFormValid() || isAdding || product?.status === 'SOLD_OUT'}
                className="h-[52px] px-8 bg-[var(--color-primary)] text-black rounded-full text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-[var(--color-primary-dark)] hover:text-white transition-colors shadow-sm cursor-pointer whitespace-nowrap flex-1 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingBagIcon className="w-5 h-5" />
                )}
                {product?.status === 'SOLD_OUT' 
                  ? 'ĐÃ HẾT MÓN'
                  : isAdding 
                    ? 'ĐANG THÊM...' 
                    : `THÊM VÀO GIỎ - ${calculateTotalPrice().toLocaleString('vi-VN')} đ`
                }
              </button>
            </div>

          </div>
        </div>

        {/* MOCK REVIEWS AND RELATED PRODUCTS */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black text-[#222222] uppercase">
              Đánh giá từ khách hàng
            </h2>
            <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary-dark)] text-sm font-black px-3 py-1 rounded-full">
              2 đánh giá
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-b from-[#fff9f9] to-white border border-yellow-50 rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-5">
                  <div className="text-6xl font-black text-[var(--color-primary-dark)] leading-none">
                    4.5
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2 text-amber-400 text-lg">
                    {'★★★★☆'}
                  </div>
                  <p className="text-sm text-gray-500 font-semibold mt-2">
                    Dựa trên 2 lượt đánh giá
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base bg-rose-100 text-rose-600">
                      T
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Thái An</p>
                      <p className="text-xs text-gray-400">18/09/2026</p>
                    </div>
                  </div>
                  <div className="text-amber-400">{'★★★★★'}</div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  “Sản phẩm rất ngon, giao hàng siêu nhanh, shipper thân thiện!”
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base bg-indigo-100 text-indigo-600">
                      H
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Hoàng Minh</p>
                      <p className="text-xs text-gray-400">17/09/2026</p>
                    </div>
                  </div>
                  <div className="text-amber-400">{'★★★★☆'}</div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  “Mùi vị đúng chuẩn, nhưng đá hơi nhiều chút xíu. Tuy nhiên vẫn cho 4 sao vì ngon.”
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#222222] mb-6 uppercase">
            Sản phẩm cùng loại
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-16">
            {[
              { id: '1', name: 'Nước Ép Cam', price: 29000, img: '/hc-assets/caphe-1.png' },
              { id: '2', name: 'Nước Ép Dưa Hấu', price: 29000, img: '/hc-assets/caphe-2.png' },
              { id: '3', name: 'Trà Sữa Thái', price: 35000, img: '/hc-assets/tra-1.png' },
              { id: '4', name: 'Cà Phê Sữa Đá', price: 25000, img: '/hc-assets/caphe-3.png' },
              { id: '5', name: 'Bạc Xỉu', price: 29000, img: '/hc-assets/caphe-1.png' },
            ].map((prod) => (
              <div key={prod.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all group p-0">
                <div className="relative aspect-square w-full overflow-hidden flex items-center justify-center bg-gray-50 border-b border-gray-50">
                  <img src={prod.img} alt={prod.name} className="w-[80%] h-[80%] object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex flex-col relative bg-white">
                  <h4 className="text-[14px] font-bold text-[#333] mb-2 line-clamp-2">{prod.name}</h4>
                  <span className="text-[15px] font-bold text-[var(--color-primary-dark)]">{prod.price.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            ))}
          </div>

          {/* RECENTLY VIEWED PRODUCTS */}
          {recentlyViewed.length > 0 && (
            <div className="mt-10 border-t border-gray-100 pt-10">
              <h2 className="text-xl font-black text-[#222222] mb-6 uppercase flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sản phẩm đã xem gần đây
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {recentlyViewed.map((prod) => (
                  <Link href={`/product/${prod.id}`} key={prod.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                    <div className="relative aspect-square w-full overflow-hidden flex items-center justify-center bg-gray-50 border-b border-gray-50">
                      <img src={prod.imageUrl || '/hc-assets/caphe-1.png'} alt={prod.name} className="w-[80%] h-[80%] object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4 flex flex-col">
                      <h4 className="text-[14px] font-bold text-[#333] mb-2 line-clamp-2">{prod.name}</h4>
                      <span className="text-[15px] font-bold text-gray-700">{Number(prod.basePrice || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && successItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Thêm vào giỏ hàng thành công</span>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src={successItem.imageUrl || '/hc-assets/1_1.jpg'} 
                  alt={successItem.name} 
                  className="w-16 h-16 object-contain rounded-lg"
                  onError={e => e.currentTarget.src = '/hc-assets/1_1.jpg'}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-[#333] text-lg">{successItem.name}</h3>
                  <div className="text-[var(--color-primary-dark)] font-bold mt-1">
                    {successItem.totalPrice.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 px-4 border-2 border-[var(--color-primary)] text-black rounded-full font-bold hover:bg-yellow-50 transition-colors"
                >
                  Tiếp tục mua
                </button>
                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/cart');
                  }}
                  className="flex-1 py-3 px-4 bg-[var(--color-primary)] text-black rounded-full font-bold hover:bg-[var(--color-primary-dark)] hover:text-white transition-colors shadow-sm"
                >
                  Xem giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
