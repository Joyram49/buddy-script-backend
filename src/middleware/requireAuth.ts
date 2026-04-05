import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/http/errors/httpErrors";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    email: string;
  };
};

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    return next(new UnauthorizedError({ code: "UNAUTHORIZED" }));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new UnauthorizedError({ code: "UNAUTHORIZED" }));
  }
}
