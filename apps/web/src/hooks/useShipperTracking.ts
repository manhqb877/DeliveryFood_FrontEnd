import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
// @ts-ignore
import SockJS from "sockjs-client/dist/sockjs";

interface ShipperLocation {
  shipperId: number;
  lat: number;
  lng: number;
  deliveryId?: number;
  updatedAt?: string;
  message?: string;
  heading?: number;
  speed?: number;
}

export function useShipperTracking(shipperId: number | null | undefined) {
  const [location, setLocation] = useState<ShipperLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // Polling location fallback every 3s
  useEffect(() => {
    if (!shipperId) {
      setLocation(null);
      setIsConnected(false);
      return;
    }

    let isMounted = true;

    const fetchCurrentLocation = async () => {
      try {
        let res = await fetch(`http://localhost:8080/api/v1/tracking/shippers/${shipperId}/location`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`http://localhost:8084/tracking/shippers/${shipperId}/location`).catch(() => null);
        }
        if (res && res.ok && isMounted) {
          const data = await res.json();
          if (data && data.lat && data.lng) {
            setLocation(data);
            setIsConnected(true);
          }
        }
      } catch (e) {
        // Shipper may be offline or hasn't pushed GPS yet
      }
    };

    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [shipperId]);

  // Real-time STOMP WebSocket push
  useEffect(() => {
    if (!shipperId) {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
        const url = typeof window !== 'undefined' && (window.location.protocol === 'https:' || host.includes('ngrok'))
          ? 'https://unentwined-johanne-biasedly.ngrok-free.dev/ws'
          : `http://${host}:8080/ws`;
        return new SockJS(url);
      },
      debug: function () {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe(`/topic/shippers/${shipperId}`, (message) => {
        if (message.body) {
          try {
            const loc = JSON.parse(message.body);
            if (loc && loc.lat && loc.lng) {
              setLocation(loc);
              setIsConnected(true);
            }
          } catch (e) {
            console.error("Failed to parse STOMP message:", e);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.warn("STOMP broker notice:", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [shipperId]);

  return { location, isConnected };
}
