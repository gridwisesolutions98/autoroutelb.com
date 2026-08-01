import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Regenerate periodically once the database is reachable, rather than freezing
// the sitemap at whatever existed when the app was built.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // On a fresh deploy the database may not exist yet at build time (e.g. Railway
  // only mounts the persistent volume at runtime, not during the build step).
  // Fall back to just the static entries rather than failing the build/request.
  let cars: { id: string; createdAt: Date }[] = [];
  let agencies: { username: string; createdAt: Date }[] = [];
  try {
    [cars, agencies] = await Promise.all([
      prisma.car.findMany({
        where: { isApproved: true, vendor: { approvalStatus: "APPROVED", subscription: { isBlocked: false } } },
        select: { id: true, createdAt: true },
      }),
      prisma.user.findMany({
        where: { role: "VENDOR", approvalStatus: "APPROVED" },
        select: { username: true, createdAt: true },
      }),
    ]);
  } catch (err) {
    console.error("sitemap: database unavailable, falling back to static entries", err);
  }

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/cars`, changeFrequency: "hourly", priority: 0.9 },
    ...cars.map((car) => ({
      url: `${baseUrl}/cars/${car.id}`,
      lastModified: car.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...agencies.map((agency) => ({
      url: `${baseUrl}/agencies/${encodeURIComponent(agency.username)}`,
      lastModified: agency.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
