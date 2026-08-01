import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendAgencyApprovalNotice } from "@/lib/email";
import { logActivity } from "@/lib/activityLog";
import { isValidAdminSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSessionToken(cookieStore.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { userId, decision } = await request.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { approvalStatus: decision === "approve" ? "APPROVED" : "REJECTED" },
  });

  if (user.contactEmail) {
    await sendAgencyApprovalNotice({
      to: user.contactEmail,
      companyName: user.companyName || "your agency",
      approved: decision === "approve",
    });
  }
await logActivity(
  decision === "approve" ? "Approved agency" : "Rejected agency",
  "User",
  userId,
  user.companyName || user.username
);
  return NextResponse.json({ success: true });
}