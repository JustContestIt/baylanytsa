import type { Server, Socket } from "socket.io";

export interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
  actor?: {
    id: string;
    username: string;
    displayName: string | null;
  };
  postId?: string | null;
}

const userSocketMap = new Map<string, Set<Socket>>();

export const registerNotificationRoutes = (io: Server) => {
  io.on("connection", (socket) => {
    const { userId } = socket.handshake.auth ?? socket.handshake.query;

    if (!userId || typeof userId !== "string") {
      socket.disconnect(true);
      return;
    }

    let sockets = userSocketMap.get(userId);
    if (!sockets) {
      sockets = new Set();
      userSocketMap.set(userId, sockets);
    }
    sockets.add(socket);

    socket.on("disconnect", () => {
      const stored = userSocketMap.get(userId);
      if (!stored) return;
      stored.delete(socket);
      if (stored.size === 0) {
        userSocketMap.delete(userId);
      }
    });
  });
};

export const pushNotification = (userId: string, payload: NotificationPayload) => {
  const sockets = userSocketMap.get(userId);
  if (!sockets) return;
  sockets.forEach((socket) => socket.emit("notification", payload));
};
