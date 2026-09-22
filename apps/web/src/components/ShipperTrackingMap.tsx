import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useShipperTracking } from '../hooks/useShipperTracking';
import { MapPin, Navigation } from 'lucide-react';

// Reset Leaflet icon default
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const storeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>`;
const customerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const shipperSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;

const shopIcon = createCustomIcon('#1D4ED8', 38, storeSvg);
const customerIcon = createCustomIcon('#EA580C', 38, customerSvg);
const shipperIcon = createCustomIcon('#10B981', 44, shipperSvg);

export const VIETMAP_API_KEY = '809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845';

interface ShipperTrackingMapProps {
  shipperId?: number;
  pickupLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
}

// Component phụ để tự động căn chỉnh khung hình bản đồ
function MapFitter({ routeShop, routeCustomer, pickupLocation, deliveryLocation, location }: any) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (routeShop && routeShop.length > 0) routeShop.forEach((c: any) => bounds.extend(c));
    if (routeCustomer && routeCustomer.length > 0) routeCustomer.forEach((c: any) => bounds.extend(c));
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
    } else {
      if (pickupLocation) bounds.extend([pickupLocation.lat, pickupLocation.lng]);
      if (deliveryLocation) bounds.extend([deliveryLocation.lat, deliveryLocation.lng]);
      if (location) bounds.extend([location.lat, location.lng]);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
      }
    }
  }, [map, routeShop, routeCustomer, pickupLocation, deliveryLocation, location]);

  return null;
}

export function ShipperTrackingMap({ shipperId, pickupLocation, deliveryLocation }: ShipperTrackingMapProps) {
  const { location, isConnected } = useShipperTracking(shipperId);
  const [routeToShop, setRouteToShop] = useState<[number, number][]>([]);
  const [routeToCustomer, setRouteToCustomer] = useState<[number, number][]>([]);

  const fetchVietmapRoute = async (from: { lat: number, lng: number }, to: { lat: number, lng: number }) => {
    try {
      const url = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${from.lat},${from.lng}&point=${to.lat},${to.lng}&vehicle=motorcycle&points_encoded=false`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.paths && data.paths.length > 0) {
        return data.paths[0].points.coordinates.map((c: any) => [c[1], c[0]]);
      }
    } catch (e) {
      console.warn('Vietmap fetch error', e);
    }
    return [];
  };

  const [routeFetched, setRouteFetched] = useState(false);

  useEffect(() => {
    const loadRoutes = async () => {
      // Chỉ fetch tuyến đường 1 lần khi đã có đủ toạ độ
      if (routeFetched) return;
      if (!location || !pickupLocation || !deliveryLocation) return;

      // 1. Shipper -> Shop (Blue Route)
      const route1 = await fetchVietmapRoute(location, pickupLocation);
      setRouteToShop(route1);
      
      // 2. Shop -> Customer (Orange Route)
      const route2 = await fetchVietmapRoute(pickupLocation, deliveryLocation);
      setRouteToCustomer(route2);

      setRouteFetched(true);
    };
    
    loadRoutes();
  }, [location?.lat, location?.lng, pickupLocation?.lat, pickupLocation?.lng, deliveryLocation?.lat, deliveryLocation?.lng, routeFetched]);

  const defaultCenter: [number, number] = [10.7769, 106.7009];
  const center: [number, number] = location ? [location.lat, location.lng] : (pickupLocation ? [pickupLocation.lat, pickupLocation.lng] : defaultCenter);

  return (
    <div className="w-full h-full relative flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="relative flex h-3 w-3">
          {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
        </span>
        {isConnected ? 'Shipper trực tuyến' : 'Đang tìm Shipper...'}
      </div>

      <MapContainer center={center} zoom={13} className="w-full h-64 md:h-80 z-0">
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />

        <MapFitter 
          routeShop={routeToShop} 
          routeCustomer={routeToCustomer}
          pickupLocation={pickupLocation} 
          deliveryLocation={deliveryLocation} 
          location={location} 
        />

        {routeToShop.length > 0 && (
          <Polyline positions={routeToShop} color="#3B82F6" weight={5} opacity={0.8} lineCap="round" lineJoin="round" />
        )}
        
        {routeToCustomer.length > 0 && (
          <Polyline positions={routeToCustomer} color="#F97316" weight={5} opacity={0.8} lineCap="round" lineJoin="round" />
        )}

        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={shopIcon}>
            <Popup className="font-semibold text-sm">Vị trí quán</Popup>
          </Marker>
        )}

        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={customerIcon}>
            <Popup className="font-semibold text-sm">Vị trí giao hàng</Popup>
          </Marker>
        )}

        {location && (
          <Marker position={[location.lat, location.lng]} icon={shipperIcon} zIndexOffset={1000}>
            <Popup className="font-semibold text-sm">Shipper đang ở đây</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
