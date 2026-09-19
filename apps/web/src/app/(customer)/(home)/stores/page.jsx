"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import StoreSidebar from "./components/StoreSidebar";

// Dynamic import map to avoid SSR window error
const StoreMap = dynamic(() => import("./components/StoreMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100">Đang tải bản đồ...</div>
});

export default function StoresPage() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/core/shops");
        if (response.ok) {
          const data = await response.json();
          setShops(data);
          setFilteredShops(data);
        }
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      }
    };
    fetchShops();
  }, []);

  return (
    <div className="flex flex-col h-[800px] w-full bg-gray-100">
      <div className="flex flex-1 w-full max-w-7xl mx-auto shadow-sm my-8 rounded border border-gray-200 bg-white overflow-hidden min-h-0">
        <div className="w-1/3 min-w-[320px] max-w-[400px] h-full">
          <StoreSidebar 
            shops={shops} 
            filteredShops={filteredShops}
            onFilterChange={setFilteredShops}
            activeShop={activeShop}
            onShopSelect={setActiveShop}
          />
        </div>
        <div className="flex-1 relative z-0 h-full">
          <StoreMap shops={filteredShops} activeShop={activeShop} />
        </div>
      </div>
    </div>
  );
}
