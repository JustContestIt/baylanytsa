import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: 'Validation error', issues: err.issues });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
