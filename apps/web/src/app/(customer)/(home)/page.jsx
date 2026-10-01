'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Crosshair, 
  X, 
  Clock, 
  Star, 
  ArrowRight,
  CircleNotch,
  Sparkle,
  ChatCircleDots,
  PhoneCall
} from "@phosphor-icons/react";

const VIETMAP_API_KEY = "809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845";

function calculateDistanceInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm) {
  if (distKm === null || distKm === undefined) return "";
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)}m`;
  }
  return `${distKm.toFixed(1)} km`;
}

export default function CustomerHome() {
  const [addressQuery, setAddressQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState(null); // { address, lat, lng }
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);

  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // 1. Load Shops & restore saved location from localStorage
  useEffect(() => {
    // Load saved location
    try {
      const savedAddr = localStorage.getItem("user_delivery_address");
      const savedCoords = localStorage.getItem("user_delivery_coords");
      if (savedAddr) {
        setTimeout(() => {
          setAddressQuery(savedAddr);
          if (savedCoords) {
            const parsed = JSON.parse(savedCoords);
            if (parsed?.lat && parsed?.lng) {
              setSelectedLocation({ address: savedAddr, lat: parsed.lat, lng: parsed.lng });
            }
          }
        }, 0);
      }
    } catch (e) {}

    // Fetch Shops
    const fetchShops = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/core/shops");
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) setShops(list);
        }
      } catch (err) {
        console.error("Failed to fetch shops:", err);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, []);

  // 2. Click outside dropdown listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Debounced VietMap Autocomplete
  const handleInputChange = (e) => {
    const val = e.target.value;
    setAddressQuery(val);

    if (val.trim().length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);
      fetch(
        `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${VIETMAP_API_KEY}&text=${encodeURIComponent(
          val.trim()
        )}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAutocompleteResults(data);
            setShowDropdown(true);
          } else {
            setAutocompleteResults([]);
          }
        })
        .catch((err) => {
          console.error("Vietmap autocomplete error:", err);
          setAutocompleteResults([]);
        })
        .finally(() => setIsSearching(false));
    }, 350);
  };

  // 4. Handle Address Selection
  const handleSelectAddress = (item) => {
    const displayAddr = item.display || item.name;
    setAddressQuery(displayAddr);
    setShowDropdown(false);

    // Fetch place details to get coordinates (lat, lng)
    fetch(`https://maps.vietmap.vn/api/place/v3?apikey=${VIETMAP_API_KEY}&refid=${item.ref_id}`)
      .then((r) => r.json())
      .then((place) => {
        if (place?.lat && place?.lng) {
          const loc = { address: displayAddr, lat: place.lat, lng: place.lng };
          setSelectedLocation(loc);
          try {
            localStorage.setItem("user_delivery_address", displayAddr);
            localStorage.setItem("user_delivery_coords", JSON.stringify({ lat: place.lat, lng: place.lng }));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.error("Failed to fetch place details:", err);
      });
  };

  // 5. GPS Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://maps.vietmap.vn/api/reverse/v3?apikey=${VIETMAP_API_KEY}&lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          const first = Array.isArray(data) && data[0];
          const displayAddr = first?.display || first?.address || `Tọa độ ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setAddressQuery(displayAddr);
          const loc = { address: displayAddr, lat: latitude, lng: longitude };
          setSelectedLocation(loc);

          try {
            localStorage.setItem("user_delivery_address", displayAddr);
            localStorage.setItem("user_delivery_coords", JSON.stringify({ lat: latitude, lng: longitude }));
          } catch (e) {}
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          const fallback = `Vị trí hiện tại (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setAddressQuery(fallback);
          setSelectedLocation({ address: fallback, lat: latitude, lng: longitude });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
        alert("Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleClear = () => {
    setAddressQuery("");
    setAutocompleteResults([]);
    setShowDropdown(false);
  };

  // 6. Calculate & Sort Shops by Distance
  const nearbyShops = useMemo(() => {
    if (!shops.length) return [];

    const mapped = shops.map((shop) => {
      let distanceKm = null;
      if (selectedLocation?.lat && selectedLocation?.lng && shop.shopLat && shop.shopLng) {
        distanceKm = calculateDistanceInKm(
          selectedLocation.lat,
          selectedLocation.lng,
          shop.shopLat,
          shop.shopLng
        );
      }
      return {
        ...shop,
        distanceKm,
      };
    });

    if (selectedLocation) {
      // Sort closest first
      return mapped.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return mapped;
  }, [shops, selectedLocation]);

  return (
    <>
      {/* ── 1. HERO BANNER SLIDER ── */}
      <section className="w-full overflow-hidden bg-white">
        <div className="w-full h-[360px] md:h-[500px] lg:h-[650px] bg-[#f4f0eb] relative">
          <img 
            src="https://food.be.com.vn/placeholder-hero.webp?dpl=food-frontend-v2-1-0-428-production-0c12e565b511" 
            alt="beFood Banner" 
            className="w-full h-full object-cover" 
          />
          
          {/* Floating Address Box */}
          <div 
            ref={dropdownRef}
            className="absolute top-1/2 left-4 md:left-12 lg:left-24 -translate-y-1/2 w-[92%] sm:w-[440px] md:w-[470px] bg-white rounded-3xl p-6 md:p-8 shadow-2xl z-30 border border-gray-100/80 backdrop-blur-md"
          >
            <h1 className="text-[24px] md:text-[30px] font-black text-gray-900 mb-4 leading-tight">
              Địa chỉ bạn muốn giao món
            </h1>

            {/* Input with Autocomplete */}
            <div className="relative">
              <div className="relative flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MapPin size={22} weight="fill" className="text-[#FFB700]" />
                </div>
                
                <input
                  type="text"
                  placeholder="Nhập địa chỉ giao hàng"
                  value={addressQuery}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (autocompleteResults.length > 0) setShowDropdown(true);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-20 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#FFB700] focus:bg-white focus:ring-2 focus:ring-[#FFB700]/25 transition-all font-medium shadow-xs"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {addressQuery ? (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                      title="Xóa địa chỉ"
                    >
                      <X size={15} weight="bold" />
                    </button>
                  ) : null}

                  <button 
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="p-1.5 rounded-xl hover:bg-amber-50 text-gray-500 hover:text-[#FFB700] transition-colors cursor-pointer"
                    title="Vị trí hiện tại"
                  >
                    {isLocating ? (
                      <CircleNotch size={19} weight="bold" className="animate-spin text-[#FFB700]" />
                    ) : (
                      <Crosshair size={19} weight="bold" />
                    )}
                  </button>
                </div>
              </div>

              {/* Autocomplete Dropdown - Exact styling inspired by beFood */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-72 overflow-y-auto z-50 divide-y divide-gray-100">
                  {isSearching ? (
                    <div className="p-4 text-xs font-medium text-gray-400 text-center flex items-center justify-center gap-2">
                      <CircleNotch size={16} weight="bold" className="animate-spin text-[#FFB700]" />
                      <span>Đang tìm địa chỉ...</span>
                    </div>
                  ) : autocompleteResults.length > 0 ? (
                    autocompleteResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAddress(item)}
                        className="w-full text-left p-3.5 hover:bg-amber-50/60 transition-colors flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#FFB700]/20 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <MapPin size={15} weight="fill" className="text-gray-400 group-hover:text-[#FFB700] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {item.display || item.address}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-gray-400 text-center">
                      Không tìm thấy địa chỉ
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Nearby Preview inside Card (when an address is selected) */}
            {selectedLocation && nearbyShops.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Gần bạn
                  </span>
                  <Link 
                    href="/order" 
                    className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
                  >
                    Xem thêm <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>

                <div className="space-y-1.5">
                  {nearbyShops.slice(0, 2).map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/order?shopId=${shop.id}`}
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-amber-50/70 transition-colors border border-gray-100 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={shop.logoUrl || shop.coverImageUrl || "https://imgproxy.be.com.vn/preset:sharp/rs:fit:256/q:75/aHR0cDovL21lZGlh/LmJlLmNvbS52bi5z/dG9yYWdlLmdvb2ds/ZWFwaXMuY29tL2Jp/em9wcy9pbWFnZS9j/YWQxZjBkYS03MDI0/LTExZWYtYmQ2Ni1i/MjM5YzgzYTgxMjQv/dGh1bWJuYWls.webp"} 
                          alt={shop.shopName}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate group-hover:text-black">
                            {shop.shopName}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {shop.locationDetail || "Nội khu"}
                          </p>
                        </div>
                      </div>

                      {shop.distanceKm !== null && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFB700] text-black shrink-0 shadow-2xs">
                          {formatDistance(shop.distanceKm)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Dock on Right Side of Banner */}
          <div className="hidden sm:flex absolute right-4 md:right-8 lg:right-12 bottom-5 md:bottom-8 z-20 items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-lg">
            {/* Trợ lý beFood */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 text-gray-800 transition-all cursor-pointer group"
              title="Trợ lý beFood - Gợi ý món thông minh"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FFB700] text-black flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Sparkle size={15} weight="fill" />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">Trợ lý beFood</span>
            </button>

            <div className="w-px h-5 bg-gray-200" />

            {/* Nhắn tin hỗ trợ */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 text-gray-700 hover:text-black transition-all cursor-pointer group"
              title="Nhắn tin với quán / hỗ trợ"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-emerald-100 text-gray-600 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                <ChatCircleDots size={16} weight="fill" />
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">Hỗ trợ</span>
            </button>

            <div className="w-px h-5 bg-gray-200" />

            {/* Hotline */}
            <a
              href="tel:19001755"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 text-gray-700 hover:text-black transition-all cursor-pointer group"
              title="Gọi hotline 1900 1755"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-amber-100 text-gray-600 group-hover:text-amber-700 flex items-center justify-center shrink-0 transition-colors">
                <PhoneCall size={16} weight="fill" />
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">1900 1755</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. CỬA HÀNG GẦN BẠN ── */}
      <section className="w-full bg-[#FAFAF8] py-12 md:py-16 border-b border-gray-200">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                  {selectedLocation ? "GẦN BẠN" : "NỔI BẬT"}
                </span>
                {selectedLocation && (
                  <span className="text-xs text-gray-500 font-medium truncate max-w-xs md:max-w-md flex items-center gap-1">
                    <MapPin size={13} weight="fill" className="text-amber-500 shrink-0" />
                    <span className="truncate">{selectedLocation.address}</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {selectedLocation ? "Quán ngon gần bạn" : "Quán ngon nổi bật"}
              </h2>
            </div>

            <Link
              href="/order"
              className="text-sm font-bold text-gray-700 hover:text-black flex items-center gap-1.5 transition-colors group"
            >
              <span>Xem tất cả ({nearbyShops.length})</span>
              <ArrowRight size={15} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingShops ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse">
                  <div className="w-full aspect-[16/10] bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                </div>
              ))}
            </div>
          ) : nearbyShops.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">Chưa có gian hàng nào trong khu vực</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyShops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/order?shopId=${shop.id}`}
                  className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  {/* Shop Cover Image */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                    <img 
                      src={shop.coverImageUrl || shop.logoUrl || "https://imgproxy.be.com.vn/preset:sharp/rs:fit:256/q:75/aHR0cDovL21lZGlh/LmJlLmNvbS52bi5z/dG9yYWdlLmdvb2ds/ZWFwaXMuY29tL2Jp/em9wcy9pbWFnZS9j/YWQxZjBkYS03MDI0/LTExZWYtYmQ2Ni1i/MjM5YzgzYTgxMjQv/dGh1bWJuYWls.webp"} 
                      alt={shop.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Distance Badge */}
                    {shop.distanceKm !== null ? (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                        <MapPin size={13} weight="fill" className="text-[#FFB700]" />
                        <span>{formatDistance(shop.distanceKm)}</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                        Giao tận nơi
                      </div>
                    )}

                    {/* Prep Time Badge */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-gray-800 text-[11px] font-semibold flex items-center gap-1 shadow-2xs">
                      <Clock size={12} weight="bold" className="text-gray-500" />
                      <span>~{shop.avgPrepTimeMinutes || 15} phút</span>
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {shop.shopName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-900 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 shrink-0">
                        <Star size={12} weight="fill" className="text-amber-500" />
                        <span>{shop.avgRating && shop.avgRating > 0 ? Number(shop.avgRating).toFixed(1) : "5.0"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 line-clamp-1 mb-3">
                      <MapPin size={13} weight="regular" className="text-gray-400 shrink-0" />
                      <span className="truncate">{shop.locationDetail || "Nội khu"}</span>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Mở cửa
                      </span>

                      <span className="font-bold text-gray-800 group-hover:text-black flex items-center gap-1">
                        Đặt món
                        <ArrowRight size={13} weight="bold" className="text-[#FFB700] group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. APP PROMO — 50/50 THÀNH VIÊN ── */}
      <section className="w-full bg-[#f4f0eb]">
        <div className="flex flex-col md:flex-row w-full items-stretch">
          {/* Left: App promo image */}
          <div className="flex-1 overflow-hidden bg-white flex items-center justify-center">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSytWoYNSci8W16ofAroTpqU5xTWWu9OVx51Q6Wl3uCtw&s=10" 
              alt="beFood App Thành viên" 
              className="h-full w-full object-cover min-h-[380px] md:min-h-[460px] max-h-[540px] transition-transform duration-700 hover:scale-102"
              loading="lazy"
            />
          </div>
          {/* Right: text in cream background */}
          <div className="flex flex-1 flex-col items-center justify-center bg-[#f4f0eb] px-8 md:px-14 py-16 md:py-24 text-center">
            <span className="px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-[var(--color-primary)] text-black mb-4 shadow-xs">
              BE MEMBER REWARDS
            </span>
            <h2 className="text-[34px] font-bold leading-tight text-[#222222] md:text-[42px] whitespace-pre-line">
              Dành riêng cho<br/>Thành viên beFood
            </h2>
            <p className="mt-4 text-base font-medium text-gray-700 max-w-md">
              Đăng ký thành viên để nhận ngay hàng ngàn ưu đãi giảm giá, mã freeship và tích điểm đổi quà hấp dẫn mỗi ngày!
            </p>
            <Link
              href="/order"
              className="mt-8 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black px-10 py-3.5 text-[14px] font-black tracking-wide transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              ĐẶT MÓN & TÍCH ĐIỂM NGAY
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. ĐỒNG HÀNH — 3 ảnh ưu đãi ── */}
      <section className="w-full bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-widest uppercase text-gray-400 block mb-2">
              ƯU ĐÃI NỔI BẬT
            </span>
            <h2 className="text-3xl font-extrabold text-[#222222] md:text-[38px] tracking-tight">
              Luôn đồng hành cùng bạn
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {[
              {
                label: "ĐẶT HÀNG NGAY",
                link: "/order",
                img: "https://imgmainsite.be.com.vn/2022/07/2c763054-810x540_freeship-m%E1%BB%8Di-%C4%91%C6%A1n-h%C3%A0ng.jpg",
                tag: "Giao nhanh 30 phút"
              },
              {
                label: "HỖ TRỢ KHÁCH HÀNG",
                link: "/support",
                img: "https://upload.urbox.vn/strapi/befood_002_44f7e2ed23.jpg",
                tag: "beFood Care 24/7"
              },
              {
                label: "TIN TỨC MỖI NGÀY",
                link: "/news",
                img: "https://imgmainsite.be.com.vn/2023/02/cf4641ee-thay-doi-gia-befood_600x450.jpg",
                tag: "Cập nhật liên tục"
              },
            ].map((item, idx) => (
              <Link href={item.link} key={idx} className="flex flex-col items-center cursor-pointer group">
                <div className="overflow-hidden rounded-2xl w-full shadow-md border border-gray-100 bg-gray-50 relative aspect-[4/3]">
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                    {item.tag}
                  </span>
                  <img 
                    src={item.img} 
                    alt={item.label} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy" 
                  />
                </div>
                <p className="mt-4 text-center text-[15px] font-extrabold uppercase tracking-wide text-[#222222] group-hover:text-[var(--color-primary-dark)] transition-colors">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. THỨC UỐNG ĐẬM ĐÀ & MÓN ĂN HẤP DẪN ── */}
      <section className="w-full bg-white pb-16 md:pb-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            <Link 
              href="/order?category=drinks" 
              className="group block overflow-hidden rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="overflow-hidden w-full aspect-[16/10] bg-gray-100">
                <img 
                  src="https://digifnb.com/wp-content/uploads/2025/02/image-1-compressed-49.jpg" 
                  alt="Thức uống đậm đà" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
            </Link>

            <Link 
              href="/order?category=food" 
              className="group block overflow-hidden rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="overflow-hidden w-full aspect-[16/10] bg-gray-100">
                <img 
                  src="https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2024/12/31/thumbnail-anh-bai-pr-600-x-375-px-17356386832451405336738.png" 
                  alt="Món ăn hấp dẫn" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. CỬA HÀNG GẦN BẠN — 50/50 ── */}
      <section className="w-full bg-[#f9f4ec] overflow-hidden">
        <div className="flex flex-col md:flex-row w-full items-stretch">
          <div className="flex flex-1 flex-col items-center justify-center px-8 md:px-16 py-16 md:py-24 text-center">
            <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-white border border-gray-200 text-gray-700 mb-4 shadow-2xs">
              MẠNG LƯỚI QUÁN ĂN TOÀN QUỐC
            </span>
            <h2 className="text-[34px] font-bold leading-tight text-[#222222] md:text-[42px] whitespace-pre-line">
              Mạng lưới cửa hàng beFood
            </h2>
            <p className="mt-4 text-[15px] font-medium text-[#555555] max-w-md">
              Hàng ngàn quán ăn, nhà hàng yêu thích và tài xế beFood luôn sẵn sàng phục vụ món ngon tận tay bạn nhanh chóng!
            </p>
            <Link
              href="/order"
              className="mt-8 rounded-full bg-[#002B5E] hover:bg-[#001f44] text-white px-10 py-3.5 text-[14px] font-black tracking-wide transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              KHÁM PHÁ CỬA HÀNG
            </Link>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
            <img 
              src="https://www.techsignin.com/wp-content/uploads/2022/04/be-group-dich-vu-dat-do-an-befood-5.jpg" 
              alt="Cửa hàng đối tác beFood" 
              className="h-full w-full object-cover min-h-[360px] md:min-h-[460px] max-h-[520px] transition-transform duration-700 hover:scale-102" 
              loading="lazy" 
            />
          </div>
        </div>
      </section>

      {/* Khoảng trắng trước footer */}
      <div className="w-full h-[40px] bg-white"></div>
    </>
  );
}
