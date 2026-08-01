import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

function verify(value: string, signature: string) {
  const expected = sign(value);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSessionToken(userId: string) {
  return `${userId}.${sign(`session:${userId}`)}`;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  return parseSessionToken(token);
}

export function parseSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const userId = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  return verify(`session:${userId}`, signature) ? userId : null;
}

export function createAdminSessionToken() {
  return `true.${sign("admin-session")}`;
}

export function isValidAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const value = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (value !== "true") return false;
  return verify("admin-session", signature);
}
