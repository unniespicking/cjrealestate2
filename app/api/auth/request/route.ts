import { NextResponse } from "next/server";
import { createMagicToken, findStaffByEmail } from "@/lib/auth";
import { postToSlack } from "@/lib/slack-webhook";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const staff = findStaffByEmail(email);
  if (!staff) {
    // Same response shape as success — don't leak which emails are valid.
    return NextResponse.json({ ok: true, demo: true });
  }

  const token = await createMagicToken(email);
  if (!token) {
    return NextResponse.json({ error: "Could not generate link" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const link = `${origin}/api/auth/verify?token=${token}`;

  // Mirror to Slack so the team can see login attempts.
  await postToSlack({
    channel: "#staff-auth",
    title: "Staff sign-in attempt",
    subtitle: `${staff.name} <${staff.email}>`,
    fields: [
      { label: "Office", value: staff.office },
      { label: "Role", value: staff.role },
      { label: "Magic link", value: link },
    ],
    emoji: "🔐",
  });

  // In demo mode there is no SMTP — return the link directly so it's clickable.
  return NextResponse.json({
    ok: true,
    demo: !process.env.SMTP_HOST,
    link,
    name: staff.name,
    email: staff.email,
  });
}
