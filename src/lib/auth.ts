import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "funpython_session";
const SECRET = process.env.SESSION_SECRET;
if (!SECRET) throw new Error("SESSION_SECRET env var is required");
const ENC_SECRET = new TextEncoder().encode(SECRET);
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export interface SessionPayload {
  userId: string;
  role: Role;
  username: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  xp: number;
  lives: number;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(ENC_SECRET);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ENC_SECRET);
    if (
      typeof payload.userId === "string" &&
      typeof payload.role === "string" &&
      typeof payload.username === "string"
    ) {
      return {
        userId: payload.userId,
        role: payload.role as Role,
        username: payload.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      xp: true,
      lives: true,
    },
  });
  return user ?? null;
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,24}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}
