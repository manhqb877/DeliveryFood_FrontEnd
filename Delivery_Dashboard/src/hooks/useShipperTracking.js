import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

export function useShipperTracking(shipperId) {
  const [location, setLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!shipperId) {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      return;
    }

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
