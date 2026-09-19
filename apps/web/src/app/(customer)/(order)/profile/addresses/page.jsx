'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/lib/location';
import AccountSidebarLayout from '@/components/layout/AccountSidebarLayout';

export default function AddressBookPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const [isDefault, setIsDefault] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile/addresses');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince).then(setDistricts);
    } else {
      setDistricts([]);
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict).then(setWards);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict]);



  const name = user?.fullName || user?.phone || 'Khách hàng';

  const fetchAddresses = async () => {
    try {
      const data = await authService.getAddresses();
      setAddresses(data);
    } catch (err) {
      window.alert('Không thể tải danh sách địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!streetAddress.trim() || !selectedProvince || !selectedDistrict || !selectedWard) {
      window.alert('Vui lòng nhập đầy đủ thông tin địa chỉ');
      return;
    }

    const provinceName = provinces.find(p => p.code == selectedProvince)?.name || '';
    const districtName = districts.find(d => d.code == selectedDistrict)?.name || '';
    const wardName = wards.find(w => w.code == selectedWard)?.name || '';
    
    const fullAddress = `${streetAddress}, ${wardName}, ${districtName}, ${provinceName}`;

    setIsSubmitting(true);
    try {
      await authService.addAddress({
        addressLine: fullAddress,
        isDefault: isDefault || addresses.length === 0, // Tự động làm mặc định nếu là địa chỉ đầu tiên
      });
      window.alert('Thêm địa chỉ thành công');
      setStreetAddress('');
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      setIsDefault(false);
      fetchAddresses();
    } catch (err) {
      window.alert(err.message || 'Lỗi khi thêm địa chỉ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await authService.deleteAddress(id);
      window.alert('Đã xóa địa chỉ');
      fetchAddresses();
    } catch (err) {
      window.alert('Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await authService.setDefaultAddress(id);
      window.alert('Đã đặt làm địa chỉ mặc định');
      fetchAddresses();
    } catch (err) {
      window.alert('Có lỗi xảy ra');
    }
  };

  if (!isMounted || !isAuthenticated) {
    return null; // Return null until mounted and checked auth to avoid hydration mismatch
  }

  return (
    <AccountSidebarLayout activeTab="addresses">
      <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-gray-800 uppercase mb-6 tracking-wide">
              SỔ ĐỊA CHỈ
            </h2>
            
            {/* List addresses */}
            <div className="space-y-4 mb-10">
              {isLoading ? (
                <div className="py-4 text-gray-500">Đang tải danh sách địa chỉ...</div>
              ) : addresses.length === 0 ? (
                <div className="py-4 text-gray-500 italic">Bạn chưa có địa chỉ nào. Hãy thêm mới bên dưới.</div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className={`p-4 border rounded ${addr.isDefault ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{addr.addressLine}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tọa độ: {addr.latitude}, {addr.longitude}
                        </p>
                        {addr.isDefault && (
                          <span className="inline-block mt-2 text-xs font-bold bg-yellow-400 text-black px-2 py-1 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button onClick={() => handleDelete(addr.id)} className="text-sm text-yellow-600 hover:underline">
                          Xóa
                        </button>
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr.id)} className="text-sm text-blue-600 hover:underline">
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <hr className="my-8" />

            <h3 className="text-lg font-bold text-gray-800 mb-4">Thêm địa chỉ mới</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    Tỉnh/Thành phố <span className="text-yellow-600">*</span>
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    Quận/Huyện <span className="text-yellow-600">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors disabled:opacity-50"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    Phường/Xã <span className="text-yellow-600">*</span>
                  </label>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors disabled:opacity-50"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    Tên đường, số nhà <span className="text-yellow-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="VD: 164 Lê Thánh Tôn"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Địa chỉ của bạn sẽ được định vị tự động qua bản đồ VietMap.</p>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow-400 text-black px-6 py-2.5 rounded font-bold hover:bg-yellow-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? 'Đang thêm...' : 'Thêm địa chỉ'}
                </button>
              </div>
            </form>
          </div>
    </AccountSidebarLayout>
  );
}
