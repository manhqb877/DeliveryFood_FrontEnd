import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { User, Area } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  Lock, Unlock, Key, Eye, Edit3, Save, 
  MapPin, ShoppingBag, Truck, Store, User as UserIcon, 
  CheckCircle2, AlertCircle, Clock, ShieldCheck, Mail, Phone, Calendar, RefreshCw
} from 'lucide-react';

export function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & User Details
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'profile' | 'orders'>('info');

  // Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    areaId: 1,
    isAreaVerified: false,
    addressText: '',
    // Shipper
    idCardNumber: '',
    vehicleType: 'MOTORBIKE',
    vehiclePlate: '',
    shipperApprovalStatus: 'PENDING',
    // Shop
    shopName: '',
    locationDetail: '',
    shopType: 'COM_TRUA',
    shopApprovalStatus: 'PENDING'
  });

  // Reset Password
  const [resetPassUser, setResetPassUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadData = async (kw = search, role = roleFilter, status = statusFilter) => {
    setLoading(true);
    const data = await dbService.getUsers({
      keyword: kw.trim() || undefined,
      role: role !== 'ALL' ? role : undefined,
      status: status !== 'ALL' ? status : undefined
    });
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    dbService.getAreas().then(setAreas).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search, roleFilter, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  // Fetch full details when opening modal
  const handleOpenDetail = async (user: User, edit = false) => {
    setSelectedUserId(user.id);
    setIsEditMode(edit);
    setActiveTab('info');
    setLoadingDetail(true);
    try {
      const detail = await dbService.getUserDetail(user.id);
      setUserDetail(detail || user);
      populateEditForm(detail || user);
    } catch (e) {
      console.error(e);
      setUserDetail(user);
      populateEditForm(user);
    } finally {
      setLoadingDetail(false);
    }
  };

  const populateEditForm = (data: any) => {
    const defaultAddr = data.defaultAddress || {};
    const addrStr = typeof defaultAddr === 'object' 
      ? (defaultAddr.fullAddress || defaultAddr.address || '') 
      : String(defaultAddr || '');

    const shipper = data.shipperProfile || {};
    const shop = data.shopProfile || {};

    setEditForm({
      fullName: data.fullName || data.full_name || '',
      phone: data.phone || '',
      email: data.email || '',
      role: data.role || 'CUSTOMER',
      status: data.status || 'ACTIVE',
      areaId: data.areaId || data.area_id || 1,
      isAreaVerified: Boolean(data.isAreaVerified ?? data.is_area_verified ?? false),
      addressText: addrStr,
      idCardNumber: shipper.id_card_number || shipper.idCardNumber || '',
      vehicleType: shipper.vehicle_type || shipper.vehicleType || 'MOTORBIKE',
      vehiclePlate: shipper.vehicle_plate || shipper.vehiclePlate || '',
      shipperApprovalStatus: shipper.approval_status || shipper.approvalStatus || 'PENDING',
      shopName: shop.shop_name || shop.shopName || '',
      locationDetail: shop.location_detail || shop.locationDetail || '',
      shopType: shop.shop_type || shop.shopType || 'COM_TRUA',
      shopApprovalStatus: shop.approval_status || shop.approvalStatus || 'PENDING'
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedUserId) return;
    if (!editForm.fullName.trim()) {
      alert('Vui lòng nhập họ và tên!');
      return;
    }
    if (!editForm.phone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    setSavingEdit(true);
    try {
      const payload: any = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() ? editForm.email.trim() : null,
        role: editForm.role,
        status: editForm.status,
        areaId: Number(editForm.areaId) || 1,
        isAreaVerified: editForm.isAreaVerified,
        defaultAddress: {
          fullAddress: editForm.addressText.trim()
        }
      };

      if (editForm.role === 'SHIPPER') {
        payload.idCardNumber = editForm.idCardNumber.trim();
        payload.vehiclePlate = editForm.vehiclePlate.trim();
        payload.vehicleType = editForm.vehicleType;
        payload.shipperApprovalStatus = editForm.shipperApprovalStatus;
      }

      if (editForm.role === 'SHOP_MANAGER') {
        payload.shopName = editForm.shopName.trim();
        payload.locationDetail = editForm.locationDetail.trim();
        payload.shopType = editForm.shopType;
        payload.shopApprovalStatus = editForm.shopApprovalStatus;
      }

      const updated = await dbService.updateUserDetails(selectedUserId, payload);
      setUserDetail(updated);
      setIsEditMode(false);
      alert('Cập nhật thông tin tài khoản thành công!');
      loadData();
    } catch (e: any) {
      console.error(e);
      alert('Lỗi cập nhật: ' + (e.message || 'Không thể lưu thông tin.'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    if (confirm(`Bạn có chắc chắn muốn ${nextStatus === 'LOCKED' ? 'Khóa' : 'Mở khóa'} tài khoản ${user.full_name || (user as any).fullName}?`)) {
      await dbService.updateUserStatus(user.id, nextStatus);
      loadData();
      if (selectedUserId === user.id && userDetail) {
        setUserDetail({ ...userDetail, status: nextStatus });
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Vui lòng nhập mật khẩu mới ít nhất 6 ký tự!');
      return;
    }
    if (resetPassUser) {
      await dbService.resetUserPassword(resetPassUser.id, newPassword);
      alert(`Đã cấp lại mật khẩu mới cho tài khoản ${resetPassUser.phone} thành công!`);
      setResetPassUser(null);
      setNewPassword('');
    }
  };

  function removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  const filteredUsers = users.filter((u) => {
    const searchTrimmed = search.trim();
    const searchNorm = removeVietnameseTones(searchTrimmed);
    const phoneStr = u.phone || '';
    const nameStr = u.full_name || (u as any).fullName || '';
    const nameNorm = removeVietnameseTones(nameStr);
    
    const matchSearch =
      !searchNorm || phoneStr.includes(searchTrimmed) || nameNorm.includes(searchNorm);
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const columns: Column<User>[] = [
    {
      header: 'ID / SĐT',
      cell: (u) => (
        <div>
          <span className="font-mono text-slate-500 font-semibold">#{u.id}</span>
          <p className="font-semibold text-slate-800">{u.phone}</p>
        </div>
      ),
    },
    {
      header: 'Họ và tên',
      cell: (u) => (
        <div>
          <p className="font-semibold text-slate-800">{u.full_name || (u as any).fullName || 'Người dùng'}</p>
          <p className="text-[11px] text-slate-400">{u.email || 'Chưa cập nhật email'}</p>
        </div>
      ),
    },
    {
      header: 'Vai trò (Role)',
      cell: (u) => {
        const roleLabels: Record<string, string> = {
          ADMIN: 'Quản trị viên',
          SHOP_MANAGER: 'Chủ gian hàng',
          SHIPPER: 'Shipper nội khu',
          CUSTOMER: 'Khách hàng',
        };
        const roleColors: Record<string, string> = {
          ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
          SHOP_MANAGER: 'bg-amber-50 text-amber-700 border-amber-200',
          SHIPPER: 'bg-blue-50 text-blue-700 border-blue-200',
          CUSTOMER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleColors[u.role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {roleLabels[u.role] || u.role}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái',
      cell: (u) => <Badge statusText={u.status} />,
    },
    {
      header: 'Khu vực ID',
      cell: (u) => {
        const areaId = u.area_id || (u as any).areaId;
        const isVerified = u.is_area_verified ?? (u as any).isAreaVerified;
        return (
          <span className="text-xs text-slate-600 font-medium">
            {areaId ? `Khu #${areaId} ${isVerified ? '✓ (Đã duyệt)' : ''}` : 'Chưa gán'}
          </span>
        );
      },
    },
    {
      header: 'Ngày tạo',
      cell: (u) => {
        const rawDate = u.created_at || (u as any).createdAt;
        return (
          <span className="text-xs text-slate-500">
            {rawDate ? new Date(rawDate).toLocaleDateString('vi-VN') : '—'}
          </span>
        );
      },
    },
    {
      header: 'Hành động',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetail(u, false)}
            title="Xem chi tiết"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleOpenDetail(u, true)}
            title="Chỉnh sửa thông tin"
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setResetPassUser(u)}
            title="Reset mật khẩu"
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4" />
          </button>

          {u.role !== 'ADMIN' && (
            <button
              onClick={() => handleToggleStatus(u)}
              title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                u.status === 'ACTIVE'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản Lý Tài Khoản & Phân Quyền</h1>
          <p className="text-xs text-slate-500 mt-1">
            Xem chi tiết và cập nhật thông tin người dùng trong hệ thống.
          </p>
        </div>
        <button
          onClick={() => loadData()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo SĐT hoặc Tên người dùng..."
        onRefresh={loadData}
        dropdowns={[
          {
            id: 'role',
            label: 'Vai trò',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { label: 'Tất cả vai trò', value: 'ALL' },
              { label: 'Khách hàng (CUSTOMER)', value: 'CUSTOMER' },
              { label: 'Chủ gian hàng (SHOP_MANAGER)', value: 'SHOP_MANAGER' },
              { label: 'Shipper (SHIPPER)', value: 'SHIPPER' },
              { label: 'Quản trị viên (ADMIN)', value: 'ADMIN' },
            ],
          },
          {
            id: 'status',
            label: 'Trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Hoạt động (ACTIVE)', value: 'ACTIVE' },
              { label: 'Bị khóa (LOCKED)', value: 'LOCKED' },
              { label: 'Chờ duyệt (PENDING)', value: 'PENDING' },
            ],
          },
        ]}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        loading={loading}
        keyExtractor={(u) => u.id}
        emptyMessage="Không tìm thấy tài khoản thỏa điều kiện"
      />

      {/* View / Edit User Details Modal */}
      <Modal
        isOpen={!!selectedUserId}
        onClose={() => {
          setSelectedUserId(null);
          setUserDetail(null);
          setIsEditMode(false);
        }}
        title={isEditMode ? "Cập Nhật Thông Tin Người Dùng" : "Chi Tiết Toàn Diện Người Dùng"}
        subtitle={`Mã tài khoản: #${selectedUserId} ${userDetail?.phone ? `• SĐT: ${userDetail.phone}` : ''}`}
        maxWidth="4xl"
      >
        {loadingDetail ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Đang tải thông tin chi tiết...</p>
          </div>
        ) : userDetail ? (
          <div className="space-y-5 text-xs">
            {/* Top User Header Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm overflow-hidden">
                  {userDetail.avatarUrl || userDetail.avatar_url ? (
                    <img 
                      src={userDetail.avatarUrl || userDetail.avatar_url} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    (userDetail.fullName || userDetail.full_name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-800">
                      {userDetail.fullName || userDetail.full_name || 'Người dùng'}
                    </h2>
                    <Badge statusText={userDetail.status} />
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {userDetail.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {userDetail.email || 'Chưa có email'}</span>
                  </div>
                </div>
              </div>

              {/* Mode Toggle Button */}
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Chỉnh sửa chi tiết
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition cursor-pointer"
                  >
                    Hủy sửa
                  </button>
                )}
              </div>
            </div>

            {/* If in EDIT MODE */}
            {isEditMode ? (
              <div className="space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    1. Thông tin tài khoản & Phân quyền
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Họ và tên <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        placeholder="Nhập họ và tên..."
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Số điện thoại <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        placeholder="0987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Vai trò hệ thống</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                      >
                        <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                        <option value="SHOP_MANAGER">Chủ gian hàng (SHOP_MANAGER)</option>
                        <option value="SHIPPER">Shipper nội khu (SHIPPER)</option>
                        <option value="ADMIN">Quản trị viên (ADMIN)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Trạng thái tài khoản</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                      >
                        <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                        <option value="LOCKED">Bị khóa (LOCKED)</option>
                        <option value="PENDING">Chờ duyệt (PENDING)</option>
                        <option value="DELETED">Đã xóa (DELETED)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Khu vực sinh sống / hoạt động</label>
                      <select
                        value={editForm.areaId}
                        onChange={(e) => setEditForm({ ...editForm, areaId: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                      >
                        {areas.length > 0 ? (
                          areas.map((a) => (
                            <option key={a.id} value={a.id}>
                              #{a.id} - {a.area_name} ({a.city})
                            </option>
                          ))
                        ) : (
                          <option value={editForm.areaId}>Khu vực #{editForm.areaId}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isAreaVerified"
                      checked={editForm.isAreaVerified}
                      onChange={(e) => setEditForm({ ...editForm, isAreaVerified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="isAreaVerified" className="text-slate-700 font-medium cursor-pointer">
                      Đã xác thực mã khu vực nội bộ
                    </label>
                  </div>
                </div>

                {/* Address Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    2. Địa chỉ nhận hàng mặc định
                  </h3>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Địa chỉ chi tiết (Tòa nhà, số phòng, tên đường...)</label>
                    <input
                      type="text"
                      value={editForm.addressText}
                      onChange={(e) => setEditForm({ ...editForm, addressText: e.target.value })}
                      placeholder="VD: Phòng 1204 Tòa S2.01, Vinhomes Grand Park, Phường Long Bình, TP. Thủ Đức"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Role Specific Section: Shipper */}
                {editForm.role === 'SHIPPER' && (
                  <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl space-y-3 shadow-xs">
                    <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5 border-b pb-2 border-blue-200">
                      <Truck className="w-4 h-4 text-blue-600" />
                      3. Hồ sơ nghiệp vụ Shipper
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Số CCCD / CMND</label>
                        <input
                          type="text"
                          value={editForm.idCardNumber}
                          onChange={(e) => setEditForm({ ...editForm, idCardNumber: e.target.value })}
                          placeholder="079090001234"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Loại phương tiện</label>
                        <select
                          value={editForm.vehicleType}
                          onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        >
                          <option value="MOTORBIKE">Xe máy (MOTORBIKE)</option>
                          <option value="EBIKE">Xe đạp điện (EBIKE)</option>
                          <option value="BICYCLE">Xe đạp (BICYCLE)</option>
                          <option value="WALKING">Đi bộ (WALKING)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Biển số xe</label>
                        <input
                          type="text"
                          value={editForm.vehiclePlate}
                          onChange={(e) => setEditForm({ ...editForm, vehiclePlate: e.target.value })}
                          placeholder="59-X1 123.45"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Duyệt hồ sơ shipper</label>
                        <select
                          value={editForm.shipperApprovalStatus}
                          onChange={(e) => setEditForm({ ...editForm, shipperApprovalStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        >
                          <option value="APPROVED">Đã duyệt (APPROVED)</option>
                          <option value="PENDING">Chờ duyệt (PENDING)</option>
                          <option value="REJECTED">Từ chối (REJECTED)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Role Specific Section: Shop Manager */}
                {editForm.role === 'SHOP_MANAGER' && (
                  <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3 shadow-xs">
                    <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-1.5 border-b pb-2 border-amber-200">
                      <Store className="w-4 h-4 text-amber-600" />
                      3. Hồ sơ nghiệp vụ Gian hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Tên gian hàng</label>
                        <input
                          type="text"
                          value={editForm.shopName}
                          onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                          placeholder="Cơm Tấm Sài Gòn..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Vị trí gian hàng</label>
                        <input
                          type="text"
                          value={editForm.locationDetail}
                          onChange={(e) => setEditForm({ ...editForm, locationDetail: e.target.value })}
                          placeholder="Tầng trệt Tòa S1.02..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Trạng thái duyệt quán</label>
                        <select
                          value={editForm.shopApprovalStatus}
                          onChange={(e) => setEditForm({ ...editForm, shopApprovalStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        >
                          <option value="APPROVED">Đã duyệt (APPROVED)</option>
                          <option value="PENDING">Chờ duyệt (PENDING)</option>
                          <option value="REJECTED">Từ chối (REJECTED)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {savingEdit ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE (TABBED VIEW) */
              <div className="space-y-4">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'info'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Thông tin định danh
                  </button>

                  <button
                    onClick={() => setActiveTab('address')}
                    className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'address'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Khu vực & Địa chỉ
                  </button>

                  {(userDetail.role === 'SHIPPER' || userDetail.role === 'SHOP_MANAGER' || userDetail.shipperProfile || userDetail.shopProfile) && (
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'profile'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {userDetail.role === 'SHIPPER' ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                      Hồ sơ {userDetail.role === 'SHIPPER' ? 'Shipper' : 'Gian hàng'}
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'orders'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Đơn hàng & Giao dịch
                  </button>
                </div>

                {/* Tab 1: Info */}
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-slate-400 font-medium">Họ và tên:</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {userDetail.fullName || userDetail.full_name || 'Người dùng'}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Số điện thoại:</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5 font-mono">
                        {userDetail.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Địa chỉ Email:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {userDetail.email || <span className="text-slate-400 italic">Chưa cập nhật email</span>}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Vai trò hệ thống:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {userDetail.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Trạng thái tài khoản:</p>
                      <div className="mt-0.5">
                        <Badge statusText={userDetail.status} />
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Số lần đăng nhập sai:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {userDetail.failedLoginCount ?? 0} lần
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Lần đăng nhập gần nhất:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {userDetail.lastLoginAt ? new Date(userDetail.lastLoginAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-medium">Ngày khởi tạo:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {(userDetail.createdAt || userDetail.created_at)
                          ? new Date(userDetail.createdAt || userDetail.created_at).toLocaleString('vi-VN')
                          : '—'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Address */}
                {activeTab === 'address' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          Khu vực gán: #{userDetail.areaId || userDetail.area_id || 'Chưa gán'}
                        </span>
                        {(userDetail.isAreaVerified ?? userDetail.is_area_verified) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực nội bộ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5" /> Chưa xác thực khu vực
                          </span>
                        )}
                      </div>

                      {userDetail.areaInfo ? (
                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200">
                          <div>
                            <p className="text-slate-400">Tên khu vực:</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{userDetail.areaInfo.areaName} ({userDetail.areaInfo.areaCode})</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Thành phố / Quận:</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{userDetail.areaInfo.city} • {userDetail.areaInfo.district}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-400">Địa chỉ trung tâm khu:</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{userDetail.areaInfo.address}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-xs pt-1">
                          Chưa có thông tin mở rộng của khu vực.
                        </p>
                      )}
                    </div>

                    {/* Default delivery address */}
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                      <p className="text-slate-500 font-semibold mb-1">Địa chỉ nhận hàng mặc định:</p>
                      {userDetail.defaultAddress ? (
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <p className="font-semibold text-slate-800">
                            {typeof userDetail.defaultAddress === 'object'
                              ? (userDetail.defaultAddress.fullAddress || userDetail.defaultAddress.address || JSON.stringify(userDetail.defaultAddress))
                              : userDetail.defaultAddress}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Chưa thiết lập địa chỉ mặc định</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Profile (Shipper / Shop) */}
                {activeTab === 'profile' && (
                  <div>
                    {userDetail.role === 'SHIPPER' || userDetail.shipperProfile ? (
                      <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-3">
                        <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-blue-600" />
                          Chi tiết hồ sơ Shipper nội khu
                        </h4>
                        {userDetail.shipperProfile ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            <div>
                              <p className="text-slate-400">Số CCCD / CMND:</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{userDetail.shipperProfile.id_card_number || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Loại phương tiện:</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{userDetail.shipperProfile.vehicle_type || 'Xe máy'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Biển số xe:</p>
                              <p className="font-semibold text-slate-800 mt-0.5 font-mono">{userDetail.shipperProfile.vehicle_plate || 'Chưa có'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Trạng thái hồ sơ:</p>
                              <div className="mt-0.5"><Badge statusText={userDetail.shipperProfile.approval_status || 'PENDING'} /></div>
                            </div>
                            <div>
                              <p className="text-slate-400">Tổng đơn đã giao:</p>
                              <p className="font-bold text-blue-600 text-sm mt-0.5">{userDetail.shipperProfile.total_deliveries ?? 0} đơn</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Đánh giá trung bình:</p>
                              <p className="font-bold text-amber-500 text-sm mt-0.5">⭐ {userDetail.shipperProfile.avg_rating ?? '5.0'}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">Chưa có bản ghi hồ sơ shipper.</p>
                        )}
                      </div>
                    ) : userDetail.role === 'SHOP_MANAGER' || userDetail.shopProfile ? (
                      <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-3">
                        <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-amber-600" />
                          Chi tiết hồ sơ Gian hàng
                        </h4>
                        {userDetail.shopProfile ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                            <div>
                              <p className="text-slate-400">Tên quán:</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{userDetail.shopProfile.shopName || userDetail.shopProfile.shop_name}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Địa chỉ / Vị trí:</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{userDetail.shopProfile.locationDetail || userDetail.shopProfile.location_detail || 'Chưa có'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Trạng thái duyệt:</p>
                              <div className="mt-0.5"><Badge statusText={userDetail.shopProfile.approvalStatus || userDetail.shopProfile.approval_status} /></div>
                            </div>
                            <div>
                              <p className="text-slate-400">Đang mở cửa:</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{userDetail.shopProfile.isOpen ? '✓ Đang mở' : 'Đóng cửa'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Đang nhận đơn:</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{userDetail.shopProfile.isAcceptingOrders ? '✓ Sẵn sàng nhận' : 'Tạm ngưng'}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">Chưa có bản ghi hồ sơ quán.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Tab 4: Orders */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                        <p className="text-blue-600 font-medium">Tổng số đơn</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">
                          {userDetail.orderStats?.totalOrders ?? 0}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                        <p className="text-emerald-600 font-medium">Tổng chi tiêu</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">
                          {Number(userDetail.orderStats?.totalSpent ?? 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                        <p className="text-indigo-600 font-medium">Đơn thành công</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">
                          {userDetail.orderStats?.completedOrders ?? 0}
                        </p>
                      </div>
                      <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                        <p className="text-rose-600 font-medium">Đơn đã hủy</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">
                          {userDetail.orderStats?.cancelledOrders ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Recent Orders List */}
                    <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                      <p className="font-semibold text-slate-800 mb-2">Đơn hàng gần đây:</p>
                      {userDetail.orderStats?.recentOrders && userDetail.orderStats.recentOrders.length > 0 ? (
                        <div className="space-y-2">
                          {userDetail.orderStats.recentOrders.map((ord: any) => (
                            <div key={ord.id || ord.orderCode} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                              <div>
                                <span className="font-mono font-bold text-blue-600">#{ord.orderCode}</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {ord.shopName || 'Gian hàng'} • {ord.placedAt ? new Date(ord.placedAt).toLocaleString('vi-VN') : '—'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-800">
                                  {Number(ord.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                </p>
                                <div className="mt-0.5"><Badge statusText={ord.orderStatus || 'COMPLETED'} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-center py-4">Chưa có giao dịch đơn hàng nào.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Modal Close Button */}
            {!isEditMode && (
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setUserDetail(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetPassUser}
        onClose={() => setResetPassUser(null)}
        title="Cấp Lại Mật Khẩu"
        subtitle={`Tài khoản: ${resetPassUser?.phone} - ${resetPassUser?.full_name || (resetPassUser as any)?.fullName}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Mật khẩu mới:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setResetPassUser(null)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 bg-[#0F2540] text-white rounded-lg font-medium hover:bg-slate-800 cursor-pointer"
            >
              Xác Nhận Cấp Lại
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
