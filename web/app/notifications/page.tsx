"use client";

import { useEffect, useMemo } from "react";
import useSWR from "swr";
import FeedSkeleton from "@/components/FeedSkeleton";
import NotificationList from "@/components/NotificationList";
import RegisterForm from "@/components/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { connectSocket } from "@/lib/socket";
import type { NotificationItem } from "@/types";

interface NotificationsResponse {
  notifications: NotificationItem[];
}

type NotificationSocketPayload = {
  id: string;
  type: NotificationItem["type"];
  read: boolean;
  createdAt: string;
  message: string;
  actor?: {
    id: string;
    username: string;
    displayName: string | null;
  };
  postId?: string | null;
};

const NotificationsPage = () => {
  const { user, isLoading: authLoading, mutate: mutateAuth } = useAuth();
  const { data, mutate, isLoading } = useSWR<NotificationsResponse>(user ? "/api/notifications" : null, {
    refreshInterval: 60_000
  });

  useEffect(() => {
    if (!user?.id) return;
    const socket = connectSocket(user.id);
    const handler = (payload: NotificationSocketPayload) => {
      const incoming: NotificationItem = {
        id: payload.id,
        type: payload.type,
        read: payload.read,
        createdAt: payload.createdAt,
        message: payload.message,
        actor: payload.actor ?? undefined,
        post: payload.postId ? { id: payload.postId, content: null } : null
      };
      mutate((current) => {
        if (!current) {
          return { notifications: [incoming] };
        }
        return { notifications: [incoming, ...current.notifications] };
      }, false);
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [user?.id, mutate]);

  const notifications = useMemo(() => data?.notifications ?? [], [data]);

  if (authLoading) {
    return (
      <div className="space-y-4">
        <FeedSkeleton />
      </div>
    );
  }

  if (!user) {
    return <RegisterForm onSuccess={() => mutateAuth()} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Уведомления</h1>
      {isLoading && <FeedSkeleton />}
      <NotificationList items={notifications} />
    </div>
  );
};

export default NotificationsPage;
