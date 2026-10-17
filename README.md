# 🖥️ Food Delivery - Frontend Applications Monorepo

[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900.svg)](https://leafletjs.com/)

Kho mã nguồn Frontend bao gồm hai ứng dụng web phục vụ đầy đủ các đối tượng trong hệ sinh thái giao đồ ăn:
1. **`Delivery_Dashboard`**: Cổng thông tin Quản trị viên (Admin) và Cửa hàng đối tác (Merchant / Restaurant Owner).
2. **`apps/web`**: Ứng dụng Web đặt đồ ăn trực tuyến dành cho Khách hàng (Customer Web Portal).

---

## 📁 Cấu Trúc Thư Mục (Repository Structure)

```
DeliveryFood_FrontEnd/
├── Delivery_Dashboard/          # Dashboard quản trị cho Admin & Chủ quán (Vite + React 19 + TS)
│   ├── src/
│   │   ├── features/
│   │   │   ├── admin/           # Quản lý hệ thống, duyệt tài xế, khiếu nại, cấu hình hoa hồng, chống gian lận
│   │   │   └── merchant/        # Quản lý thực đơn, nhận & xác nhận đơn, ví tiền quán, báo cáo doanh thu
│   │   ├── components/          # Reusable UI components, Bản đồ Leaflet, Biểu đồ Recharts
│   │   └── services/            # Axios API clients, WebSocket STOMP real-time
│   ├── package.json
│   └── vite.config.ts
│
└── apps/
    └── web/                     # Ứng dụng Web đặt món cho Khách hàng (Next.js 16 App Router)
        ├── src/
        │   ├── app/             # Trang đặt món, chi tiết quán, thanh toán, theo dõi đơn, chatbot AI
        │   ├── components/      # UI components, bản đồ tài xế, giỏ hàng ghép 2 quán
        │   └── context/         # AuthContext, CartContext, NotificationContext
        ├── package.json
        └── next.config.mjs
```

---

## 🌟 1. Delivery_Dashboard (Admin & Merchant Portal)

Cổng quản lý chuyên nghiệp vận hành theo vai trò (Role-Based Access Control):

### ✨ Tính Năng Nổi Bật
- **Dành cho Quản trị viên (Admin):**
  - **Tổng quan KPI:** Doanh thu hệ thống, số lượng đơn hoàn tất, hoa hồng thu được theo ngày/tuần/tháng (Recharts).
  - **Duyệt hồ sơ & Quản lý Tài xế:** Xem xét bằng lái, CCCD, thông tin xe và kích hoạt tài khoản Shipper.
  - **Cấu hình hoa hồng linh hoạt:** Tùy chỉnh tỷ lệ chiết khấu (%) theo từng quán hoặc toàn sàn.
  - **Phát hiện gian lận (Fraud Detection):** Giám sát cảnh báo bất thường trong hủy đơn, khoảng cách di chuyển hoặc bất thường COD.
  - **Giải quyết khiếu nại (Complaints):** Tiếp nhận và xử lý khiếu nại từ khách hàng và chủ quán.
- **Dành cho Đối tác Nhà hàng (Merchant):**
  - **Xử lý đơn hàng Real-time:** Nhận đơn hàng mới tức thì qua WebSocket, bấm nhận đơn / chuẩn bị món / gọi tài xế. Hỗ trợ xác nhận đơn ghép 2 quán.
  - **Quản lý Thực đơn & Món ăn:** Thêm, sửa, ẩn/hiện món, tạo nhóm topping/options và thiết lập giá khuyến mãi.
  - **Ví doanh thu Quán:** Nhận hoàn trả tự động tiền COD từ shipper sau khi hoàn tất giao hàng; theo dõi lịch sử nạp rút minh bạch.

### 🚀 Cách Chạy Delivery_Dashboard
```bash
cd DeliveryFood_FrontEnd/Delivery_Dashboard

# 1. Cài đặt thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển (Vite)
npm run dev
```
- Mặc định truy cập tại: **`http://localhost:5173`** (hoặc cổng hiển thị trên terminal).

---

## 🌟 2. apps/web (Customer Web Portal)

Ứng dụng web tốc độ cao xây dựng trên nền tảng **Next.js 16** với kiến trúc App Router & SSR:

### ✨ Tính Năng Nổi Bật
- **Khám phá ẩm thực:** Danh mục nhà hàng phong phú, bộ lọc thông minh theo khoảng cách, đánh giá, giá cả.
- **Trợ lý AI Đặt Món (AI Agent Chat):** Trò chuyện tự nhiên với Chatbot AI để nhận gợi ý món ăn, combo ngon miệng và áp dụng mã giảm giá phù hợp.
- **Giỏ hàng đơn quán & Giỏ hàng ghép 2 quán:** Hỗ trợ đặt món cùng lúc từ 2 cửa hàng lân cận trong một cuốc xe duy nhất để tiết kiệm phí ship.
- **Thanh toán chuyển khoản VietQR tự động:** Hiển thị mã QR ngân hàng chuẩn NAPAS, tự động đối soát giao dịch thành công theo thời gian thực qua SePay Webhook.
- **Bản đồ theo dõi trực tiếp:** Theo dõi vị trí tài xế di chuyển trên bản đồ Leaflet theo thời gian thực từ lúc lấy món tới khi giao hàng.
- **Đánh giá đa chiều:** Đánh giá chất lượng món ăn, dịch vụ quán và tác phong phục vụ của tài xế kèm bình luận và hình ảnh.

### ⚙️ Cấu Hình Môi Trường (`apps/web/.env.local`)
Tạo file `.env.local` trong thư mục `apps/web`:
```env
NEXT_PUBLIC_VIETMAP_API_KEY=809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845
NEXT_PUBLIC_API_URL=https://<your-gateway-ngrok-or-ip>/api/v1
NEXT_PUBLIC_AI_AGENT_URL=https://<your-gateway-ngrok-or-ip>
```

### 🚀 Cách Chạy apps/web
```bash
cd DeliveryFood_FrontEnd/apps/web

# 1. Cài đặt thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển (Next.js)
npm run dev
```
- Mặc định truy cập tại: **`http://localhost:3000`**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Hạng mục | Công nghệ |
| :--- | :--- |
| **Frameworks** | React 19, Next.js 16 (App Router), Vite 8 |
| **Ngôn ngữ** | TypeScript, JavaScript ES2023 |
| **Giao diện & CSS** | Tailwind CSS v4, Lucide React, Phosphor Icons |
| **Dữ liệu & Bảng biểu** | TanStack React Query, TanStack React Table, Recharts |
| **Bản đồ** | Leaflet, React Leaflet, Vietmap Routing API |
| **Thời gian thực** | WebSocket STOMP (`@stomp/stompjs`, `sockjs-client`), Socket.io |
| **HTTP Client** | Axios (tích hợp tự động gắn JWT Token và Refresh Token) |

---

## 🛡️ Giấy Phép
Dự án được phát triển cho Khóa luận tốt nghiệp (KLTN Delivery Food). Mọi quyền được bảo lưu.
