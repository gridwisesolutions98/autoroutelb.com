import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendBookingNotification({
  to,
  carName,
  renterName,
  renterPhone,
  startDate,
  endDate,
  totalPrice,
  depositAmount,
  paymentMethod,
}: {
  to: string;
  carName: string;
  renterName: string;
  renterPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  depositAmount: number;
  paymentMethod: string;
}) {
  if (!to) return;

  try {
    await transporter.sendMail({
      from: `"AutoRoute LB" <${process.env.GMAIL_USER}>`,
      to,
      subject: `New booking: ${carName}`,
      html: `
        <h2>New booking received</h2>
        <p><strong>Car:</strong> ${carName}</p>
        <p><strong>Renter:</strong> ${renterName} (${renterPhone})</p>
        <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Total:</strong> $${totalPrice}</p>
        <p><strong>Deposit due (30%) via ${paymentMethod}:</strong> $${depositAmount}</p>
        <p><strong>Remaining balance (70%), cash on pickup:</strong> $${Math.round((totalPrice - depositAmount) * 100) / 100}</p>
        <p>Log in to your dashboard to confirm the payment once received.</p>
      `,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }
}
export async function sendAgencyApprovalNotice({
  to,
  companyName,
  approved,
}: {
  to: string;
  companyName: string;
  approved: boolean;
}) {
  if (!to) return;

  try {
    await transporter.sendMail({
      from: `"AutoRoute LB" <${process.env.GMAIL_USER}>`,
      to,
      subject: approved ? "Your agency has been approved!" : "Update on your agency application",
      html: approved
        ? `<h2>Welcome to AutoRoute LB, ${companyName}!</h2><p>Your agency has been approved. You can now list your cars.</p>`
        : `<h2>Application update</h2><p>Unfortunately your agency application (${companyName}) was not approved at this time. Contact us for more details.</p>`,
    });
  } catch (err) {
    console.error("Approval email failed:", err);
  }
}
export async function sendRenewalReminder({
  to,
  companyName,
  expiresAt,
}: {
  to: string;
  companyName: string;
  expiresAt: string;
}) {
  if (!to) return;
  try {
    await transporter.sendMail({
      from: `"AutoRoute LB" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your subscription is expiring soon",
      html: `
        <h2>Subscription renewal reminder</h2>
        <p>Hi ${companyName},</p>
        <p>Your AutoRoute LB subscription expires on <strong>${expiresAt}</strong>.</p>
        <p>Please renew via Whish to <strong>${process.env.NEXT_PUBLIC_PLATFORM_WHISH}</strong>${process.env.NEXT_PUBLIC_PLATFORM_OMT ? ` or OMT to <strong>${process.env.NEXT_PUBLIC_PLATFORM_OMT}</strong>` : ""} before then to avoid any interruption to your listings.</p>
        <p>If your subscription expires, you'll have a 3-day grace period before your account is temporarily blocked.</p>
      `,
    });
  } catch (err) {
    console.error("Renewal reminder email failed:", err);
  }
}

export async function sendBlockedNotice({
  to,
  companyName,
}: {
  to: string;
  companyName: string;
}) {
  if (!to) return;
  try {
    await transporter.sendMail({
      from: `"AutoRoute LB" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your account has been temporarily blocked",
      html: `
        <h2>Account blocked</h2>
        <p>Hi ${companyName},</p>
        <p>Your subscription has expired and the grace period has passed. Your account is now temporarily blocked and your cars are hidden from customers.</p>
        <p>Please renew via Whish to <strong>${process.env.NEXT_PUBLIC_PLATFORM_WHISH}</strong>${process.env.NEXT_PUBLIC_PLATFORM_OMT ? ` or OMT to <strong>${process.env.NEXT_PUBLIC_PLATFORM_OMT}</strong>` : ""} and submit your transaction reference to restore access.</p>
      `,
    });
  } catch (err) {
    console.error("Blocked notice email failed:", err);
  }
}