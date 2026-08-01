"use client";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function SignOutButton({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).dashboard;
  const router = useRouter();
  return (
    <button
      className="toggle-link"
      style={{ marginTop: 0 }}
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
      }}
    >
      {t.signOut}
    </button>
  );
}
