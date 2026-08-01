import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import EditCarForm from "./EditCarForm";

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userId = await getSession();
  if (!userId) redirect("/login");

  const car = await prisma.car.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!car || car.vendorId !== userId) notFound();

  const locale = await getLocale();

  return <EditCarForm car={car} locale={locale} />;
}
