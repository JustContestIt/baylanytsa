import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticate } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { getEnv } from "./env";
import authRouter from "./routes/auth";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";
import notificationsRouter from "./routes/notifications";
import aiRouter from "./routes/ai";
import { registerNotificationRoutes } from "./sockets/notifications";

const { CLIENT_ORIGIN } = getEnv();

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authenticate);

app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api", authRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

export const attachSocketHandlers = registerNotificationRoutes;

export default app;
