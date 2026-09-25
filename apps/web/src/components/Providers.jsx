'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import CustomerChatBubble from '@/components/chat/CustomerChatBubble';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CustomerChatBubble />
      </CartProvider>
    </AuthProvider>
  );
}
