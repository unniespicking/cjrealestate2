import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { claimCase, getCase } from "@/lib/slack-cases";
import {
  postThreadReply,
  updateMessage,
  buildClaimedBlocks,
} from "@/lib/slack-webhook";

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

  // Slack sends application/x-www-form-urlencoded with a `payload` field
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

  const caseId = action.value as string;
  const slackUser = {
    id: payload.user?.id ?? "",
    name: payload.user?.name ?? payload.user?.username ?? "Unknown",
  };
  const display = payload.user?.name
    ? `<@${slackUser.id}>` // Slack will render as user mention
    : slackUser.name;

  const before = await getCase(caseId);
  const after = await claimCase(caseId, slackUser);
  const channelId = payload.channel?.id ?? before?.channel_id ?? "";
  const messageTs = payload.message?.ts ?? before?.message_ts ?? "";

  if (!after || !channelId || !messageTs) {
    return NextResponse.json({ ok: true });
  }

  // If already claimed by someone else, just reply in thread, don't change original.
  const wasFreshClaim = !before?.claimed_by_user_id;

  if (wasFreshClaim) {
    // 1. Update original — strip Claim button, add "Claimed by" context.
    const originalBlocks = payload.message?.blocks ?? [];
    const newBlocks = buildClaimedBlocks(originalBlocks, slackUser.name, after.claimed_at);
    await updateMessage(channelId, messageTs, newBlocks, after.title);

    // 2. Post thread reply.
    await postThreadReply(
      channelId,
      messageTs,
      `${display} has claimed this case (${caseId}). They'll reach out to the customer next.`
    );
  } else {
    // Already claimed — just note the duplicate attempt in thread.
    await postThreadReply(
      channelId,
      messageTs,
      `${display} also tried to claim — already owned by *${before?.claimed_by_name}*.`
    );
  }

  return NextResponse.json({ ok: true });
}
