import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { postThreadReply } from "@/lib/slack-webhook";

// Slack POSTs here whenever a button / interactive component is clicked.
// See: https://api.slack.com/interactivity/handling

function verifySignature(req: Request, rawBody: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    console.error("interactions: SLACK_SIGNING_SECRET not set");
    return false;
  }
  const ts = req.headers.get("x-slack-request-timestamp");
  const sig = req.headers.get("x-slack-signature");
  if (!ts || !sig) {
    console.error("interactions: missing slack signature headers");
    return false;
  }
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
    console.error("interactions: signature timestamp too old", ts);
    return false;
  }
  const base = `v0:${ts}:${rawBody}`;
  const hash = crypto.createHmac("sha256", secret).update(base).digest("hex");
  const expected = `v0=${hash}`;
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!ok) console.error("interactions: signature mismatch");
    return ok;
  } catch (err: any) {
    console.error("interactions: signature compare error", err?.message);
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
    console.warn("interactions: unhandled action_id", action?.action_id);
    return NextResponse.json({ ok: true });
  }

  const channelId = payload.channel?.id ?? "";
  const messageTs = payload.message?.ts ?? "";
  if (!channelId || !messageTs) {
    console.error("interactions: missing channel/ts", { channelId, messageTs });
    return NextResponse.json({ ok: true });
  }

  const userId = payload.user?.id as string | undefined;
  const userName = payload.user?.name ?? payload.user?.username ?? "Unknown";
  const display = userId ? `<@${userId}>` : userName;

  console.log("interactions: posting claim reply", { channelId, messageTs, user: userName });
  const result = await postThreadReply(channelId, messageTs, `${display} clicked Claim.`);
  if (!result.ok) {
    console.error("interactions: thread reply failed", result.error);
  }

  return NextResponse.json({ ok: true });
}
