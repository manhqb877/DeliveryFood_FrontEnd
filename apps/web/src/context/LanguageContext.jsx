'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  vi: {
    // Navigation & Header
    nav_home: 'Trang chủ',
    nav_categories: 'Danh mục sản phẩm',
    nav_policy: 'Chính sách đặt hàng',
    nav_support: 'Hỗ trợ',
    nav_contact: 'Liên hệ',
    header_delivery: 'Giao tận nơi',
    header_account: 'Tài khoản',
    header_login: 'Đăng nhập',
    header_register: 'Đăng ký',
    header_logout: 'Đăng xuất',
    header_profile: 'Hồ sơ cá nhân',
    header_my_orders: 'Đơn hàng của tôi',
    header_track_order: 'Tra cứu đơn',
    header_cart: 'Giỏ hàng',
    header_search_placeholder: 'Tìm kiếm theo món ăn, quán ăn...',
    header_notifications: 'Thông báo',
    
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
    footer_about_title: 'Về beFood',
    footer_about_desc: 'Ứng dụng đặt đồ ăn trực tuyến hàng đầu, giao hàng nhanh chóng, hương vị tuyệt hảo tận tay.',
    footer_policies: 'Chính sách',
    footer_support: 'Hỗ trợ',
    footer_newsletter: 'Đăng ký nhận tin',
    footer_newsletter_desc: 'Nhận ngay các ưu đãi giảm giá và voucher hấp dẫn hàng tuần.',
    footer_rights: 'Bản quyền thuộc về beFood - Be Group © 2026. Mọi quyền được bảo lưu.',
  },

  en: {
    // Navigation & Header
    nav_home: 'Home',
    nav_categories: 'Categories',
    nav_policy: 'Order Policy',
    nav_support: 'Support',
    nav_contact: 'Contact',
    header_delivery: 'Direct Delivery',
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
    footer_about_title: 'About beFood',
    footer_about_desc: 'Leading online food delivery platform bringing delicious meals right to your doorstep.',
    footer_policies: 'Policies',
    footer_support: 'Support',
    footer_newsletter: 'Subscribe to Newsletter',
    footer_newsletter_desc: 'Get exclusive discounts and attractive weekly vouchers.',
    footer_rights: 'Copyright belongs to beFood - Be Group © 2026. All rights reserved.',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befood_language');
      if (saved === 'en' || saved === 'vi') return saved;
    }
    return 'vi';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang) => {
    if (lang !== 'vi' && lang !== 'en') return;
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('befood_language', lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.vi;
    return dict[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
