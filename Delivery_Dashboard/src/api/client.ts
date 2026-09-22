import {
  initialAreas,
  initialIntraZoneMaps,
  initialUsers,
  initialShops,
  initialShippers,
  initialCategories,
  initialItems,
  initialItemPrices,
  initialItemOptions,
  initialOrders,
  initialOrderStatusHistory,
  initialComplaints,
  initialFraudAlerts,
  initialCommissionConfigs,
  initialCodRecords,
  initialTransactions,
  initialPromotions,
  initialReviews,
  initialPayoutSchedules,
  initialPromotionRedemptions,
  initialCommissionRecords,
  User,
  Area,
  IntraZoneNode,
  ShopProfile,
  ShipperProfile,
  Category,
  Item,
  ItemPrice,
  ItemOption,
  Order,
  OrderStatusHistory,
  Complaint,
  FraudAlert,
  CommissionConfig,
  CodRecord,
  Transaction,
  Promotion,
  Review,
  PlatformPayoutSchedule,
  PromotionRedemption,
  CommissionRecord
} from './mockData';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'hyperlocal_users',
  SHOPS: 'hyperlocal_shops',
  SHIPPERS: 'hyperlocal_shippers',
  AREAS: 'hyperlocal_areas',
  INTRA_MAPS: 'hyperlocal_intra_maps',
  CATEGORIES: 'hyperlocal_categories',
  ITEMS: 'hyperlocal_items',
  ITEM_PRICES: 'hyperlocal_item_prices',
  ITEM_OPTIONS: 'hyperlocal_item_options',
  ORDERS: 'hyperlocal_orders',
  ORDER_HISTORY: 'hyperlocal_order_history',
  COMPLAINTS: 'hyperlocal_complaints',
  FRAUD_ALERTS: 'hyperlocal_fraud_alerts',
  COMMISSIONS: 'hyperlocal_commissions',
  COD_RECORDS: 'hyperlocal_cod_records',
  TRANSACTIONS: 'hyperlocal_transactions',
  PROMOTIONS: 'hyperlocal_promotions',
  PROMOTION_REDEMPTIONS: 'hyperlocal_promotion_redemptions',
  PAYOUT_SCHEDULES: 'hyperlocal_payout_schedules',
  COMMISSION_RECORDS: 'hyperlocal_commission_records',
  REVIEWS: 'hyperlocal_reviews',
};


function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Generate UUID for Idempotency-Key
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'idempotency-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
}

function mapBackendShopToProfile(data: any): ShopProfile {
  return {
    id: data.id,
    owner_id: data.ownerId || data.owner_id || 0,
    owner_name: data.ownerName || data.owner_name || 'Chủ quán',
    area_id: data.areaId || data.area_id || 1,
    area_name: data.areaName || data.area_name || 'Vinhomes Grand Park Q9',
    location_detail: data.locationDetail || data.location_detail || '',
    building_code: data.buildingCode || data.building_code || '',
    floor: data.floor || '',
    unit_number: data.unitNumber || data.unit_number || '',
    shop_name: data.shopName || data.shop_name,
    shop_type: data.shopType || data.shop_type || 'COM_TRUA',
    shop_description: data.shopDescription || data.shop_description || '',
    logo_url: data.logoUrl || data.logo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    cover_image_url: data.coverImageUrl || data.cover_image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    phone: data.phone || '',
    email: data.email || '',
    zalo_link: data.zaloLink || data.zalo_link || '',
    facebook_link: data.facebookLink || data.facebook_link || '',
    business_license_number: data.businessLicenseNumber || data.business_license_number || '',
    food_safety_cert_number: data.foodSafetyCertNumber || data.food_safety_cert_number || '',
    tax_id: data.taxId || data.tax_id || '',
    business_hours: Array.isArray(data.businessHours) ? data.businessHours : (data.business_hours || []),
    approval_status: data.approvalStatus || data.approval_status || 'APPROVED',
    is_open: data.isOpen ?? data.is_open ?? true,
    is_accepting_orders: data.isAcceptingOrders ?? data.is_accepting_orders ?? true,
    avg_rating: data.avgRating || data.avg_rating || 5.0,
    total_reviews: data.totalReviews || data.total_reviews || 0,
    shop_lat: data.shopLat ?? data.shop_lat ?? 10.77,
    shop_lng: data.shopLng ?? data.shop_lng ?? 106.69,
    documents: data.documents || [],
    created_at: data.createdAt || data.created_at || new Date().toISOString()
  };
}

export const dbService = {
  // USERS
  getUsers: async () => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/auth/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },
  updateUserStatus: async (userId: number, status: User['status']) => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/auth/admin/users/${userId}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const users = await dbService.getUsers();
        return users;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },
  resetUserPassword: async (userId: number, newPassword: string) => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/auth/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
    }
    return false;
  },

  // SHOPS
  getMyShop: async (): Promise<ShopProfile | null> => {
    const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
    const currentUserRaw = localStorage.getItem('hyperlocal_current_user');
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    // 1. Try /api/v1/auth/shops/me if token exists
    if (token) {
      try {
        const res = await fetch('http://192.168.100.151:8080/api/v1/auth/shops/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            return mapBackendShopToProfile(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch /shops/me from gateway, trying 8081 directly:', err);
        try {
          const directRes = await fetch('http://192.168.100.151:8081/api/v1/auth/shops/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (directRes.ok) {
            const directJson = await directRes.json();
            if (directJson.data) {
              return mapBackendShopToProfile(directJson.data);
            }
          }
        } catch (e2) {}
      }
    }

    // 2. Try fetching from /api/v1/core/shops and match by ownerId or userId
    if (currentUser?.id) {
      try {
        const res = await fetch('http://192.168.100.151:8080/api/v1/core/shops');
        if (res.ok) {
          const shopsList = await res.json();
          if (Array.isArray(shopsList)) {
            const found = shopsList.find((s: any) => s.ownerId === currentUser.id || s.id === currentUser.id);
            if (found) {
              return mapBackendShopToProfile(found);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch /core/shops:', err);
      }
    }

    // 3. Fallback to first shop in real backend
    try {
      const res = await fetch('http://192.168.100.151:8080/api/v1/core/shops');
      if (res.ok) {
        const shopsList = await res.json();
        if (Array.isArray(shopsList) && shopsList.length > 0) {
          return mapBackendShopToProfile(shopsList[0]);
        }
      }
    } catch (err) {
      console.warn('Fallback to real backend shops failed:', err);
    }

    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    if (currentUser?.id) {
      const localFound = shops.find(s => s.owner_id === currentUser.id);
      if (localFound) return localFound;
    }
    return shops[0] || null;
  },
  getShops: async (): Promise<ShopProfile[]> => {
    try {
      const res = await fetch('http://192.168.100.151:8080/api/v1/core/shops');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          return list.map(mapBackendShopToProfile);
        }
      }
    } catch (e) {
      console.warn('Using local shops');
    }
    return [];
  },
  getShopById: async (id: number): Promise<ShopProfile> => {
    try {
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/shops/${id}/details`);
      if (res.ok) {
        const data = await res.json();
        if (data) return mapBackendShopToProfile(data);
      }
    } catch (e) {}
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    return shops.find(s => s.id === id) || shops[0];
  },
  approveShop: async (shopId: number, approved: boolean, reason?: string) => {
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
    let targetOwnerId: number | undefined;

    const updatedShops = shops.map(s => {
      if (s.id === shopId) {
        targetOwnerId = s.owner_id;
        return {
          ...s,
          approval_status: (approved ? 'APPROVED' : 'REJECTED') as ShopProfile['approval_status'],
          rejection_reason: approved ? undefined : reason,
          approved_at: approved ? new Date().toISOString() : undefined,
          is_open: approved,
          is_accepting_orders: approved
        };
      }
      return s;
    });

    if (targetOwnerId) {
      const updatedUsers = users.map(u => {
        if (u.id === targetOwnerId) {
          return {
            ...u,
            status: (approved ? 'ACTIVE' : 'LOCKED') as User['status']
          };
        }
        return u;
      });
      setStored(STORAGE_KEYS.USERS, updatedUsers);
    }

    setStored(STORAGE_KEYS.SHOPS, updatedShops);
    return updatedShops;
  },
  registerShop: async (payload: {
    // Owner Info
    owner_name: string;
    phone: string;
    email: string;
    // Shop Details
    shop_name: string;
    shop_type?: 'COM_TRUA' | 'THUC_UONG' | 'AN_VUNG' | 'BANH' | 'KHAC';
    shop_description: string;
    area_id: number;
    area_name?: string;
    location_detail: string;
    building_code?: string;
    floor?: string;
    unit_number?: string;
    // Contact & Media
    logo_url?: string;
    cover_image_url?: string;
    business_license_number?: string;
    food_safety_cert_number?: string;
    tax_id?: string;
    documents?: string[];
    // Hours & Ops
    business_hours?: Array<{ day: number; open: string; close: string; is_closed: boolean }>;
    avg_prep_time_minutes?: number;
    min_order_value?: number;
  }) => {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const areas = getStored<Area[]>(STORAGE_KEYS.AREAS, initialAreas);

    const newUserId = Date.now();
    const newShopId = Date.now() + 1;

    const selectedArea = areas.find(a => a.id === payload.area_id) || areas[0];

    const newUser: User = {
      id: newUserId,
      phone: payload.phone,
      email: payload.email,
      full_name: payload.owner_name,
      role: 'SHOP_MANAGER',
      status: 'PENDING',
      area_id: payload.area_id,
      is_area_verified: true,
      created_at: new Date().toISOString()
    };

    const newShop: ShopProfile = {
      id: newShopId,
      owner_id: newUserId,
      owner_name: payload.owner_name,
      area_id: payload.area_id,
      area_name: payload.area_name || selectedArea.area_name,
      location_detail: payload.location_detail,
      building_code: payload.building_code || 'SH-01',
      floor: payload.floor || 'Tầng 1',
      unit_number: payload.unit_number || 'SH-01',
      shop_lat: selectedArea.center_lat,
      shop_lng: selectedArea.center_lng,
      shop_name: payload.shop_name,
      shop_type: payload.shop_type || 'COM_TRUA',
      shop_description: payload.shop_description || 'Mô tả gian hàng',
      logo_url: payload.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
      cover_image_url: payload.cover_image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      phone: payload.phone,
      email: payload.email,
      business_license_number: payload.business_license_number || 'HKD-' + Date.now(),
      food_safety_cert_number: payload.food_safety_cert_number || 'ATTP-' + Date.now(),
      tax_id: payload.tax_id || 'MST-' + Date.now(),
      business_hours: payload.business_hours || [
        { day: 0, open: '08:00', close: '21:00', is_closed: false },
        { day: 1, open: '07:00', close: '21:30', is_closed: false },
        { day: 2, open: '07:00', close: '21:30', is_closed: false },
        { day: 3, open: '07:00', close: '21:30', is_closed: false },
        { day: 4, open: '07:00', close: '21:30', is_closed: false },
        { day: 5, open: '07:00', close: '21:30', is_closed: false },
        { day: 6, open: '07:30', close: '22:00', is_closed: false }
      ],
      approval_status: 'PENDING',
      is_open: false,
      is_accepting_orders: false,
      max_concurrent_orders: 15,
      avg_prep_time_minutes: payload.avg_prep_time_minutes || 15,
      min_order_value: payload.min_order_value || 30000,
      commission_rate: 15.0,
      shipper_model: 'PLATFORM',
      documents: payload.documents && payload.documents.length > 0 ? payload.documents : ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500'],
      created_at: new Date().toISOString(),
      avg_rating: 5.0,
      total_reviews: 0
    };

    setStored(STORAGE_KEYS.USERS, [newUser, ...users]);
    setStored(STORAGE_KEYS.SHOPS, [newShop, ...shops]);

    return { user: newUser, shop: newShop };
  },
  updateShopProfile: async (shopId: number, data: Partial<ShopProfile>) => {
    // Try calling backend API if auth token exists
    const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
    if (token) {
      try {
        const res = await fetch('http://192.168.100.151:8080/api/v1/auth/shops/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            shopName: data.shop_name,
            shopDescription: data.shop_description,
            logoUrl: data.logo_url,
            coverImageUrl: data.cover_image_url,
            phone: data.phone,
            locationDetail: data.location_detail,
            businessHours: data.business_hours,
            isOpen: data.is_open,
            isAcceptingOrders: data.is_accepting_orders
          })
        });
        if (res.ok) {
          const apiRes = await res.json();
          console.log('Backend profile updated:', apiRes);
          if (apiRes.data) {
            return mapBackendShopToProfile(apiRes.data);
          }
        }
      } catch (err) {
        console.warn('Backend server unreachable, using local storage', err);
      }
    }

    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const updated = shops.map(s => s.id === shopId ? { ...s, ...data } : s);
    setStored(STORAGE_KEYS.SHOPS, updated);
    return updated.find(s => s.id === shopId);
  },
  toggleShopOpenStatus: async (shopId: number, isOpen: boolean) => {
    const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch(`http://192.168.100.151:8080/api/v1/auth/shops/me/open?isOpen=${isOpen}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Backend server unreachable, updating local storage', err);
      }
    }
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const updated = shops.map(s => s.id === shopId ? { ...s, is_open: isOpen } : s);
    setStored(STORAGE_KEYS.SHOPS, updated);
    return updated.find(s => s.id === shopId);
  },
  toggleShopAcceptingOrders: async (shopId: number, isAcceptingOrders: boolean) => {
    const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch(`http://192.168.100.151:8080/api/v1/auth/shops/me/accepting?isAcceptingOrders=${isAcceptingOrders}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Backend server unreachable, updating local storage', err);
      }
    }
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const updated = shops.map(s => s.id === shopId ? { ...s, is_accepting_orders: isAcceptingOrders } : s);
    setStored(STORAGE_KEYS.SHOPS, updated);
    return updated.find(s => s.id === shopId);
  },

  // SHIPPERS
  getShippers: async (): Promise<ShipperProfile[]> => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/auth/shippers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const resData = await res.json();
        return Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },
  approveShipper: async (shipperId: number, approved: boolean, reason?: string) => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/auth/shippers/${shipperId}/approve?approved=${approved}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await dbService.getShippers();
        setStored(STORAGE_KEYS.SHIPPERS, updated);
        return updated;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  // AREAS & INTRA ZONES
  getAreas: async () => getStored<Area[]>(STORAGE_KEYS.AREAS, initialAreas),
  saveArea: async (area: Partial<Area>) => {
    const areas = getStored<Area[]>(STORAGE_KEYS.AREAS, initialAreas);
    let updated: Area[];
    if (area.id) {
      updated = areas.map(a => a.id === area.id ? { ...a, ...area } as Area : a);
    } else {
      const newArea: Area = {
        id: Date.now(),
        area_code: area.area_code || `AREA_${Date.now()}`,
        area_name: area.area_name || 'Khu Vực Mới',
        area_type: area.area_type || 'CHUNG_CU',
        city: area.city || 'TP. Hồ Chí Minh',
        district: area.district || 'Quận 9',
        address: area.address || 'Địa chỉ',
        center_lat: area.center_lat || 10.8402,
        center_lng: area.center_lng || 106.8351,
        radius_meters: area.radius_meters || 500,
        auth_code: area.auth_code || 'CODE123',
        shipper_model: area.shipper_model || 'PLATFORM',
        is_active: true,
        created_at: new Date().toISOString()
      };
      updated = [...areas, newArea];
    }
    setStored(STORAGE_KEYS.AREAS, updated);
    return updated;
  },

  getIntraZoneMaps: async (areaId?: number) => {
    const nodes = getStored<IntraZoneNode[]>(STORAGE_KEYS.INTRA_MAPS, initialIntraZoneMaps);
    if (areaId) return nodes.filter(n => n.area_id === areaId);
    return nodes;
  },
  saveIntraZoneNode: async (node: Partial<IntraZoneNode>) => {
    const nodes = getStored<IntraZoneNode[]>(STORAGE_KEYS.INTRA_MAPS, initialIntraZoneMaps);
    let updated: IntraZoneNode[];
    if (node.id) {
      updated = nodes.map(n => n.id === node.id ? { ...n, ...node } as IntraZoneNode : n);
    } else {
      const newNode: IntraZoneNode = {
        id: Date.now(),
        area_id: node.area_id || 1,
        node_type: node.node_type || 'BUILDING',
        node_code: node.node_code || `NODE_${Date.now()}`,
        node_label: node.node_label || 'Tên Nút Mới',
        parent_id: node.parent_id || null,
        entry_lat: node.entry_lat,
        entry_lng: node.entry_lng,
        is_active: true
      };
      updated = [...nodes, newNode];
    }
    setStored(STORAGE_KEYS.INTRA_MAPS, updated);
    return updated;
  },

  // CATEGORIES
  getCategories: async (shopId: number) => {
    try {
      let targetShopId = shopId;
      const token = localStorage.getItem('hyperlocal_access_token');
      if (token) {
        const meRes = await fetch('http://192.168.100.151:8080/api/v1/auth/shops/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.data?.id) {
            targetShopId = meData.data.id;
          }
        }
      }
      
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/categories/shop/${targetShopId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend server unreachable for categories', e);
    }
    return [];
  },
  saveCategory: async (category: Partial<Category>) => {
    try {
      const isUpdate = !!category.id;
      const url = isUpdate 
        ? `http://192.168.100.151:8080/api/v1/core/categories/${category.id}` 
        : `http://192.168.100.151:8080/api/v1/core/categories`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
      console.warn('Failed to save category', await res.text());
    } catch (e) {
      console.error(e);
    }
    return null;
  },
  deleteCategory: async (id: number) => {
    try {
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        return true;
      }
    } catch(e) {
      console.error(e);
    }
    return false;
  },

  // ITEMS
  getItems: async (shopId: number) => {
    try {
      let targetShopId = shopId;
      const token = localStorage.getItem('hyperlocal_access_token');
      if (token) {
        const meRes = await fetch('http://192.168.100.151:8080/api/v1/auth/shops/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.data?.id) {
            targetShopId = meData.data.id;
          }
        }
      }

      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/shops/${targetShopId}/details`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.categories) {
          const items: Item[] = [];
          data.categories.forEach((cat: any) => {
            if (cat.items) {
              cat.items.forEach((it: any) => {
                items.push({
                  id: it.id,
                  shop_id: targetShopId,
                  category_id: cat.id,
                  name: it.name,
                  description: it.description,
                  base_price: it.basePrice || it.originalPrice || 0,
                  discount_price: it.discountPrice,
                  image_url: it.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                  status: it.status,
                  daily_sold: it.dailySold || 0,
                  daily_limit: it.dailyLimit,
                  prep_time_minutes: it.prepTimeMinutes || 15,
                  tags: it.tags || [],
                  avg_rating: it.avgRating || 5.0,
                  total_reviews: it.totalReviews || 0,
                  sort_order: it.sortOrder !== undefined ? it.sortOrder : it.id,
                  created_at: new Date().toISOString()
                });
              });
            }
          });
          return items;
        }
      }
    } catch (e) {
      console.warn('Backend server unreachable for items, using local storage', e);
    }
    return [];
  },
  getItemById: async (id: number) => {
    return undefined;
  },
  toggleItemStatus: async (itemId: number, newStatus: Item['status']) => {
    try {
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Backend server unreachable', e);
    }
    const items = getStored<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    const updated = items.map(i => i.id === itemId ? { ...i, status: newStatus } : i);
    setStored(STORAGE_KEYS.ITEMS, updated);
    return updated;
  },
  deleteItem: async (itemId: number) => {
    try {
      const url = `http://192.168.100.151:8080/api/v1/core/items/${itemId}`;
      await fetch(url, {
        method: "DELETE",
      });
    } catch(e) {}
    const items = getStored<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    const updated = items.filter(i => i.id !== itemId);
    setStored(STORAGE_KEYS.ITEMS, updated);
  },
  saveItem: async (item: Partial<Item>) => {
    try {
      const isUpdate = !!item.id;
      const url = isUpdate 
        ? `http://192.168.100.151:8080/api/v1/core/items/${item.id}`
        : `http://192.168.100.151:8080/api/v1/core/items`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: item.shop_id,
          categoryId: item.category_id,
          name: item.name,
          description: item.description,
          imageUrl: item.image_url,
          basePrice: item.base_price,
          discountPrice: item.discount_price,
          status: item.status,
          dailyLimit: item.daily_limit,
          prepTimeMinutes: item.prep_time_minutes,
          tags: item.tags,
          sortOrder: item.sort_order
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Failed to save item to backend', e);
    }
    // Fallback
    const items = getStored<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    let updated: Item[];
    if (item.id) {
      updated = items.map(i => i.id === item.id ? { ...i, ...item } as Item : i);
    } else {
      const newItem: Item = {
        id: Date.now(),
        shop_id: item.shop_id || 1,
        category_id: item.category_id || 1,
        category_name: item.category_name || 'Cơm Phần',
        name: item.name || 'Món ăn mới',
        description: item.description || '',
        image_url: item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        base_price: item.base_price || 30000,
        status: item.status || 'AVAILABLE',
        daily_limit: item.daily_limit,
        daily_sold: 0,
        prep_time_minutes: item.prep_time_minutes || 10,
        tags: item.tags || [],
        avg_rating: 5.0,
        total_reviews: 0
      };
      updated = [...items, newItem];
    }
    setStored(STORAGE_KEYS.ITEMS, updated);
    return item.id ? updated.find(i => i.id === item.id) : updated[updated.length - 1];
  },

  // ITEM PRICES
  getItemPrices: async (itemId: number) => {
    const prices = getStored<ItemPrice[]>(STORAGE_KEYS.ITEM_PRICES, initialItemPrices);
    return prices.filter(p => p.item_id === itemId);
  },
  saveItemPrice: async (price: Partial<ItemPrice>) => {
    const prices = getStored<ItemPrice[]>(STORAGE_KEYS.ITEM_PRICES, initialItemPrices);
    let updated: ItemPrice[];
    if (price.id) {
      updated = prices.map(p => p.id === price.id ? { ...p, ...price } as ItemPrice : p);
    } else {
      const newPrice: ItemPrice = {
        id: Date.now(),
        item_id: price.item_id || 1,
        price_name: price.price_name || 'Giá Giờ Vàng',
        price: price.price || 40000,
        price_type: price.price_type || 'PEAK_HOUR',
        applicable_days: price.applicable_days,
        time_start: price.time_start,
        time_end: price.time_end,
        valid_from: price.valid_from,
        valid_until: price.valid_until,
        priority: price.priority || 1,
        is_active: true
      };
      updated = [...prices, newPrice];
    }
    setStored(STORAGE_KEYS.ITEM_PRICES, updated);
    return updated;
  },
  deleteItemPrice: async (id: number) => {
    const prices = getStored<ItemPrice[]>(STORAGE_KEYS.ITEM_PRICES, initialItemPrices);
    const updated = prices.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.ITEM_PRICES, updated);
    return updated;
  },

  // ITEM OPTIONS
  getItemOptions: async (itemId: number) => {
    try {
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/items/${itemId}/options`);
      if (res.ok) {
        const list = await res.json();
        return list.map((o: any) => ({
          id: o.id,
          item_id: itemId,
          group_name: o.groupName || o.group_name,
          option_name: o.optionName || o.option_name,
          extra_price: o.extraPrice || o.extra_price,
          is_required: o.isRequired || o.is_required,
          is_multiple: o.isMultiple || o.is_multiple,
          max_select: o.maxSelect || o.max_select,
          is_active: true
        }));
      }
    } catch (e) {
      console.warn('Backend server unreachable', e);
    }
    const options = getStored<ItemOption[]>(STORAGE_KEYS.ITEM_OPTIONS, initialItemOptions);
    return options.filter(o => o.item_id === itemId);
  },
  getSuggestedOptionsByCategory: async (categoryId: number) => {
    try {
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/items/category/${categoryId}/suggested-options`);
      if (res.ok) {
        const body = await res.json();
        const arr = Array.isArray(body) ? body : (body?.data && Array.isArray(body.data) ? body.data : []);
        return arr.map((opt: any) => ({
          group_name: opt.groupName,
          option_name: opt.optionName,
          extra_price: opt.extraPrice,
          is_required: opt.isRequired,
          is_multiple: opt.isMultiple,
          max_select: opt.maxSelect,
          sort_order: opt.sortOrder
        }));
      }
    } catch(e) {}
    return [];
  },
  saveItemOption: async (option: Partial<ItemOption>) => {
    try {
      const url = `http://192.168.100.151:8080/api/v1/core/items/${option.item_id}/options`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: option.group_name,
          optionName: option.option_name,
          extraPrice: option.extra_price,
          isRequired: option.is_required,
          isMultiple: option.is_multiple,
          maxSelect: option.max_select
        })
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      console.warn('Failed to save option to backend', e);
    }
    const options = getStored<ItemOption[]>(STORAGE_KEYS.ITEM_OPTIONS, initialItemOptions);
    let updated: ItemOption[];
    if (option.id) {
      updated = options.map(o => o.id === option.id ? { ...o, ...option } as ItemOption : o);
    } else {
      const newOpt: ItemOption = {
        id: Date.now(),
        item_id: option.item_id || 1,
        group_name: option.group_name || 'Nhóm tuỳ chọn',
        option_name: option.option_name || 'Tên tuỳ chọn',
        extra_price: option.extra_price || 0,
        is_required: option.is_required || false,
        is_multiple: option.is_multiple || false,
        max_select: option.max_select || 1,
        is_active: true
      };
      updated = [...options, newOpt];
    }
    setStored(STORAGE_KEYS.ITEM_OPTIONS, updated);
    return updated;
  },
  deleteItemOption: async (id: number) => {
    try {
      await fetch(`http://192.168.100.151:8080/api/v1/core/items/options/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete option from backend', e);
    }
    const options = getStored<ItemOption[]>(STORAGE_KEYS.ITEM_OPTIONS, initialItemOptions);
    const updated = options.filter(o => o.id !== id);
    setStored(STORAGE_KEYS.ITEM_OPTIONS, updated);
    return updated;
  },

  // ORDERS & FSM
  getOrders: async (filters?: { shop_id?: number; area_id?: number; status?: string }) => {
    try {
      let targetShopId = filters?.shop_id;
      const token = localStorage.getItem('hyperlocal_access_token');
      if (!targetShopId && token) {
        try {
          const meRes = await fetch('http://192.168.100.151:8080/api/v1/auth/shops/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData?.data?.id) {
              targetShopId = meData.data.id;
            }
          }
        } catch (e) {}
      }

      if (targetShopId) {
        const res = await fetch(`http://192.168.100.151:8080/api/v1/orders/shop/${targetShopId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            let orders: Order[] = data.map((d: any) => ({
              id: d.id,
              order_code: d.orderCode,
              user_id: d.userId,
              customer_name: d.deliveryAddress?.recipientName || d.deliveryAddress?.recipient_name || 'Khách vãng lai',
              customer_phone: d.deliveryAddress?.phoneNumber || d.deliveryAddress?.recipientPhone || d.deliveryAddress?.recipient_phone || '',
              shop_id: d.shopId,
              shop_name: d.shopName || `Shop #${d.shopId}`,
              area_id: 1, // mock area
              delivery_address: {
                building: d.deliveryAddress?.address || d.deliveryAddress?.fullAddress || d.deliveryAddress?.building || '',
                unit: d.deliveryAddress?.unit || '',
                lat: d.deliveryAddress?.lat || 0,
                lng: d.deliveryAddress?.lng || 0,
                recipient_name: d.deliveryAddress?.recipientName || d.deliveryAddress?.recipient_name || '',
                recipient_phone: d.deliveryAddress?.phoneNumber || d.deliveryAddress?.recipientPhone || d.deliveryAddress?.recipient_phone || '',
                note: d.deliveryAddress?.note || ''
              },
              subtotal: d.subtotal || 0,
              discount_amount: d.discountAmount || 0,
              delivery_fee: d.deliveryFee || 0,
              total_amount: d.totalAmount || 0,
              payment_method: d.paymentMethod || 'COD',
              payment_status: d.paymentStatus || 'PENDING',
              order_status: d.orderStatus || 'PLACED',
              order_note: d.orderNote || '',
              cancel_reason: d.cancelReason,
              cancelled_by: d.cancelledBy,
              placed_at: d.placedAt,
              confirmed_at: d.confirmedAt,
              ready_at: d.readyAt,
              completed_at: d.completedAt,
              items: (d.items || []).map((it: any) => ({
                id: it.id,
                item_id: it.itemId,
                item_name: it.itemName,
                item_image_url: it.itemImage,
                unit_price: it.unitPrice,
                quantity: it.quantity,
                selected_options: (it.selectedOptions || []).map((opt: any) => ({
                  group: opt.group,
                  option: opt.option,
                  extra_price: opt.extra_price || opt.extraPrice || 0
                })),
                item_note: it.itemNote,
                total_price: it.totalPrice
              }))
            }));
            
            if (filters?.area_id) orders = orders.filter(o => o.area_id === filters.area_id);
            if (filters?.status) orders = orders.filter(o => o.order_status === filters.status);
            return orders;
          }
        }
      }
    } catch (e) {
      console.warn('Backend server unreachable for orders, using local storage', e);
    }

    let orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    if (filters?.shop_id) orders = orders.filter(o => o.shop_id === filters.shop_id);
    if (filters?.area_id) orders = orders.filter(o => o.area_id === filters.area_id);
    if (filters?.status) orders = orders.filter(o => o.order_status === filters.status);
    return orders;
  },
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch('http://192.168.100.151:8080/api/v1/orders/admin/all');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((d: any) => ({
            id: d.id,
            order_code: d.orderCode,
            user_id: d.userId,
            customer_name: d.deliveryAddress?.recipientName || d.deliveryAddress?.recipient_name || 'Khách vãng lai',
            customer_phone: d.deliveryAddress?.phoneNumber || d.deliveryAddress?.recipientPhone || d.deliveryAddress?.recipient_phone || '',
            shop_id: d.shopId,
            shop_name: d.shopName || `Shop #${d.shopId}`,
            area_id: 1,
            delivery_address: {
              building: d.deliveryAddress?.address || d.deliveryAddress?.fullAddress || d.deliveryAddress?.building || '',
              unit: d.deliveryAddress?.unit || '',
              lat: d.deliveryAddress?.lat || 0,
              lng: d.deliveryAddress?.lng || 0,
              recipient_name: d.deliveryAddress?.recipientName || d.deliveryAddress?.recipient_name || '',
              recipient_phone: d.deliveryAddress?.phoneNumber || d.deliveryAddress?.recipientPhone || d.deliveryAddress?.recipient_phone || '',
              note: d.deliveryAddress?.note || ''
            },
            subtotal: d.subtotal || 0,
            discount_amount: d.discountAmount || 0,
            delivery_fee: d.deliveryFee || 0,
            total_amount: d.totalAmount || 0,
            payment_method: d.paymentMethod || 'COD',
            payment_status: d.paymentStatus || 'PENDING',
            order_status: d.orderStatus || 'PLACED',
            order_note: d.orderNote,
            cancel_reason: d.cancelReason,
            cancelled_by: d.cancelledBy,
            placed_at: d.placedAt,
            confirmed_at: d.confirmedAt,
            ready_at: d.readyAt,
            completed_at: d.completedAt,
            items: (d.items || []).map((it: any) => ({
              id: it.id,
              item_id: it.itemId,
              item_name: it.itemName,
              item_image_url: it.itemImage,
              unit_price: it.unitPrice,
              quantity: it.quantity,
              selected_options: Array.isArray(it.selectedOptions)
                ? it.selectedOptions.map((opt: any) => ({
                    group: opt.group,
                    option: opt.option,
                    extra_price: opt.extra_price || opt.extraPrice || 0
                  }))
                : [],
              item_note: it.itemNote,
              total_price: it.totalPrice
            }))
          }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch /orders/admin/all, using stored orders', e);
    }
    return [];
  },

  updateOrderStatus: async (orderId: number, newStatus: Order['order_status'], actor: string, reason?: string) => {
    try {
      await fetch(`http://192.168.100.151:8080/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          status: newStatus,
          cancelReason: reason,
          actorType: actor
        })
      });
    } catch (err) {
      console.warn('Backend order-service unreachable, updating local storage', err);
    }

    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const history = getStored<OrderStatusHistory[]>(STORAGE_KEYS.ORDER_HISTORY, initialOrderStatusHistory);
    let oldStatus: string | undefined;

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        oldStatus = o.order_status;
        const now = new Date().toISOString();
        return {
          ...o,
          order_status: newStatus,
          cancel_reason: reason || o.cancel_reason,
          confirmed_at: newStatus === 'CONFIRMED' ? now : o.confirmed_at,
          ready_at: newStatus === 'READY_FOR_PICKUP' ? now : o.ready_at,
          completed_at: newStatus === 'COMPLETED' ? now : o.completed_at
        };
      }
      return o;
    });

    const newHistoryEntry: OrderStatusHistory = {
      id: Date.now(),
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      actor_type: actor,
      note: reason ? `Lý do: ${reason}` : `Đã chuyển sang ${newStatus}`,
      created_at: new Date().toISOString()
    };

    setStored(STORAGE_KEYS.ORDERS, updatedOrders);
    setStored(STORAGE_KEYS.ORDER_HISTORY, [newHistoryEntry, ...history]);

    try {
      const payload = {
        type: 'ORDER_STATUS_CHANGED',
        orderId,
        newStatus,
        timestamp: Date.now()
      };
      const bc = new BroadcastChannel('hyperlocal_orders');
      bc.postMessage(payload);
      bc.close();
      localStorage.setItem('hyperlocal_order_event', JSON.stringify(payload));
    } catch (e) {}

    return updatedOrders;
  },
  getOrderStatusHistory: async (orderId: number) => {
    const history = getStored<OrderStatusHistory[]>(STORAGE_KEYS.ORDER_HISTORY, initialOrderStatusHistory);
    return history.filter(h => h.order_id === orderId);
  },

  // COMPLAINTS
  getComplaints: async () => getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, initialComplaints),
  resolveComplaint: async (id: number, resolution: string, status: Complaint['status']) => {
    const list = getStored<Complaint[]>(STORAGE_KEYS.COMPLAINTS, initialComplaints);
    const updated = list.map(c => c.id === id ? { ...c, resolution, status, resolved_at: new Date().toISOString() } : c);
    setStored(STORAGE_KEYS.COMPLAINTS, updated);
    return updated;
  },

  // FRAUD ALERTS
  getFraudAlerts: async () => getStored<FraudAlert[]>(STORAGE_KEYS.FRAUD_ALERTS, initialFraudAlerts),
  reviewFraudAlert: async (id: string, status: FraudAlert['status'], note?: string) => {
    const list = getStored<FraudAlert[]>(STORAGE_KEYS.FRAUD_ALERTS, initialFraudAlerts);
    const updated = list.map(a => a.id === id ? { ...a, status, review_note: note } : a);
    setStored(STORAGE_KEYS.FRAUD_ALERTS, updated);
    return updated;
  },

  // COMMISSIONS & COD & TRANSACTIONS
  getCommissionConfigs: async () => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/commission-configs/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch(e) {}
    return [];
  },
  saveCommissionConfig: async (config: Partial<CommissionConfig>) => {
    const list = getStored<CommissionConfig[]>(STORAGE_KEYS.COMMISSIONS, initialCommissionConfigs);
    const newEntry: CommissionConfig = {
      id: Date.now(),
      shop_id: config.shop_id,
      shop_name: config.shop_name,
      area_id: config.area_id,
      area_name: config.area_name,
      commission_type: config.commission_type || 'PERCENT',
      rate: config.rate || 10,
      valid_from: new Date().toISOString()
    };
    const updated = [...list, newEntry];
    setStored(STORAGE_KEYS.COMMISSIONS, updated);
    return updated;
  },

  getCodRecords: async () => getStored<CodRecord[]>(STORAGE_KEYS.COD_RECORDS, initialCodRecords),
  reconcileCodBulk: async (ids: number[]) => {
    const list = getStored<CodRecord[]>(STORAGE_KEYS.COD_RECORDS, initialCodRecords);
    const updated = list.map(c => ids.includes(c.id) ? { ...c, reconcile_status: 'CONFIRMED' as const } : c);
    setStored(STORAGE_KEYS.COD_RECORDS, updated);
    return updated;
  },

  getTransactions: async () => getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions),

  // PROMOTIONS (M-SHOP-05 & M-ADM-05 Anti-Abuse)
  getPromotions: async (scope?: 'PLATFORM' | 'SHOP', shopId?: number) => {
    try {
      const url = scope === 'PLATFORM'
        ? 'http://192.168.100.151:8080/api/v1/promotions/platform'
        : shopId
        ? `http://192.168.100.151:8080/api/v1/promotions/shop/${shopId}`
        : 'http://192.168.100.151:8080/api/v1/promotions/admin';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: Promotion[] = data.map((d: any) => ({
            id: d.id,
            code: d.code,
            promo_type: d.promoType || 'FIXED_AMOUNT',
            scope: d.scope || (d.shopId ? 'SHOP' : 'PLATFORM'),
            shop_id: d.shopId,
            shop_name: d.shopName,
            area_id: d.areaId,
            area_name: d.areaName,
            discount_value: d.discountValue,
            min_order_value: d.minOrderValue,
            max_discount_amount: d.maxDiscountAmount,
            total_limit: d.totalLimit,
            used_count: d.usedCount || 0,
            per_user_limit: d.perUserLimit || 1,
            applicable_to: d.applicableTo || 'ALL',
            valid_from: d.validFrom,
            valid_until: d.validUntil,
            approval_status: d.approvalStatus || 'PENDING',
            is_active: d.isActive !== false,
            created_at: d.createdAt || new Date().toISOString()
          }));
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Backend core-service unreachable for promotions, using local storage fallback', e);
    }
    return [];
  },

  approvePromotion: async (id: number, approved: boolean, reason?: string) => {
    try {
      await fetch(`http://192.168.100.151:8080/api/v1/promotions/admin/${id}/approve?approved=${approved}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, rejectionReason: reason })
      });
    } catch (e) {
      console.warn('Backend core-service unreachable, updating local storage', e);
    }
    const list = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    const updated = list.map(p => p.id === id ? { ...p, approval_status: (approved ? 'APPROVED' : 'REJECTED') as Promotion['approval_status'], is_active: approved } : p);
    setStored(STORAGE_KEYS.PROMOTIONS, updated);

    // Broadcast real-time event to all tabs/windows
    try {
      const payload = {
        type: approved ? 'PROMOTION_APPROVED' : 'PROMOTION_REJECTED',
        promoId: id,
        reason,
        timestamp: Date.now()
      };
      const bc = new BroadcastChannel('hyperlocal_promotions');
      bc.postMessage(payload);
      bc.close();
      localStorage.setItem('hyperlocal_promo_event', JSON.stringify(payload));
    } catch (e) {}

    return updated;
  },

  togglePromotion: async (id: number, isActive: boolean) => {
    try {
      await fetch(`http://192.168.100.151:8080/api/v1/promotions/${id}/toggle?isActive=${isActive}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
    } catch (e) {
      console.warn('Backend core-service unreachable, updating local storage', e);
    }
    const list = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    const updated = list.map(p => p.id === id ? { ...p, is_active: isActive } : p);
    setStored(STORAGE_KEYS.PROMOTIONS, updated);

    try {
      const payload = {
        type: 'PROMOTION_TOGGLED',
        promoId: id,
        isActive,
        timestamp: Date.now()
      };
      const bc = new BroadcastChannel('hyperlocal_promotions');
      bc.postMessage(payload);
      bc.close();
      localStorage.setItem('hyperlocal_promo_event', JSON.stringify(payload));
    } catch (e) {}

    return updated;
  },

  savePromotion: async (promo: Partial<Promotion>) => {
    let savedBackendPromo: any = null;
    const formatValidDate = (dateStr?: string, defaultEnd = false) => {
      if (!dateStr) {
        return defaultEnd 
          ? new Date(Date.now() + 30 * 86400000).toISOString()
          : new Date().toISOString();
      }
      if (dateStr.includes('T')) return dateStr;
      return defaultEnd ? `${dateStr}T23:59:59Z` : `${dateStr}T00:00:00Z`;
    };

    try {
      if (promo.id && typeof promo.id === 'number' && promo.id < 1000000000) {
        // Update existing promotion on backend
        const res = await fetch(`http://192.168.100.151:8080/api/v1/promotions/${promo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: promo.code,
            promoType: promo.promo_type,
            discountValue: promo.discount_value,
            minOrderValue: promo.min_order_value,
            maxDiscountAmount: promo.max_discount_amount,
            totalLimit: promo.total_limit,
            perUserLimit: promo.per_user_limit,
            applicableTo: promo.applicable_to,
            validFrom: formatValidDate(promo.valid_from, false),
            validUntil: formatValidDate(promo.valid_until, true)
          })
        });
        if (res.ok) savedBackendPromo = await res.json();
      } else if (promo.scope === 'PLATFORM') {
        const res = await fetch('http://192.168.100.151:8080/api/v1/promotions/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: promo.code,
            promoType: promo.promo_type,
            discountValue: promo.discount_value,
            minOrderValue: promo.min_order_value,
            maxDiscountAmount: promo.max_discount_amount,
            totalLimit: promo.total_limit,
            perUserLimit: promo.per_user_limit,
            applicableTo: promo.applicable_to,
            validFrom: formatValidDate(promo.valid_from, false),
            validUntil: formatValidDate(promo.valid_until, true)
          })
        });
        if (res.ok) savedBackendPromo = await res.json();
      } else {
        const targetShopId = promo.shop_id || 1;
        const res = await fetch(`http://192.168.100.151:8080/api/v1/promotions/shop/${targetShopId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: promo.code,
            promoType: promo.promo_type,
            discountValue: promo.discount_value,
            minOrderValue: promo.min_order_value,
            maxDiscountAmount: promo.max_discount_amount,
            totalLimit: promo.total_limit,
            perUserLimit: promo.per_user_limit,
            applicableTo: promo.applicable_to,
            validFrom: formatValidDate(promo.valid_from, false),
            validUntil: formatValidDate(promo.valid_until, true)
          })
        });
        if (res.ok) savedBackendPromo = await res.json();
      }
    } catch (e) {
      console.warn('Backend core-service savePromotion unreachable, storing locally', e);
    }

    const list = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    let updated: Promotion[];
    let newOrUpdatedPromo: Promotion;

    if (promo.id) {
      updated = list.map(p => p.id === promo.id ? { ...p, ...promo } as Promotion : p);
      newOrUpdatedPromo = { ...promo } as Promotion;
    } else {
      newOrUpdatedPromo = {
        id: savedBackendPromo?.id || Date.now(),
        code: promo.code || `KM${Date.now()}`,
        promo_type: promo.promo_type || 'FIXED_AMOUNT',
        scope: promo.scope || 'SHOP',
        shop_id: promo.shop_id,
        shop_name: promo.shop_name,
        area_id: promo.area_id,
        discount_value: promo.discount_value || 10000,
        min_order_value: promo.min_order_value || 50000,
        max_discount_amount: promo.max_discount_amount,
        total_limit: promo.total_limit || 100,
        used_count: 0,
        per_user_limit: promo.per_user_limit || 1,
        applicable_to: promo.applicable_to || 'ALL',
        valid_from: promo.valid_from || new Date().toISOString(),
        valid_until: promo.valid_until || new Date(Date.now() + 30 * 86400000).toISOString(),
        approval_status: savedBackendPromo?.approvalStatus || promo.approval_status || (promo.scope === 'PLATFORM' ? 'APPROVED' : 'PENDING'),
        is_active: true,
        created_at: new Date().toISOString()
      };
      updated = [newOrUpdatedPromo, ...list];
    }
    setStored(STORAGE_KEYS.PROMOTIONS, updated);

    // Broadcast real-time event to Admin and other components
    try {
      const payload = {
        type: promo.id ? 'PROMOTION_UPDATED' : 'PROMOTION_CREATED',
        promo: newOrUpdatedPromo,
        shopName: promo.shop_name || 'Gian hàng',
        shopId: promo.shop_id,
        timestamp: Date.now()
      };
      const bc = new BroadcastChannel('hyperlocal_promotions');
      bc.postMessage(payload);
      bc.close();
      localStorage.setItem('hyperlocal_promo_event', JSON.stringify(payload));
    } catch (e) {}

    return updated;
  },

  // ANTI-ABUSE VALIDATION ENGINE (M-SHOP-05: Chống lạm dụng khuyến mãi)
  validatePromotion: async (payload: { code: string; shopId: number; userId: number; orderValue: number }): Promise<{
    valid: boolean;
    discountAmount?: number;
    finalAmount?: number;
    message: string;
  }> => {
    try {
      const res = await fetch('http://192.168.100.151:8082/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: payload.code,
          shopId: payload.shopId,
          userId: payload.userId,
          orderValue: payload.orderValue
        })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          valid: data.valid,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          message: data.message
        };
      }
    } catch (e) {
      console.warn('Backend validatePromotion unreachable, using local anti-abuse simulation');
    }

    // Client-side Anti-Abuse simulation
    const promos = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    const redemptions = getStored<PromotionRedemption[]>(STORAGE_KEYS.PROMOTION_REDEMPTIONS, initialPromotionRedemptions);
    const p = promos.find(item => item.code.toUpperCase() === payload.code.toUpperCase());

    if (!p) {
      return { valid: false, message: 'Mã khuyến mãi không tồn tại trong hệ thống!' };
    }
    if (!p.is_active) {
      return { valid: false, message: 'Mã khuyến mãi hiện đang bị tạm dừng hoạt động!' };
    }
    if (p.approval_status !== 'APPROVED') {
      return { valid: false, message: 'Mã khuyến mãi chưa được Admin sàn kiểm duyệt!' };
    }
    if (p.scope === 'SHOP' && p.shop_id && p.shop_id !== payload.shopId) {
      return { valid: false, message: 'Mã khuyến mãi này áp dụng riêng cho gian hàng khác!' };
    }
    if (payload.orderValue < p.min_order_value) {
      return {
        valid: false,
        message: `Đơn hàng (${payload.orderValue.toLocaleString()} ₫) chưa đạt giá trị tối thiểu (${p.min_order_value.toLocaleString()} ₫) để áp dụng voucher!`
      };
    }
    if (p.total_limit && p.used_count >= p.total_limit) {
      return {
        valid: false,
        message: `Mã khuyến mãi đã HẾT LƯỢT phát hành (${p.used_count}/${p.total_limit} mã). Hệ thống chống vượt ngân sách gian hàng đã kích hoạt!`
      };
    }
    const userUsedCount = redemptions.filter(r => r.promotion_code === p.code && r.user_id === payload.userId).length;
    if (p.per_user_limit && userUsedCount >= p.per_user_limit) {
      return {
        valid: false,
        message: `Khách hàng đã đạt tối đa số lượt dùng mã này (${userUsedCount}/${p.per_user_limit} lượt). Hệ thống chống lạm dụng voucher đã chặn đặt hàng!`
      };
    }

    let discount = 0;
    if (p.promo_type === 'FIXED_AMOUNT') {
      discount = p.discount_value;
    } else if (p.promo_type === 'PERCENT') {
      discount = (payload.orderValue * p.discount_value) / 100;
      if (p.max_discount_amount && discount > p.max_discount_amount) {
        discount = p.max_discount_amount;
      }
    } else if (p.promo_type === 'FREE_DELIVERY') {
      discount = 15000;
    }

    return {
      valid: true,
      discountAmount: discount,
      finalAmount: Math.max(0, payload.orderValue - discount),
      message: `Áp dụng mã thành công! Giảm ${discount.toLocaleString()} ₫.`
    };
  },

  getPromotionRedemptions: async (promotionId?: number): Promise<PromotionRedemption[]> => {
    try {
      if (promotionId) {
        const res = await fetch(`http://192.168.100.151:8082/promotions/${promotionId}/redemptions`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map((d: any) => ({
              id: d.id,
              promotion_id: d.promotionId,
              promotion_code: d.promotionCode,
              order_id: d.orderId,
              order_code: d.orderCode || `ORD-${d.orderId}`,
              user_id: d.userId,
              user_name: d.userName || `Khách hàng #${d.userId}`,
              user_phone: d.userPhone || '090xxxxxxx',
              order_value: d.orderValue,
              discount_amount: d.discountAmount,
              used_at: d.usedAt
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Backend core-service redemptions unreachable, using local data');
    }
    const list = getStored<PromotionRedemption[]>(STORAGE_KEYS.PROMOTION_REDEMPTIONS, initialPromotionRedemptions);
    if (promotionId) return list.filter(r => r.promotion_id === promotionId);
    return list;
  },

  // REVENUE & SETTLEMENT & PAYOUT (M-SHOP-04)
  getPayoutSchedules: async (): Promise<PlatformPayoutSchedule[]> => {
    return getStored<PlatformPayoutSchedule[]>(STORAGE_KEYS.PAYOUT_SCHEDULES, initialPayoutSchedules);
  },

  getCommissionRecords: async (period?: string): Promise<CommissionRecord[]> => {
    const list = getStored<CommissionRecord[]>(STORAGE_KEYS.COMMISSION_RECORDS, initialCommissionRecords);
    if (period && period !== 'ALL') return list.filter(r => r.settlement_period === period);
    return list;
  },

  // REVIEWS (M-SHOP-05)
  getReviews: async (shopId?: number): Promise<Review[]> => {
    try {
      const res = await fetch(`http://192.168.100.151:8083/reviews/shop/${shopId || 1}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            order_id: d.orderId,
            order_code: d.orderCode || `ORD-${d.orderId}`,
            user_name: d.userName || 'Khách hàng',
            user_phone: d.userPhone,
            user_avatar: d.userAvatar,
            shop_id: d.shopId,
            shop_rating: d.shopRating,
            shop_comment: d.shopComment,
            food_rating: d.foodRating,
            delivery_rating: d.deliveryRating,
            image_urls: d.imageUrls || [],
            shop_reply: d.shopReply,
            shop_replied_at: d.shopRepliedAt,
            created_at: d.createdAt
          }));
        }
      }
    } catch (e) {
      console.warn('Backend order-service reviews unreachable, using local storage');
    }
    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    if (shopId) return list.filter(r => r.shop_id === shopId);
    return list;
  },

  replyReview: async (reviewId: number, shopReply: string) => {
    try {
      await fetch(`http://192.168.100.151:8083/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopReply })
      });
    } catch (e) {
      console.warn('Backend order-service review reply unreachable, using local storage');
    }
    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    const updated = list.map(r => r.id === reviewId ? { ...r, shop_reply: shopReply, shop_replied_at: new Date().toISOString() } : r);
    setStored(STORAGE_KEYS.REVIEWS, updated);
    return updated;
  },
  addBulkCategoryOption: async (categoryId: number, optionData: any) => {
    try {
      const payload = {
        groupName: optionData.group_name,
        optionName: optionData.option_name,
        extraPrice: optionData.extra_price,
        isRequired: optionData.is_required,
        isMultiple: optionData.is_multiple,
        maxSelect: optionData.max_select,
        sortOrder: optionData.sort_order
      };
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/items/category/${categoryId}/bulk-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  },
  updateBulkCategoryOption: async (categoryId: number, oldGroupName: string, oldOptionName: string, newOptionData: any) => {
    try {
      const newOptionPayload = {
        groupName: newOptionData.group_name,
        optionName: newOptionData.option_name,
        extraPrice: newOptionData.extra_price,
        isRequired: newOptionData.is_required,
        isMultiple: newOptionData.is_multiple,
        maxSelect: newOptionData.max_select,
        sortOrder: newOptionData.sort_order
      };
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/items/category/${categoryId}/bulk-options`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldGroupName: oldGroupName,
          oldOptionName: oldOptionName,
          newOption: newOptionPayload
        })
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  },
  deleteBulkCategoryOption: async (categoryId: number, groupName: string, optionName: string) => {
    try {
      const res = await fetch(`http://192.168.100.151:8080/api/v1/core/items/category/${categoryId}/bulk-options?groupName=${encodeURIComponent(groupName)}&optionName=${encodeURIComponent(optionName)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  },

  // REMITTANCES
  getShopRemittances: async (shopId: number) => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8083/remittances/shop/${shopId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Lỗi khi lấy dữ liệu đối soát:', e);
    }
    return [];
  },

  // WALLETS
  getShopWallet: async (userId: number) => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8085/wallets/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      console.error('Lỗi khi lấy thông tin ví:', e);
    }
    return { balance: 0, status: 'INACTIVE' };
  }
};
