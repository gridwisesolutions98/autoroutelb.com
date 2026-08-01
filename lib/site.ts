import { headers } from "next/headers";

export async function getBaseUrl() {
  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || (process.env.NODE_ENV === "development" ? "http" : "https");
  return `${proto}://${host}`;
}
