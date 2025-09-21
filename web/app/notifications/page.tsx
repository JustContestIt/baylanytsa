'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcherJSON, api } from '@/lib/api';
import useSocket from '../../hooks/useSocket';
import NotificationsList from '../../components/NotificationsList';

type Notification = {
  id: number;
  type: 'LIKE' | 'COMMENT';
  actor: { id: number; username: string; displayName?: string | null };
  postId?: number | null;
  createdAt: string;
  read: boolean;
};

export default function NotificationsPage() {
  const { data, mutate } = useSWR<Notification[]>(
    api('/notifications'),
    fetcherJSON
  );
  const [live, setLive] = useState<Notification[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = (n: any) => {
      // простая вставка в начало
      setLive((prev) => [
        { ...n, actor: { id: n.actorId, username: '...' } },
        ...prev,
      ]);
      // перезагрузить список с сервера (там actor уже заполнен)
      mutate();
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket, mutate]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 space-y-2">
        Подписка на realtime-уведомления активна при наличии cookie.
      </div>
      <NotificationsList items={data || []} />
    </div>
  );
}
