import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId }, omit: { password: true } });
  if (!user) redirect("/login");

  const locale = await getLocale();

  return <SettingsForm user={user} locale={locale} />;
}
