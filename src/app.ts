import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./lib/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { postRouter } from "./routes/post.js";
import { errorHandler, notFoundHandler } from "./http/middleware/errorHandler.js";

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
app.use(postRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
