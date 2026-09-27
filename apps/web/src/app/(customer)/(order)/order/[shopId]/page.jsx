'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Route /order/[shopId]
 * Chuyển hướng sang /order?shopId=... để OrderContent render đúng shop.
 * Link từ AI Agent dạng /order/42 sẽ hoạt động đúng.
 */
export default function OrderByShopIdPage() {
  const { shopId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (shopId) {
      router.replace(`/order?shopId=${shopId}`);
    } else {
      router.replace('/order');
    }
  }, [shopId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}
