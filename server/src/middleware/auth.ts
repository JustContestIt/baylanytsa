import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId };
  } catch (error) {
    req.user = undefined;
  }
  next();
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError());
  }
  next();
};
