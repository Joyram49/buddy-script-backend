import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";
import { NotFoundError, UnauthorizedError } from "@/http/errors/httpErrors";

type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const authService = {
  async register(input: RegisterInput) {
    const { email, password, name } = input;
    const passwordHash = await bcrypt.hash(password, 12);

    // Let Prisma errors bubble up to the global error middleware.
    // Unique constraint violations will be mapped to a 409 response.
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return { user };
  },

  async login(input: LoginInput) {
    const { email, password } = input;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedError({
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError({
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      throw new NotFoundError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return { user };
  },
};
