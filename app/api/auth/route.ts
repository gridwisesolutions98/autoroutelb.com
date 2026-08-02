import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { createSessionToken } from "@/lib/session";

const BCRYPT_PREFIX = /^\$2[aby]?\$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      username,
      password,
      companyName,
      whishNumber,
      whatsappNumber,
      contactEmail,
      address,
      website,
    } = body;

    if (website) {
      return NextResponse.json({ success: true });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`auth:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    if (action === "register") {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          username,
          password: passwordHash,
          companyName: companyName || "My Agency",
          whishNumber,
          whatsappNumber,
          contactEmail,
          address,
          subscription: {
            create: {
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      const { password: _pw, ...safeUser } = newUser;
      const response = NextResponse.json({ success: true, user: safeUser });
      response.cookies.set("session", createSessionToken(newUser.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } else {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      const isHashed = user ? BCRYPT_PREFIX.test(user.password) : false;
      const passwordMatches = user
        ? isHashed
          ? await bcrypt.compare(password, user.password)
          : user.password === password
        : false;

      if (!user || !passwordMatches) {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
      }

      // Legacy plaintext password that just matched — upgrade it to a hash now.
      if (!isHashed) {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: await bcrypt.hash(password, 10) },
        });
      }

      const { password: _pw, ...safeUser } = user;
      const response = NextResponse.json({ success: true, user: safeUser });
      response.cookies.set("session", createSessionToken(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
  } catch (error) {
    console.error("Auth error details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}