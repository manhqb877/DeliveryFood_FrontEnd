// Strict mock data matching DB Schema V2 (identity_db, core_db, order_db, tracking_db, payment_db, analytics_db)

export interface User {
  id: number;
  phone: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  role: 'CUSTOMER' | 'SHOP_MANAGER' | 'SHIPPER' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'PENDING' | 'DELETED';
  area_id?: number;
  is_area_verified?: boolean;
  created_at: string;
}

export interface Area {
  id: number;
  area_code: string;
  area_name: string;
  area_type: 'CHUNG_CU' | 'KHU_CN' | 'VAN_PHONG' | 'KY_TUC_XA';
  city: string;
  district: string;
  address: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  auth_code: string;
  shipper_model: 'PLATFORM' | 'SHOP_OWN' | 'HYBRID';
  is_active: boolean;
  created_at: string;
}

export interface IntraZoneNode {
  id: number;
  area_id: number;
  node_type: 'BUILDING' | 'FLOOR' | 'UNIT' | 'ZONE' | 'WORKSHOP' | 'GATE' | 'LANDMARK';
  node_code: string;
  node_label: string;
  parent_id: number | null;
  entry_lat?: number;
  entry_lng?: number;
  is_active: boolean;
}

export interface ShopProfile {
  id: number;
  owner_id: number;
  owner_name: string;
  area_id: number;
  area_name: string;
  location_detail: string;
  building_code?: string;       // Mã tòa/cụm
  floor?: string;               // Tầng (nếu có)
  unit_number?: string;         // Số phòng/căn
  shop_lat: number;
  shop_lng: number;
  shop_name: string;
  shop_type?: 'COM_TRUA' | 'THUC_UONG' | 'AN_VUNG' | 'BANH' | 'KHAC'; // Loại hình kinh doanh
  shop_description: string;
  logo_url: string;
  cover_image_url: string;
  phone: string;
  email?: string;               // Email liên hệ quán
  zalo_link?: string;           // Zalo/Fanpage
  facebook_link?: string;
  business_license_number?: string; // Số giấy phép kinh doanh
  food_safety_cert_number?: string; // Số chứng nhận VSATTP
  tax_id?: string;              // Mã số thuế hộ cá thể
  business_hours: Array<{ day: number; open: string; close: string; is_closed: boolean }>;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejection_reason?: string;
  is_open: boolean;
  is_accepting_orders: boolean;
  max_concurrent_orders?: number;  // Số đơn cùng lúc tối đa quán chấp nhận
  avg_prep_time_minutes?: number;  // Thời gian nấu TB của quán
  min_order_value?: number;       // Đơn tối thiểu quán đặt ra
  commission_rate?: number;
  shipper_model?: 'PLATFORM' | 'SHOP_OWN' | 'HYBRID';
  documents: string[];
  approved_at?: string;
  created_at: string;
  avg_rating: number;
  total_reviews: number;
}

export interface ShipperProfile {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  id_card_number: string;
  vehicle_type: 'MOTORBIKE' | 'BICYCLE' | 'EBIKE' | 'WALKING';
  vehicle_plate: string;
  vehicle_photo_url: string;
  registered_area_ids: number[];
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  avg_rating: number;
  total_deliveries: number;
  rejection_reason?: string;
  created_at: string;
}

export interface Category {
  id: number;
  shop_id: number;
  name: string;
  description: string;
  image_url: string;
  icon_emoji?: string;          // Emoji icon (VD: 🍚 🍵 🥗)
  sort_order: number;
  is_active: boolean;
  available_from?: string;      // Từ giờ nào danh mục này hiển thị (VD: 06:00)
  available_until?: string;     // Đến giờ nào (VD: 14:00 — chỉ bán buổi sáng)
  created_at?: string;
}

export interface Item {
  id: number;
  shop_id: number;
  category_id: number;
  category_name?: string;
  name: string;
  name_en?: string;             // Tên tiếng anh (tùy chọn)
  description: string;
  image_url: string;
  extra_image_urls?: string[];  // Ảnh phụ của món
  base_price: number;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'HIDDEN' | 'DISCONTINUED';
  daily_limit?: number;         // Giới hạn suất/ngày
  daily_sold: number;
  weekly_limit?: number;        // Giới hạn suất/tuần
  prep_time_minutes: number;
  spice_level?: 'NONE' | 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT'; // Độ cay
  is_vegetarian?: boolean;      // Chay
  is_vegan?: boolean;           // Thuần chay
  is_signature?: boolean;       // Món đặc trưng/nổi bật
  allergens?: string[];         // Thông tin dị ứng (gluten, hải sản, đậu phộng...)
  tags: string[];
  calories?: number;            // Lượng calo (nếu có)
  sort_order?: number;          // Thứ tự trong danh mục
  avg_rating: number;
  total_reviews: number;
  created_at?: string;
}

export interface ItemPrice {
  id: number;
  item_id: number;
  price_name: string;
  price: number;
  price_type: 'NORMAL' | 'PEAK_HOUR' | 'OFF_PEAK' | 'SEASONAL' | 'WEEKEND' | 'HAPPY_HOUR' | 'EARLY_BIRD' | 'LATE_NIGHT' | 'PROMOTION';
  applicable_days?: number[];
  time_start?: string;
  time_end?: string;
  valid_from?: string;
  valid_until?: string;
  priority: number;
  is_active: boolean;
}

export interface ItemOption {
  id: number;
  item_id: number;
  group_name: string;
  option_name: string;
  extra_price: number;
  is_required: boolean;
  is_multiple: boolean;
  max_select: number;
  sort_order?: number;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  item_id: number;
  item_name: string;
  item_image_url?: string;
  unit_price: number;
  quantity: number;
  selected_options?: Array<{ group: string; option: string; extra_price: number }>;
  item_note?: string;
  total_price: number;
}

export interface Order {
  id: number;
  order_code: string;
  user_id?: number;
  customer_name: string;
  customer_phone: string;
  shop_id: number;
  shop_name: string;
  area_id: number;
  delivery_address: {
    building: string;
    unit: string;
    floor?: string;
    note?: string;
    lat: number;
    lng: number;
    recipient_name: string;
    recipient_phone: string;
  };
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  promotion_code?: string;
  payment_method: 'COD' | 'ONLINE' | 'WALLET';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'COD_PENDING';
  order_status: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  cancel_reason?: string;
  cancelled_by?: 'CUSTOMER' | 'GUEST' | 'SHOP' | 'SYSTEM' | 'ADMIN';
  order_note?: string;
  placed_at: string;
  confirmed_at?: string;
  ready_at?: string;
  completed_at?: string;
  items: OrderItem[];
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  old_status?: string;
  new_status: string;
  actor_type: string;
  note?: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  order_id: number;
  order_code: string;
  complainant_name: string;
  reason_type: 'WRONG_ITEM' | 'MISSING_ITEM' | 'FOOD_QUALITY' | 'LATE_DELIVERY' | 'RUDE_SHIPPER' | 'PAYMENT_ISSUE' | 'OTHER';
  description: string;
  image_urls: string[];
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolved_at?: string;
  created_at: string;
}

export interface FraudAlert {
  id: string;
  alert_type: 'PROMO_ABUSE' | 'FAKE_ORDER' | 'MASS_ACCOUNT_CREATION' | 'SUSPICIOUS_LOCATION' | 'VELOCITY_FRAUD';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user_id?: number;
  ip_address: string;
  device_fingerprint: string;
  details: Record<string, any>;
  status: 'OPEN' | 'INVESTIGATING' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED';
  review_note?: string;
  created_at: string;
}

export interface CommissionConfig {
  id: number;
  shop_id?: number;
  shop_name?: string;
  area_id?: number;
  area_name?: string;
  commission_type: 'PERCENT' | 'FIXED_PER_ORDER';
  rate: number;
  valid_from: string;
  valid_until?: string;
}

export interface CodRecord {
  id: number;
  delivery_id: number;
  order_code: string;
  shipper_id: number;
  shipper_name: string;
  shop_id: number;
  shop_name: string;
  amount: number;
  collected_at: string;
  reconcile_status: 'PENDING' | 'CONFIRMED' | 'DISPUTED';
}

export interface Transaction {
  id: number;
  order_id: number;
  order_code: string;
  transaction_type: 'ORDER_PAYMENT' | 'REFUND' | 'COD_COLLECTION' | 'WALLET_TOPUP' | 'COMMISSION_DEDUCT';
  payment_gateway: 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'COD' | 'WALLET' | 'INTERNAL';
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  gateway_transaction_id: string;
  created_at: string;
}

export interface Promotion {
  id: number;
  code: string;
  promo_type: 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'FREE_ITEM';
  scope: 'PLATFORM' | 'SHOP' | 'AREA';
  shop_id?: number;
  shop_name?: string;
  area_id?: number;
  area_name?: string;
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  total_limit?: number;
  used_count: number;
  per_user_limit: number;
  applicable_to: 'ALL' | 'CUSTOMER' | 'RESIDENT' | 'NEW_USER';
  valid_from: string;
  valid_until: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  order_id: number;
  order_code: string;
  user_name: string;
  user_phone?: string;
  user_avatar?: string;
  shop_id: number;
  shop_rating: number;
  shop_comment: string;
  food_rating?: number;         // Đánh giá chất lượng món ăn riêng
  delivery_rating?: number;     // Đánh giá shipper riêng (nếu có)
  image_urls: string[];
  shop_reply?: string;
  shop_replied_at?: string;
  created_at: string;
}

// ============ NEW: Commission Record per order (M-SHOP-04) ============
export interface CommissionRecord {
  id: number;
  order_id: number;
  order_code: string;
  shop_id: number;
  order_revenue: number;         // Doanh thu đơn hàng
  commission_rate: number;       // Tỉ lệ % hoa hồng
  commission_amount: number;     // Số tiền hoa hồng nền tảng thu
  shop_net_revenue: number;      // Doanh thu thuần quán nhận
  settlement_period: string;     // Kỳ đối soát (VD: 2026-09-W3)
  settlement_status: 'PENDING' | 'SETTLED' | 'DISPUTED';
  settled_at?: string;
  created_at: string;
}

// ============ Platform Payout Schedule (Lịch chi trả nền tảng M-SHOP-04) ============
export interface PlatformPayoutSchedule {
  id: number;
  period_code: string;
  period_name: string;
  start_date: string;
  end_date: string;
  payout_date: string;
  total_orders: number;
  order_revenue: number;
  commission_deducted: number;
  net_payout: number;
  bank_name: string;
  bank_account_mask: string;
  payout_status: 'PAID' | 'PROCESSING' | 'SCHEDULED';
  transaction_ref?: string;
  paid_at?: string;
}

// ============ Promotion Redemption Record (Chống lạm dụng khuyến mãi M-SHOP-05) ============
export interface PromotionRedemption {
  id: number;
  promotion_id: number;
  promotion_code: string;
  order_id: number;
  order_code: string;
  user_id: number;
  user_name: string;
  user_phone: string;
  order_value: number;
  discount_amount: number;
  used_at: string;
}


// ============ NEW: CustomerPurchaseRecord (danh sách khách mua) ============
export interface CustomerPurchaseRecord {
  user_id: number;
  user_name: string;
  user_phone: string;
  user_avatar?: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  last_order_code: string;
  used_vouchers: string[];        // Mã voucher đã dùng tại shop
  avg_order_value: number;
  favorite_item?: string;         // Món hay gọi nhất
  is_repeat_customer: boolean;
  review_count: number;
  avg_rating_given?: number;
}

// ============ NEW: HourlyOrderAnalysis (phân tích giờ mua) ============
export interface HourlyOrderAnalysis {
  hour: number;                  // 0-23
  order_count: number;
  revenue: number;
  avg_prep_time: number;
  peak_label?: string;           // 'Sáng sớm' | 'Giờ ăn trưa' | 'Buổi tối'
}

// ============================================================
// MOCK DATA
// ============================================================

export const initialAreas: Area[] = [
  {
    id: 1,
    area_code: 'CC_VINHOMES_Q9',
    area_name: 'Vinhomes Grand Park Q9',
    area_type: 'CHUNG_CU',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 9 (TP. Thủ Đức)',
    address: 'Đường Nguyễn Xiển, P. Long Thạnh Mỹ',
    center_lat: 10.8402,
    center_lng: 106.8351,
    radius_meters: 800,
    auth_code: 'VHG2026X',
    shipper_model: 'PLATFORM',
    is_active: true,
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 2,
    area_code: 'KCN_LINH_TRUNG',
    area_name: 'Khu Công Nghiệp Linh Trung 1',
    area_type: 'KHU_CN',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận Thủ Đức',
    address: 'QL1A, P. Linh Trung',
    center_lat: 10.8650,
    center_lng: 106.7720,
    radius_meters: 1200,
    auth_code: 'KCNLT2026',
    shipper_model: 'HYBRID',
    is_active: true,
    created_at: '2025-02-01T09:30:00Z',
  },
  {
    id: 3,
    area_code: 'SUNRISE_CITY_Q7',
    area_name: 'Chung cư Sunrise City Q7',
    area_type: 'CHUNG_CU',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    address: '23 Nguyễn Hữu Thọ, P. Tân Hưng',
    center_lat: 10.7425,
    center_lng: 106.7011,
    radius_meters: 500,
    auth_code: 'SUNRISE7',
    shipper_model: 'SHOP_OWN',
    is_active: true,
    created_at: '2025-03-15T10:00:00Z',
  }
];

export const initialIntraZoneMaps: IntraZoneNode[] = [
  { id: 101, area_id: 1, node_type: 'BUILDING', node_code: 'TOA_S1', node_label: 'Tòa S1 - Rainbow', parent_id: null, entry_lat: 10.8405, entry_lng: 106.8353, is_active: true },
  { id: 102, area_id: 1, node_type: 'FLOOR', node_code: 'TANG_15', node_label: 'Tầng 15 (S1)', parent_id: 101, is_active: true },
  { id: 103, area_id: 1, node_type: 'UNIT', node_code: 'P_1502', node_label: 'Phòng 1502', parent_id: 102, is_active: true },
  { id: 104, area_id: 1, node_type: 'BUILDING', node_code: 'TOA_S2', node_label: 'Tòa S2 - Origami', parent_id: null, entry_lat: 10.8410, entry_lng: 106.8360, is_active: true },
  { id: 105, area_id: 2, node_type: 'ZONE', node_code: 'KHU_A', node_label: 'Khu Nhà Xưởng A', parent_id: null, entry_lat: 10.8655, entry_lng: 106.7725, is_active: true },
  { id: 106, area_id: 2, node_type: 'WORKSHOP', node_code: 'XUONG_A3', node_label: 'Xưởng Điện Tử A3', parent_id: 105, is_active: true },
  { id: 107, area_id: 2, node_type: 'GATE', node_code: 'CONG_B', node_label: 'Cổng Bảo Vệ B', parent_id: null, entry_lat: 10.8640, entry_lng: 106.7710, is_active: true }
];

export const initialUsers: User[] = [
  { id: 1, phone: '0901111111', email: 'admin@hyperlocal.vn', full_name: 'Quản trị viên Hệ thống', role: 'ADMIN', status: 'ACTIVE', created_at: '2025-01-01T00:00:00Z' },
  { id: 67, phone: '01111111111', email: 'admin.011@hyperlocal.vn', full_name: 'Quản Trị Viên Hệ Thống', role: 'ADMIN', status: 'ACTIVE', created_at: '2026-09-19T16:50:50Z' },
  { id: 2, phone: '0902222222', email: 'lan.comnha@gmail.com', full_name: 'Trần Thị Lan (Cơm Nhà Chị Lan)', role: 'SHOP_MANAGER', status: 'ACTIVE', area_id: 1, is_area_verified: true, created_at: '2025-01-05T10:00:00Z' },
  { id: 3, phone: '0903333333', email: 'phukien.tra@gmail.com', full_name: 'Nguyễn Văn Phú (Trà Sữa KOI)', role: 'SHOP_MANAGER', status: 'ACTIVE', area_id: 1, is_area_verified: true, created_at: '2025-01-08T14:30:00Z' },
  { id: 4, phone: '0904444444', email: 'shop.pending@gmail.com', full_name: 'Lê Hoàng Nam (Bún Bò Huế Xưa)', role: 'SHOP_MANAGER', status: 'PENDING', area_id: 2, is_area_verified: false, created_at: '2025-09-10T09:00:00Z' },
  { id: 5, phone: '0905555555', email: 'shipper.hung@gmail.com', full_name: 'Phạm Quốc Hùng (Shipper)', role: 'SHIPPER', status: 'ACTIVE', area_id: 1, is_area_verified: true, created_at: '2025-01-12T11:00:00Z' },
  { id: 6, phone: '0906666666', email: 'shipper.tuan@gmail.com', full_name: 'Đặng Minh Tuấn (Shipper Mới)', role: 'SHIPPER', status: 'PENDING', area_id: 1, is_area_verified: false, created_at: '2025-09-12T16:00:00Z' },
  { id: 7, phone: '0907777777', email: 'khach.an@gmail.com', full_name: 'Nguyễn Thị An', role: 'CUSTOMER', status: 'ACTIVE', area_id: 1, is_area_verified: true, created_at: '2025-02-01T08:00:00Z' },
  { id: 8, phone: '0908888888', email: 'khach.binh@gmail.com', full_name: 'Vũ Minh Bình', role: 'CUSTOMER', status: 'LOCKED', area_id: 2, is_area_verified: true, created_at: '2025-02-15T09:00:00Z' },
  { id: 9, phone: '0909999999', email: 'khach.chau@gmail.com', full_name: 'Phạm Thị Châu', role: 'CUSTOMER', status: 'ACTIVE', area_id: 1, is_area_verified: true, created_at: '2025-03-01T10:00:00Z' },
  { id: 10, phone: '0910000001', email: 'khach.dung@gmail.com', full_name: 'Trần Văn Dũng', role: 'CUSTOMER', status: 'ACTIVE', area_id: 1, is_area_verified: true, created_at: '2025-03-15T11:00:00Z' },
];

export const initialShops: ShopProfile[] = [
  {
    id: 1,
    owner_id: 2,
    owner_name: 'Trần Thị Lan',
    area_id: 1,
    area_name: 'Vinhomes Grand Park Q9',
    location_detail: 'Tầng 1 Tòa S1.02, Căn Shophouse 05',
    building_code: 'TOA_S1',
    floor: 'Tầng 1 (Shophouse)',
    unit_number: 'SH-05',
    shop_lat: 10.8406,
    shop_lng: 106.8354,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    shop_type: 'COM_TRUA',
    shop_description: 'Cơm trưa văn phòng, cơm phần gia đình nấu từ nguyên liệu tươi ngon mỗi ngày. Chuyên cơm phần nấu theo kiểu Bắc Bộ.',
    logo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    phone: '0902222222',
    email: 'lan.comnha@gmail.com',
    zalo_link: 'https://zalo.me/0902222222',
    business_license_number: 'HKD-2025-HCM-123456',
    food_safety_cert_number: 'VSATTP-2025-012345',
    tax_id: '012345678',
    business_hours: [
      { day: 0, open: '08:00', close: '21:00', is_closed: false },
      { day: 1, open: '07:00', close: '21:30', is_closed: false },
      { day: 2, open: '07:00', close: '21:30', is_closed: false },
      { day: 3, open: '07:00', close: '21:30', is_closed: false },
      { day: 4, open: '07:00', close: '21:30', is_closed: false },
      { day: 5, open: '07:00', close: '21:30', is_closed: false },
      { day: 6, open: '07:30', close: '22:00', is_closed: false },
    ],
    approval_status: 'APPROVED',
    is_open: true,
    is_accepting_orders: true,
    max_concurrent_orders: 15,
    avg_prep_time_minutes: 12,
    min_order_value: 30000,
    commission_rate: 15.0,
    shipper_model: 'PLATFORM',
    documents: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500'],
    approved_at: '2025-01-06T10:00:00Z',
    created_at: '2025-01-05T10:00:00Z',
    avg_rating: 4.8,
    total_reviews: 142
  },
  {
    id: 2,
    owner_id: 3,
    owner_name: 'Nguyễn Văn Phú',
    area_id: 1,
    area_name: 'Vinhomes Grand Park Q9',
    location_detail: 'Tầng Trệt Tòa S3.05, Shop 12',
    building_code: 'TOA_S3',
    floor: 'Tầng Trệt',
    unit_number: 'SH-12',
    shop_lat: 10.8412,
    shop_lng: 106.8362,
    shop_name: 'Trà Sữa KOI & Trái Cây Tươi',
    shop_type: 'THUC_UONG',
    shop_description: 'Trà sữa đậm vị trà, kem cheese béo ngậy, topping handmade làm mới mỗi ngày.',
    logo_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    phone: '0903333333',
    email: 'koi.milktea@gmail.com',
    business_hours: [
      { day: 0, open: '09:00', close: '22:30', is_closed: false },
      { day: 1, open: '08:30', close: '22:00', is_closed: false },
      { day: 2, open: '08:30', close: '22:00', is_closed: false },
      { day: 3, open: '08:30', close: '22:00', is_closed: false },
      { day: 4, open: '08:30', close: '22:00', is_closed: false },
      { day: 5, open: '08:30', close: '22:30', is_closed: false },
      { day: 6, open: '09:00', close: '23:00', is_closed: false },
    ],
    approval_status: 'APPROVED',
    is_open: true,
    is_accepting_orders: true,
    max_concurrent_orders: 20,
    avg_prep_time_minutes: 8,
    min_order_value: 20000,
    commission_rate: 12.5,
    shipper_model: 'PLATFORM',
    documents: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500'],
    approved_at: '2025-01-09T09:00:00Z',
    created_at: '2025-01-08T14:30:00Z',
    avg_rating: 4.6,
    total_reviews: 98
  },
  {
    id: 3,
    owner_id: 4,
    owner_name: 'Lê Hoàng Nam',
    area_id: 2,
    area_name: 'Khu Công Nghiệp Linh Trung 1',
    location_detail: 'Số 15 Cổng B KCN Linh Trung',
    shop_lat: 10.8652,
    shop_lng: 106.7722,
    shop_name: 'Bún Bò Huế Xưa & Chả Cua',
    shop_type: 'AN_VUNG',
    shop_description: 'Bún bò nước dùng đậm đà ninh xương 12 tiếng, chả cua tự quết thơm nức.',
    logo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    phone: '0904444444',
    business_hours: [
      { day: 0, open: '06:00', close: '20:00', is_closed: false },
      { day: 1, open: '06:00', close: '20:00', is_closed: false },
      { day: 2, open: '06:00', close: '20:00', is_closed: false },
      { day: 3, open: '06:00', close: '20:00', is_closed: false },
      { day: 4, open: '06:00', close: '20:00', is_closed: false },
      { day: 5, open: '06:00', close: '20:00', is_closed: false },
      { day: 6, open: '06:00', close: '20:00', is_closed: false },
    ],
    approval_status: 'PENDING',
    is_open: false,
    is_accepting_orders: false,
    documents: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500'
    ],
    created_at: '2025-09-10T09:00:00Z',
    avg_rating: 0,
    total_reviews: 0
  }
];

export const initialShippers: ShipperProfile[] = [
  {
    id: 1,
    user_id: 5,
    full_name: 'Phạm Quốc Hùng',
    phone: '0905555555',
    id_card_number: '079201012345',
    vehicle_type: 'MOTORBIKE',
    vehicle_plate: '59-X3 888.99',
    vehicle_photo_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400',
    registered_area_ids: [1],
    approval_status: 'APPROVED',
    avg_rating: 4.9,
    total_deliveries: 320,
    created_at: '2025-01-12T11:00:00Z'
  },
  {
    id: 2,
    user_id: 6,
    full_name: 'Đặng Minh Tuấn',
    phone: '0906666666',
    id_card_number: '079201099887',
    vehicle_type: 'EBIKE',
    vehicle_plate: '59-MD 123.45',
    vehicle_photo_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400',
    registered_area_ids: [1, 2],
    approval_status: 'PENDING',
    avg_rating: 0,
    total_deliveries: 0,
    created_at: '2025-09-12T16:00:00Z'
  }
];

export const initialCategories: Category[] = [
  { id: 1, shop_id: 1, name: 'Cơm Phần Trưa', description: 'Cơm nóng hổi kèm canh và rau xào', icon_emoji: '🍚', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', sort_order: 1, is_active: true, available_from: '07:00', available_until: '14:00', created_at: '2025-01-05T10:00:00Z' },
  { id: 2, shop_id: 1, name: 'Món Thêm & Canh', description: 'Gọi thêm thịt, trứng, canh chua', icon_emoji: '🥣', image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200', sort_order: 2, is_active: true, created_at: '2025-01-05T10:00:00Z' },
  { id: 3, shop_id: 1, name: 'Nước Giải Khát', description: 'Trà đá, nước sâm, mơ ngâm', icon_emoji: '🥤', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200', sort_order: 3, is_active: true, created_at: '2025-01-05T10:00:00Z' },
  { id: 4, shop_id: 2, name: 'Trà Sữa Sơ Biển', description: 'Trà sữa đậm đà kèm kem cheese', icon_emoji: '🧋', image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200', sort_order: 1, is_active: true, created_at: '2025-01-08T14:30:00Z' },
  { id: 5, shop_id: 2, name: 'Trà Trái Cây Tươi', description: 'Trà đào, trà vải, trà dâu tây', icon_emoji: '🍑', image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200', sort_order: 2, is_active: true, created_at: '2025-01-08T14:30:00Z' }
];

export const initialItems: Item[] = [
  {
    id: 1,
    shop_id: 1,
    category_id: 1,
    category_name: 'Cơm Phần Trưa',
    name: 'Cơm Sườn Nướng Mật Ong',
    name_en: 'Grilled Honey Pork Rib Rice',
    description: 'Sườn cốt lết ướp sốt mật ong nướng than hoa thơm nức, ăn kèm dưa góp và canh nấm. Đặc biệt sườn nướng mềm, thịt dày.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    extra_image_urls: [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
      'https://images.unsplash.com/photo-1560717845-968823efbee1?w=400'
    ],
    base_price: 45000,
    status: 'AVAILABLE',
    daily_limit: 100,
    daily_sold: 42,
    prep_time_minutes: 10,
    spice_level: 'NONE',
    is_vegetarian: false,
    is_vegan: false,
    is_signature: true,
    allergens: [],
    tags: ['hot_deal', 'best_seller'],
    calories: 520,
    sort_order: 1,
    avg_rating: 4.9,
    total_reviews: 86,
    created_at: '2025-01-05T12:00:00Z'
  },
  {
    id: 2,
    shop_id: 1,
    category_id: 1,
    category_name: 'Cơm Phần Trưa',
    name: 'Cơm Cá Kho Tộ Nước Dừa',
    name_en: 'Braised Fish in Coconut Rice',
    description: 'Cá basa kho tộ đậm đà màu cánh gián, rắc tiêu xanh và hành lá. Nước kho sệt sánh ngon cơm.',
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    base_price: 50000,
    status: 'AVAILABLE',
    daily_limit: 50,
    daily_sold: 20,
    prep_time_minutes: 12,
    spice_level: 'MILD',
    is_vegetarian: false,
    is_vegan: false,
    allergens: ['fish'],
    tags: ['truyen_thong'],
    calories: 480,
    sort_order: 2,
    avg_rating: 4.7,
    total_reviews: 42,
    created_at: '2025-01-05T12:00:00Z'
  },
  {
    id: 3,
    shop_id: 1,
    category_id: 2,
    category_name: 'Món Thêm & Canh',
    name: 'Trứng Chiên Thịt Băm',
    name_en: 'Fried Egg with Ground Pork',
    description: 'Trứng gà chiên phồng kẹp thịt băm nêm nếm vừa vặn.',
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    base_price: 15000,
    status: 'AVAILABLE',
    daily_sold: 35,
    prep_time_minutes: 5,
    spice_level: 'NONE',
    is_vegetarian: false,
    allergens: ['eggs'],
    tags: ['mon_them'],
    calories: 180,
    sort_order: 1,
    avg_rating: 4.8,
    total_reviews: 20,
    created_at: '2025-01-05T12:00:00Z'
  },
  {
    id: 4,
    shop_id: 1,
    category_id: 1,
    category_name: 'Cơm Phần Trưa',
    name: 'Cơm Thịt Kho Trứng Cút',
    name_en: 'Braised Pork with Quail Egg Rice',
    description: 'Thịt rọi rút sườn kho nước dừa tươi mềm ngọt.',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    base_price: 48000,
    status: 'SOLD_OUT',
    daily_limit: 30,
    daily_sold: 30,
    prep_time_minutes: 10,
    spice_level: 'NONE',
    is_vegetarian: false,
    allergens: ['eggs'],
    tags: ['het_hang'],
    calories: 550,
    sort_order: 3,
    avg_rating: 4.6,
    total_reviews: 30,
    created_at: '2025-01-05T12:00:00Z'
  },
  {
    id: 5,
    shop_id: 2,
    category_id: 4,
    category_name: 'Trà Sữa Sơ Biển',
    name: 'Trà Sữa Trân Châu Hoàng Gia',
    name_en: 'Royal Pearl Milk Tea',
    description: 'Trà đen nướng kết hợp sữa tươi trân châu đường đen dẻo dai.',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400',
    base_price: 35000,
    status: 'AVAILABLE',
    daily_sold: 80,
    prep_time_minutes: 5,
    spice_level: 'NONE',
    is_vegetarian: true,
    is_vegan: false,
    is_signature: true,
    allergens: ['milk', 'gluten'],
    tags: ['best_seller'],
    calories: 320,
    sort_order: 1,
    avg_rating: 4.9,
    total_reviews: 110,
    created_at: '2025-01-08T14:30:00Z'
  }
];

export const initialItemPrices = [
  { id: 1, item_id: 1, price_name: 'Giá Tiêu Chuẩn', price: 45000, price_type: 'NORMAL' as const, priority: 0, is_active: true },
  { id: 2, item_id: 1, price_name: 'Giờ Cao Điểm Ăn Trưa (11:00-13:00)', price: 49000, price_type: 'PEAK_HOUR' as const, time_start: '11:00', time_end: '13:00', priority: 10, is_active: true },
  { id: 3, item_id: 1, price_name: 'Ưu Đãi Cuối Tuần (T7-CN)', price: 42000, price_type: 'WEEKEND' as const, applicable_days: [6, 0], priority: 5, is_active: true }
];

export const initialItemOptions = [
  { id: 1, item_id: 1, group_name: 'Chọn Canh Đi Kèm', option_name: 'Canh Nấm Thịt Băm', extra_price: 0, is_required: true, is_multiple: false, max_select: 1, sort_order: 1, is_active: true },
  { id: 2, item_id: 1, group_name: 'Chọn Canh Đi Kèm', option_name: 'Canh Chua Cà Chua', extra_price: 0, is_required: true, is_multiple: false, max_select: 1, sort_order: 2, is_active: true },
  { id: 3, item_id: 1, group_name: 'Topping Thêm', option_name: 'Thêm Sườn Nướng (+1 miếng)', extra_price: 20000, is_required: false, is_multiple: true, max_select: 2, sort_order: 1, is_active: true },
  { id: 4, item_id: 1, group_name: 'Topping Thêm', option_name: 'Thêm Trứng Ốp La', extra_price: 7000, is_required: false, is_multiple: true, max_select: 2, sort_order: 2, is_active: true }
];

export const initialOrders: Order[] = [
  {
    id: 101,
    order_code: 'ORD-20260918-A101',
    user_id: 7,
    customer_name: 'Nguyễn Thị An',
    customer_phone: '0907777777',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    area_id: 1,
    delivery_address: {
      building: 'Tòa S1.02',
      unit: 'P.1502',
      floor: '15',
      note: 'Vui lòng gọi điện trước khi lên thang máy',
      lat: 10.8407,
      lng: 106.8355,
      recipient_name: 'Nguyễn Thị An',
      recipient_phone: '0907777777'
    },
    subtotal: 95000,
    discount_amount: 15000,
    delivery_fee: 10000,
    total_amount: 90000,
    promotion_code: 'CHUNGCU15K',
    payment_method: 'ONLINE',
    payment_status: 'PAID',
    order_status: 'PLACED',
    order_note: 'Cho dưa góp nhiều một chút ạ',
    placed_at: new Date(Date.now() - 3 * 60000).toISOString(),
    items: [
      { id: 1, item_id: 1, item_name: 'Cơm Sườn Nướng Mật Ong', unit_price: 45000, quantity: 1, selected_options: [{ group: 'Chọn Canh Đi Kèm', option: 'Canh Nấm Thịt Băm', extra_price: 0 }], total_price: 45000 },
      { id: 2, item_id: 2, item_name: 'Cơm Cá Kho Tộ Nước Dừa', unit_price: 50000, quantity: 1, total_price: 50000 }
    ]
  },
  {
    id: 102,
    order_code: 'ORD-20260918-B202',
    user_id: 9,
    customer_name: 'Phạm Thị Châu',
    customer_phone: '0909999999',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    area_id: 1,
    delivery_address: {
      building: 'Tòa S1.02',
      unit: 'P.2005',
      floor: '20',
      lat: 10.8407,
      lng: 106.8355,
      recipient_name: 'Phạm Thị Châu',
      recipient_phone: '0909999999'
    },
    subtotal: 45000,
    discount_amount: 0,
    delivery_fee: 10000,
    total_amount: 55000,
    payment_method: 'COD',
    payment_status: 'COD_PENDING',
    order_status: 'CONFIRMED',
    placed_at: new Date(Date.now() - 15 * 60000).toISOString(),
    confirmed_at: new Date(Date.now() - 12 * 60000).toISOString(),
    items: [
      { id: 3, item_id: 1, item_name: 'Cơm Sườn Nướng Mật Ong', unit_price: 45000, quantity: 1, total_price: 45000 }
    ]
  },
  {
    id: 103,
    order_code: 'ORD-20260918-C303',
    user_id: 8,
    customer_name: 'Vũ Minh Bình',
    customer_phone: '0908888888',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    area_id: 1,
    delivery_address: {
      building: 'Tòa S2.05',
      unit: 'P.0804',
      floor: '8',
      lat: 10.8415,
      lng: 106.8365,
      recipient_name: 'Vũ Minh Bình',
      recipient_phone: '0908888888'
    },
    subtotal: 100000,
    discount_amount: 10000,
    delivery_fee: 10000,
    total_amount: 100000,
    promotion_code: 'LAN20K',
    payment_method: 'ONLINE',
    payment_status: 'PAID',
    order_status: 'READY_FOR_PICKUP',
    placed_at: new Date(Date.now() - 35 * 60000).toISOString(),
    confirmed_at: new Date(Date.now() - 30 * 60000).toISOString(),
    ready_at: new Date(Date.now() - 10 * 60000).toISOString(),
    items: [
      { id: 4, item_id: 2, item_name: 'Cơm Cá Kho Tộ Nước Dừa', unit_price: 50000, quantity: 2, total_price: 100000 }
    ]
  },
  {
    id: 104,
    order_code: 'ORD-20260918-D404',
    user_id: 7,
    customer_name: 'Nguyễn Thị An',
    customer_phone: '0907777777',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    area_id: 1,
    delivery_address: {
      building: 'Tòa S1.02',
      unit: 'P.1502',
      floor: '15',
      lat: 10.8407,
      lng: 106.8355,
      recipient_name: 'Nguyễn Thị An',
      recipient_phone: '0907777777'
    },
    subtotal: 60000,
    discount_amount: 0,
    delivery_fee: 10000,
    total_amount: 70000,
    payment_method: 'ONLINE',
    payment_status: 'PAID',
    order_status: 'COMPLETED',
    placed_at: '2026-09-17T12:00:00Z',
    completed_at: '2026-09-17T12:25:00Z',
    items: [
      { id: 5, item_id: 1, item_name: 'Cơm Sườn Nướng Mật Ong', unit_price: 45000, quantity: 1, total_price: 45000 },
      { id: 6, item_id: 3, item_name: 'Trứng Chiên Thịt Băm', unit_price: 15000, quantity: 1, total_price: 15000 }
    ]
  },
  {
    id: 105,
    order_code: 'ORD-20260918-E505',
    user_id: 10,
    customer_name: 'Trần Văn Dũng',
    customer_phone: '0910000001',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    area_id: 1,
    delivery_address: {
      building: 'Tòa S3.01',
      unit: 'P.0601',
      lat: 10.8420,
      lng: 106.8370,
      recipient_name: 'Trần Văn Dũng',
      recipient_phone: '0910000001'
    },
    subtotal: 135000,
    discount_amount: 0,
    delivery_fee: 10000,
    total_amount: 145000,
    payment_method: 'ONLINE',
    payment_status: 'PAID',
    order_status: 'COMPLETED',
    placed_at: '2026-09-17T18:00:00Z',
    completed_at: '2026-09-17T18:30:00Z',
    items: [
      { id: 7, item_id: 1, item_name: 'Cơm Sườn Nướng Mật Ong', unit_price: 45000, quantity: 2, total_price: 90000 },
      { id: 8, item_id: 3, item_name: 'Trứng Chiên Thịt Băm', unit_price: 15000, quantity: 3, total_price: 45000 }
    ]
  },
  {
    id: 106,
    order_code: 'ORD-20260918-F606',
    user_id: 9,
    customer_name: 'Phạm Thị Châu',
    customer_phone: '0909999999',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    area_id: 1,
    delivery_address: {
      building: 'Tòa S1.02',
      unit: 'P.2005',
      floor: '20',
      lat: 10.8407,
      lng: 106.8355,
      recipient_name: 'Phạm Thị Châu',
      recipient_phone: '0909999999'
    },
    subtotal: 50000,
    discount_amount: 10000,
    delivery_fee: 10000,
    total_amount: 50000,
    promotion_code: 'LAN20K',
    payment_method: 'WALLET',
    payment_status: 'PAID',
    order_status: 'CANCELLED',
    cancel_reason: 'Khách hàng hủy vì có việc đột xuất',
    cancelled_by: 'CUSTOMER',
    placed_at: '2026-09-16T11:00:00Z',
    items: [
      { id: 9, item_id: 2, item_name: 'Cơm Cá Kho Tộ Nước Dừa', unit_price: 50000, quantity: 1, total_price: 50000 }
    ]
  }
];

export const initialOrderStatusHistory = [
  { id: 1, order_id: 101, old_status: undefined, new_status: 'PLACED', actor_type: 'CUSTOMER', note: 'Khách hàng đặt đơn thành công', created_at: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: 2, order_id: 102, old_status: undefined, new_status: 'PLACED', actor_type: 'CUSTOMER', note: 'Khách hàng đặt đơn', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 3, order_id: 102, old_status: 'PLACED', new_status: 'CONFIRMED', actor_type: 'SHOP_MANAGER', note: 'Shop đã xác nhận đơn hàng', created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 4, order_id: 103, old_status: 'PREPARING', new_status: 'READY_FOR_PICKUP', actor_type: 'SHOP_MANAGER', note: 'Món ăn đã sẵn sàng giao', created_at: new Date(Date.now() - 10 * 60000).toISOString() }
];

export const initialComplaints = [
  {
    id: 1,
    order_id: 104,
    order_code: 'ORD-20260917-D404',
    complainant_name: 'Nguyễn Thị An',
    reason_type: 'MISSING_ITEM' as const,
    description: 'Đơn hàng đặt 2 món nhưng shipper giao tới thiếu 1 suất Trứng Chiên Thịt Băm.',
    image_urls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
    status: 'IN_REVIEW' as const,
    created_at: '2026-09-17T13:00:00Z'
  },
  {
    id: 2,
    order_id: 103,
    order_code: 'ORD-20260918-C303',
    complainant_name: 'Vũ Minh Bình',
    reason_type: 'LATE_DELIVERY' as const,
    description: 'Chờ đơn quá 45 phút chưa thấy shipper giao.',
    image_urls: [],
    status: 'OPEN' as const,
    created_at: '2026-09-18T16:40:00Z'
  }
];

export const initialFraudAlerts = [
  {
    id: 'ALERT-001',
    alert_type: 'PROMO_ABUSE' as const,
    severity: 'HIGH' as const,
    user_id: 8,
    ip_address: '113.161.45.12',
    device_fingerprint: 'fp_chrome_win_998812',
    details: {
      reason: 'Phát hiện 4 tài khoản tạo cùng 1 thiết bị dùng chung mã CHUNGCU15K',
      accounts: ['0908888888', '0908888889', '0908888890'],
      total_discount_claimed: '60,000 VND'
    },
    status: 'OPEN' as const,
    created_at: '2026-09-18T15:00:00Z'
  },
  {
    id: 'ALERT-002',
    alert_type: 'FAKE_ORDER' as const,
    severity: 'CRITICAL' as const,
    user_id: 4,
    ip_address: '27.72.105.88',
    device_fingerprint: 'fp_app_android_3311',
    details: {
      reason: 'Đặt 10 đơn liên tiếp rồi hủy sau 1 phút',
      target_shop: 'Cơm Nhà Chị Lan'
    },
    status: 'INVESTIGATING' as const,
    created_at: '2026-09-18T16:10:00Z'
  }
];

export const initialCommissionConfigs: CommissionConfig[] = [
  { id: 1, shop_id: 1, shop_name: 'Cơm Nhà Chị Lan', commission_type: 'PERCENT', rate: 15.0, valid_from: '2025-01-01T00:00:00Z' },
  { id: 2, shop_id: 2, shop_name: 'Trà Sữa KOI', commission_type: 'PERCENT', rate: 12.5, valid_from: '2025-01-01T00:00:00Z' },
  { id: 3, area_id: 1, area_name: 'Vinhomes Grand Park Q9 (Mặc Định)', commission_type: 'PERCENT', rate: 10.0, valid_from: '2025-01-01T00:00:00Z' }
];

export const initialCodRecords = [
  { id: 1, delivery_id: 501, order_code: 'ORD-20260917-D404', shipper_id: 5, shipper_name: 'Phạm Quốc Hùng', shop_id: 1, shop_name: 'Cơm Nhà Chị Lan', amount: 70000, collected_at: '2026-09-17T12:25:00Z', reconcile_status: 'CONFIRMED' as const },
  { id: 2, delivery_id: 502, order_code: 'ORD-20260918-B202', shipper_id: 5, shipper_name: 'Phạm Quốc Hùng', shop_id: 1, shop_name: 'Cơm Nhà Chị Lan', amount: 55000, collected_at: '2026-09-18T16:45:00Z', reconcile_status: 'PENDING' as const }
];

export const initialTransactions: Transaction[] = [
  { id: 1, order_id: 101, order_code: 'ORD-20260918-A101', transaction_type: 'ORDER_PAYMENT', payment_gateway: 'VNPAY', amount: 90000, status: 'SUCCESS', gateway_transaction_id: 'VNP14892019', created_at: '2026-09-18T16:50:05Z' },
  { id: 2, order_id: 103, order_code: 'ORD-20260918-C303', transaction_type: 'ORDER_PAYMENT', payment_gateway: 'MOMO', amount: 100000, status: 'SUCCESS', gateway_transaction_id: 'MOMO99281203', created_at: '2026-09-18T16:15:10Z' }
];

export const initialPromotions: Promotion[] = [
  {
    id: 1,
    code: 'CHUNGCU15K',
    promo_type: 'FIXED_AMOUNT',
    scope: 'PLATFORM',
    discount_value: 15000,
    min_order_value: 80000,
    total_limit: 500,
    used_count: 142,
    per_user_limit: 2,
    applicable_to: 'RESIDENT',
    valid_from: '2026-09-01T00:00:00Z',
    valid_until: '2026-10-31T23:59:59Z',
    approval_status: 'APPROVED',
    is_active: true,
    created_at: '2026-08-30T10:00:00Z'
  },
  {
    id: 2,
    code: 'LAN20K',
    promo_type: 'FIXED_AMOUNT',
    scope: 'SHOP',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan',
    discount_value: 20000,
    min_order_value: 120000,
    total_limit: 100,
    used_count: 35,
    per_user_limit: 1,
    applicable_to: 'ALL',
    valid_from: '2026-09-15T00:00:00Z',
    valid_until: '2026-09-30T23:59:59Z',
    approval_status: 'APPROVED',
    is_active: true,
    created_at: '2026-09-14T08:00:00Z'
  },
  {
    id: 3,
    code: 'KOIGIAM10',
    promo_type: 'PERCENT',
    scope: 'SHOP',
    shop_id: 2,
    shop_name: 'Trà Sữa KOI',
    discount_value: 10,
    min_order_value: 50000,
    max_discount_amount: 20000,
    total_limit: 200,
    used_count: 0,
    per_user_limit: 1,
    applicable_to: 'ALL',
    valid_from: '2026-09-20T00:00:00Z',
    valid_until: '2026-10-15T23:59:59Z',
    approval_status: 'PENDING',
    is_active: true,
    created_at: '2026-09-18T10:00:00Z'
  },
  {
    id: 4,
    code: 'LANHE25K',
    promo_type: 'FIXED_AMOUNT',
    scope: 'SHOP',
    shop_id: 1,
    shop_name: 'Cơm Nhà Chị Lan - Chuẩn Vị Bắc',
    discount_value: 25000,
    min_order_value: 120000,
    total_limit: 50,
    used_count: 0,
    per_user_limit: 1,
    applicable_to: 'ALL',
    valid_from: '2026-09-20T00:00:00Z',
    valid_until: '2026-10-20T23:59:59Z',
    approval_status: 'PENDING',
    is_active: true,
    created_at: '2026-09-19T09:15:00Z'
  },
  {
    id: 5,
    code: 'BUNBO15K',
    promo_type: 'FIXED_AMOUNT',
    scope: 'SHOP',
    shop_id: 4,
    shop_name: 'Bún Bò Huế Xưa',
    discount_value: 15000,
    min_order_value: 80000,
    total_limit: 30,
    used_count: 0,
    per_user_limit: 1,
    applicable_to: 'ALL',
    valid_from: '2026-09-20T00:00:00Z',
    valid_until: '2026-10-10T23:59:59Z',
    approval_status: 'PENDING',
    is_active: true,
    created_at: '2026-09-19T14:30:00Z'
  }
];

export const initialReviews: Review[] = [
  {
    id: 1,
    order_id: 104,
    order_code: 'ORD-20260917-D404',
    user_name: 'Nguyễn Thị An',
    user_phone: '0907777777',
    user_avatar: 'https://i.pravatar.cc/64?img=5',
    shop_id: 1,
    shop_rating: 5,
    food_rating: 5,
    delivery_rating: 4,
    shop_comment: 'Cơm sườn nướng mặn ngọt đậm đà, giao lên tới tầng 15 còn nóng hổi! Lần sau sẽ tiếp tục ủng hộ quán.',
    image_urls: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=400'],
    shop_reply: 'Cảm ơn bạn An đã ủng hộ quán nhé! Chúc bạn có bữa ăn ngon miệng!',
    shop_replied_at: '2026-09-17T14:00:00Z',
    created_at: '2026-09-17T13:00:00Z'
  },
  {
    id: 2,
    order_id: 105,
    order_code: 'ORD-20260917-E505',
    user_name: 'Trần Văn Dũng',
    user_phone: '0910000001',
    user_avatar: 'https://i.pravatar.cc/64?img=12',
    shop_id: 1,
    shop_rating: 4,
    food_rating: 4,
    delivery_rating: 5,
    shop_comment: 'Cơm ngon, phần nhiều. Hơi tiếc là sườn hơi mặn lần này. Nhưng nhìn chung vẫn rất hài lòng.',
    image_urls: [],
    created_at: '2026-09-17T19:00:00Z'
  }
];

// ============ NEW Commission Records per Order (M-SHOP-04) ============
export const initialCommissionRecords: CommissionRecord[] = [
  {
    id: 1,
    order_id: 104,
    order_code: 'ORD-20260917-D404',
    shop_id: 1,
    order_revenue: 70000,
    commission_rate: 15.0,
    commission_amount: 10500,
    shop_net_revenue: 59500,
    settlement_period: '2026-09-W3',
    settlement_status: 'SETTLED',
    settled_at: '2026-09-20T08:00:00Z',
    created_at: '2026-09-17T12:25:00Z'
  },
  {
    id: 2,
    order_id: 105,
    order_code: 'ORD-20260917-E505',
    shop_id: 1,
    order_revenue: 145000,
    commission_rate: 15.0,
    commission_amount: 21750,
    shop_net_revenue: 123250,
    settlement_period: '2026-09-W3',
    settlement_status: 'SETTLED',
    settled_at: '2026-09-20T08:00:00Z',
    created_at: '2026-09-17T18:30:00Z'
  },
  {
    id: 3,
    order_id: 101,
    order_code: 'ORD-20260918-A101',
    shop_id: 1,
    order_revenue: 90000,
    commission_rate: 15.0,
    commission_amount: 13500,
    shop_net_revenue: 76500,
    settlement_period: '2026-09-W4',
    settlement_status: 'PENDING',
    created_at: '2026-09-18T16:50:05Z'
  },
  {
    id: 4,
    order_id: 102,
    order_code: 'ORD-20260918-B202',
    shop_id: 1,
    order_revenue: 55000,
    commission_rate: 15.0,
    commission_amount: 8250,
    shop_net_revenue: 46750,
    settlement_period: '2026-09-W4',
    settlement_status: 'PENDING',
    created_at: '2026-09-18T17:00:00Z'
  },
  {
    id: 5,
    order_id: 103,
    order_code: 'ORD-20260918-C303',
    shop_id: 1,
    order_revenue: 100000,
    commission_rate: 15.0,
    commission_amount: 15000,
    shop_net_revenue: 85000,
    settlement_period: '2026-09-W4',
    settlement_status: 'PENDING',
    created_at: '2026-09-18T16:15:10Z'
  }
];

// ============ NEW Customer Purchase Records ============
export const initialCustomerPurchaseRecords: CustomerPurchaseRecord[] = [
  {
    user_id: 7,
    user_name: 'Nguyễn Thị An',
    user_phone: '0907777777',
    user_avatar: 'https://i.pravatar.cc/64?img=5',
    total_orders: 18,
    total_spent: 892000,
    last_order_at: new Date(Date.now() - 3 * 60000).toISOString(),
    last_order_code: 'ORD-20260918-A101',
    used_vouchers: ['CHUNGCU15K'],
    avg_order_value: 49556,
    favorite_item: 'Cơm Sườn Nướng Mật Ong',
    is_repeat_customer: true,
    review_count: 2,
    avg_rating_given: 5.0
  },
  {
    user_id: 9,
    user_name: 'Phạm Thị Châu',
    user_phone: '0909999999',
    user_avatar: 'https://i.pravatar.cc/64?img=22',
    total_orders: 8,
    total_spent: 412000,
    last_order_at: new Date(Date.now() - 15 * 60000).toISOString(),
    last_order_code: 'ORD-20260918-B202',
    used_vouchers: ['LAN20K'],
    avg_order_value: 51500,
    favorite_item: 'Cơm Sườn Nướng Mật Ong',
    is_repeat_customer: true,
    review_count: 0,
    avg_rating_given: undefined
  },
  {
    user_id: 8,
    user_name: 'Vũ Minh Bình',
    user_phone: '0908888888',
    user_avatar: 'https://i.pravatar.cc/64?img=15',
    total_orders: 5,
    total_spent: 280000,
    last_order_at: new Date(Date.now() - 35 * 60000).toISOString(),
    last_order_code: 'ORD-20260918-C303',
    used_vouchers: ['LAN20K', 'CHUNGCU15K'],
    avg_order_value: 56000,
    favorite_item: 'Cơm Cá Kho Tộ Nước Dừa',
    is_repeat_customer: true,
    review_count: 0,
    avg_rating_given: undefined
  },
  {
    user_id: 10,
    user_name: 'Trần Văn Dũng',
    user_phone: '0910000001',
    user_avatar: 'https://i.pravatar.cc/64?img=30',
    total_orders: 3,
    total_spent: 310000,
    last_order_at: '2026-09-17T18:30:00Z',
    last_order_code: 'ORD-20260917-E505',
    used_vouchers: [],
    avg_order_value: 103333,
    favorite_item: 'Cơm Sườn Nướng Mật Ong',
    is_repeat_customer: false,
    review_count: 1,
    avg_rating_given: 4.0
  }
];

// ============ NEW Hourly Order Analysis ============
export const initialHourlyAnalysis: HourlyOrderAnalysis[] = [
  { hour: 6, order_count: 5, revenue: 220000, avg_prep_time: 8, peak_label: 'Sáng sớm' },
  { hour: 7, order_count: 12, revenue: 540000, avg_prep_time: 10, peak_label: 'Sáng sớm' },
  { hour: 8, order_count: 22, revenue: 990000, avg_prep_time: 11, peak_label: 'Giờ sáng' },
  { hour: 9, order_count: 15, revenue: 675000, avg_prep_time: 10 },
  { hour: 10, order_count: 18, revenue: 810000, avg_prep_time: 10 },
  { hour: 11, order_count: 45, revenue: 2025000, avg_prep_time: 15, peak_label: '🔥 Trưa cao điểm' },
  { hour: 12, order_count: 68, revenue: 3060000, avg_prep_time: 18, peak_label: '🔥 Trưa cao điểm' },
  { hour: 13, order_count: 52, revenue: 2340000, avg_prep_time: 14, peak_label: '🔥 Trưa cao điểm' },
  { hour: 14, order_count: 20, revenue: 900000, avg_prep_time: 9 },
  { hour: 15, order_count: 10, revenue: 450000, avg_prep_time: 8 },
  { hour: 16, order_count: 14, revenue: 630000, avg_prep_time: 9 },
  { hour: 17, order_count: 28, revenue: 1260000, avg_prep_time: 12 },
  { hour: 18, order_count: 55, revenue: 2475000, avg_prep_time: 16, peak_label: '🌙 Tối cao điểm' },
  { hour: 19, order_count: 42, revenue: 1890000, avg_prep_time: 13, peak_label: '🌙 Tối cao điểm' },
  { hour: 20, order_count: 30, revenue: 1350000, avg_prep_time: 11 },
  { hour: 21, order_count: 12, revenue: 540000, avg_prep_time: 9 },
];

// ============ NEW Platform Payout Schedules (M-SHOP-04) ============
export const initialPayoutSchedules: PlatformPayoutSchedule[] = [
  {
    id: 1,
    period_code: '2026-09-K1',
    period_name: 'Kỳ 1 Tháng 09/2026 (01/09 - 15/09)',
    start_date: '2026-09-01',
    end_date: '2026-09-15',
    payout_date: '2026-09-18',
    total_orders: 148,
    order_revenue: 14500000,
    commission_deducted: 2175000, // 15%
    net_payout: 12325000,
    bank_name: 'MB Bank',
    bank_account_mask: '**** **** 8899',
    payout_status: 'PAID',
    transaction_ref: 'MB-FT260918-091223',
    paid_at: '2026-09-18T10:30:00Z'
  },
  {
    id: 2,
    period_code: '2026-09-K2',
    period_name: 'Kỳ 2 Tháng 09/2026 (16/09 - 30/09)',
    start_date: '2026-09-16',
    end_date: '2026-09-30',
    payout_date: '2026-10-03',
    total_orders: 52,
    order_revenue: 5200000,
    commission_deducted: 780000,
    net_payout: 4420000,
    bank_name: 'MB Bank',
    bank_account_mask: '**** **** 8899',
    payout_status: 'PROCESSING',
    transaction_ref: 'CHỜ_CHUYỂN_KHOẢN'
  },
  {
    id: 3,
    period_code: '2026-10-K1',
    period_name: 'Kỳ 1 Tháng 10/2026 (01/10 - 15/10)',
    start_date: '2026-10-01',
    end_date: '2026-10-15',
    payout_date: '2026-10-18',
    total_orders: 0,
    order_revenue: 0,
    commission_deducted: 0,
    net_payout: 0,
    bank_name: 'MB Bank',
    bank_account_mask: '**** **** 8899',
    payout_status: 'SCHEDULED'
  }
];

// ============ NEW Promotion Redemptions (M-SHOP-05 Anti-Abuse Audit) ============
export const initialPromotionRedemptions: PromotionRedemption[] = [
  {
    id: 1,
    promotion_id: 2,
    promotion_code: 'LAN20K',
    order_id: 102,
    order_code: 'ORD-20260918-B202',
    user_id: 9,
    user_name: 'Phạm Thị Châu',
    user_phone: '0909999999',
    order_value: 120000,
    discount_amount: 20000,
    used_at: '2026-09-18T16:45:00Z'
  },
  {
    id: 2,
    promotion_id: 2,
    promotion_code: 'LAN20K',
    order_id: 103,
    order_code: 'ORD-20260918-C303',
    user_id: 8,
    user_name: 'Vũ Minh Bình',
    user_phone: '0908888888',
    order_value: 140000,
    discount_amount: 20000,
    used_at: '2026-09-18T16:10:00Z'
  },
  {
    id: 3,
    promotion_id: 1,
    promotion_code: 'CHUNGCU15K',
    order_id: 101,
    order_code: 'ORD-20260918-A101',
    user_id: 7,
    user_name: 'Nguyễn Thị An',
    user_phone: '0907777777',
    order_value: 90000,
    discount_amount: 15000,
    used_at: '2026-09-18T16:50:00Z'
  }
];

