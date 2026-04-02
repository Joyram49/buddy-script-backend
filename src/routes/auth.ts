import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";
import { requireAuth, type AuthenticatedRequest } from "@/middleware/requireAuth";

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

authRouter.post("/auth/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "VALIDATION_ERROR", issues: parsed.error.issues });
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });
    return res.status(201).json({ user });
  } catch {
    return res.status(409).json({ error: "EMAIL_IN_USE" });
  }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "VALIDATION_ERROR", issues: parsed.error.issues });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (!user?.passwordHash) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  return res.json({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth!.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });

  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json({ user });
});
