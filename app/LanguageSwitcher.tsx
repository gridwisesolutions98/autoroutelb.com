"use client";

export default function LanguageSwitcher({ current }: { current: string }) {
  const switchTo = async (locale: string) => {
    if (locale === current) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    window.location.reload();
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => switchTo("en")}
        className="lang-btn"
        style={{ opacity: current === "en" ? 1 : 0.5 }}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ar")}
        className="lang-btn"
        style={{ opacity: current === "ar" ? 1 : 0.5 }}
      >
        عربي
      </button>
    </div>
  );
}