/**
 * Vercel Express entry: must not rely on tsconfig path aliases.
 * The real app is compiled to dist/ where tsc-alias rewrites @/* imports.
 */
import { app } from "./dist/src/app.js";

export default app;
