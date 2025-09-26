import jwt from "jsonwebtoken";
import { getEnv } from "../env";

const { JWT_SECRET } = getEnv();

export const signToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};
