import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { authController } from "../controllers/authController.js";
import { asyncHandler } from "../http/asyncHandler.js";

export const authRouter = Router();

authRouter.post(
  "/auth/register",
  asyncHandler(async (req, res, next) => authController.register(req, res, next)),
);

authRouter.post(
  "/auth/login",
  asyncHandler(async (req, res, next) => authController.login(req, res, next)),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res, next) => authController.me(req, res, next)),
);
