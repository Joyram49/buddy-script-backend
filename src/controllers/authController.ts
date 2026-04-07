import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AuthenticatedRequest } from "../middleware/requireAuth.js";
import { authService } from "../services/authService.js";
import { sendResponse } from "../http/success/sendResponse.js";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req: Request, res: Response, _next: NextFunction) {
    const parsed = RegisterSchema.parse(req.body);
    const { user } = await authService.register(parsed);
    return sendResponse(res, {
      statusCode: 201,
      data: { user },
      message: "User registered successfully",
    });
  },

  async login(req: Request, res: Response, _next: NextFunction) {
    const parsed = LoginSchema.parse(req.body);
    const payload = await authService.login(parsed);
    return sendResponse(res, {
      data: payload,
      message: "User logged in successfully",
    });
  },

  async me(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const payload = await authService.getMe(userId);
    return sendResponse(res, {
      data: payload,
      message: "User data fetched successfully",
    });
  },
};
