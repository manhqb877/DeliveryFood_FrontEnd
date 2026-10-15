'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  vi: {
    // Navigation & Main Header
    nav_home: 'Trang chủ',
    nav_about: 'VỀ BEFOOD',
    nav_careers: 'NGHỀ NGHIỆP',
    nav_support: 'HỖ TRỢ',
    nav_news: 'TIN TỨC',
    nav_stores: 'CỬA HÀNG',
    nav_order_now: 'ĐẶT HÀNG',
    nav_categories: 'Danh mục sản phẩm',
    nav_policy: 'Chính sách đặt hàng',
    nav_contact: 'Liên hệ',
    header_delivery: 'GIAO TẬN NƠI',
    header_account: 'Tài khoản',
    header_login: 'Đăng nhập',
    header_register: 'Đăng ký',
    header_logout: 'Đăng xuất',
    header_profile: 'Tài khoản của tôi',
    header_my_orders: 'Đơn hàng của tôi',
    header_track_order: 'Tra cứu đơn',
    header_cart: 'Giỏ hàng',
    header_search_placeholder: 'Tìm kiếm món ăn, quán ăn...',
    header_notifications: 'Thông báo',
    role_customer: 'Khách hàng',
    role_shop_manager: 'Chủ quán',
    role_shipper: 'Tài xế',
    search_results_for: 'Kết quả tìm kiếm cho',
    search_show_by: 'Hiển thị kết quả theo:',
    search_products: 'Sản phẩm',
    search_no_results: 'Không tìm thấy sản phẩm nào',
    search_see_more: 'Xem thêm sản phẩm có chứa',
    search_searching: 'Đang tìm kiếm...',

    // Home Page
    home_address_box_title: 'Địa chỉ bạn muốn giao món',
    home_address_placeholder: 'Nhập địa chỉ giao hàng',
    home_clear_address: 'Xóa địa chỉ',
    home_current_location: 'Vị trí hiện tại',
    home_searching_address: 'Đang tìm địa chỉ...',
    home_not_found_address: 'Không tìm thấy địa chỉ',
    home_near_you: 'Gần bạn',
    home_featured: 'Nổi bật',
    home_view_all: 'Xem tất cả',
    home_view_more: 'Xem thêm',
    home_shops_near_you: 'Quán ngon gần bạn',
    home_shops_featured: 'Quán ngon nổi bật',
    home_open: 'Mở cửa',
    home_order_action: 'Đặt món',
    home_direct_delivery: 'Giao tận nơi',
    home_minutes: 'phút',
    home_no_shops: 'Chưa có gian hàng nào trong khu vực',
    home_rewards_badge: 'BE MEMBER REWARDS',
    home_rewards_title: 'Dành riêng cho\nThành viên beFood',
    home_rewards_desc: 'Đăng ký thành viên để nhận ngay hàng ngàn ưu đãi giảm giá, mã freeship và tích điểm đổi quà hấp dẫn mỗi ngày!',
    home_rewards_btn: 'ĐẶT MÓN & TÍCH ĐIỂM NGAY',
    home_companion_badge: 'ƯU ĐÃI NỔI BẬT',
    home_companion_title: 'Luôn đồng hành cùng bạn',
    home_fast_30m: 'Giao nhanh 30 phút',
    home_order_now_caps: 'ĐẶT HÀNG NGAY',
    home_care_247: 'beFood Care 24/7',
    home_support_caps: 'HỖ TRỢ KHÁCH HÀNG',
    home_news_daily: 'Cập nhật liên tục',
    home_news_caps: 'TIN TỨC MỖI NGÀY',
    home_network_badge: 'MẠNG LƯỚI QUÁN ĂN TOÀN QUỐC',
    home_network_title: 'Mạng lưới cửa hàng beFood',
    home_network_desc: 'Hàng ngàn quán ăn, nhà hàng yêu thích và tài xế beFood luôn sẵn sàng phục vụ món ngon tận tay bạn nhanh chóng!',
    home_explore_shops: 'KHÁM PHÁ CỬA HÀNG',

    // Order Page (/order)
    order_shop_list_title: 'Danh sách Quán',
    order_chat_with_shop: 'Nhắn tin cho Quán',
    order_error_title: 'Lỗi tải dữ liệu quán',
    order_not_found: 'Không tìm thấy thông tin quán.',
    order_empty_shops: 'Hệ thống chưa có quán nào.',
    order_loading: 'Đang tải...',

    // Cart Page (/cart)
    cart_title: 'Giỏ hàng',
    cart_items_count: 'món',
    cart_empty_title: '“Hổng” có gì trong giỏ hết',
    cart_empty_desc: 'Về trang cửa hàng để chọn đặt hàng ngay bạn nhé!!',
    cart_order_now: 'Đặt hàng ngay',
    cart_clear_all: 'Xóa tất cả',
    cart_shop_label: 'Quán',
    cart_types: 'loại',
    cart_options_default: 'Tùy chọn: Mặc định',
    cart_edit: 'Sửa',
    cart_subtotal: 'Tổng tiền',
    cart_checkout_btn: 'Tiến hành đặt hàng',
    cart_confirm_remove: 'Xóa món này khỏi giỏ hàng?',
    cart_confirm_clear: 'Xóa toàn bộ giỏ hàng này?',

    // Auth & Login
    auth_login_title: 'Đăng nhập tài khoản',
    auth_register_title: 'Đăng ký tài khoản',
    auth_forgot_title: 'Khôi phục mật khẩu',
    auth_no_account: 'Bạn chưa có tài khoản ?',
    auth_have_account: 'Đã có tài khoản?',
    auth_register_here: 'Đăng ký tại đây',
    auth_login_here: 'Đăng nhập tại đây',
    auth_phone_or_email: 'SĐT hoặc Email',
    auth_phone_placeholder: 'Nhập SĐT hoặc Email',
    auth_password: 'Mật khẩu',
    auth_password_placeholder: 'Nhập mật khẩu',
    auth_forgot_password: 'Quên mật khẩu?',
    auth_click_here: 'Nhấn vào đây',
    auth_btn_login: 'Đăng nhập',
    auth_or_login_with: 'Hoặc đăng nhập bằng',
    auth_fullname: 'Họ và tên',
    auth_phone: 'Số điện thoại',
    auth_email: 'Email',
    auth_btn_register: 'Tạo tài khoản',
    auth_btn_continue: 'Tiếp tục',

    // Product Detail
    product_related_title: 'SẢN PHẨM CÙNG LOẠI',
    product_recently_viewed: 'SẢN PHẨM ĐÃ XEM GẦN ĐÂY',
    product_reviews: 'Đánh giá từ khách hàng',
    product_no_reviews: 'Chưa có đánh giá nào cho sản phẩm này.',
    product_add_to_cart: 'Thêm vào giỏ hàng',
    product_buy_now: 'Mua ngay',
    product_quantity: 'Số lượng',
    product_select_options: 'Tùy chọn món',
    product_required: 'Bắt buộc',
    product_optional: 'Tùy chọn',
    product_choose_max: 'Chọn tối đa',
    product_added_success: 'Đã thêm vào giỏ hàng thành công!',
    product_view_cart: 'Xem giỏ hàng',
    product_continue_order: 'Tiếp tục chọn món',
    product_original_price: 'Giá gốc',
    product_price: 'Giá',
    product_shop_info: 'Thông tin quán',

    // Support & Help Center
    support_title: 'TRUNG TÂM HỖ TRỢ KHÁCH HÀNG BEFOOD',
    support_subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn 24/7',
    support_search_placeholder: 'Nhập vấn đề bạn cần giúp đỡ (ví dụ: hủy đơn, hoàn tiền, thanh toán)...',
    support_topic_orders: 'Đơn hàng & Giao nhận',
    support_topic_orders_desc: 'Kiểm tra trạng thái, thời gian giao hàng hoặc hủy đơn',
    support_topic_payment: 'Thanh toán & Hoàn tiền',
    support_topic_payment_desc: 'Thanh toán VietQR SePay, chuyển khoản ngân hàng, hoàn tiền',
    support_topic_promo: 'Khuyến mãi & Voucher',
    support_topic_promo_desc: 'Cách dùng mã giảm giá, quyền lợi thành viên và freeship',
    support_topic_partner: 'Hợp tác Quán & Tài xế',
    support_topic_partner_desc: 'Đăng ký bán hàng trên beFood hoặc đăng ký làm shipper',
    support_faq_title: 'CÂU HỎI THƯỜNG GẶP (FAQ)',
    support_contact_direct: 'Bạn cần hỗ trợ trực tiếp?',
    support_hotline_label: 'Tổng đài chăm sóc khách hàng 24/7',
    support_email_label: 'Hòm thư tiếp nhận khiếu nại',
    support_ai_label: 'Trợ lý AI beFood thông minh',
    support_ai_desc: 'Hỗ trợ đặt món và giải đáp tức thì mọi lúc mọi nơi',
    support_btn_ai: 'Trò chuyện với AI ngay',

    // Contact
    contact_title: 'BEFOOD ORDER THUỘC CÔNG TY CỔ PHẦN BE GROUP',
    contact_form_title: 'Liên hệ với chúng tôi',
    contact_address: 'Địa chỉ',
    contact_phone: 'Số điện thoại',
    contact_email: 'Email',
    contact_name_placeholder: 'Họ và tên',
    contact_email_placeholder: 'Email của bạn',
    contact_phone_placeholder: 'Số điện thoại *',
    contact_message_placeholder: 'Nhập nội dung *',
    contact_btn_send: 'Gửi đi',
    contact_map_open: 'Mở trong Maps',

    // Footer
    footer_about_title: 'VỀ BEFOOD',
    footer_menu: 'Thực đơn',
    footer_promotions: 'Khuyến mãi',
    footer_careers: 'Nghề nghiệp',
    footer_support_link: 'Hỗ trợ khách hàng',
    footer_stores_title: 'CỬA HÀNG',
    footer_find_stores: 'Tìm kiếm cửa hàng',
    footer_track_orders: 'Tra cứu đơn hàng',
    footer_news_title: 'TIN TỨC',
    footer_latest_news: 'Tin tức mới nhất',
    footer_blog: 'Blog',
    footer_socials_title: 'MẠNG XÃ HỘI',
    footer_about_desc: 'Ứng dụng đặt đồ ăn trực tuyến hàng đầu, giao hàng nhanh chóng, hương vị tuyệt hảo tận tay.',
    footer_policies: 'Chính sách',
    footer_support: 'Hỗ trợ',
    footer_newsletter: 'Đăng ký nhận tin',
    footer_newsletter_desc: 'Nhận ngay các ưu đãi giảm giá và voucher hấp dẫn hàng tuần.',
    footer_email_placeholder: 'Nhập email của bạn...',
    footer_rights: 'Bản quyền thuộc về beFood - Be Group © 2026. Mọi quyền được bảo lưu.',
    footer_secure: '100% An toàn & Bảo mật',
  },

  en: {
    // Navigation & Main Header
    nav_home: 'Home',
    nav_about: 'ABOUT BEFOOD',
    nav_careers: 'CAREERS',
    nav_support: 'SUPPORT',
    nav_news: 'NEWS',
    nav_stores: 'STORES',
    nav_order_now: 'ORDER NOW',
    nav_categories: 'Product Categories',
    nav_policy: 'Order Policy',
    nav_contact: 'Contact',
    header_delivery: 'DIRECT DELIVERY',
    header_account: 'Account',
    header_login: 'Log In',
    header_register: 'Sign Up',
    header_logout: 'Log Out',
    header_profile: 'My Profile',
    header_my_orders: 'My Orders',
    header_track_order: 'Track Order',
    header_cart: 'Cart',
    header_search_placeholder: 'Search for dishes, restaurants...',
    header_notifications: 'Notifications',
    role_customer: 'Customer',
    role_shop_manager: 'Store Owner',
    role_shipper: 'Rider',
    search_results_for: 'Search results for',
    search_show_by: 'Show results by:',
    search_products: 'Products',
    search_no_results: 'No products found',
    search_see_more: 'See more products matching',
    search_searching: 'Searching...',

    // Home Page
    home_address_box_title: 'Where do you want food delivered?',
    home_address_placeholder: 'Enter delivery address',
    home_clear_address: 'Clear address',
    home_current_location: 'Current location',
    home_searching_address: 'Finding address...',
    home_not_found_address: 'Address not found',
    home_near_you: 'Near You',
    home_featured: 'Featured',
    home_view_all: 'View All',
    home_view_more: 'View more',
    home_shops_near_you: 'Restaurants near you',
    home_shops_featured: 'Featured restaurants',
    home_open: 'Open',
    home_order_action: 'Order Now',
    home_direct_delivery: 'Direct Delivery',
    home_minutes: 'mins',
    home_no_shops: 'No restaurants available in this area yet',
    home_rewards_badge: 'BE MEMBER REWARDS',
    home_rewards_title: 'Exclusive for\nbeFood Members',
    home_rewards_desc: 'Sign up as a member to get thousands of discounts, free delivery codes, and earn reward points every day!',
    home_rewards_btn: 'ORDER & EARN POINTS NOW',
    home_companion_badge: 'FEATURED OFFERS',
    home_companion_title: 'Always by your side',
    home_fast_30m: 'Fast 30-min delivery',
    home_order_now_caps: 'ORDER NOW',
    home_care_247: 'beFood Care 24/7',
    home_support_caps: 'CUSTOMER SUPPORT',
    home_news_daily: 'Constantly updated',
    home_news_caps: 'DAILY NEWS',
    home_network_badge: 'NATIONWIDE RESTAURANT NETWORK',
    home_network_title: 'beFood Restaurant Network',
    home_network_desc: 'Thousands of your favorite stores, restaurants, and beFood drivers are always ready to serve delicious meals to your doorstep!',
    home_explore_shops: 'EXPLORE STORES',

    // Order Page (/order)
    order_shop_list_title: 'Restaurant List',
    order_chat_with_shop: 'Message Store',
    order_error_title: 'Failed to load restaurant',
    order_not_found: 'Restaurant information not found.',
    order_empty_shops: 'No restaurants available in the system.',
    order_loading: 'Loading...',

    // Cart Page (/cart)
    cart_title: 'Shopping Cart',
    cart_items_count: 'items',
    cart_empty_title: 'Your cart is completely empty',
    cart_empty_desc: 'Head over to our stores to pick your favorite dishes now!!',
    cart_order_now: 'Order Now',
    cart_clear_all: 'Clear All',
    cart_shop_label: 'Store',
    cart_types: 'types',
    cart_options_default: 'Options: Default',
    cart_edit: 'Edit',
    cart_subtotal: 'Total Amount',
    cart_checkout_btn: 'Proceed to Checkout',
    cart_confirm_remove: 'Remove this item from cart?',
    cart_confirm_clear: 'Clear entire cart for this store?',

    // Auth & Login
    auth_login_title: 'ACCOUNT LOGIN',
    auth_register_title: 'CREATE AN ACCOUNT',
    auth_forgot_title: 'RESET PASSWORD',
    auth_no_account: "Don't have an account?",
    auth_have_account: 'Already have an account?',
    auth_register_here: 'Sign up here',
    auth_login_here: 'Log in here',
    auth_phone_or_email: 'Phone or Email',
    auth_phone_placeholder: 'Enter Phone or Email',
    auth_password: 'Password',
    auth_password_placeholder: 'Enter password',
    auth_forgot_password: 'Forgot password?',
    auth_click_here: 'Click here',
    auth_btn_login: 'Log In',
    auth_or_login_with: 'Or log in with',
    auth_fullname: 'Full Name',
    auth_phone: 'Phone Number',
    auth_email: 'Email',
    auth_btn_register: 'Create Account',
    auth_btn_continue: 'Continue',

    // Product Detail
    product_related_title: 'SIMILAR PRODUCTS',
    product_recently_viewed: 'RECENTLY VIEWED',
    product_reviews: 'Customer Reviews',
    product_no_reviews: 'No reviews yet for this product.',
    product_add_to_cart: 'Add to Cart',
    product_buy_now: 'Buy Now',
    product_quantity: 'Quantity',
    product_select_options: 'Item Options',
    product_required: 'Required',
    product_optional: 'Optional',
    product_choose_max: 'Choose up to',
    product_added_success: 'Item successfully added to cart!',
    product_view_cart: 'View Cart',
    product_continue_order: 'Continue Shopping',
    product_original_price: 'Original Price',
    product_price: 'Price',
    product_shop_info: 'Restaurant Info',

    // Support & Help Center
    support_title: 'BEFOOD CUSTOMER SUPPORT CENTER',
    support_subtitle: 'We are here to assist and answer all your questions 24/7',
    support_search_placeholder: 'Search your issue (e.g. order cancel, refund, payment)...',
    support_topic_orders: 'Orders & Delivery',
    support_topic_orders_desc: 'Track status, delivery ETA, or cancel an order',
    support_topic_payment: 'Payment & Refunds',
    support_topic_payment_desc: 'VietQR SePay transfer, banking, refund policies',
    support_topic_promo: 'Promotions & Vouchers',
    support_topic_promo_desc: 'How to use discount codes, member rewards, and free shipping',
    support_topic_partner: 'Merchant & Driver Partners',
    support_topic_partner_desc: 'Register your food store or join as a delivery rider',
    support_faq_title: 'FREQUENTLY ASKED QUESTIONS (FAQ)',
    support_contact_direct: 'Need immediate support?',
    support_hotline_label: '24/7 Customer Care Hotline',
    support_email_label: 'Complaint & Inquiry Email',
    support_ai_label: 'Smart beFood AI Assistant',
    support_ai_desc: 'Instant answers and smart food recommendations anytime',
    support_btn_ai: 'Chat with AI Now',

    // Contact
    contact_title: 'BEFOOD ORDER - BE GROUP JOINT STOCK COMPANY',
    contact_form_title: 'Contact Us',
    contact_address: 'Address',
    contact_phone: 'Phone',
    contact_email: 'Email',
    contact_name_placeholder: 'Full name',
    contact_email_placeholder: 'Your email address',
    contact_phone_placeholder: 'Phone number *',
    contact_message_placeholder: 'Enter your message *',
    contact_btn_send: 'Send Message',
    contact_map_open: 'Open in Maps',

    // Footer
    footer_about_title: 'ABOUT BEFOOD',
    footer_menu: 'Menu',
    footer_promotions: 'Promotions',
    footer_careers: 'Careers',
    footer_support_link: 'Customer Support',
    footer_stores_title: 'STORES',
    footer_find_stores: 'Find Stores',
    footer_track_orders: 'Track Orders',
    footer_news_title: 'NEWS',
    footer_latest_news: 'Latest News',
    footer_blog: 'Blog',
    footer_socials_title: 'SOCIALS',
    footer_about_desc: 'Leading online food delivery platform bringing delicious meals right to your doorstep.',
    footer_policies: 'Policies',
    footer_support: 'Support',
    footer_newsletter: 'Subscribe to Newsletter',
    footer_newsletter_desc: 'Get exclusive discounts and attractive weekly vouchers.',
    footer_email_placeholder: 'Enter your email address...',
    footer_rights: 'Copyright belongs to beFood - Be Group © 2026. All rights reserved.',
    footer_secure: '100% Safe & Secure',
  }
};

export function LanguageProvider({ children }) {
  // Always start with 'vi' to ensure SSR and Client initial render match 100%
  const [language, setLanguageState] = useState('vi');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('befood_language');
      if (saved === 'en' || saved === 'vi') {
        setLanguageState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch (_) {}
  }, []);

  const setLanguage = (lang) => {
    if (lang !== 'vi' && lang !== 'en') return;
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('befood_language', lang);
        document.documentElement.lang = lang;
      }
    } catch (_) {}
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.vi;
    return dict[key] !== undefined ? dict[key] : (fallback || key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isMounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'vi',
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
      isMounted: true,
    };
  }
  return context;
};
