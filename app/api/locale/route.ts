import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { locale } = await request.json();

  if (locale !== "en" && locale !== "ar") {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}