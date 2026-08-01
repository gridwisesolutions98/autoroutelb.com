import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken } from "@/lib/session";
import AdminLogin from "../AdminLogin";
import Link from "next/link";

export default async function AgenciesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const cookieStore = await cookies();
  const isAdmin = isValidAdminSessionToken(cookieStore.get("admin_session")?.value);
  if (!isAdmin) return <AdminLogin />;

  const { q, status } = await searchParams;

  const agencies = await prisma.user.findMany({
    where: {
      role: "VENDOR",
      ...(q && {
        OR: [
          { companyName: { contains: q } },
          { username: { contains: q } },
        ],
      }),
      ...(status && { approvalStatus: status as "PENDING" | "APPROVED" | "REJECTED" }),
    },
    include: { subscription: true, cars: true },
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
        <Link href="/admin" className="toggle-link" style={{ margin: 0 }}>← Back to admin</Link>
      </div>
      <h1 style={{ margin: "20px 0" }}>All agencies</h1>

      <form className="filter-bar" method="get">
        <input type="text" name="q" placeholder="Search by name or username..." defaultValue={q || ""} />
        <select name="status" defaultValue={status || ""}>
          <option value="">Any status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button type="submit" className="toggle-link" style={{ margin: 0, background: "var(--ink)", color: "white", padding: "10px 18px", borderRadius: "5px" }}>
          Search
        </button>
        <Link href="/admin/agencies" className="toggle-link" style={{ margin: 0 }}>Clear</Link>
      </form>

      {agencies.length === 0 && <p className="car-meta">No agencies match.</p>}

      {agencies.map((agency) => (
        <div key={agency.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{agency.companyName}</strong> (@{agency.username})</p>
          <p className="car-meta">
            Status: {agency.approvalStatus} · Cars: {agency.cars.length} · Plan: {agency.subscription?.plan || "—"} ·
            Subscription: {agency.subscription?.paymentStatus || "—"}
            {agency.subscription?.isBlocked && " · BLOCKED"}
          </p>
          <p className="car-meta">{agency.contactEmail || "no email"} · {agency.whishNumber || "no Whish#"}</p>
        </div>
      ))}
    </div>
  );
}