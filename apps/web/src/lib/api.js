/**
 * API Client configured for Spring Cloud API Gateway (port 8080)
 * Base URL: /api/v1 (e.g. http://localhost:8080/api/v1)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'fooddelivery_access_token',
  REFRESH_TOKEN: 'fooddelivery_refresh_token',
  USER: 'fooddelivery_user',
};

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get stored access token
 */
export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * Save auth tokens and user in localStorage
 */
export function setAuthSession({ accessToken, refreshToken, user }) {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  if (user) localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
}

/**
 * Clear all auth session data
 */
export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.USER);
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Attempt to refresh access token using refresh token
 */
async function refreshAuthToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const json = await res.json();
    if (!res.ok || json.status >= 400) {
      clearAuthSession();
      return null;
    }

    const newAccessToken = json.data?.accessToken;
    const newRefreshToken = json.data?.refreshToken;
    if (newAccessToken) {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);
      }
      return newAccessToken;
    }
  } catch {
    clearAuthSession();
  }
  return null;
}

/**
 * Universal fetch wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, config);

    // Handle 401 Unauthorized with token refresh (exclude auth endpoints)
    if (
      response.status === 401 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/register') &&
      !endpoint.includes('/auth/refresh')
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAuthToken();
        isRefreshing = false;
        if (newToken) {
          onRefreshed(newToken);
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...config, headers });
        } else {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      } else {
        // Wait for refresh in progress
        const retryToken = await new Promise((resolve) => {
          subscribeTokenRefresh((token) => resolve(token));
        });
        if (retryToken) {
          headers['Authorization'] = `Bearer ${retryToken}`;
          response = await fetch(url, { ...config, headers });
        }
      }
    }

    // Try parsing JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok || (data && typeof data === 'object' && data.status >= 400)) {
      const errorMessage =
        (typeof data === 'object' && (data.message || data.error)) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Lỗi kết nối máy chủ', 0);
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
