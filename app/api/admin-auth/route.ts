import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { createAdminSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`admin:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}