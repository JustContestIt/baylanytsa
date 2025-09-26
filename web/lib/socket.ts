import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const instance = getSocket();
  if (instance.connected) {
    return instance;
  }
  instance.auth = { userId };
  instance.connect();
  return instance;
};

export const disconnectSocket = () => {
  if (!socket) return;
  if (socket.connected) {
    socket.disconnect();
  }
};
