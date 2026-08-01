"use client";
import { useRouter } from "next/navigation";

export default function ConfirmButton({ type, id }: { type: string; id: string }) {
  const router = useRouter();
  return (
    <button
      className="submit-btn"
      style={{ marginTop: "10px", width: "auto", padding: "8px 16px" }}
      onClick={async () => {
        await fetch("/api/admin/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, id }),
        });
        router.refresh();
      }}
    >
      Confirm payment
    </button>
  );
}