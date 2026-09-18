import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Item, ItemPrice, ItemOption, Category } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, Clock, DollarSign, ListPlus, Star, ShieldCheck, Trash2, Flame, Leaf, Heart, ImagePlus, SortAsc, Zap } from 'lucide-react';

export function MenuItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Item>>({
    name: '',
    description: '',
    base_price: 35000,
    category_id: 1,
    status: 'AVAILABLE',
    prep_time_minutes: 10,
    tags: [],
  });

  // Time Prices Modal
  const [pricingItem, setPricingItem] = useState<Item | null>(null);
  const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);
  const [isAddPriceModalOpen, setIsAddPriceModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState<Partial<ItemPrice>>({
    price_name: '',
    price: 40000,
    price_type: 'PEAK_HOUR',
    priority: 10,
  });

  // Options/Toppings Modal
  const [optionsItem, setOptionsItem] = useState<Item | null>(null);
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  const [isAddOptModalOpen, setIsAddOptModalOpen] = useState(false);
  const [newOpt, setNewOpt] = useState<Partial<ItemOption>>({
    group_name: 'Topping Thêm',
    option_name: '',
    extra_price: 5000,
    is_required: false,
    is_multiple: true,
    max_select: 2,
  });

  const loadData = async () => {
    setLoading(true);
    const iList = await dbService.getItems(1); // shop 1
    const cList = await dbService.getCategories(1);
    setItems(iList);
    setCategories(cList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickToggleSoldOut = async (item: Item) => {
    const nextStatus = item.status === 'AVAILABLE' ? 'SOLD_OUT' : 'AVAILABLE';
    await dbService.toggleItemStatus(item.id, nextStatus);
    loadData();
  };

  const handleSaveItem = async () => {
    if (!editingItem.name || !editingItem.base_price) {
      alert('Vui lòng nhập tên món và giá gốc!');
      return;
    }
    const cat = categories.find((c) => c.id === editingItem.category_id);
    await dbService.saveItem({
      ...editingItem,
      shop_id: 1,
      category_name: cat?.name || 'Món ăn',
    });
    alert('Đã lưu thông tin món ăn!');
    setIsItemModalOpen(false);
    loadData();
  };

  // Pricing handlers
  const handleOpenPricingModal = async (item: Item) => {
    setPricingItem(item);
    const prices = await dbService.getItemPrices(item.id);
    setItemPrices(prices);
  };

  const handleSavePriceRule = async () => {
    if (!pricingItem || !newPrice.price_name || !newPrice.price) {
      alert('Vui lòng nhập tên và giá áp dụng!');
      return;
    }

    // Dynamic schema validation per price_type
    const type = newPrice.price_type;
    if (['PEAK_HOUR', 'OFF_PEAK', 'HAPPY_HOUR', 'EARLY_BIRD', 'LATE_NIGHT'].includes(type || '')) {
      if (!newPrice.time_start || !newPrice.time_end) {
        alert(`Loại giá ${type} bắt buộc phải chọn Giờ Bắt Đầu và Giờ Kết Thúc!`);
        return;
      }
    } else if (type === 'SEASONAL') {
      if (!newPrice.valid_from || !newPrice.valid_until) {
        alert('Loại giá SEASONAL (Theo mùa) bắt buộc phải nhập Ngày Bắt Đầu & Kết Thúc!');
        return;
      }
    }

    await dbService.saveItemPrice({ ...newPrice, item_id: pricingItem.id });
    alert('Đã lưu quy tắc giá thành công!');
    setIsAddPriceModalOpen(false);
    const prices = await dbService.getItemPrices(pricingItem.id);
    setItemPrices(prices);
  };

  const handleDeletePriceRule = async (id: number) => {
    if (!pricingItem) return;
    await dbService.deleteItemPrice(id);
    const prices = await dbService.getItemPrices(pricingItem.id);
    setItemPrices(prices);
  };

  // Options handlers
  const handleOpenOptionsModal = async (item: Item) => {
    setOptionsItem(item);
    const opts = await dbService.getItemOptions(item.id);
    setItemOptions(opts);
  };

  const handleSaveOptionRule = async () => {
    if (!optionsItem || !newOpt.group_name || !newOpt.option_name) {
      alert('Vui lòng nhập tên nhóm và tên tuỳ chọn!');
      return;
    }
    await dbService.saveItemOption({ ...newOpt, item_id: optionsItem.id });
    alert('Đã lưu tuỳ chọn thành công!');
    setIsAddOptModalOpen(false);
    const opts = await dbService.getItemOptions(optionsItem.id);
    setItemOptions(opts);
  };

  const handleDeleteOptionRule = async (id: number) => {
    if (!optionsItem) return;
    await dbService.deleteItemOption(id);
    const opts = await dbService.getItemOptions(optionsItem.id);
    setItemOptions(opts);
  };

  const filteredItems = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || i.category_id === Number(categoryFilter);
    const matchStat = statusFilter === 'ALL' || i.status === statusFilter;
    return matchSearch && matchCat && matchStat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Quản Lý Món Ăn & Bảng Giá Thời Điểm</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cấu hình menu, toggle hết món nhanh, thiết lập giá giờ vàng và nhóm topping đi kèm.
        </p>
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên món ăn..."
        onRefresh={loadData}
        primaryAction={{
          label: '+ Tạo Món Ăn Mới',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {
            setEditingItem({
              name: '',
              description: '',
              base_price: 35000,
              category_id: categories[0]?.id || 1,
              status: 'AVAILABLE',
              prep_time_minutes: 10,
            });
            setIsItemModalOpen(true);
          },
        }}
        dropdowns={[
          {
            id: 'category',
            label: 'Danh mục',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'Tất cả danh mục', value: 'ALL' },
              ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
            ],
          },
          {
            id: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Còn món (AVAILABLE)', value: 'AVAILABLE' },
              { label: 'Hết món (SOLD_OUT)', value: 'SOLD_OUT' },
              { label: 'Tạm ẩn (HIDDEN)', value: 'HIDDEN' },
            ],
          },
        ]}
      />

      {/* Card Grid view */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải danh sách món ăn...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Không tìm thấy món ăn nào thỏa điều kiện lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              <CardGridItem
                image={item.image_url}
                categoryOverlay={item.category_name}
                statusText={item.status}
                subBadge={`Giá: ${item.base_price.toLocaleString()} ₫ ${item.is_signature ? '• ⭐ Signature' : ''} ${item.is_vegetarian ? '• 🥬 Chay' : ''}`}
                title={item.name}
                subtitle={item.description}
                metaItems={[
                  { icon: <Clock className="w-3.5 h-3.5" />, label: `Nấu ~${item.prep_time_minutes}p` },
                  { icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />, label: `${item.avg_rating}★ (${item.total_reviews})` },
                  ...(item.spice_level && item.spice_level !== 'NONE' ? [{ icon: <Flame className="w-3.5 h-3.5 text-rose-500" />, label: item.spice_level }] : []),
                  ...(item.daily_limit ? [{ icon: <Zap className="w-3.5 h-3.5 text-blue-500" />, label: `${item.daily_sold}/${item.daily_limit} suất` }] : []),
                ]}
                detailAction={{
                  label: 'Sửa thông tin →',
                  onClick: () => {
                    setEditingItem(item);
                    setIsItemModalOpen(true);
                  },
                }}
                actions={[
                  {
                    icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
                    title: 'Bảng giá thời điểm (item_prices)',
                    onClick: () => handleOpenPricingModal(item),
                  },
                  {
                    icon: <ListPlus className="w-4 h-4 text-purple-600" />,
                    title: 'Tuỳ chọn/Topping (item_options)',
                    onClick: () => handleOpenOptionsModal(item),
                  },
                ]}
              />

              {/* Quick status toggle button (AVAILABLE ⇄ SOLD_OUT) */}
              <button
                onClick={() => handleQuickToggleSoldOut(item)}
                className={`absolute top-3 left-3 shadow-md z-10 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-transform active:scale-95 border ${
                  item.status === 'AVAILABLE'
                    ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                    : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                }`}
                title="Bấm để đổi trạng thái nhanh"
              >
                {item.status === 'AVAILABLE' ? '⚡ Báo Hết Món' : '✓ Báo Còn Món'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Item Add/Edit Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem.id ? `Chỉnh Sửa Món: ${editingItem.name || ''}` : 'Tạo Món Ăn Mới'}
        subtitle="Cấu hình đầy đủ thông tin, thuộc tính món ăn, định lượng và hình ảnh"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Nhóm 1: Tên & Danh mục */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên món ăn (Tiếng Việt) *:</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: Cơm Sườn Bì Chả Đặc Biệt"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên món (English name):</label>
                <input
                  type="text"
                  value={editingItem.name_en || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, name_en: e.target.value }))}
                  placeholder="VD: Broken Rice with Grilled Pork Chop"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Mô tả món ăn:</label>
              <textarea
                rows={2}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả nguyên liệu, độ giòn/mềm, hương vị..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Danh mục thực đơn:</label>
                <select
                  value={editingItem.category_id || 1}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, category_id: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Giá cơ bản (base_price ₫) *:</label>
                <input
                  type="number"
                  step="1000"
                  value={editingItem.base_price || 35000}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, base_price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Trạng thái món:</label>
                <select
                  value={editingItem.status || 'AVAILABLE'}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                >
                  <option value="AVAILABLE">🟢 Đang mở bán (AVAILABLE)</option>
                  <option value="SOLD_OUT">🔴 Tạm hết món (SOLD_OUT)</option>
                  <option value="HIDDEN">👁️‍🗨️ Tạm ẩn (HIDDEN)</option>
                  <option value="DISCONTINUED">⛔ Ngừng kinh doanh (DISCONTINUED)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Thuộc tính ẩm thực & Nhãn đặc biệt */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Đặc tính ẩm thực & Chế độ ăn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Độ cay (Spice Level):</label>
                <select
                  value={editingItem.spice_level || 'NONE'}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, spice_level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="NONE">Không cay (None)</option>
                  <option value="MILD">🌶️ Cay nhẹ (Mild)</option>
                  <option value="MEDIUM">🌶️🌶️ Cay vừa (Medium)</option>
                  <option value="HOT">🌶️🌶️🌶️ Cay nồng (Hot)</option>
                  <option value="EXTRA_HOT">🔥 Siêu cay (Extra Hot)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Thời gian nấu (phút):</label>
                <input
                  type="number"
                  value={editingItem.prep_time_minutes || 10}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, prep_time_minutes: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Lượng Calo ước tính (Kcal):</label>
                <input
                  type="number"
                  value={editingItem.calories || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, calories: Number(e.target.value) }))}
                  placeholder="VD: 550"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={!!editingItem.is_signature}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, is_signature: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Món Signature
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={!!editingItem.is_vegetarian}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, is_vegetarian: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  Món Chay (Vegetarian)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={!!editingItem.is_vegan}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, is_vegan: e.target.checked }))}
                  className="rounded text-green-600"
                />
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Thuần Chay (Vegan)
                </span>
              </label>
            </div>
          </div>

          {/* Nhóm 3: Giới hạn số lượng & Thứ tự */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <SortAsc className="w-3.5 h-3.5 text-indigo-600" />
              Định mức phục vụ & Thứ tự hiển thị
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Giới hạn suất bán/ngày (daily_limit):</label>
                <input
                  type="number"
                  value={editingItem.daily_limit || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, daily_limit: Number(e.target.value) }))}
                  placeholder="Để trống = không giới hạn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Đã bán hôm nay (daily_sold):</label>
                <input
                  type="number"
                  disabled
                  value={editingItem.daily_sold || 0}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Thứ tự hiển thị (sort_order):</label>
                <input
                  type="number"
                  value={editingItem.sort_order || 0}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                  placeholder="0 = tự động"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Cảnh báo dị ứng (phân tách bởi dấu phẩy):</label>
                <input
                  type="text"
                  value={Array.isArray(editingItem.allergens) ? editingItem.allergens.join(', ') : ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      allergens: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="VD: Hải sản, Đậu phộng, Trứng, Gluten"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Thẻ tags tìm kiếm (phân tách bởi dấu phẩy):</label>
                <input
                  type="text"
                  value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="VD: Bán chạy, Ăn trưa, Cơm tấm, Đặc sản"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 4: Hình ảnh món */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ImagePlus className="w-3.5 h-3.5 text-purple-600" />
              Hình ảnh món ăn
            </h4>
            <div>
              <label className="block font-medium text-slate-700 mb-1">URL Hình ảnh chính (Cover Image):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
                {editingItem.image_url && (
                  <img
                    src={editingItem.image_url}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-300"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">URL Ảnh phụ / Chi tiết (mỗi dòng 1 URL):</label>
              <textarea
                rows={2}
                value={(editingItem.extra_image_urls || []).join('\n')}
                onChange={(e) =>
                  setEditingItem((prev) => ({
                    ...prev,
                    extra_image_urls: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                  }))
                }
                placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsItemModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveItem}
              className="px-5 py-2 bg-[#0F2540] text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              Lưu Món Ăn
            </button>
          </div>
        </div>
      </Modal>

      {/* Sub-modal: Time-based Prices (item_prices) */}
      <Modal
        isOpen={!!pricingItem}
        onClose={() => setPricingItem(null)}
        title="Bảng Giá Theo Thời Điểm / Giờ Vàng (item_prices)"
        subtitle={`Món: ${pricingItem?.name}`}
        maxWidth="xl"
      >
        {pricingItem && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                Giá gốc: <span className="font-bold text-slate-800">{pricingItem.base_price.toLocaleString()} ₫</span>
              </p>
              <button
                onClick={() => setIsAddPriceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Quy Tắc Giá</span>
              </button>
            </div>

            {/* List of rules */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {itemPrices.length === 0 ? (
                <div className="p-4 text-center text-slate-400">Chưa có quy tắc giá thời điểm nào.</div>
              ) : (
                itemPrices.map((rule) => (
                  <div key={rule.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{rule.price_name}</span>
                        <Badge statusText={rule.price_type} />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                          Priority: {rule.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rule.time_start && rule.time_end ? `Khung giờ: ${rule.time_start} - ${rule.time_end}` : ''}
                        {rule.applicable_days ? ` Ngày: ${rule.applicable_days.join(', ')}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-emerald-600">{rule.price.toLocaleString()} ₫</span>
                      <button
                        onClick={() => handleDeletePriceRule(rule.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPricingItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Price Rule Modal */}
      <Modal
        isOpen={isAddPriceModalOpen}
        onClose={() => setIsAddPriceModalOpen(false)}
        title="Thêm Quy Tắc Giá Thời Điểm"
        subtitle={`Món: ${pricingItem?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Tên mô tả quy tắc (price_name):</label>
            <input
              type="text"
              value={newPrice.price_name || ''}
              onChange={(e) => setNewPrice((prev) => ({ ...prev, price_name: e.target.value }))}
              placeholder="VD: Giá Giờ Trưa Cao Điểm (11:00-13:00)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Loại thời điểm (price_type):</label>
              <select
                value={newPrice.price_type || 'PEAK_HOUR'}
                onChange={(e) => setNewPrice((prev) => ({ ...prev, price_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="PEAK_HOUR">PEAK_HOUR (Giờ cao điểm)</option>
                <option value="OFF_PEAK">OFF_PEAK (Giờ thấp điểm)</option>
                <option value="WEEKEND">WEEKEND (Cuối tuần T7-CN)</option>
                <option value="SEASONAL">SEASONAL (Theo mùa/Tết)</option>
                <option value="HAPPY_HOUR">HAPPY_HOUR (Giờ vui vẻ)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giá áp dụng (₫):</label>
              <input
                type="number"
                value={newPrice.price || 40000}
                onChange={(e) => setNewPrice((prev) => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giờ bắt đầu (time_start):</label>
              <input
                type="time"
                value={newPrice.time_start || '11:00'}
                onChange={(e) => setNewPrice((prev) => ({ ...prev, time_start: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giờ kết thúc (time_end):</label>
              <input
                type="time"
                value={newPrice.time_end || '13:00'}
                onChange={(e) => setNewPrice((prev) => ({ ...prev, time_end: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAddPriceModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSavePriceRule}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 cursor-pointer"
            >
              Lưu Quy Tắc Giá
            </button>
          </div>
        </div>
      </Modal>

      {/* Sub-modal: Options/Toppings (item_options) */}
      <Modal
        isOpen={!!optionsItem}
        onClose={() => setOptionsItem(null)}
        title="Quản Lý Tuỳ Chọn / Topping (item_options)"
        subtitle={`Món: ${optionsItem?.name}`}
        maxWidth="xl"
      >
        {optionsItem && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Danh sách các lựa chọn đi kèm khi khách gọi món:</p>
              <button
                onClick={() => setIsAddOptModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Tuỳ Chọn / Topping</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {itemOptions.length === 0 ? (
                <div className="p-4 text-center text-slate-400">Chưa có tuỳ chọn đi kèm nào.</div>
              ) : (
                itemOptions.map((opt) => (
                  <div key={opt.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">[{opt.group_name}]</span>
                        <span className="font-semibold text-purple-700">{opt.option_name}</span>
                        {opt.is_required && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            Bắt buộc
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {opt.is_multiple ? `Chọn tối đa ${opt.max_select} lựa chọn` : 'Chỉ chọn 1 (Radio)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">
                        {opt.extra_price > 0 ? `+${opt.extra_price.toLocaleString()} ₫` : 'Miễn phí'}
                      </span>
                      <button
                        onClick={() => handleDeleteOptionRule(opt.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setOptionsItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Option Modal */}
      <Modal
        isOpen={isAddOptModalOpen}
        onClose={() => setIsAddOptModalOpen(false)}
        title="Thêm Tuỳ Chọn / Topping Mới"
        subtitle={`Món: ${optionsItem?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tên nhóm (group_name):</label>
              <input
                type="text"
                value={newOpt.group_name || ''}
                onChange={(e) => setNewOpt((prev) => ({ ...prev, group_name: e.target.value }))}
                placeholder="VD: Topping Thêm"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tên tuỳ chọn (option_name):</label>
              <input
                type="text"
                value={newOpt.option_name || ''}
                onChange={(e) => setNewOpt((prev) => ({ ...prev, option_name: e.target.value }))}
                placeholder="VD: Thêm Sườn Nướng (+1 miếng)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giá cộng thêm (extra_price ₫):</label>
              <input
                type="number"
                value={newOpt.extra_price || 0}
                onChange={(e) => setNewOpt((prev) => ({ ...prev, extra_price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Số lượng chọn tối đa:</label>
              <input
                type="number"
                value={newOpt.max_select || 1}
                onChange={(e) => setNewOpt((prev) => ({ ...prev, max_select: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={newOpt.is_required}
                onChange={(e) => setNewOpt((prev) => ({ ...prev, is_required: e.target.checked }))}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-slate-700">Bắt buộc phải chọn</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={newOpt.is_multiple}
                onChange={(e) => setNewOpt((prev) => ({ ...prev, is_multiple: e.target.checked }))}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-slate-700">Cho phép chọn nhiều</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAddOptModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveOptionRule}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer"
            >
              Lưu Tuỳ Chọn
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
