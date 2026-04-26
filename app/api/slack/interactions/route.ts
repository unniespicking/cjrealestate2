import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { postThreadReply } from "@/lib/slack-webhook";

// Slack POSTs here whenever a button / interactive component is clicked.
// See: https://api.slack.com/interactivity/handling

function verifySignature(req: Request, rawBody: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;
  const ts = req.headers.get("x-slack-request-timestamp");
  const sig = req.headers.get("x-slack-signature");
  if (!ts || !sig) return false;
  // Reject replays > 5 min
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const base = `v0:${ts}:${rawBody}`;
  const hash = crypto.createHmac("sha256", secret).update(base).digest("hex");
  const expected = `v0=${hash}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const payloadJson = params.get("payload");
  if (!payloadJson) return NextResponse.json({ error: "No payload" }, { status: 400 });

  let payload: any;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  if (payload.type !== "block_actions") {
    return NextResponse.json({ ok: true });
  }

  const action = payload.actions?.[0];
  if (!action || action.action_id !== "claim_case") {
    return NextResponse.json({ ok: true });
  }

  const channelId = payload.channel?.id ?? "";
  const messageTs = payload.message?.ts ?? "";
  if (!channelId || !messageTs) {
    return NextResponse.json({ ok: true });
  }

  const userId = payload.user?.id as string | undefined;
  const userName = payload.user?.name ?? payload.user?.username ?? "Unknown";
  const display = userId ? `<@${userId}>` : userName;

  await postThreadReply(channelId, messageTs, `${display} clicked Claim.`);

  return NextResponse.json({ ok: true });
}
