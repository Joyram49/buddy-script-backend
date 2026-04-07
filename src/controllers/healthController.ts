import type { Request, Response, NextFunction } from "express";

import { asyncHandler } from "../http/asyncHandler.js";
import { healthService } from "../services/healthService.js";

export const healthController = {
  check: asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const payload = await healthService.check();
    return res.json(payload);
  }),
};

