import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Category } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const loadData = async () => {
    setLoading(true);
    const myShop = await dbService.getMyShop();
    const currentShopId = myShop?.id || 1;
    const data = await dbService.getCategories(currentShopId);
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!editingCategory.name) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }
    const myShop = await dbService.getMyShop();
    const currentShopId = myShop?.id || 1;
    await dbService.saveCategory({ ...editingCategory, shop_id: currentShopId });
    alert('Đã lưu danh mục thành công!');
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      await dbService.deleteCategory(id);
      loadData();
    }
  };

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
              sort_order: categories.length + 1,
              is_active: true,
              available_from: '06:00',
              available_until: '22:00',
            });
            setIsModalOpen(true);
          },
        }}
      />

      {/* Card Grid view */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải danh mục...</div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Chưa có danh mục nào. Hãy bấm "Tạo Danh Mục Mới" để bắt đầu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CardGridItem
              key={cat.id}
              image={cat.image_url}
              categoryOverlay={`Thứ tự: #${cat.sort_order}`}
              statusText={cat.is_active ? 'ACTIVE' : 'INACTIVE'}
              subBadge={cat.available_from && cat.available_until ? `⏰ Khung giờ: ${cat.available_from} - ${cat.available_until}` : '⏰ Cả ngày'}
              title={`${cat.icon_emoji || '📁'} ${cat.name}`}
              subtitle={cat.description}
              actions={[
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
                  onClick: () => handleDelete(cat.id),
                  danger: true,
                },
              ]}
            />
          ))}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">URL Hình đại diện:</label>
              <input
                type="text"
                value={editingCategory.image_url || ''}
                onChange={(e) => setEditingCategory((prev) => ({ ...prev, image_url: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
    </div>
  );
}
