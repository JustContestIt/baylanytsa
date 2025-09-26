import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app, { attachSocketHandlers } from "./app";
import { getEnv } from "./env";

dotenv.config();

const { PORT, CLIENT_ORIGIN } = getEnv();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true
  }
});

attachSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
