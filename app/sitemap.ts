import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [cars, agencies] = await Promise.all([
    prisma.car.findMany({
      where: { isApproved: true, vendor: { approvalStatus: "APPROVED", subscription: { isBlocked: false } } },
      select: { id: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: "VENDOR", approvalStatus: "APPROVED" },
      select: { username: true, createdAt: true },
    }),
  ]);

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
