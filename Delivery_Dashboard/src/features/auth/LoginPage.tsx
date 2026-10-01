import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthGuard';
import { dbService, API_HOST } from '@/api/client';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/api/location';
import {
  Store,
  Shield,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Sliding panel state: false = Login view, true = Register view
  const [isRegisterView, setIsRegisterView] = useState(false);

  // Portal view for login: 'admin' (default) | 'shop'
  const [portalView, setPortalView] = useState<'admin' | 'shop'>('admin');

  // Login Form states
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Shop states
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regShopName, setRegShopName] = useState('');
  const [regLicense, setRegLicense] = useState('');

  // Location States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProv, setSelectedProv] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [shopLat, setShopLat] = useState<number | null>(null);
  const [shopLng, setShopLng] = useState<number | null>(null);

  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Status & Errors
  const [error, setError] = useState('');
  const [regError, setRegError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Provinces
  useEffect(() => {
    fetchProvinces().then(setProvinces).catch(() => {});
  }, []);

  // Load Districts when Province changes
  useEffect(() => {
    if (selectedProv) {
      fetchDistricts(selectedProv).then(setDistricts).catch(() => {});
    } else {
      setDistricts([]);
      setSelectedDist('');
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedProv]);

  // Load Wards when District changes
  useEffect(() => {
    if (selectedDist) {
      fetchWards(selectedDist).then(setWards).catch(() => {});
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDist]);

  const norm = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/^(tỉnh|thành phố|tp\.|quận|huyện|thị xã|tx\.|phường|xã|thị trấn|tt\.)\s+/g, "")
      .trim();

  const parseAddressString = (str: string) => {
    if (!str) return null;
    const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const city = parts[parts.length - 1];
      const dist = parts[parts.length - 2];
      const ward = parts[parts.length - 3];
      return { city, dist, ward };
    }
    return null;
  };

  const mapLocationToDropdowns = (cityName?: string, districtName?: string, wardName?: string) => {
    if (!cityName) return;
    const cityNorm = norm(cityName);
    const p = provinces.find(
      (x) => norm(x.name) === cityNorm || norm(x.name).includes(cityNorm) || cityNorm.includes(norm(x.name))
    );
    if (!p) return;

    setSelectedProv(p.code);
    fetchDistricts(p.code).then((dList) => {
      setDistricts(dList);
      if (!districtName) return;
      const distNorm = norm(districtName);
      const d = dList.find(
        (x: any) => norm(x.name) === distNorm || norm(x.name).includes(distNorm) || distNorm.includes(norm(x.name))
      );
      if (!d) return;

      setSelectedDist(d.code);
      fetchWards(d.code).then((wList) => {
        setWards(wList);
        if (!wardName) return;
        const wardNorm = norm(wardName);
        const w = wList.find(
          (x: any) => norm(x.name) === wardNorm || norm(x.name).includes(wardNorm) || wardNorm.includes(norm(x.name))
        );
        if (w) setSelectedWard(w.code);
      });
    });
  };

  // Autocomplete Address with Vietmap
  useEffect(() => {
    if (streetAddress.length < 3) {
      setAutocompleteResults([]);
      setIsSearchingAddress(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchingAddress(true);
      fetch(
        `https://maps.vietmap.vn/api/autocomplete/v3?apikey=809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845&text=${encodeURIComponent(
          streetAddress
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setAutocompleteResults(data || []);
        })
        .catch(() => setAutocompleteResults([]))
        .finally(() => setIsSearchingAddress(false));
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [streetAddress]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Số điện thoại / Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://${API_HOST}:8080/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneOrEmail.trim().toLowerCase(), password }),
      });

      const result = await response.json();

      if (response.ok && result.status === 200 && result.data) {
        const { accessToken, user } = result.data;
        localStorage.setItem('hyperlocal_access_token', accessToken);

        const loggedInUser: any = {
          id: user.id,
          phone: user.phone || phoneOrEmail.trim(),
          email: user.email,
          full_name: user.fullName || 'Người Dùng',
          role: user.role,
          status: user.status,
          area_id: user.areaId || 1,
          is_area_verified: user.isAreaVerified || true,
          created_at: user.createdAt || new Date().toISOString(),
        };

        // Validate portal view
        if (portalView === 'admin' && loggedInUser.role !== 'ADMIN') {
          setError('Tài khoản này không phải Admin. Vui lòng chuyển sang cổng Shop!');
          setLoading(false);
          return;
        }
        if (portalView === 'shop' && loggedInUser.role !== 'SHOP_MANAGER') {
          setError('Tài khoản này không phải Shop Manager. Vui lòng chuyển sang cổng Admin!');
          setLoading(false);
          return;
        }

        if (loggedInUser.role === 'SHOP_MANAGER' && loggedInUser.status === 'PENDING') {
          login(loggedInUser);
          navigate('/pending-approval');
          return;
        }

        login(loggedInUser);
        if (loggedInUser.role === 'ADMIN') {
          navigate('/admin/reports');
        } else {
          navigate('/shop/orders');
        }
      } else {
        localStorage.removeItem('hyperlocal_access_token');
        localStorage.removeItem('auth_token');
        setError(result.message || 'Số điện thoại/Email hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem('hyperlocal_access_token');
      localStorage.removeItem('auth_token');
      setError('Có lỗi xảy ra khi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regOwnerName.trim() ||
      !regPhone.trim() ||
      !regPassword ||
      !regShopName.trim() ||
      !streetAddress.trim()
    ) {
      setRegError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    setLoading(true);
    setRegError('');

    try {
      const pName = provinces.find((p) => p.code == selectedProv)?.name || '';
      const dName = districts.find((d) => d.code == selectedDist)?.name || '';
      const wName = wards.find((w) => w.code == selectedWard)?.name || '';

      let fullAddress = streetAddress;
      if (wName && !fullAddress.includes(wName)) fullAddress += `, ${wName}`;
      if (dName && !fullAddress.includes(dName)) fullAddress += `, ${dName}`;
      if (pName && !fullAddress.includes(pName)) fullAddress += `, ${pName}`;

      const payload = {
        ownerName: regOwnerName.trim(),
        phone: regPhone.trim(),
        email: `${regPhone.trim()}@shop.hyperlocal.vn`,
        password: regPassword,
        shopName: regShopName.trim(),
        shopType: 'FOOD',
        shopDescription: 'Gian hàng chuyên phục vụ ẩm thực nội khu',
        areaId: 1,
        locationDetail: fullAddress,
        businessLicenseNumber: regLicense.trim() || `HKD-${Date.now()}`,
        shopLat: shopLat || undefined,
        shopLng: shopLng || undefined,
      };

      const response = await fetch(`http://${API_HOST}:8080/api/v1/auth/shops/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 201) {
        const shop = result.data;
        const loggedInUser: any = {
          id: shop.ownerId || shop.id,
          phone: shop.ownerPhone || shop.phone || regPhone,
          email: shop.ownerEmail || `${regPhone}@shop.hyperlocal.vn`,
          full_name: shop.ownerName || regOwnerName,
          role: 'SHOP_OWNER',
          status: 'PENDING',
          area_id: shop.areaId || 1,
        };
        login(loggedInUser);
        navigate('/pending-approval');
      } else {
        setRegError(result.message || 'Lỗi khi đăng ký gian hàng!');
      }
    } catch (err) {
      console.error(err);
      setRegError('Không thể gửi hồ sơ đăng ký. Vui lòng kiểm tra kết nối!');
    } finally {
      setLoading(false);
    }
  };

  // Fast Demo 1-Click Login
  const handleQuickLogin = async (userId: number, targetPortal: 'admin' | 'shop') => {
    setLoading(true);
    setError('');
    setPortalView(targetPortal);

    if (targetPortal === 'admin') {
      try {
        const response = await fetch(`http://${API_HOST}:8080/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '0901234567', password: '123456' }),
        });
        const result = await response.json();
        if (response.ok && result.data?.accessToken) {
          localStorage.setItem('hyperlocal_access_token', result.data.accessToken);
          const u = result.data.user;
          const loggedInUser: any = {
            id: u.id,
            phone: u.phone,
            email: u.email,
            full_name: u.fullName || 'Nguyễn Quản Trị',
            role: u.role || 'ADMIN',
            status: u.status || 'ACTIVE',
            area_id: u.areaId || 1,
            is_area_verified: true,
            created_at: u.createdAt || new Date().toISOString(),
          };
          login(loggedInUser);
          navigate('/admin/reports');
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('hyperlocal_access_token');
          localStorage.removeItem('auth_token');
        }
      } catch (err) {
        console.warn('Backend login in quick-login failed, falling back:', err);
        localStorage.removeItem('hyperlocal_access_token');
        localStorage.removeItem('auth_token');
      }
    } else if (targetPortal === 'shop') {
      try {
        const response = await fetch(`http://${API_HOST}:8080/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '0902345678', password: '123456' }),
        });
        const result = await response.json();
        if (response.ok && result.data?.accessToken) {
          localStorage.setItem('hyperlocal_access_token', result.data.accessToken);
        } else {
          localStorage.removeItem('hyperlocal_access_token');
          localStorage.removeItem('auth_token');
        }
      } catch (err) {
        console.warn('Backend login for shop in quick-login failed, falling back:', err);
        localStorage.removeItem('hyperlocal_access_token');
        localStorage.removeItem('auth_token');
      }
    }

    const users = await dbService.getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      login(found);
      if (found.role === 'ADMIN') {
        navigate('/admin/reports');
      } else {
        if (found.status === 'PENDING') {
          navigate('/pending-approval');
        } else {
          navigate('/shop/orders');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className={`auth-card-container ${isRegisterView ? 'right-panel-active' : ''}`} id="container">
        {/* ======================================================== */}
        {/* REGISTER CONTAINER (Shop Registration)                  */}
        {/* ======================================================== */}
        <div className="form-container register-container">
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <h1>Đăng Ký Gian Hàng</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>
              Mở gian hàng ẩm thực nội khu cùng Hyperlocal
            </p>

            {regError && <div className="auth-error-banner">{regError}</div>}

            <div className="form-grid-2">
              <div className="form-control-item">
                <input
                  type="text"
                  required
                  placeholder="Họ tên chủ quán *"
                  value={regOwnerName}
                  onChange={(e) => setRegOwnerName(e.target.value)}
                />
                <span className="underline-anim"></span>
              </div>

              <div className="form-control-item">
                <input
                  type="text"
                  required
                  placeholder="Số điện thoại *"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
                <span className="underline-anim"></span>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-control-item">
                <input
                  type="text"
                  required
                  placeholder="Tên gian hàng *"
                  value={regShopName}
                  onChange={(e) => setRegShopName(e.target.value)}
                />
                <span className="underline-anim"></span>
              </div>

              <div className="form-control-item" style={{ position: 'relative' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  placeholder="Mật khẩu đăng nhập *"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <span className="underline-anim"></span>
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Address Row: Province, District, Ward */}
            <div className="form-grid-3" style={{ marginTop: '2px' }}>
              <div className="form-control-item">
                <select
                  value={selectedProv}
                  onChange={(e) => setSelectedProv(e.target.value)}
                  style={{ fontSize: '11px', padding: '8px 0' }}
                >
                  <option value="">Chọn Tỉnh/Thành</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="underline-anim"></span>
              </div>

              <div className="form-control-item">
                <select
                  disabled={!selectedProv}
                  value={selectedDist}
                  onChange={(e) => setSelectedDist(e.target.value)}
                  style={{ fontSize: '11px', padding: '8px 0' }}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <span className="underline-anim"></span>
              </div>

              <div className="form-control-item">
                <select
                  disabled={!selectedDist}
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  style={{ fontSize: '11px', padding: '8px 0' }}
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <span className="underline-anim"></span>
              </div>
            </div>

            {/* Street Address with Vietmap Autocomplete */}
            <div className="form-control-item" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà) *"
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => {
                  if (streetAddress.length >= 3) setShowAutocomplete(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowAutocomplete(false);
                    if (!selectedProv && streetAddress.trim()) {
                      const parsed = parseAddressString(streetAddress);
                      if (parsed) mapLocationToDropdowns(parsed.city, parsed.dist, parsed.ward);
                    }
                  }, 250);
                }}
              />
              <span className="underline-anim"></span>

              {showAutocomplete && (isSearchingAddress || autocompleteResults.length > 0) && (
                <div className="autocomplete-dropdown">
                  {isSearchingAddress ? (
                    <div style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                      Đang tìm địa chỉ...
                    </div>
                  ) : (
                    autocompleteResults.map((res, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="autocomplete-dropdown-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const displayStr = res.display || res.name;
                          setStreetAddress(displayStr);
                          setShowAutocomplete(false);

                          let boundaryCity = res.boundaries?.find((b: any) => b.type === 0)?.full_name || res.boundaries?.find((b: any) => b.type === 0)?.name;
                          let boundaryDist = res.boundaries?.find((b: any) => b.type === 1)?.full_name || res.boundaries?.find((b: any) => b.type === 1)?.name;
                          let boundaryWard = res.boundaries?.find((b: any) => b.type === 2)?.full_name || res.boundaries?.find((b: any) => b.type === 2)?.name;

                          fetch(
                            `https://maps.vietmap.vn/api/place/v3?apikey=809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845&refid=${res.ref_id}`
                          )
                            .then((r) => r.json())
                            .then((detail) => {
                              if (detail?.lat && detail?.lng) {
                                setShopLat(detail.lat);
                                setShopLng(detail.lng);
                              }
                              const city = detail?.city || boundaryCity;
                              const dist = detail?.district || boundaryDist;
                              const ward = detail?.ward || boundaryWard;

                              if (city) {
                                mapLocationToDropdowns(city, dist, ward);
                              } else {
                                const parsed = parseAddressString(displayStr);
                                if (parsed) mapLocationToDropdowns(parsed.city, parsed.dist, parsed.ward);
                              }
                            })
                            .catch((err) => {
                              console.error(err);
                              const city = boundaryCity;
                              const dist = boundaryDist;
                              const ward = boundaryWard;
                              if (city) {
                                mapLocationToDropdowns(city, dist, ward);
                              } else {
                                const parsed = parseAddressString(displayStr);
                                if (parsed) mapLocationToDropdowns(parsed.city, parsed.dist, parsed.ward);
                              }
                            });
                        }}
                      >
                        <p style={{ fontWeight: 600, fontSize: '11px', color: '#334155', margin: 0 }}>
                          {res.name}
                        </p>
                        <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0' }}>
                          {res.display}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? 'Đang gửi...' : 'Đăng Ký Ngay'}
            </button>

            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              Cần nộp giấy phép VSATTP?{' '}
              <a
                href="#register-full"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register-shop');
                }}
                style={{ color: '#2563eb', fontWeight: 600 }}
              >
                Form 4 bước chi tiết →
              </a>
            </span>
          </form>
        </div>

        {/* ======================================================== */}
        {/* LOGIN CONTAINER (Admin & Shop Login)                     */}
        {/* ======================================================== */}
        <div className="form-container login-container">
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <h1>Đăng Nhập</h1>

            {/* Portal Switcher (Admin / Shop) */}
            <div className="role-segmented-control">
              <button
                type="button"
                className={`role-tab-btn ${portalView === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setPortalView('admin');
                  setError('');
                }}
              >
                <Shield size={13} />
                Quản Trị Viên (Admin)
              </button>
              <button
                type="button"
                className={`role-tab-btn ${portalView === 'shop' ? 'active' : ''}`}
                onClick={() => {
                  setPortalView('shop');
                  setError('');
                }}
              >
                <Store size={13} />
                Chủ Quán (Shop)
              </button>
            </div>

            {error && <div className="auth-error-banner">{error}</div>}

            {/* Phone or Email Input */}
            <div className="form-control-item">
              <input
                type="text"
                placeholder={
                  portalView === 'admin'
                    ? 'Số điện thoại hoặc Email Quản trị viên'
                    : 'Số điện thoại hoặc Email Chủ quán'
                }
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
              />
              <span className="underline-anim"></span>
            </div>

            {/* Password Input */}
            <div className="form-control-item" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="underline-anim"></span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="form-options-row">
              <div className="form-checkbox-wrap">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Ghi nhớ đăng nhập</label>
              </div>
              <a href="#forgot" className="form-forgot-link">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>

            {/* Social / Demo section */}
            <span className="social-divider">Hoặc đăng nhập nhanh</span>
            <div className="social-circle-container">
              {/* Facebook */}
              <a
                href="#facebook"
                className="social-circle-btn"
                title="Facebook"
                onClick={(e) => e.preventDefault()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Google */}
              <a
                href="#google"
                className="social-circle-btn"
                title="Google"
                onClick={(e) => e.preventDefault()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V7.4h6.887C19.2 8.16 19.36 9.07 19.36 10.18c0 4.22-2.82 7.22-7.12 7.22-4.14 0-7.5-3.36-7.5-7.5s3.36-7.5 7.5-7.5c2.02 0 3.72.74 5.03 1.96l-2.04 1.97c-.55-.52-1.51-1.13-2.99-1.13-2.57 0-4.66 2.13-4.66 4.75s2.09 4.75 4.66 4.75c2.97 0 4.09-2.14 4.26-3.25H12.24z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="#tiktok"
                className="social-circle-btn"
                title="TikTok"
                onClick={(e) => e.preventDefault()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49c.8-.8 1.28-1.87 1.28-3.08V8.72a8.28 8.28 0 0 0 4.49 1.42V6.69z" />
                </svg>
              </a>
            </div>

            {/* Quick Demo 1-Click login pills */}
            <div className="demo-accounts-row">
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleQuickLogin(1, 'admin')}
                title="Đăng nhập tài khoản Quản Trị Viên"
              >
                ⚡ Demo Admin
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleQuickLogin(2, 'shop')}
                title="Đăng nhập tài khoản Shop (Đã duyệt)"
              >
                ⚡ Chị Lan (Active)
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleQuickLogin(4, 'shop')}
                title="Đăng nhập tài khoản Shop (Chờ duyệt)"
              >
                ⚡ Bún Bò Huế (Pending)
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================== */}
        {/* SLIDING OVERLAY CONTAINER                                */}
        {/* ======================================================== */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Left Overlay: Visible when Register Panel is active */}
            <div className="overlay-panel overlay-left">
              <h1 className="title">
                Chào Mừng <br />
                Trở Lại!
              </h1>
              <p>Nếu bạn đã có tài khoản, hãy đăng nhập tại đây để vào hệ thống quản lý</p>
              <button
                className="auth-btn-ghost"
                id="login"
                type="button"
                onClick={() => {
                  setIsRegisterView(false);
                  setError('');
                }}
              >
                <ArrowLeft size={16} />
                Đăng Nhập
              </button>
            </div>

            {/* Right Overlay: Visible when Login Panel is active */}
            <div className="overlay-panel overlay-right">
              <h1 className="title">
                Bắt Đầu <br />
                Kinh Doanh
              </h1>
              <p>
                Bạn là chủ quán mới? Gia nhập ngay hệ sinh thái giao đồ ăn nội khu Hyperlocal
              </p>
              <button
                className="auth-btn-ghost"
                id="register"
                type="button"
                onClick={() => {
                  setIsRegisterView(true);
                  setRegError('');
                }}
              >
                Đăng Ký Mở Shop
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
