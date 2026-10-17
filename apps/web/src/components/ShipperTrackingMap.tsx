import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useShipperTracking } from "../hooks/useShipperTracking";

// Reset Leaflet icon default
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Cache lộ trình toàn cục để không gọi lại Vietmap API với các chặng cố định
const globalRouteCache = new Map<string, [number, number][]>();

// Custom Icons (matching AppShipper React Native UI)
const createCustomIcon = (bgColor: string, size: number, svgIcon: string) => {
  return new L.DivIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px; border-radius: ${size / 2}px; 
        background-color: ${bgColor}; border: 3px solid white; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        display: flex; justify-content: center; align-items: center; color: white;">
        ${svgIcon}
      </div>
    `,
    className: "custom-leaflet-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const storeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>`;
const customerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const shipperSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

const createShopIcon = (bgColor: string, size: number, label: string, isMulti?: boolean) => {
  const badge = isMulti ? `<div style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:9px;background:#EF4444;color:white;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${label}</div>` : '';
  return new L.DivIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px; height: ${size}px; border-radius: ${size / 2}px; 
        background-color: ${bgColor}; border: 3px solid white; 
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        display: flex; justify-content: center; align-items: center; color: white;">
        ${storeSvg}
        ${badge}
      </div>
    `,
    className: "custom-leaflet-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const customerIcon = createCustomIcon("#EA580C", 40, customerSvg);
const shipperIcon = createCustomIcon("#10B981", 44, shipperSvg);

export const VIETMAP_API_KEY = "809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845";

interface ShipperTrackingMapProps {
  shipperId?: number;
  pickupLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
  pickup2Location?: { lat: number; lng: number };
  isMultiShop?: boolean;
  shop1Name?: string;
  shop2Name?: string;
  pickup1Completed?: boolean;
  pickup2Completed?: boolean;
  optimalPickupOrder?: string;
}

// Component tự động căn chỉnh khung hình bản đồ
function MapFitter({ routeShop, routeBetween, routeCustomer, pickupLocation, deliveryLocation, pickup2Location, location }: any) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (routeShop && routeShop.length > 0) routeShop.forEach((c: any) => bounds.extend(c));
    if (routeBetween && routeBetween.length > 0) routeBetween.forEach((c: any) => bounds.extend(c));
    if (routeCustomer && routeCustomer.length > 0) routeCustomer.forEach((c: any) => bounds.extend(c));
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
    } else {
      if (pickupLocation) bounds.extend([pickupLocation.lat, pickupLocation.lng]);
      if (pickup2Location) bounds.extend([pickup2Location.lat, pickup2Location.lng]);
      if (deliveryLocation) bounds.extend([deliveryLocation.lat, deliveryLocation.lng]);
      if (location) bounds.extend([location.lat, location.lng]);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
      }
    }
  }, [map, routeShop, routeBetween, routeCustomer, pickupLocation, deliveryLocation, pickup2Location, location]);

  return null;
}

export function ShipperTrackingMap({
  shipperId,
  pickupLocation,
  deliveryLocation,
  pickup2Location,
  isMultiShop,
  shop1Name,
  shop2Name,
  pickup1Completed,
  pickup2Completed,
  optimalPickupOrder,
}: ShipperTrackingMapProps) {
  const { location, isConnected } = useShipperTracking(shipperId);
  const [routeToShop, setRouteToShop] = useState<[number, number][]>([]);
  const [routeBetweenShops, setRouteBetweenShops] = useState<[number, number][]>([]);
  const [routeToCustomer, setRouteToCustomer] = useState<[number, number][]>([]);
  const lastShipperFetchRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Xác định thứ tự ghé quán theo thuật toán TSP đồng bộ với App Shipper
  const isShop1First = useMemo(() => {
    if (!isMultiShop || !pickup2Location?.lat || !pickupLocation?.lat) return true;
    if (optimalPickupOrder === 'SHOP2_FIRST') return false;
    if (optimalPickupOrder === 'SHOP1_FIRST') return true;

    const sLat = location?.lat || 10.78033;
    const sLng = location?.lng || 106.65691;
    const p1 = pickupLocation;
    const p2 = pickup2Location;
    const d = deliveryLocation || { lat: 10.8095, lng: 106.6262 };

    const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const dS_P1 = calcDist(sLat, sLng, p1.lat, p1.lng);
    const dS_P2 = calcDist(sLat, sLng, p2.lat, p2.lng);
    const dP1_P2 = calcDist(p1.lat, p1.lng, p2.lat, p2.lng);
    const dP1_D = calcDist(p1.lat, p1.lng, d.lat, d.lng);
    const dP2_D = calcDist(p2.lat, p2.lng, d.lat, d.lng);

    return (dS_P1 + dP1_P2 + dP2_D) <= (dS_P2 + dP1_P2 + dP1_D);
  }, [isMultiShop, optimalPickupOrder, location?.lat, location?.lng, pickupLocation, pickup2Location, deliveryLocation]);

  const stop1 = useMemo(() => {
    return isShop1First
      ? { name: shop1Name || 'Quán 1', location: pickupLocation, done: pickup1Completed, id: 1 }
      : { name: shop2Name || 'Quán 2', location: pickup2Location, done: pickup2Completed, id: 2 };
  }, [isShop1First, shop1Name, shop2Name, pickupLocation, pickup2Location, pickup1Completed, pickup2Completed]);

  const stop2 = useMemo(() => {
    return isShop1First
      ? { name: shop2Name || 'Quán 2', location: pickup2Location, done: pickup2Completed, id: 2 }
      : { name: shop1Name || 'Quán 1', location: pickupLocation, done: pickup1Completed, id: 1 };
  }, [isShop1First, shop1Name, shop2Name, pickupLocation, pickup2Location, pickup1Completed, pickup2Completed]);

  const fetchVietmapRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<[number, number][]> => {
    const key = `${from.lat.toFixed(4)}_${from.lng.toFixed(4)}_${to.lat.toFixed(4)}_${to.lng.toFixed(4)}`;
    if (globalRouteCache.has(key)) {
      return globalRouteCache.get(key)!;
    }

    // 1. Thử gọi VietMap API
    try {
      const url = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${from.lat},${from.lng}&point=${to.lat},${to.lng}&vehicle=motorcycle&points_encoded=false`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.paths && data.paths.length > 0) {
          const coords = data.paths[0].points.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
          globalRouteCache.set(key, coords);
          return coords;
        }
      }
    } catch (e) {
      console.warn("Vietmap fetch error", e);
    }

    // 2. Dự phòng chất lượng cao OSRM khi VietMap gặp 429 hoặc lỗi mạng
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const oRes = await fetch(osrmUrl);
      if (oRes.ok) {
        const oData = await oRes.json();
        if (oData && oData.routes && oData.routes.length > 0 && oData.routes[0].geometry?.coordinates) {
          const coords = oData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
          globalRouteCache.set(key, coords);
          return coords;
        }
      }
    } catch (e) {
      console.warn("OSRM fallback error", e);
    }

    // 3. Dự phòng toạ độ nội suy để tuyến đường không bao giờ biến mất
    const fallbackCoords: [number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      fallbackCoords.push([
        from.lat + (to.lat - from.lat) * (i / 20),
        from.lng + (to.lng - from.lng) * (i / 20)
      ]);
    }
    globalRouteCache.set(key, fallbackCoords);
    return fallbackCoords;
  };

  // 1. Chặng Quán cuối -> Khách hàng (Màu cam) - Chỉ fetch 1 lần và cache
  useEffect(() => {
    const origin = (isMultiShop && stop2.location?.lat) ? stop2.location : pickupLocation;
    if (!origin?.lat || !deliveryLocation?.lat) return;

    fetchVietmapRoute(origin, deliveryLocation).then((coords) => {
      if (coords && coords.length > 0) {
        setRouteToCustomer(coords);
      }
    });
  }, [isMultiShop, stop2.location?.lat, stop2.location?.lng, pickupLocation?.lat, pickupLocation?.lng, deliveryLocation?.lat, deliveryLocation?.lng]);

  // 2. Chặng Stop 1 -> Stop 2 (Màu tím) nếu là đơn 2 quán - Chỉ fetch 1 lần và cache
  useEffect(() => {
    if (!isMultiShop || !stop1.location?.lat || !stop2.location?.lat) return;

    fetchVietmapRoute(stop1.location, stop2.location).then((coords) => {
      if (coords && coords.length > 0) {
        setRouteBetweenShops(coords);
      }
    });
  }, [isMultiShop, stop1.location?.lat, stop1.location?.lng, stop2.location?.lat, stop2.location?.lng]);

  // 3. Chặng Shipper xuất phát -> Điểm lấy món 1 (Màu xanh dương) - Đồng bộ 100% chuẩn y hệt AppShipper
  const initialShipperOriginRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastFetchedLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  useEffect(() => {
    const target = isMultiShop ? stop1.location : pickupLocation;
    if (!target?.lat || !target?.lng) return;

    if (location?.lat && location?.lng && !initialShipperOriginRef.current) {
      initialShipperOriginRef.current = { lat: location.lat, lng: location.lng };
    }

    const shipLoc = location || initialShipperOriginRef.current || { lat: 10.78033, lng: 106.65691 };

    const now = Date.now();
    if (lastFetchedLocationRef.current) {
      const prev = lastFetchedLocationRef.current;
      const moved = Math.abs(prev.lat - shipLoc.lat) + Math.abs(prev.lng - shipLoc.lng);
      if (now - prev.time < 2500 && moved < 0.0003) {
        return;
      }
    }
    lastFetchedLocationRef.current = { lat: shipLoc.lat, lng: shipLoc.lng, time: now };

    fetchVietmapRoute(shipLoc, target).then((coords) => {
      if (coords && coords.length > 0) {
        setRouteToShop(coords);
      }
    });
  }, [isMultiShop, stop1.location?.lat, stop1.location?.lng, pickupLocation?.lat, pickupLocation?.lng, location?.lat, location?.lng]);

  const defaultCenter: [number, number] = [10.7769, 106.7009];
  const center: [number, number] = location
    ? [location.lat, location.lng]
    : (stop1.location ? [stop1.location.lat, stop1.location.lng] : defaultCenter);

  const hasShipper = !!shipperId;
  const shop1Badge = isShop1First ? "1" : "2";
  const shop1Color = "#2563EB";
  const shop2Badge = isShop1First ? "2" : "1";
  const shop2Color = "#7C3AED";

  const shopIcon = isMultiShop ? createShopIcon(shop1Color, 42, shop1Badge, true) : createCustomIcon("#2563EB", 38, storeSvg);
  const shop2Icon = createShopIcon(shop2Color, 42, shop2Badge, true);

  return (
    <div className="w-full h-full relative flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="absolute top-3 left-3 right-3 md:right-auto z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            {hasShipper && isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                hasShipper && isConnected
                  ? "bg-emerald-500"
                  : hasShipper
                  ? "bg-amber-500 animate-pulse"
                  : "bg-slate-400 animate-pulse"
              }`}
            ></span>
          </span>
          <span>{isMultiShop ? "⚡ ĐƠN 2 QUÁN - LỘ TRÌNH TỐI ƯU" : (hasShipper ? (isConnected ? "Shipper trực tuyến" : "Đang định vị Shipper...") : "Đang tìm Shipper...")}</span>
        </div>
        {isMultiShop && (
          <div className="text-xs font-semibold text-slate-500">
            🎯 Tuyến lấy & giao: <span className="font-bold text-purple-600">{stop1.name} (1) ➔ {stop2.name} (2) ➔ Bạn</span>
          </div>
        )}
      </div>

      <MapContainer center={center} zoom={13} className="w-full h-64 md:h-80 z-0">
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />

        <MapFitter
          routeShop={routeToShop}
          routeBetween={routeBetweenShops}
          routeCustomer={routeToCustomer}
          pickupLocation={pickupLocation}
          deliveryLocation={deliveryLocation}
          pickup2Location={pickup2Location}
          location={location}
        />

        {routeToShop.length > 0 && (
          <Polyline positions={routeToShop} color="#2563EB" weight={6} opacity={0.9} lineCap="round" lineJoin="round" />
        )}

        {routeBetweenShops.length > 0 && (
          <Polyline positions={routeBetweenShops} color="#7C3AED" weight={5} opacity={0.9} lineCap="round" lineJoin="round" />
        )}

        {routeToCustomer.length > 0 && (
          <Polyline positions={routeToCustomer} color="#EA580C" weight={5} opacity={0.9} lineCap="round" lineJoin="round" />
        )}

        <style>{`
          .custom-tooltip {
            background: rgba(15, 23, 42, 0.90) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            padding: 4px 9px !important;
            color: #ffffff !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            white-space: nowrap !important;
          }
          .custom-tooltip::before { display: none !important; }
          .shop-tooltip { background: #1e3a8a !important; border-color: #60a5fa !important; }
          .shop2-tooltip { background: #581c87 !important; border-color: #c084fc !important; }
          .customer-tooltip { background: #7c2d12 !important; border-color: #fb923c !important; }
          .shipper-tooltip { background: #064e3b !important; border-color: #34d399 !important; }
        `}</style>

        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={shopIcon}>
            <Tooltip permanent direction="top" offset={[0, -20]} className="custom-tooltip shop-tooltip">
              🏪 {isMultiShop ? `${shop1Name || 'Quán 1'} (Quán ${shop1Badge})` : (shop1Name || 'Vị trí quán')}
            </Tooltip>
            <Popup className="font-semibold text-sm">
              {isMultiShop ? `Điểm lấy món #${shop1Badge}: ${shop1Name || 'Quán 1'}` : (shop1Name || 'Vị trí quán')}
            </Popup>
          </Marker>
        )}

        {isMultiShop && pickup2Location && (
          <Marker position={[pickup2Location.lat, pickup2Location.lng]} icon={shop2Icon}>
            <Tooltip permanent direction="top" offset={[0, -20]} className="custom-tooltip shop2-tooltip">
              🏪 {isMultiShop ? `${shop2Name || 'Quán 2'} (Quán ${shop2Badge})` : (shop2Name || 'Quán 2')}
            </Tooltip>
            <Popup className="font-semibold text-sm">
              <span className="text-purple-600 font-bold">Điểm lấy món #{shop2Badge}:</span> {shop2Name || 'Quán 2'}
            </Popup>
          </Marker>
        )}

        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={customerIcon} zIndexOffset={500}>
            <Tooltip permanent direction="top" offset={[0, -20]} className="custom-tooltip customer-tooltip">
              📍 Điểm nhận hàng (Bạn)
            </Tooltip>
            <Popup className="font-semibold text-sm">Vị trí giao hàng (Khách)</Popup>
          </Marker>
        )}

        {location && (
          <Marker position={[location.lat, location.lng]} icon={shipperIcon} zIndexOffset={1000}>
            <Tooltip permanent direction="bottom" offset={[0, 24]} className="custom-tooltip shipper-tooltip">
              🛵 Shipper
            </Tooltip>
            <Popup className="font-semibold text-sm">Shipper đang ở đây</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
