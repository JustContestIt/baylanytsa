'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  const baseURL = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return url.replace(/\/+$/, '');
  }, []);

  useEffect(() => {
    // соединение с сервером
    const s = io(baseURL, {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [baseURL]);

  return socket;
}
