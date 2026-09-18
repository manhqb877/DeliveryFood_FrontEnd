import OrderHeader from '@/components/layout/OrderHeader';
import OrderFooter from '@/components/layout/OrderFooter';
import FloatingActionButtons from '@/components/common/FloatingActionButtons';

export const metadata = {
  title: 'Đặt hàng - beFood',
  description: 'Giao diện đặt hàng',
};

export default function OrderLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-white font-sans flex flex-col">
      <OrderHeader />
      <main className="flex-1 w-full flex flex-col relative z-0">
        {children}
      </main>
      <OrderFooter />
      <FloatingActionButtons />
    </div>
  );
}
