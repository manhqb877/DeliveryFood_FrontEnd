"use client";

import { useEffect, useState, useMemo } from "react";
import { MapPin, Clock, Phone } from "lucide-react";

export default function StoreSidebar({ shops, filteredShops, onFilterChange, activeShop, onShopSelect }) {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const locationData = useMemo(() => {
    const data = {};
    if (!Array.isArray(shops)) return data;

    shops.forEach(shop => {
      if (!shop.locationDetail) return;
      const parts = shop.locationDetail.split(',').map(s => s.trim());
      if (parts.length < 2) return;

      let provinceRaw = parts[parts.length - 1];
      let provinceOffset = 1;
      if (provinceRaw.toLowerCase() === "việt nam" || provinceRaw.toLowerCase() === "vietnam") {
        if (parts.length < 3) return;
        provinceRaw = parts[parts.length - 2];
        provinceOffset = 2;
      }

      // Normalize province
      let normProvince = provinceRaw.replace(/Thành phố |TP\. |Tỉnh /gi, '').trim();
      normProvince = normProvince.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');

      // Extract district
      let districtRaw = "";
      for (let p of parts) {
        const lower = p.trim().toLowerCase();
        if (lower.startsWith("quận ") || lower.startsWith("q.") || lower.startsWith("q ") || lower.startsWith("huyện ") || lower.startsWith("h.")) {
          districtRaw = lower;
          break;
        }
      }

      // Fallback if no district keyword found
      if (!districtRaw && parts.length > provinceOffset + 1) {
        const candidate = parts[parts.length - provinceOffset - 1].trim();
        if (!candidate.toLowerCase().startsWith("phường") && !candidate.toLowerCase().startsWith("p.")) {
          districtRaw = candidate;
        }
      }

      let normDistrict = "";
      if (districtRaw) {
        normDistrict = districtRaw
          .replace(/^q\./i, 'quận ')
          .replace(/^q\s+/i, 'quận ')
          .replace(/^h\./i, 'huyện ')
          .replace(/^h\s+/i, 'huyện ')
          .trim();
        
        // Title case for district
        normDistrict = normDistrict.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      if (!data[normProvince]) {
        data[normProvince] = new Set();
      }
      if (normDistrict) {
        data[normProvince].add(normDistrict);
      }
    });
    return data;
  }, [shops]);

  const provinces = Object.keys(locationData).sort();
  const districts = selectedProvince ? Array.from(locationData[selectedProvince] || []).sort() : [];

  useEffect(() => {
    if (!Array.isArray(shops)) return;
    const filtered = shops.filter(shop => {
      const shopLoc = shop.locationDetail ? shop.locationDetail.toLowerCase() : "";
      const shopName = shop.shopName ? shop.shopName.toLowerCase() : "";
      
      if (selectedProvince) {
        const normSelectedProv = selectedProvince.toLowerCase().replace(/thành phố |tp\. |tỉnh /gi, '').trim();
        if (!shopLoc.includes(normSelectedProv)) return false;
      }
      
      if (selectedDistrict) {
        // Build a regex to match aliases (e.g. "Quận 1" matches "Q.1", "Q 1", "Quận 1")
        let districtRegexStr = selectedDistrict.toLowerCase().trim();
        if (districtRegexStr.startsWith("quận ")) {
          const numOrName = districtRegexStr.replace("quận ", "").trim();
          districtRegexStr = `(quận|q\\.|q\\s*)\\s*${numOrName}`;
        } else if (districtRegexStr.startsWith("huyện ")) {
          const numOrName = districtRegexStr.replace("huyện ", "").trim();
          districtRegexStr = `(huyện|h\\.|h\\s*)\\s*${numOrName}`;
        }
        const districtRegex = new RegExp(districtRegexStr, 'i');
        
        if (!districtRegex.test(shopLoc)) return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!shopName.includes(query) && !shopLoc.includes(query)) return false;
      }
      
      return true;
    });
    
    onFilterChange(filtered);
    
    // Auto clear active shop if it's filtered out
    if (activeShop && !filtered.find(s => s.id === activeShop.id)) {
      onShopSelect(null);
    }
  }, [shops, selectedProvince, selectedDistrict, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="font-semibold text-gray-700 italic">Tìm được {filteredShops?.length || 0} quán</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <select 
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedDistrict("");
            }}
            className="p-2 border border-gray-300 rounded text-sm bg-white outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedProvince}
            className="p-2 border border-gray-300 rounded text-sm bg-white outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <input 
          type="text" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập tên đường, hoặc quán..." 
          className="w-full mt-3 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <button 
          onClick={handleSearch}
          className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded text-sm font-semibold transition-colors"
        >
          Tìm kiếm
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {Array.isArray(filteredShops) && filteredShops.map((shop) => (
          <div 
            key={shop.id} 
            onClick={() => onShopSelect(shop)}
            className={`p-4 border-b cursor-pointer transition-colors ${activeShop?.id === shop.id ? 'bg-yellow-50 border-l-4 border-l-yellow-600' : 'hover:bg-gray-50'}`}
          >
            <h3 className="font-bold text-gray-800 hover:text-yellow-600 transition-colors text-[15px] leading-snug">
              {shop.shopName}
            </h3>
            <p className="text-[13px] text-gray-600 mt-2 line-clamp-2">{shop.locationDetail}</p>
            
            <div className="flex items-center mt-3 text-[13px] text-gray-600">
              <Phone className="w-3.5 h-3.5 mr-2 text-yellow-600" />
              <span>{shop.phone || "Đang cập nhật"}</span>
            </div>
            
            <div className="flex items-center mt-1.5 text-[13px] text-gray-600">
              <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded mr-2">OPEN</span>
              <span>7:00 - 22:00 * 7 ngày/ tuần</span>
            </div>
            
            <div className="flex gap-4 mt-3 text-[12px] text-gray-500 font-medium">
              <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-400"/> Wifi Miễn Phí</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
