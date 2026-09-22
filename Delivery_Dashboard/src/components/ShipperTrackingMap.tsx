import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useShipperTracking } from '../hooks/useShipperTracking';
import { MapPin, Navigation } from 'lucide-react';

// Sửa icon mặc định của leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon
const shipperIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3085/3085330.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'drop-shadow-md'
});

const shopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3004/3004812.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: 'drop-shadow-md'
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555572.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: 'drop-shadow-md'
});

export const VIETMAP_API_KEY = '809bdd000025b62b0e9710b82e28f65f6178ee698cdb1845';

interface ShipperTrackingMapProps {
  shipperId?: number;
  pickupLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
}

// Component phụ để tự động căn chỉnh khung hình bản đồ
function MapFitter({ routeCoords, pickupLocation, deliveryLocation, location }: any) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (routeCoords && routeCoords.length > 0) {
      routeCoords.forEach((c: any) => bounds.extend(c));
    } else {
      if (pickupLocation) bounds.extend([pickupLocation.lat, pickupLocation.lng]);
      if (deliveryLocation) bounds.extend([deliveryLocation.lat, deliveryLocation.lng]);
      if (location) bounds.extend([location.lat, location.lng]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
    }
  }, [map, routeCoords, pickupLocation, deliveryLocation, location]);

  return null;
}

export function ShipperTrackingMap({ shipperId, pickupLocation, deliveryLocation }: ShipperTrackingMapProps) {
  const { location, isConnected } = useShipperTracking(shipperId);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // Lấy đường đi Vietmap
  useEffect(() => {
    const getRoute = async () => {
      let from = pickupLocation;
      let to = deliveryLocation;

      if (location && deliveryLocation) {
        from = location;
        to = deliveryLocation;
      }

      if (from && to) {
        try {
          const url = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${from.lat},${from.lng}&point=${to.lat},${to.lng}&vehicle=motorcycle&points_encoded=false`;
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.paths && data.paths.length > 0) {
            const coords = data.paths[0].points.coordinates.map((c: any) => [c[1], c[0]]);
            setRouteCoords(coords);
          }
        } catch (e) {
          console.warn('Vietmap fetch error', e);
        }
      }
    };
    getRoute();
  }, [location?.lat, location?.lng, pickupLocation?.lat, pickupLocation?.lng, deliveryLocation?.lat, deliveryLocation?.lng]);

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
        {/* Dùng tile của Google Maps để giao diện hiện đại và sạch sẽ hơn OSM */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />

        <MapFitter 
          routeCoords={routeCoords} 
          pickupLocation={pickupLocation} 
          deliveryLocation={deliveryLocation} 
          location={location} 
        />

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#3B82F6" weight={5} opacity={0.8} className="drop-shadow-md" lineCap="round" lineJoin="round" />
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
