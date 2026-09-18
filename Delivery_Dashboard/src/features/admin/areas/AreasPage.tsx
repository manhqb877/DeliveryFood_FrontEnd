import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Area, IntraZoneNode } from '@/api/mockData';
import { CardGridItem } from '@/components/ui/Card';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Plus, FolderTree, Key, Building, Layers, DoorOpen } from 'lucide-react';

export function AreasPage() {
  const [activeTab, setActiveTab] = useState<'AREAS' | 'INTRA_TREE'>('AREAS');

  const [areas, setAreas] = useState<Area[]>([]);
  const [intraNodes, setIntraNodes] = useState<IntraZoneNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Area Form Modal
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Partial<Area> | null>(null);

  // Intra Node Modal
  const [isIntraModalOpen, setIsIntraModalOpen] = useState(false);
  const [editingIntraNode, setEditingIntraNode] = useState<Partial<IntraZoneNode> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const aList = await dbService.getAreas();
    const iList = await dbService.getIntraZoneMaps();
    setAreas(aList);
    setIntraNodes(iList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveArea = async () => {
    if (!editingArea?.area_name || !editingArea?.area_code) {
      alert('Vui lòng nhập tên và mã khu vực!');
      return;
    }
    await dbService.saveArea(editingArea);
    alert('Đã lưu thông tin khu vực thành công!');
    setIsAreaModalOpen(false);
    setEditingArea(null);
    loadData();
  };

  const handleSaveIntraNode = async () => {
    if (!editingIntraNode?.node_label || !editingIntraNode?.node_code) {
      alert('Vui lòng nhập nhãn và mã nút nội khu!');
      return;
    }
    await dbService.saveIntraZoneNode(editingIntraNode);
    alert('Đã lưu nút bản đồ nội khu thành công!');
    setIsIntraModalOpen(false);
    setEditingIntraNode(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Quản Lý Khu Vực & Bản Đồ Nội Khu</h1>
        <p className="text-xs text-slate-500 mt-1">
          Định nghĩa khu vực hoạt động (Chung cư/KCN), mã xác thực cư dân và cây bản đồ định tuyến nội bộ.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('AREAS')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'AREAS'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Danh Sách Khu Vực Phục Vụ ({areas.length})
        </button>
        <button
          onClick={() => setActiveTab('INTRA_TREE')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'INTRA_TREE'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sơ Đồ Cây Định Tuyến Nội Khu ({intraNodes.length} Nút)
        </button>
      </div>

      {activeTab === 'AREAS' ? (
        <div className="space-y-6">
          <FilterBar
            onRefresh={loadData}
            primaryAction={{
              label: '+ Thêm Khu Vực Mới',
              icon: <Plus className="w-4 h-4" />,
              onClick: () => {
                setEditingArea({
                  area_code: '',
                  area_name: '',
                  area_type: 'CHUNG_CU',
                  city: 'TP. Hồ Chí Minh',
                  district: 'Quận 9',
                  address: '',
                  center_lat: 10.8402,
                  center_lng: 106.8351,
                  radius_meters: 500,
                  auth_code: 'CODE' + Math.floor(Math.random() * 1000),
                  shipper_model: 'PLATFORM',
                });
                setIsAreaModalOpen(true);
              },
            }}
          />

          {/* Area Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <CardGridItem
                key={area.id}
                image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"
                categoryOverlay={area.area_type}
                statusText={area.is_active ? 'ACTIVE' : 'INACTIVE'}
                subBadge={`Mã khu: ${area.area_code}`}
                title={area.area_name}
                subtitle={area.address}
                metaItems={[
                  { icon: <MapPin className="w-3.5 h-3.5" />, label: `${area.center_lat}, ${area.center_lng}` },
                  { icon: <Key className="w-3.5 h-3.5 text-amber-500" />, label: `Mã Cư Dân: ${area.auth_code}` },
                ]}
                detailAction={{
                  label: 'Sửa cấu hình khu vực →',
                  onClick: () => {
                    setEditingArea(area);
                    setIsAreaModalOpen(true);
                  },
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Intra Zone Tree View */
        <div className="space-y-6">
          <FilterBar
            onRefresh={loadData}
            primaryAction={{
              label: '+ Thêm Nút Nội Khu',
              icon: <Plus className="w-4 h-4" />,
              onClick: () => {
                setEditingIntraNode({
                  area_id: areas[0]?.id || 1,
                  node_type: 'BUILDING',
                  node_code: '',
                  node_label: '',
                  parent_id: null,
                });
                setIsIntraModalOpen(true);
              },
            }}
          />

          {/* Tree View list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-600" />
              Cấu Trúc Tòa → Tầng → Phòng (Cây Bản Đồ Nút Nội Khu):
            </h4>

            <div className="space-y-3">
              {intraNodes
                .filter((n) => n.parent_id === null)
                .map((parent) => (
                  <div key={parent.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span>{parent.node_label}</span>
                        <span className="font-mono text-[11px] text-slate-400">({parent.node_code})</span>
                        <Badge statusText={parent.node_type} />
                      </div>
                      <button
                        onClick={() => {
                          setEditingIntraNode(parent);
                          setIsIntraModalOpen(true);
                        }}
                        className="text-xs text-blue-600 hover:underline cursor-pointer"
                      >
                        Sửa
                      </button>
                    </div>

                    {/* Children nodes */}
                    <div className="pl-6 border-l-2 border-slate-300 space-y-2 pt-1">
                      {intraNodes
                        .filter((c) => c.parent_id === parent.id)
                        .map((child) => (
                          <div key={child.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-purple-600" />
                              <span className="font-semibold text-slate-700">{child.node_label}</span>
                              <span className="font-mono text-[10px] text-slate-400">({child.node_code})</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingIntraNode(child);
                                setIsIntraModalOpen(true);
                              }}
                              className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                            >
                              Sửa
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Area Modal */}
      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        title={editingArea?.id ? 'Chỉnh Sửa Khu Vực' : 'Thêm Khu Vực Mới'}
        subtitle="Cấu hình thông tin địa lý & mô hình shipper"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã khu vực (area_code):</label>
              <input
                type="text"
                value={editingArea?.area_code || ''}
                onChange={(e) => setEditingArea((prev) => ({ ...prev, area_code: e.target.value }))}
                placeholder="VD: CC_VINHOMES_Q9"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Loại khu vực:</label>
              <select
                value={editingArea?.area_type || 'CHUNG_CU'}
                onChange={(e) => setEditingArea((prev) => ({ ...prev, area_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="CHUNG_CU">Chung cư / Khu dân cư</option>
                <option value="KHU_CN">Khu công nghiệp</option>
                <option value="VAN_PHONG">Tòa văn phòng</option>
                <option value="KY_TUC_XA">Ký túc xá</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Tên khu vực đầy đủ:</label>
            <input
              type="text"
              value={editingArea?.area_name || ''}
              onChange={(e) => setEditingArea((prev) => ({ ...prev, area_name: e.target.value }))}
              placeholder="VD: Vinhomes Grand Park Q9"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Vĩ độ trung tâm (center_lat):</label>
              <input
                type="number"
                step="0.0001"
                value={editingArea?.center_lat || 10.8402}
                onChange={(e) => setEditingArea((prev) => ({ ...prev, center_lat: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kinh độ trung tâm (center_lng):</label>
              <input
                type="number"
                step="0.0001"
                value={editingArea?.center_lng || 106.8351}
                onChange={(e) => setEditingArea((prev) => ({ ...prev, center_lng: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã xác thực cư dân (auth_code):</label>
              <input
                type="text"
                value={editingArea?.auth_code || ''}
                onChange={(e) => setEditingArea((prev) => ({ ...prev, auth_code: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mô hình Shipper:</label>
              <select
                value={editingArea?.shipper_model || 'PLATFORM'}
                onChange={(e) => setEditingArea((prev) => ({ ...prev, shipper_model: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="PLATFORM">PLATFORM (Shipper hệ thống)</option>
                <option value="SHOP_OWN">SHOP_OWN (Shop tự giao)</option>
                <option value="HYBRID">HYBRID (Kết hợp cả hai)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAreaModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveArea}
              className="px-4 py-2 bg-[#0F2540] text-white rounded-lg font-medium hover:bg-slate-800 cursor-pointer"
            >
              Lưu Khu Vực
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Intra Node Modal */}
      <Modal
        isOpen={isIntraModalOpen}
        onClose={() => setIsIntraModalOpen(false)}
        title={editingIntraNode?.id ? 'Chỉnh Sửa Nút Nội Khu' : 'Thêm Nút Bản Đồ Nội Khu'}
        subtitle="Định tuyến giao nhận tòa nhà / tầng / xưởng"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Loại nút (node_type):</label>
              <select
                value={editingIntraNode?.node_type || 'BUILDING'}
                onChange={(e) => setEditingIntraNode((prev) => ({ ...prev, node_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="BUILDING">BUILDING (Tòa nhà)</option>
                <option value="FLOOR">FLOOR (Tầng trong tòa)</option>
                <option value="UNIT">UNIT (Phòng / Căn hộ)</option>
                <option value="ZONE">ZONE (Khu nhà xưởng)</option>
                <option value="WORKSHOP">WORKSHOP (Xưởng)</option>
                <option value="GATE">GATE (Cổng vào)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mã nút (node_code):</label>
              <input
                type="text"
                value={editingIntraNode?.node_code || ''}
                onChange={(e) => setEditingIntraNode((prev) => ({ ...prev, node_code: e.target.value }))}
                placeholder="VD: TOA_S1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Nhãn hiển thị (node_label):</label>
            <input
              type="text"
              value={editingIntraNode?.node_label || ''}
              onChange={(e) => setEditingIntraNode((prev) => ({ ...prev, node_label: e.target.value }))}
              placeholder="VD: Tòa S1 - Rainbow"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsIntraModalOpen(false)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveIntraNode}
              className="px-4 py-2 bg-[#0F2540] text-white rounded-lg font-medium hover:bg-slate-800 cursor-pointer"
            >
              Lưu Nút Bản Đồ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
