'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

const CART_API = 'http://localhost:8080/api/v1/carts';
const GUEST_SESSION_KEY = 'befood_guest_session_id';

function getOrCreateGuestSessionId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  // Reset nếu id quá lớn (Date.now() = 13 chữ số) - không hợp lệ với Java Long constraints
  if (!id || id.length > 10) {
    id = Math.floor(Math.random() * 999999999 + 100000000).toString();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return parseInt(id, 10);
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [carts, setCarts] = useState([]); // array of cart per shop
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = user?.id || null;
  const guestSessionId = !userId ? getOrCreateGuestSessionId() : null;

  // Tổng số lượng items qua tất cả carts
  const totalItemCount = carts.reduce((sum, cart) => {
    return sum + (cart.items?.reduce((s, i) => s + i.quantity, 0) || 0);
  }, 0);

  const totalAmount = carts.reduce((sum, cart) => {
    return sum + parseFloat(cart.subtotal || 0);
  }, 0);

  // Lấy tất cả giỏ hàng
  const fetchAllCarts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      else if (guestSessionId) params.append('guestSessionId', guestSessionId);
      else return;

      const res = await fetch(`${CART_API}/all?${params}`);
      const data = await res.json();
      if (data.status === 200 && data.data) {
        // Hydrate imageUrl from core-service for each item in the cart
        const hydratedCarts = await Promise.all(
          data.data.map(async (cart) => {
            const hydratedItems = await Promise.all(
              (cart.items || []).map(async (item) => {
                try {
                  const itemRes = await fetch(`http://localhost:8080/api/v1/core/items/${item.itemId}`);
                  if (itemRes.ok) {
                    const itemData = await itemRes.json();
                    return { ...item, imageUrl: itemData.imageUrl || null };
                  }
                } catch (e) {
                  // Ignore fetch errors and fallback to original item
                }
                return item;
              })
            );
            return { ...cart, items: hydratedItems };
          })
        );
        setCarts(hydratedCarts);
      }
    } catch (e) {
      console.error('Fetch carts error:', e);
    }
  }, [userId, guestSessionId]);

  useEffect(() => {
    fetchAllCarts();
  }, [fetchAllCarts]);

  // Thêm món vào giỏ
  const addToCart = useCallback(async ({ shopId, areaId, item, quantity, selectedOptions, itemNote }) => {
    setLoading(true);
    try {
      const body = {
        shopId,
        areaId: areaId || 1,
        itemId: item.id,
        itemName: item.name,
        unitPrice: item.basePrice,
        quantity: quantity || 1,
        selectedOptions: selectedOptions || [],
        itemNote: itemNote || null,
        userId,
        guestSessionId,
      };

      const res = await fetch(`${CART_API}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === 200) {
        await fetchAllCarts();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối' };
    } finally {
      setLoading(false);
    }
  }, [userId, guestSessionId, fetchAllCarts]);

  // Cập nhật item trong giỏ (số lượng, options)
  const updateCartItem = useCallback(async (cartItemId, { quantity, selectedOptions, itemNote }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      else if (guestSessionId) params.append('guestSessionId', guestSessionId);

      const res = await fetch(`${CART_API}/items/${cartItemId}?${params}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, selectedOptions, itemNote }),
      });
      const data = await res.json();
      if (data.status === 200) {
        await fetchAllCarts();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userId, guestSessionId, fetchAllCarts]);

  // Xóa 1 item khỏi giỏ
  const removeCartItem = useCallback(async (cartItemId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      else if (guestSessionId) params.append('guestSessionId', guestSessionId);

      const res = await fetch(`${CART_API}/items/${cartItemId}?${params}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.status === 200) {
        await fetchAllCarts();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userId, guestSessionId, fetchAllCarts]);

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async (cartId) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    else if (guestSessionId) params.append('guestSessionId', guestSessionId);

    await fetch(`${CART_API}/${cartId}?${params}`, { method: 'DELETE' });
    await fetchAllCarts();
  }, [userId, guestSessionId, fetchAllCarts]);

  const value = {
    carts,
    totalItemCount,
    totalAmount,
    loading,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    fetchAllCarts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
