'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { TrashIcon, ShoppingCartIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ProductModal from '@/components/menu/ProductModal';

const API = 'http://localhost:8080/api/v1';

export default function CartPage() {
  const router = useRouter();
  const { carts, totalAmount, loading, updateCartItem, removeCartItem, clearCart } = useCart();
  const [removingId, setRemovingId] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState(null);
  const [editingProductDetail, setEditingProductDetail] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleRemove = async (cartItemId) => {
    setRemovingId(cartItemId);
    await removeCartItem(cartItemId);
    setRemovingId(null);
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      if (confirm('Xóa món này khỏi giỏ hàng?')) await removeCartItem(item.id);
    } else {
      await updateCartItem(item.id, { quantity: newQty });
    }
  };

  const handleOpenEdit = async (cartItem) => {
    setLoadingEdit(cartItem.id);
    try {
      const res = await fetch(`${API}/core/items/${cartItem.itemId}`);
      if (res.ok) {
        const product = await res.json();
        setEditingProductDetail(product);
        setEditingCartItem(cartItem);
        setEditModalOpen(true);
      } else {
        alert('Sản phẩm này không còn tồn tại hoặc đang cập nhật!');
      }
    } catch (err) {
      alert('Lỗi kết nối khi lấy thông tin sản phẩm.');
    } finally {
      setLoadingEdit(null);
    }
  };

  const handleSaveEdit = async (cartItemId, data) => {
    await updateCartItem(cartItemId, data);
  };

  const totalItems = carts.reduce((sum, c) => sum + (c.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);
  const isEmpty = !carts.length || carts.every(c => !c.items?.length);

  if (loading && !carts.length) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="bg-white min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-200 pb-6">
          <ShoppingCartIcon className="w-8 h-8 text-[var(--color-primary-dark)]" />
          <h1 className="text-[32px] font-extrabold text-[#333]">Giỏ hàng</h1>
          {totalItems > 0 && (
            <span className="bg-[var(--color-primary)] text-black text-sm font-bold px-4 py-1 rounded-full ml-2 shadow-sm border border-yellow-300">
              {totalItems} món
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-40 h-40 mb-6 relative">
              {/* Empty state SVG using primary color */}
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[var(--color-primary-dark)]">
                <path d="M40 80 L160 80 L140 180 L60 180 Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" fill="white"/>
                <path d="M70 80 C70 40, 130 40, 130 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <circle cx="100" cy="130" r="15" stroke="currentColor" strokeWidth="4" fill="none"/>
                <text x="100" y="136" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold">0</text>
                <path d="M85 155 Q100 145 115 155" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <circle cx="85" cy="148" r="3" fill="currentColor"/>
                <circle cx="115" cy="148" r="3" fill="currentColor"/>
                <line x1="10" y1="120" x2="30" y2="120" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <line x1="170" y1="120" x2="190" y2="120" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <line x1="25" y1="140" x2="40" y2="140" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <line x1="160" y1="140" x2="175" y2="140" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-[#333] mb-3">“Hổng” có gì trong giỏ hết</h2>
            <p className="text-gray-500 mb-8 text-sm">Về trang cửa hàng để chọn đặt hàng ngay bạn nhé!!</p>
            <Link href="/" className="px-10 py-3 bg-[var(--color-primary)] text-black font-bold rounded-full shadow-sm hover:bg-[var(--color-primary-dark)] transition-colors">
              Đặt hàng ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Left: Cart Items */}
            <div className="flex-1">
              {carts.filter(c => c.items?.length > 0).map(cart => (
                <div key={cart.id} className="mb-10">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Quán #{cart.shopId} <span className="text-sm text-gray-400 font-normal ml-2">({cart.items?.length} loại)</span></h3>
                    <button onClick={() => { if (confirm('Xóa toàn bộ giỏ hàng này?')) clearCart(cart.id); }} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition"><TrashIcon className="w-4 h-4" />Xóa tất cả</button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {cart.items?.map(item => (
                      <div key={item.id} className={`flex items-center gap-6 pb-6 border-b border-gray-100 transition-opacity ${removingId === item.id ? 'opacity-40' : ''}`}>
                        {/* Remove button */}
                        <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500 transition px-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Image */}
                        <div className="w-24 h-24 shrink-0 bg-white rounded border border-gray-200 overflow-hidden">
                          <img src={item.imageUrl || '/hc-assets/1_1.jpg'} alt={item.itemName} className="w-full h-full object-contain" onError={e => e.currentTarget.src = '/hc-assets/1_1.jpg'} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#333] text-[16px]">{item.itemName}</h4>
                          <div className="text-[13px] text-gray-500 mt-1 line-clamp-1">
                            {item.selectedOptions?.length > 0 ? item.selectedOptions.map(o => `${o.group}: ${o.option}`).join(' · ') : 'Tùy chọn: Bình thường'}
                          </div>
                          {item.itemNote && (
                            <div className="text-[13px] text-amber-600 mt-1 italic">
                              "{item.itemNote}"
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <button onClick={() => handleOpenEdit(item)} disabled={loadingEdit === item.id} className="text-[13px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                              {loadingEdit === item.id ? <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <PencilSquareIcon className="w-4 h-4" />}
                              Sửa
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right w-[120px]">
                          <div className="font-bold text-red-600 text-[17px]">{Number(item.totalPrice).toLocaleString('vi-VN')}đ</div>
                          <div className="text-xs text-gray-400 mt-1">{Number(item.unitPrice).toLocaleString('vi-VN')}đ / cái</div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 rounded-full h-10 w-28 shrink-0">
                          <button className="flex-1 h-full flex items-center justify-center text-gray-500 hover:text-black font-bold transition rounded-l-full" onClick={() => handleQuantityChange(item, -1)}>−</button>
                          <span className="w-8 text-center font-bold text-[#333]">{item.quantity}</span>
                          <button className="flex-1 h-full flex items-center justify-center text-gray-500 hover:text-black font-bold transition rounded-r-full" onClick={() => handleQuantityChange(item, 1)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-[450px]">
              <div className="border border-gray-200 rounded-sm p-6 md:p-8 bg-[#fafafa]">
                <h2 className="text-xl font-bold text-[#333] mb-6 pb-4 border-b border-gray-200">Tóm tắt đơn hàng</h2>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-[#333] text-lg">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[#0089cf]">{Number(totalAmount).toLocaleString('vi-VN')} đ</span>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full h-12 bg-[#337ab7] text-white rounded-sm font-medium hover:bg-[#286090] transition-colors text-[15px] uppercase flex items-center justify-center gap-2"
                >
                  Thanh toán
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {editModalOpen && editingProductDetail && (
        <ProductModal 
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          product={editingProductDetail}
          shopId={carts.find(c => c.items.some(i => i.id === editingCartItem?.id))?.shopId}
          editingItem={editingCartItem}
          onSaveEdit={handleSaveEdit}
        />
      )}
    </div>
  );
}
