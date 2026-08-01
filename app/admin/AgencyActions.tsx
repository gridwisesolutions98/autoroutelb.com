"use client";
import { useRouter } from "next/navigation";

export default function AgencyActions({ userId }: { userId: string }) {
  const router = useRouter();

  const decide = async (decision: "approve" | "reject") => {
    await fetch("/api/admin/approve-agency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, decision }),
    });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
      <button className="submit-btn" style={{ width: "auto", padding: "8px 16px", background: "#1E7B34" }} onClick={() => decide("approve")}>
        Approve
      </button>
      <button className="submit-btn" style={{ width: "auto", padding: "8px 16px", background: "#B3432B" }} onClick={() => decide("reject")}>
        Reject
      </button>
    </div>
  );
}