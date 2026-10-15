import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Category, Item } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ImageUploadPicker } from '@/components/ui/ImageUploadPicker';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

export function CategoriesPage() {
  const { success, error } = useToast();

  // Instant cache load: read from localStorage first (0ms load time)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem('hyperlocal_cached_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return (dbService as any).getCachedCategories?.() || [];
  });
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const stored = localStorage.getItem('hyperlocal_cached_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return (dbService as any).getCachedItems?.() || [];
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [optionsCategory, setOptionsCategory] = useState<Category | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [isAddOptModalOpen, setIsAddOptModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<any>({
    group_name: '', option_name: '', extra_price: 0, is_required: false, is_multiple: false, max_select: 1, sort_order: 1
  });
  const [originalEditingOption, setOriginalEditingOption] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    icon_emoji: '🍲',
    sort_order: 1,
    is_active: true,
    available_from: '06:00',
    available_until: '22:00',
  });

  const loadData = async (showLoading = false, forceRefresh = false) => {
    if (showLoading && categories.length === 0) setLoading(true);
    try {
      const currentShopId = (dbService as any).getCurrentShopIdSync?.() || 1;
      const [catData, itemData] = await Promise.all([
        dbService.getCategories(currentShopId, forceRefresh),
        dbService.getItems(currentShopId, forceRefresh),
      ]);
      if (catData && catData.length > 0) {
        catData.sort((a: any, b: any) => (Number(b.id) || 0) - (Number(a.id) || 0));
        setCategories(catData);
        try {
          localStorage.setItem('hyperlocal_cached_categories', JSON.stringify(catData));
        } catch (_) {}
      }
      if (itemData && itemData.length > 0) {
        itemData.sort((a: any, b: any) => (Number(b.id) || 0) - (Number(a.id) || 0));
        setItems(itemData);
        try {
          localStorage.setItem('hyperlocal_cached_items', JSON.stringify(itemData));
        } catch (_) {}
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false, true);
  }, []);

  const fetchCategoryOptions = async (categoryId: number) => {
    try {
      const opts = await (dbService as any).getSuggestedOptionsByCategory?.(categoryId) || [];
      setCategoryOptions(opts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveOption = async () => {
    if (!optionsCategory) return;
    try {
      if (originalEditingOption) {
        await (dbService as any).updateBulkCategoryOption(
          optionsCategory.id,
          originalEditingOption.group_name,
          originalEditingOption.option_name,
          editingOption
        );
        success('Đã cập nhật Topping thành công!');
      } else {
        await (dbService as any).addBulkCategoryOption(
          optionsCategory.id,
          editingOption
        );
        success('Đã thêm Topping hàng loạt thành công!');
      }
      setIsAddOptModalOpen(false);
      fetchCategoryOptions(optionsCategory.id);
    } catch (err: any) {
      error(err?.message || 'Lỗi khi lưu Topping');
    }
  };

  const handleDeleteOption = async (groupName: string, optionName: string) => {
    if (!optionsCategory) return;
    if (confirm('Bạn có chắc muốn xoá Topping này khỏi TOÀN BỘ món ăn trong danh mục?')) {
      await (dbService as any).deleteBulkCategoryOption(optionsCategory.id, groupName, optionName);
      success('Đã xoá Topping khỏi danh mục!');
      fetchCategoryOptions(optionsCategory.id);
    }
  };

  const handleSave = async () => {
    if (!editingCategory.name?.trim()) {
      error('Vui lòng nhập tên danh mục!');
      return;
    }
    const isUpdate = !!editingCategory.id;
    try {
      const currentShopId = (dbService as any).getCurrentShopIdSync?.() || 1;
      setIsModalOpen(false);

      const res = await dbService.saveCategory({ ...editingCategory, shop_id: currentShopId });
      
      // Optimistic update: đưa mục mới lên NGAY ĐẦU DANH SÁCH (vị trí #1)
      const savedCat: Category = {
        ...editingCategory,
        id: res?.id || editingCategory.id || Date.now(),
        shop_id: currentShopId,
        shopId: currentShopId,
        name: editingCategory.name.trim(),
        description: editingCategory.description || '',
        image_url: editingCategory.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
        imageUrl: editingCategory.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
        icon_emoji: editingCategory.icon_emoji || '🍲',
        iconEmoji: editingCategory.icon_emoji || '🍲',
        sort_order: editingCategory.sort_order ?? 1,
        sortOrder: editingCategory.sort_order ?? 1,
        is_active: editingCategory.is_active ?? true,
        isActive: editingCategory.is_active ?? true,
        available_from: editingCategory.available_from || '06:00',
        available_until: editingCategory.available_until || '22:00',
      } as Category;

      if (isUpdate) {
        setCategories((prev) => {
          const updated = prev.map((c) => (c.id === savedCat.id ? savedCat : c));
          try { localStorage.setItem('hyperlocal_cached_categories', JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        success(`Cập nhật danh mục "${savedCat.name}" thành công!`);
      } else {
        setCategories((prev) => {
          const updated = [savedCat, ...prev.filter((c) => c.id !== savedCat.id)];
          try { localStorage.setItem('hyperlocal_cached_categories', JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        setCurrentPage(1); // Chuyển ngay về trang 1 để người dùng thấy mục mới tạo ở đầu!
        success(`Đã thêm danh mục mới "${savedCat.name}" vào đầu thực đơn!`);
      }

      // Sync background với backend
      loadData(false, true);
    } catch (e: any) {
      console.error(e);
      error(`Lỗi khi lưu danh mục: ${e?.message || 'Vui lòng kiểm tra lại thông tin.'}`);
    }
  };

  const handleDelete = async (cat: Category) => {
    const categoryItems = items.filter(
      (it) => it.category_id === cat.id || (it as any).categoryId === cat.id
    );
    const count = categoryItems.length;

    let confirmMsg = `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`;
    if (count > 0) {
      confirmMsg = `⚠️ Danh mục "${cat.name}" này đang có ${count} món ăn!\nBạn có chắc chắn muốn xoá danh mục này không?`;
    }

    if (window.confirm(confirmMsg)) {
      // Optimistic delete: xoá ngay khỏi giao diện
      const prevCats = [...categories];
      setCategories((prev) => {
        const updated = prev.filter((c) => c.id !== cat.id);
        try { localStorage.setItem('hyperlocal_cached_categories', JSON.stringify(updated)); } catch (_) {}
        return updated;
      });

      try {
        const ok = await dbService.deleteCategory(cat.id);
        if (ok) {
          success(`Đã xoá danh mục "${cat.name}" thành công!`);
          loadData(false, true);
        } else {
          setCategories(prevCats);
          error('Không thể xóa danh mục. Vui lòng thử lại!');
        }
      } catch (e: any) {
        console.error(e);
        setCategories(prevCats);
        error(`Lỗi khi xóa danh mục: ${e?.message || 'Vui lòng thử lại sau.'}`);
      }
    }
  };

  // Sắp xếp: Ưu tiên mục mới nhất lên ĐẦU DANH SÁCH (ID giảm dần)
  const sortedCategories = [...categories].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage) || 1;
  const paginatedCategories = sortedCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Danh Mục Thực Đơn Gian Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Phân nhóm món ăn (VD: Cơm phần, Món thêm, Nước giải khát), cấu hình khung giờ hiển thị theo bữa (sáng/trưa/tối).
        </p>
      </div>

      <FilterBar
        onRefresh={loadData}
        primaryAction={{
          label: '+ Tạo Danh Mục Mới',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {
            setEditingCategory({
              name: '',
              description: '',
              image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
              icon_emoji: '🍲',
              sort_order: 1,
              is_active: true,
              available_from: '06:00',
              available_until: '22:00',
            });
            setIsModalOpen(true);
          },
        }}
      />

      {/* Card Grid view */}
      {loading && categories.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
              <div className="h-44 bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Chưa có danh mục nào. Hãy bấm "Tạo Danh Mục Mới" để bắt đầu.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {paginatedCategories.map((cat, idx) => {
              const catItemCount = items.filter(
                (it) => it.category_id === cat.id || (it as any).categoryId === cat.id
              ).length;
              const displayOrder = (currentPage - 1) * itemsPerPage + idx + 1;
              return (
                <div key={cat.id} className="h-full">
                  <CardGridItem
                    className="h-full"
                    image={cat.image_url}
                    categoryOverlay={`Vị trí: #${displayOrder} • ${catItemCount} món`}
                    statusText={cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                    subBadge={cat.available_from && cat.available_until ? `⏰ Khung giờ: ${cat.available_from} - ${cat.available_until}` : '⏰ Cả ngày'}
                    title={`${cat.icon_emoji || '📁'} ${cat.name}`}
                    subtitle={cat.description || (catItemCount > 0 ? `Đang có ${catItemCount} món ăn trong danh mục` : 'Chưa có món ăn')}
                    actions={[
                      {
                        icon: <Layers className="w-4 h-4 text-purple-600" />,
                        title: 'Xem chi tiết Topping',
                        onClick: async () => {
                          setOptionsCategory(cat);
                          const opts = await (dbService as any).getSuggestedOptionsByCategory?.(cat.id) || [];
                          setCategoryOptions(opts);
                          setIsOptionsModalOpen(true);
                        },
                      },
                      {
                        icon: <Edit2 className="w-4 h-4 text-slate-600" />,
                        title: 'Chỉnh sửa',
                        onClick: () => {
                          setEditingCategory(cat);
                          setIsModalOpen(true);
                        },
                      },
                      {
                        icon: <Trash2 className="w-4 h-4 text-rose-600" />,
                        title: 'Xóa',
                        onClick: () => handleDelete(cat),
                        danger: true,
                      },
                    ]}
                  />
                </div>
              );
            })}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory.id ? 'Sửa Danh Mục Thực Đơn' : 'Thêm Danh Mục Mới'}
        subtitle="Quản lý thông tin danh mục, biểu tượng và khung giờ mở bán"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Tên danh mục *:</label>
              <input
                type="text"
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Cơm Phần Trưa"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Icon / Emoji:</label>
              <input
                type="text"
                value={editingCategory.icon_emoji || '🍲'}
                onChange={(e) => setEditingCategory((prev) => ({ ...prev, icon_emoji: e.target.value }))}
                placeholder="VD: 🍚"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Mô tả ngắn:</label>
            <textarea
              rows={2}
              value={editingCategory.description || ''}
              onChange={(e) => setEditingCategory((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="VD: Cơm nóng kèm canh và dưa góp..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Chọn ảnh từ thư mục máy tính & lưu CSDL */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <ImageUploadPicker
              label="Hình đại diện danh mục"
              helperText="Chọn file ảnh từ máy tính (ảnh được nén và lưu trực tiếp trên CSDL Neon Postgres)"
              value={editingCategory.image_url || ''}
              onChange={(val) => setEditingCategory((prev) => ({ ...prev, image_url: val }))}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Thứ tự hiển thị (sort_order):</label>
            <input
              type="number"
              value={editingCategory.sort_order || 1}
              onChange={(e) => setEditingCategory((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h4 className="font-semibold text-slate-700">Khung giờ mở bán danh mục này (Time Window)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Bắt đầu hiển thị từ:</label>
                <input
                  type="time"
                  value={editingCategory.available_from || '06:00'}
                  onChange={(e) => setEditingCategory((prev) => ({ ...prev, available_from: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Đến giờ (hết bán):</label>
                <input
                  type="time"
                  value={editingCategory.available_until || '22:00'}
                  onChange={(e) => setEditingCategory((prev) => ({ ...prev, available_until: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={editingCategory.is_active ?? true}
                onChange={(e) => setEditingCategory((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Kích hoạt hiển thị danh mục trên ứng dụng khách hàng</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#0F2540] text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer"
            >
              Lưu Danh Mục
            </button>
          </div>
        </div>
      </Modal>

      {/* Options/Toppings Modal */}
      <Modal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        title="Quản lý Topping / Tuỳ chọn theo danh mục"
        subtitle={`Danh mục: ${optionsCategory?.name} (Lưu ý: Thay đổi ở đây sẽ áp dụng cho TOÀN BỘ món ăn trong danh mục)`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <p className="text-blue-800 font-medium">Danh sách các lựa chọn hiện có trong danh mục:</p>
            <button
              onClick={() => {
                setEditingOption({ group_name: '', option_name: '', extra_price: 0, is_required: false, is_multiple: false, max_select: 1, sort_order: 1 });
                setOriginalEditingOption(null);
                setIsAddOptModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Topping Hàng Loạt
            </button>
          </div>

          <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {categoryOptions.length === 0 ? (
              <div className="text-slate-500 italic text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">Chưa có tuỳ chọn/topping nào trong danh mục này. Hãy thêm mới!</div>
            ) : (
              Array.from(new Set(categoryOptions.map(opt => opt.group_name))).map(groupName => {
                const groupOpts = categoryOptions.filter(opt => opt.group_name === groupName);
                return (
                  <div key={groupName as string} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                      <h4 className="font-bold text-slate-800">{groupName as string}</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {groupOpts.map((opt, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                          <div>
                            <span className="font-semibold text-slate-700">{opt.option_name}</span>
                            <span className="ml-2 text-emerald-600 font-bold">+{opt.extra_price}₫</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingOption({ ...opt });
                                setOriginalEditingOption({ ...opt });
                                setIsAddOptModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                              title="Sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOption(opt.group_name, opt.option_name)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                              title="Xoá khỏi toàn bộ món"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Option Modal */}
      <Modal
        isOpen={isAddOptModalOpen}
        onClose={() => setIsAddOptModalOpen(false)}
        title={originalEditingOption ? 'Sửa Topping (Áp dụng cho toàn danh mục)' : 'Thêm Topping Hàng Loạt'}
        subtitle="Thông tin sẽ được cập nhật cho TẤT CẢ món ăn trong danh mục này"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tên nhóm * (VD: Size, Topping):</label>
              <input
                type="text"
                list="existing-group-names-categories"
                value={editingOption.group_name}
                onChange={(e) => setEditingOption((p: any) => ({ ...p, group_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <datalist id="existing-group-names-categories">
                {Array.from(new Set(categoryOptions.map(opt => opt.group_name))).map(groupName => (
                  <option key={groupName as string} value={groupName as string} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tên lựa chọn * (VD: Size L, Trân châu):</label>
              <input
                type="text"
                value={editingOption.option_name}
                onChange={(e) => setEditingOption((p: any) => ({ ...p, option_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Giá cộng thêm (₫):</label>
              <input
                type="number"
                value={editingOption.extra_price}
                onChange={(e) => setEditingOption((p: any) => ({ ...p, extra_price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Thứ tự hiển thị:</label>
              <input
                type="number"
                value={editingOption.sort_order || 1}
                onChange={(e) => setEditingOption((p: any) => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingOption.is_required}
                onChange={(e) => setEditingOption((p: any) => ({ ...p, is_required: e.target.checked }))}
                className="rounded"
              />
              <span className="font-medium">Bắt buộc chọn</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingOption.is_multiple}
                onChange={(e) => setEditingOption((p: any) => ({ ...p, is_multiple: e.target.checked }))}
                className="rounded"
              />
              <span className="font-medium">Cho phép chọn nhiều</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsAddOptModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveOption}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 cursor-pointer"
            >
              Lưu Áp Dụng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}