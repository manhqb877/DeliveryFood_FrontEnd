import { api, setAuthSession, clearAuthSession, TOKEN_KEYS, getAccessToken } from './api';

export const authService = {
  /**
   * Đăng ký tài khoản mới (CUSTOMER, SHOP_MANAGER, SHIPPER)
   * POST /api/v1/auth/register
   */
  async register({ phone, email, fullName, password, role = 'CUSTOMER', areaId = null }) {
    const res = await api.post('/auth/register', {
      phone: phone?.trim(),
      email: email?.trim() || null,
      fullName: fullName?.trim(),
      password,
      role,
      areaId: areaId ? Number(areaId) : null,
    });
    return res.data;
  },

  /**
   * Đăng nhập với Số điện thoại + Mật khẩu
   * POST /api/v1/auth/login
   */
  async login({ phone, password }) {
    const res = await api.post('/auth/login', {
      phone: phone?.trim(),
      password,
    });

    const { accessToken, refreshToken, user } = res.data;
    setAuthSession({ accessToken, refreshToken, user });
    return res.data;
  },

  /**
   * Lấy thông tin tài khoản đang đăng nhập
   * GET /api/v1/auth/me
   */
  async getProfile() {
    const res = await api.get('/auth/me');
    if (res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(res.data));
      }
    }
    return res.data;
  },

  /**
   * Đăng xuất và vô hiệu hóa access token trong Redis
   * POST /api/v1/auth/logout
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi mạng khi logout, vẫn dọn dẹp local session
    } finally {
      clearAuthSession();
    }
  },

  /**
   * Lấy thông tin user hiện tại lưu trong LocalStorage
   */
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(TOKEN_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Kiểm tra xem user đã có token hay chưa
   */
  isAuthenticated() {
    return Boolean(getAccessToken());
  },
};
