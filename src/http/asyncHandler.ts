import type { NextFunction, Request, Response } from "express";

/**
 * Ensures async route/controller errors are forwarded to Express error middleware.
 * Express 5 usually handles promise rejections, but this keeps behavior consistent.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}
