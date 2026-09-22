import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs';

interface ShipperLocation {
  shipperId: number;
  lat: number;
  lng: number;
  deliveryId?: number;
  updatedAt?: string;
  message?: string;
}

export function useShipperTracking(shipperId: number | null | undefined) {
  const [location, setLocation] = useState<ShipperLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!shipperId) {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      return;
    }

    // Connect to tracking-service WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8084/ws'),
      debug: function (str) {
        console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to STOMP for shipper:', shipperId);
      setIsConnected(true);
      
      // Subscribe to the shipper's location topic
      client.subscribe(`/topic/shippers/${shipperId}`, (message) => {
        if (message.body) {
          try {
            const loc = JSON.parse(message.body);
            setLocation(loc);
          } catch (e) {
            console.error('Failed to parse STOMP message:', e);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [shipperId]);

  return { location, isConnected };
}
