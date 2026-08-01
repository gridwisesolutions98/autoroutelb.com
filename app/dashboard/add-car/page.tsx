import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import AddCarForm from "./AddCarForm";

export default async function AddCarPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
  if (user?.subscription?.paymentStatus !== "CONFIRMED") {
    redirect("/dashboard/subscribe");
  }

  const locale = await getLocale();

  return <AddCarForm locale={locale} />;
}
