import React, { useState, useEffect, useMemo } from "react";
import { dbService } from "@/api/client";
import { CommissionConfig, ShopProfile, Order } from "@/api/mockData";
import { Modal } from "@/components/ui/Modal";
import { 
  Percent, 
  Plus, 
  RefreshCw, 
  Store, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  ShoppingBag,
  Coins,
  ChevronRight
} from "lucide-react";

export function CommissionPage() {
  const [activeTab, setActiveTab] = useState<"configs" | "shop_revenue">("configs");

  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab 2 Filters: Month & Search
  const [monthFilter, setMonthFilter] = useState<"current_month" | "last_month" | "all">("current_month");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal form for Creating / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [newType, setNewType] = useState<"PERCENT" | "FIXED_PER_ORDER">("PERCENT");
  const [newRate, setNewRate] = useState<number>(15);
  const [selectedShopId, setSelectedShopId] = useState<number | "">("");
  const [newTargetShopName, setNewTargetShopName] = useState("");

  const loadData = async (force = false) => {
    if (force || configs.length === 0) {
      if (configs.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const [configList, shopList, orderList] = await Promise.all([
        dbService.getCommissionConfigs(force),
        dbService.getShops(force),
        dbService.getAllOrders(),
      ]);
      setConfigs(configList);
      setShops(shopList);
      setOrders(orderList);
    } catch (e) {
      console.error("Failed to load commission data:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingConfigId(null);
    setNewType("PERCENT");
    setNewRate(15);
    setSelectedShopId("");
    setNewTargetShopName("");
    setIsModalOpen(true);
  };

  const openEditModal = (c: CommissionConfig) => {
    setModalMode("edit");
    setEditingConfigId(c.id);
    setNewType(c.commission_type);
    setNewRate(c.rate);
    setSelectedShopId(c.shop_id || "");
    setNewTargetShopName(c.shop_name || "");
    setIsModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!newRate || newRate <= 0) {
      alert("Vui lòng nhập tỉ lệ / mức tiền hoa hồng hợp lệ!");
      return;
    }

    const selectedShop = shops.find(s => s.id === Number(selectedShopId));
    
    // VALIDATION: Prevent duplicate configuration for the same shop
    if (modalMode === "create") {
      if (selectedShopId) {
        const existing = configs.find(c => c.shop_id === Number(selectedShopId));
        if (existing) {
          alert(`Gian hàng "${selectedShop?.shop_name || "ID #" + selectedShopId}" đã có cấu hình hoa hồng rồi (${existing.rate}${existing.commission_type === "PERCENT" ? "%" : "₫"})! Vui lòng chỉnh sửa cấu hình hiện có thay vì tạo mới trùng lặp.`);
          return;
        }
      } else {
        const existingDefault = configs.find(c => !c.shop_id);
        if (existingDefault) {
          alert(`Đã có cấu hình mặc định toàn sàn rồi (${existingDefault.rate}${existingDefault.commission_type === "PERCENT" ? "%" : "₫"})! Vui lòng chỉnh sửa cấu hình hiện tại.`);
          return;
        }
      }

      const success = await dbService.saveCommissionConfig({
        shop_id: selectedShop?.id,
        shop_name: selectedShop?.shop_name || newTargetShopName || "Áp dụng chung",
        commission_type: newType,
        rate: newRate,
        valid_from: new Date().toISOString()
      });

      if (success) {
        alert("Đã tạo cấu hình hoa hồng mới thành công!");
      } else {
        alert("Lỗi khi lưu cấu hình, vui lòng thử lại!");
      }
    } else if (modalMode === "edit" && editingConfigId) {
      const configToUpdate = configs.find(c => c.id === editingConfigId);
      if (configToUpdate) {
        // Also check if changing to another shop that already has a config
        if (selectedShopId && Number(selectedShopId) !== configToUpdate.shop_id) {
          const existing = configs.find(c => c.shop_id === Number(selectedShopId) && c.id !== editingConfigId);
          if (existing) {
            alert(`Gian hàng này đã có cấu hình hoa hồng riêng rồi! Không thể gán trùng lặp.`);
            return;
          }
        }

        const success = await dbService.updateCommissionConfig(editingConfigId, {
          ...configToUpdate,
          shop_id: selectedShop?.id,
          shop_name: selectedShop?.shop_name || newTargetShopName || "Áp dụng chung",
          commission_type: newType,
          rate: newRate
        });
        if (!success) {
          alert("Lỗi cập nhật cấu hình!");
          return;
        }
        alert("Đã cập nhật cấu hình thành công!");
      }
    }

    setIsModalOpen(false);
    await loadData(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa cấu hình này không?")) {
      const success = await dbService.deleteCommissionConfig(id);
      if (success) {
        setConfigs(prev => prev.filter(c => c.id !== id));
        loadData(true);
      } else {
        alert("Có lỗi xảy ra khi xóa!");
      }
    }
  };

  // ==========================================
  // TAB 2: CALCULATE SALES & COMMISSION PER SHOP
  // ==========================================
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (9 = Oct)

  const shopCommissionAnalytics = useMemo(() => {
    // 1. Filter orders based on monthFilter
    const filteredOrders = orders.filter(o => {
      if (o.order_status === "CANCELLED") return false;
      const orderDate = new Date(o.placed_at || (o as any).created_at);
      if (isNaN(orderDate.getTime())) return true;

      if (monthFilter === "current_month") {
        return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
      } else if (monthFilter === "last_month") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return orderDate.getFullYear() === lastMonthYear && orderDate.getMonth() === lastMonth;
      }
      return true; // "all"
    });

    // 2. Default platform config fallback (find general config or default 15%)
    const defaultPlatformConfig = configs.find(c => !c.shop_id) || {
      commission_type: "PERCENT" as const,
      rate: 15
    };

    // 3. Aggregate metrics for every shop
    const results = shops.map(shop => {
      // Find specific config for this shop
      const shopConfig = configs.find(c => c.shop_id === shop.id);
      const isCustomConfig = !!shopConfig;
      const activeConfig = shopConfig || defaultPlatformConfig;

      const shopOrders = filteredOrders.filter(o => o.shop_id === shop.id);
      const totalOrdersCount = shopOrders.length;
      const grossRevenue = shopOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Compute Platform Commission
      let platformCommission = 0;
      if (activeConfig.commission_type === "PERCENT") {
        platformCommission = Math.round(grossRevenue * (activeConfig.rate / 100));
      } else {
        platformCommission = activeConfig.rate * totalOrdersCount;
      }

      const netShopRevenue = grossRevenue - platformCommission;

      return {
        shop,
        shopConfig: activeConfig,
        isCustomConfig,
        totalOrdersCount,
        grossRevenue,
        platformCommission,
        netShopRevenue,
      };
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return results.filter(
        r => r.shop.shop_name.toLowerCase().includes(q) || String(r.shop.id).includes(q)
      );
    }

    // Sort by grossRevenue descending
    return results.sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [shops, orders, configs, monthFilter, searchQuery]);

  // Overall platform totals for Tab 2
  const totalPlatformGross = shopCommissionAnalytics.reduce((s, r) => s + r.grossRevenue, 0);
  const totalPlatformCommission = shopCommissionAnalytics.reduce((s, r) => s + r.platformCommission, 0);
  const totalPlatformNetShop = totalPlatformGross - totalPlatformCommission;
  const totalOrdersCompleted = shopCommissionAnalytics.reduce((s, r) => s + r.totalOrdersCount, 0);

  // Summary stats for Tab 1
  const percentConfigs = configs.filter(c => c.commission_type === "PERCENT");
  const avgRate = percentConfigs.length > 0
    ? (percentConfigs.reduce((s, c) => s + c.rate, 0) / percentConfigs.length).toFixed(1)
    : "0";
  const percentCount = configs.filter(c => c.commission_type === "PERCENT").length;
  const fixedCount = configs.filter(c => c.commission_type === "FIXED_PER_ORDER").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Percent className="w-7 h-7 text-blue-600" />
            Quản Lý & Cấu Hình Hoa Hồng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập tỉ lệ chiết khấu và theo dõi doanh số, hoa hồng nền tảng theo từng gian hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            {isRefreshing ? "Đang đồng bộ..." : "Làm mới"}
          </button>
          {activeTab === "configs" && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo cấu hình mới
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-3 rounded-2xl border shadow-xs gap-3">
        <button
          onClick={() => setActiveTab("configs")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "configs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Cấu hình hoa hồng</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
            {configs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("shop_revenue")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "shop_revenue"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Doanh số & Hoa hồng theo Shop</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-bold">
            Tháng này
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CẤU HÌNH HOA HỒNG                                */}
      {/* ======================================================== */}
      {activeTab === "configs" && (
        <div className="space-y-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{configs.length}</p>
                <p className="text-xs text-slate-500 font-medium">Tổng cấu hình đang áp dụng</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{avgRate}%</p>
                <p className="text-xs text-slate-500 font-medium">Hoa hồng trung bình</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{percentCount} / {fixedCount}</p>
                <p className="text-xs text-slate-500 font-medium">Theo tỉ lệ (%) / Cố định (₫)</p>
              </div>
            </div>
          </div>

          {/* Configs Table */}
          {loading && configs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Đang tải danh sách cấu hình hoa hồng...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Percent className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-xl font-bold text-slate-700">Chưa có cấu hình hoa hồng nào</p>
              <p className="text-sm text-slate-400 mt-2">Nhấn "Tạo cấu hình mới" để bắt đầu thiết lập</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-left font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><Store className="w-4 h-4 text-slate-400" /> Đối tượng áp dụng</span>
                    </th>
                    <th className="p-4 text-left font-semibold text-slate-600">Loại hoa hồng</th>
                    <th className="p-4 text-center font-semibold text-slate-600">Tỉ lệ / Mức thu</th>
                    <th className="p-4 text-left font-semibold text-slate-600">Hiệu lực từ ngày</th>
                    <th className="p-4 text-center font-semibold text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {configs.map(c => {
                    const shop = shops.find(s => s.id === c.shop_id);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {shop?.shop_name || c.shop_name || "Mặc định toàn hệ thống"}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {shop ? `Quán #${shop.id} • ${shop.address || "Nội khu"}` : c.shop_id ? `Shop ID #${c.shop_id}` : "🌐 Áp dụng cho tất cả gian hàng"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            c.commission_type === "PERCENT" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {c.commission_type === "PERCENT" ? (
                              <><Percent className="w-3 h-3" /> Phần trăm</>
                            ) : (
                              <><DollarSign className="w-3 h-3" /> Số tiền cố định</>
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-black text-blue-600">
                            {c.commission_type === "PERCENT" ? `${c.rate}%` : `${c.rate.toLocaleString("vi-VN")} ₫`}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-500 font-mono">
                          {c.valid_from ? new Date(c.valid_from).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(c)} 
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer" 
                              title="Chỉnh sửa cấu hình"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)} 
                              className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer" 
                              title="Xóa cấu hình"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DOANH SỐ & HOA HỒNG THEO SHOP                    */}
      {/* ======================================================== */}
      {activeTab === "shop_revenue" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh Số Toàn Sàn</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><ShoppingBag className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalPlatformGross.toLocaleString("vi-VN")} ₫</p>
              <p className="text-xs text-slate-500 mt-1">Từ {totalOrdersCompleted} đơn hoàn thành</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl text-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Hoa Hồng Nền Tảng Thu</span>
                <span className="p-2 rounded-xl bg-white/20 text-white"><Percent className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black">{totalPlatformCommission.toLocaleString("vi-VN")} ₫</p>
              <p className="text-xs text-amber-100 mt-1">
                Tương đương {totalPlatformGross > 0 ? ((totalPlatformCommission / totalPlatformGross) * 100).toFixed(1) : 0}% doanh số
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thực Nhận Gian Hàng</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Coins className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-emerald-700">{totalPlatformNetShop.toLocaleString("vi-VN")} ₫</p>
              <p className="text-xs text-slate-500 mt-1">Doanh thu thuần sau chiết khấu</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số Quán Hoạt Động</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600"><Store className="w-4 h-4" /></span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {shopCommissionAnalytics.filter(r => r.totalOrdersCount > 0).length} / {shops.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Gian hàng có phát sinh đơn</p>
            </div>
          </div>

          {/* Filter Bar: Month Selector & Shop Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Kỳ đối soát:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setMonthFilter("current_month")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    monthFilter === "current_month" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tháng này (T{currentMonth + 1}/{currentYear})
                </button>
                <button
                  onClick={() => setMonthFilter("last_month")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    monthFilter === "last_month" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tháng trước (T{currentMonth === 0 ? 12 : currentMonth}/{currentMonth === 0 ? currentYear - 1 : currentYear})
                </button>
                <button
                  onClick={() => setMonthFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    monthFilter === "all" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả thời gian
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm gian hàng theo tên hoặc ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Shop Commission Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-left font-semibold text-slate-600">Gian Hàng</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Tỉ lệ hoa hồng</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Số đơn hoàn tất</th>
                  <th className="p-4 text-right font-semibold text-slate-600">Doanh số bán hàng</th>
                  <th className="p-4 text-right font-semibold text-slate-600">Hoa hồng sàn thu</th>
                  <th className="p-4 text-right font-semibold text-slate-600">Thực nhận gian hàng</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Tỷ lệ đóng góp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shopCommissionAnalytics.map(({ shop, shopConfig, isCustomConfig, totalOrdersCount, grossRevenue, platformCommission, netShopRevenue }) => {
                  const contribPct = totalPlatformGross > 0 ? ((grossRevenue / totalPlatformGross) * 100).toFixed(1) : "0";

                  return (
                    <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{shop.shop_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            Mã quán: #{shop.id} • {shop.address || "Nội khu"}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isCustomConfig 
                            ? "bg-purple-100 text-purple-700 border border-purple-200" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {shopConfig.commission_type === "PERCENT" ? `${shopConfig.rate}%` : `${shopConfig.rate.toLocaleString("vi-VN")} ₫`}
                          <span className="text-[10px] font-normal opacity-75">
                            {isCustomConfig ? "(Riêng)" : "(Mặc định)"}
                          </span>
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                          {totalOrdersCount} đơn
                        </span>
                      </td>

                      <td className="p-4 text-right font-bold text-slate-800">
                        {grossRevenue.toLocaleString("vi-VN")} ₫
                      </td>

                      <td className="p-4 text-right font-black text-amber-600">
                        +{platformCommission.toLocaleString("vi-VN")} ₫
                      </td>

                      <td className="p-4 text-right font-black text-emerald-600">
                        {netShopRevenue.toLocaleString("vi-VN")} ₫
                      </td>

                      <td className="p-4 text-center">
                        <div className="w-24 mx-auto">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                            <span>{contribPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, Number(contribPct))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Config Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === "create" ? "Tạo Cấu Hình Hoa Hồng" : "Chỉnh Sửa Cấu Hình Hoa Hồng"} 
        subtitle="Thiết lập mức chiết khấu áp dụng cho gian hàng"
      >
        <div className="space-y-4">
          {/* Shop Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Chọn Gian hàng áp dụng *
            </label>
            <select
              value={selectedShopId}
              onChange={e => {
                const val = e.target.value;
                setSelectedShopId(val ? Number(val) : "");
                const s = shops.find(sh => sh.id === Number(val));
                setNewTargetShopName(s?.shop_name || "");
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option 
                value="" 
                disabled={modalMode === "create" && configs.some(c => !c.shop_id)}
              >
                🌐 Áp dụng cho tất cả gian hàng {configs.some(c => !c.shop_id) && modalMode === "create" ? "— [Đã cấu hình]" : ""}
              </option>
              {shops.map(s => {
                const alreadyConfigured = configs.some(c => c.shop_id === s.id && c.id !== editingConfigId);
                return (
                  <option 
                    key={s.id} 
                    value={s.id} 
                    disabled={modalMode === "create" && alreadyConfigured}
                  >
                    {s.shop_name} (ID #{s.id}) {alreadyConfigured ? "— [Đã có cấu hình]" : ""}
                  </option>
                );
              })}
            </select>
            {modalMode === "create" && selectedShopId && configs.some(c => c.shop_id === Number(selectedShopId)) && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Gian hàng này đã có cấu hình riêng. Vui lòng bấm Sửa trên danh sách.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Loại hoa hồng</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENT">% Phần trăm doanh thu</option>
                <option value="FIXED_PER_ORDER">₫ Số tiền cố định / đơn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {newType === "PERCENT" ? "Tỉ lệ (%)" : "Số tiền (₫/đơn)"}
              </label>
              <input
                type="number"
                min={1}
                value={newRate}
                onChange={e => setNewRate(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Xem trước mức chiết khấu
            </p>
            <p className="text-xs text-slate-700">
              Gian hàng <span className="font-bold text-slate-900">{newTargetShopName || "Tất cả gian hàng"}</span> sẽ được áp dụng mức thu{" "}
              <span className="text-blue-600 font-extrabold text-sm">
                {newType === "PERCENT" ? `${newRate}%` : `${newRate.toLocaleString("vi-VN")} ₫/đơn`}
              </span>
              {" "}từ mỗi đơn hàng hoàn tất.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveConfig}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
