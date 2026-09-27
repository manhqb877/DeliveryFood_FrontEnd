'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ShopRedirectPage() {
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
    <div className="bg-white min-h-[500px] w-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
