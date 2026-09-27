import { Quicksand, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin", "vietnamese"],
});

import Providers from "@/components/Providers";
import AIAgentChatBubble from "@/components/chat/AIAgentChatBubble";

export const metadata = {
  title: "DeliveryFood",
  description: "Đặt đồ ăn giao hàng siêu tốc",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${quicksand.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-gray-50" suppressHydrationWarning>
        <Providers>
          {children}
          {/* AI Ordering Agent Chatbot — hiển thị trên mọi trang */}
          <AIAgentChatBubble />
        </Providers>
      </body>
    </html>
  );
}

