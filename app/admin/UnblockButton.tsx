"use client";
import { useRouter } from "next/navigation";

export default function UnblockButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();

  return (
    <button
      className="submit-btn"
      style={{ width: "auto", padding: "8px 16px", background: "#1E7B34", marginTop: "8px" }}
      onClick={async () => {
        await fetch("/api/admin/unblock-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        });
        router.refresh();
      }}
    >
      Remove block
    </button>
  );
}