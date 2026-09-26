'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import CustomerChatBubble from '@/components/chat/CustomerChatBubble';
import ToastContainer from '@/components/common/ToastContainer';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          {children}
          <CustomerChatBubble />
          <ToastContainer />
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
