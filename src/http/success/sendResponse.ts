import { Response } from "express";
import { ApiResponse } from "./ApiResponse.js";

export function sendResponse<T>(
  res: Response,
  options: {
    statusCode?: number;
    data: T;
    message?: string;
    meta?: Record<string, unknown>;
  },
) {
  const { statusCode = 200, data, message, meta } = options;

  const response = new ApiResponse(data, message, meta);

  return res.status(statusCode).json(response.toJSON());
}
