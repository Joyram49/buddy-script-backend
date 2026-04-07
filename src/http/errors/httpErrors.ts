import { ApiError } from "./ApiError.js";

export class BadRequestError extends ApiError {
  constructor(params: { code?: string; message?: string; issues?: unknown; details?: unknown }) {
    super({
      statusCode: 400,
      code: params.code ?? "VALIDATION_ERROR",
      message: params.message ?? "Bad request",
      issues: params.issues,
      details: params.details,
    });
  }
}

export class UnauthorizedError extends ApiError {
  constructor(params?: { code?: string; message?: string; details?: unknown }) {
    super({
      statusCode: 401,
      code: params?.code ?? "UNAUTHORIZED",
      message: params?.message ?? "Unauthorized",
      details: params?.details,
    });
  }
}

export class NotFoundError extends ApiError {
  constructor(params?: { code?: string; message?: string; details?: unknown }) {
    super({
      statusCode: 404,
      code: params?.code ?? "NOT_FOUND",
      message: params?.message ?? "Not found",
      details: params?.details,
    });
  }
}

export class ConflictError extends ApiError {
  constructor(params?: { code?: string; message?: string; details?: unknown }) {
    super({
      statusCode: 409,
      code: params?.code ?? "CONFLICT",
      message: params?.message ?? "Conflict",
      details: params?.details,
    });
  }
}

export class InternalServerError extends ApiError {
  constructor(params?: { code?: string; message?: string; details?: unknown }) {
    super({
      statusCode: 500,
      code: params?.code ?? "INTERNAL_SERVER_ERROR",
      message: params?.message ?? "Internal server error",
      details: params?.details,
    });
  }
}
