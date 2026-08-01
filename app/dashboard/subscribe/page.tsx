import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import SubscribeForm from "./SubscribeForm";

export default async function SubscribePage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (user?.subscription?.paymentStatus === "CONFIRMED") {
    redirect("/dashboard/add-car");
  }

  const isFirstThreeMonths =
    user?.createdAt &&
    new Date().getTime() - new Date(user.createdAt).getTime() < 90 * 24 * 60 * 60 * 1000;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.subscribe;
  const whishNumber = process.env.NEXT_PUBLIC_PLATFORM_WHISH || "";
  const omtNumber = process.env.NEXT_PUBLIC_PLATFORM_OMT || "";

  return (
    <div className="auth-form-panel" style={{ minHeight: "100vh", flexDirection: "column", padding: "40px 24px" }}>
      <div style={{ maxWidth: "700px", width: "100%" }}>
        <h2>{t.title}</h2>

        <div className="plan-grid">
          <div className="plan-card">
            <h3>{t.basicTitle}</h3>
            <p className="car-meta">{t.basicDesc}</p>
            <p className="plan-price">
              {isFirstThreeMonths ? (
                <>$15<span>/mo</span> <span className="plan-strike">$20</span></>
              ) : (
                <>$20<span>/mo</span></>
              )}
            </p>
            {isFirstThreeMonths && <p className="car-meta">{t.basicIntro(20)}</p>}
            <p className="car-meta" style={{ marginTop: "8px" }}>{t.basicYearly}</p>
          </div>

          <div className="plan-card">
            <h3>{t.premiumTitle}</h3>
            <p className="car-meta">{t.premiumDesc}</p>
            <p className="plan-price">
              {isFirstThreeMonths ? (
                <>$35<span>/mo</span> <span className="plan-strike">$50</span></>
              ) : (
                <>$50<span>/mo</span></>
              )}
            </p>
            {isFirstThreeMonths && <p className="car-meta">{t.basicIntro(50)}</p>}
            <p className="car-meta" style={{ marginTop: "8px" }}>{t.premiumYearly}</p>
          </div>
        </div>

        <SubscribeForm
          existingRef={user?.subscription?.transactionRef || ""}
          locale={locale}
          whishNumber={whishNumber}
          omtNumber={omtNumber}
        />
      </div>
    </div>
  );
}
