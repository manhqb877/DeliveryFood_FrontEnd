import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useShipperTracking } from '../hooks/useShipperTracking';
import { Navigation } from 'lucide-react';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const shipperIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3085/3085330.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const shopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3004/3004812.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555572.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export function ShipperTrackingMap({ shipperId, pickupLocation, deliveryLocation }) {
  const { location, isConnected } = useShipperTracking(shipperId);

  const defaultCenter = [10.7769, 106.7009];
  const center = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div className="w-full h-full relative flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Navigation className={`w-4 h-4 ${isConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
        {isConnected ? 'Shipper đang trực tuyến' : 'Đang kết nối Shipper...'}
      </div>

      <MapContainer center={center} zoom={15} className="w-full h-64 md:h-80 z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={shopIcon}>
            <Popup>Vị trí quán</Popup>
          </Marker>
        )}

        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={customerIcon}>
            <Popup>Vị trí giao hàng</Popup>
          </Marker>
        )}

        {location && (
          <Marker position={[location.lat, location.lng]} icon={shipperIcon}>
            <Popup>Shipper đang ở đây</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
