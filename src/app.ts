import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "@/lib/env";
import { healthRouter } from "@/routes/health";
import { authRouter } from "@/routes/auth";
import { errorHandler, notFoundHandler } from "@/http/middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(healthRouter);
app.use(authRouter);

app.use(notFoundHandler);
app.use(errorHandler);
