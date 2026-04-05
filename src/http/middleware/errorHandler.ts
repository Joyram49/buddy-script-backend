import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { env } from "@/lib/env";
import { Prisma } from "@/lib/prisma";
import { ApiError, type ApiErrorResponse } from "@/http/errors/ApiError";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "@/http/errors/httpErrors";

function sanitizeErrorBodyForProduction(body: ApiErrorResponse): ApiErrorResponse {
  return {
    success: false,
    code: body.code,
    ...(body.message ? { message: body.message } : {}),
  };
}

/**
 * Central Express error -> JSON mapping.
 * Put this after all routes and any 404 handler.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Known app errors
  if (err instanceof ApiError) {
    let body = err.toResponse();
    if (err.statusCode >= 500 && env.NODE_ENV === "production") {
      body = sanitizeErrorBodyForProduction(body);
    }
    return res.status(err.statusCode).json(body);
  }

  // Zod validation
  if (err instanceof z.ZodError) {
    const bad = new BadRequestError({
      issues: err.issues,
    });
    return res.status(bad.statusCode).json(bad.toResponse());
  }

  // Prisma errors (unique constraint, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // Unique constraint violation
      const meta = err.meta as { target?: unknown } | undefined;
      const target = meta?.target ?? undefined;
      const conflict = new ConflictError({
        code: "EMAIL_IN_USE",
        details: { target },
        message: "Resource already exists",
      });
      return res.status(conflict.statusCode).json(conflict.toResponse());
    }
  }

  // Common JWT errors
  if (err instanceof Error) {
    const name = err.name;
    if (name === "TokenExpiredError" || name === "JsonWebTokenError") {
      const unauthorized = new UnauthorizedError();
      return res.status(unauthorized.statusCode).json(unauthorized.toResponse());
    }
  }

  // Fallback
  console.error(err);
  const internal = new InternalServerError();
  return res.status(internal.statusCode).json(internal.toResponse());
}

export function notFoundHandler(_req: Request, res: Response) {
  const notFound = new NotFoundError();
  return res.status(notFound.statusCode).json(notFound.toResponse());
}
