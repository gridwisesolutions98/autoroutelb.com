"use client";
import { getDictionary, type Locale } from "@/lib/i18n";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isBooked(date: Date, bookings: { startDate: string; endDate: string }[]) {
  return bookings.some((b) => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    return date >= start && date < end;
  });
}

export default function Calendar({ bookings, locale }: { bookings: { startDate: string; endDate: string }[]; locale: Locale }) {
  const t = getDictionary(locale);
  const today = new Date();
  const months = [0, 1].map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginTop: "20px" }}>
      {months.map(({ year, month }) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = new Date(year, month, 1).getDay();
        const monthName = new Date(year, month, 1).toLocaleString(locale === "ar" ? "ar" : "default", { month: "long" });

        return (
          <div key={`${year}-${month}`} className="calendar-month">
            <h4>{monthName} {year}</h4>
            <div className="calendar-grid">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(year, month, i + 1);
                const booked = isBooked(date, bookings);
                return (
                  <div key={i} className={`calendar-day ${booked ? "booked" : "available"}`}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--text-muted)", width: "100%" }}>
        <span><span className="legend-dot booked" /> {t.calendar.unavailable}</span>
        <span><span className="legend-dot available" /> {t.calendar.available}</span>
      </div>
    </div>
  );
}
