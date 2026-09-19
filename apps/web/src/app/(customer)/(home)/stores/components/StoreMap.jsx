"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Create a custom red icon that looks like Google Maps
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    // Force leaflet to recalculate map size (fixes gray tiles bug in flexbox)
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { duration: 1.5 });
    }

    return () => clearTimeout(timeout);
  }, [center, map]);
  return null;
}

export default function StoreMap({ shops, activeShop }) {
  // Center is HCM by default
  const defaultCenter = [10.762622, 106.660172];
  
  let center = defaultCenter;
  if (activeShop && activeShop.shopLat && activeShop.shopLng) {
    center = [activeShop.shopLat, activeShop.shopLng];
  } else if (shops && shops.length > 0 && shops[0].shopLat) {
    center = [shops[0].shopLat, shops[0].shopLng];
  }

  return (
    <div className="w-full h-full relative z-0 border-l border-gray-200">
      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <MapFlyTo center={center} />
        {Array.isArray(shops) && shops.map((shop) => (
          shop.shopLat && shop.shopLng ? (
            <Marker key={shop.id} position={[shop.shopLat, shop.shopLng]} icon={redIcon}>
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-[14px] text-gray-800 mb-1">{shop.shopName}</h3>
                  <p className="text-[12px] text-gray-600 line-clamp-2">{shop.locationDetail}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
