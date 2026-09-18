import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { User } from '@/api/mockData';
import { Table, Column } from '@/components/ui/Table';
import { FilterBar } from '@/components/ui/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Lock, Unlock, Key, Eye } from 'lucide-react';

export function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPassUser, setResetPassUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    if (confirm(`Bạn có chắc chắn muốn ${nextStatus === 'LOCKED' ? 'K khóa' : 'Mở khóa'} tài khoản ${user.full_name}?`)) {
      await dbService.updateUserStatus(user.id, nextStatus);
      loadData();
    }
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Vui lòng nhập mật khẩu mới ít nhất 6 ký tự!');
      return;
    }
    alert(`Đã cấp lại mật khẩu mới cho tài khoản ${resetPassUser?.phone} thành công!`);
    setResetPassUser(null);
    setNewPassword('');
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.phone.includes(search) || u.full_name.toLowerCase().includes(search.toLowerCase());
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
          <p className="font-semibold text-slate-800">{u.full_name}</p>
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
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
      cell: (u) => (
        <span className="text-xs text-slate-600 font-medium">
          {u.area_id ? `Khu #${u.area_id} ${u.is_area_verified ? '✓ (Đã duyệt)' : ''}` : 'Chưa gán'}
        </span>
      ),
    },
    {
      header: 'Ngày tạo',
      cell: (u) => <span className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString('vi-VN')}</span>,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedUser(u)}
            title="Xem chi tiết"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
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
      <div>
        <h1 className="text-xl font-bold text-slate-800">Quản Lý Tài Khoản & Phân Quyền</h1>
        <p className="text-xs text-slate-500 mt-1">
          Danh sách người dùng, phân quyền RBAC và kiểm soát trạng thái tài khoản.
        </p>
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

      {/* View User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Chi Tiết Tài Khoản"
        subtitle={`ID: #${selectedUser?.id} - SĐT: ${selectedUser?.phone}`}
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-400 font-medium">Họ và tên:</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedUser.full_name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Email:</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.email || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Vai trò hệ thống:</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Trạng thái:</p>
                <div className="mt-0.5"><Badge statusText={selectedUser.status} /></div>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Khu vực xác thực:</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedUser.area_id ? `Khu #${selectedUser.area_id}` : 'Chưa xác thực'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Ngày khởi tạo:</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {new Date(selectedUser.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium text-xs hover:bg-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetPassUser}
        onClose={() => setResetPassUser(null)}
        title="Cấp Lại Mật Khẩu"
        subtitle={`Tài khoản: ${resetPassUser?.phone} - ${resetPassUser?.full_name}`}
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
