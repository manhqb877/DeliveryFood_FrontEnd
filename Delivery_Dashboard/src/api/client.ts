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
  Review
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

export const dbService = {
  // USERS
  getUsers: async () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
  updateUserStatus: async (userId: number, status: User['status']) => {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    setStored(STORAGE_KEYS.USERS, updated);
    return updated;
  },

  // SHOPS
  getShops: async () => getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops),
  getShopById: async (id: number) => {
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    return shops.find(s => s.id === id) || shops[0];
  },
  approveShop: async (shopId: number, approved: boolean, reason?: string) => {
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const updated = shops.map(s => {
      if (s.id === shopId) {
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
    setStored(STORAGE_KEYS.SHOPS, updated);
    return updated;
  },
  updateShopProfile: async (shopId: number, data: Partial<ShopProfile>) => {
    const shops = getStored<ShopProfile[]>(STORAGE_KEYS.SHOPS, initialShops);
    const updated = shops.map(s => s.id === shopId ? { ...s, ...data } : s);
    setStored(STORAGE_KEYS.SHOPS, updated);
    return updated.find(s => s.id === shopId);
  },

  // SHIPPERS
  getShippers: async () => getStored<ShipperProfile[]>(STORAGE_KEYS.SHIPPERS, initialShippers),
  approveShipper: async (shipperId: number, approved: boolean, reason?: string) => {
    const shippers = getStored<ShipperProfile[]>(STORAGE_KEYS.SHIPPERS, initialShippers);
    const updated = shippers.map(s => {
      if (s.id === shipperId) {
        return {
          ...s,
          approval_status: (approved ? 'APPROVED' : 'REJECTED') as ShipperProfile['approval_status'],
          rejection_reason: approved ? undefined : reason,
        };
      }
      return s;
    });
    setStored(STORAGE_KEYS.SHIPPERS, updated);
    return updated;
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
    const cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    return cats.filter(c => c.shop_id === shopId);
  },
  saveCategory: async (category: Partial<Category>) => {
    const cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    let updated: Category[];
    if (category.id) {
      updated = cats.map(c => c.id === category.id ? { ...c, ...category } as Category : c);
    } else {
      const newCat: Category = {
        id: Date.now(),
        shop_id: category.shop_id || 1,
        name: category.name || 'Danh mục mới',
        description: category.description || '',
        image_url: category.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
        sort_order: category.sort_order || 1,
        is_active: true
      };
      updated = [...cats, newCat];
    }
    setStored(STORAGE_KEYS.CATEGORIES, updated);
    return updated;
  },
  deleteCategory: async (id: number) => {
    const cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const updated = cats.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, updated);
    return updated;
  },

  // ITEMS
  getItems: async (shopId: number) => {
    const items = getStored<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    return items.filter(i => i.shop_id === shopId);
  },
  getItemById: async (id: number) => {
    const items = getStored<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    return items.find(i => i.id === id);
  },
  toggleItemStatus: async (itemId: number, newStatus: Item['status']) => {
    const items = getStored<Item[]>(STORAGE_KEYS.ITEMS, initialItems);
    const updated = items.map(i => i.id === itemId ? { ...i, status: newStatus } : i);
    setStored(STORAGE_KEYS.ITEMS, updated);
    return updated;
  },
  saveItem: async (item: Partial<Item>) => {
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
    return updated;
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
    const options = getStored<ItemOption[]>(STORAGE_KEYS.ITEM_OPTIONS, initialItemOptions);
    return options.filter(o => o.item_id === itemId);
  },
  saveItemOption: async (option: Partial<ItemOption>) => {
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
    const options = getStored<ItemOption[]>(STORAGE_KEYS.ITEM_OPTIONS, initialItemOptions);
    const updated = options.filter(o => o.id !== id);
    setStored(STORAGE_KEYS.ITEM_OPTIONS, updated);
    return updated;
  },

  // ORDERS & FSM
  getOrders: async (filters?: { shop_id?: number; area_id?: number; status?: string }) => {
    let orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    if (filters?.shop_id) orders = orders.filter(o => o.shop_id === filters.shop_id);
    if (filters?.area_id) orders = orders.filter(o => o.area_id === filters.area_id);
    if (filters?.status) orders = orders.filter(o => o.order_status === filters.status);
    return orders;
  },
  updateOrderStatus: async (orderId: number, newStatus: Order['order_status'], actor: string, reason?: string) => {
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
  getCommissionConfigs: async () => getStored<CommissionConfig[]>(STORAGE_KEYS.COMMISSIONS, initialCommissionConfigs),
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

  // PROMOTIONS
  getPromotions: async (scope?: 'PLATFORM' | 'SHOP') => {
    const list = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    if (scope) return list.filter(p => p.scope === scope);
    return list;
  },
  approvePromotion: async (id: number, approved: boolean) => {
    const list = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    const updated = list.map(p => p.id === id ? { ...p, approval_status: (approved ? 'APPROVED' : 'REJECTED') as Promotion['approval_status'] } : p);
    setStored(STORAGE_KEYS.PROMOTIONS, updated);
    return updated;
  },
  savePromotion: async (promo: Partial<Promotion>) => {
    const list = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    let updated: Promotion[];
    if (promo.id) {
      updated = list.map(p => p.id === promo.id ? { ...p, ...promo } as Promotion : p);
    } else {
      const newPromo: Promotion = {
        id: Date.now(),
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
        approval_status: promo.scope === 'PLATFORM' ? 'APPROVED' : 'PENDING',
        is_active: true,
        created_at: new Date().toISOString()
      };
      updated = [...list, newPromo];
    }
    setStored(STORAGE_KEYS.PROMOTIONS, updated);
    return updated;
  },

  // REVIEWS
  getReviews: async (shopId?: number) => {
    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    if (shopId) return list.filter(r => r.shop_id === shopId);
    return list;
  },
  replyReview: async (reviewId: number, shopReply: string) => {
    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    const updated = list.map(r => r.id === reviewId ? { ...r, shop_reply: shopReply, shop_replied_at: new Date().toISOString() } : r);
    setStored(STORAGE_KEYS.REVIEWS, updated);
    return updated;
  }
};
