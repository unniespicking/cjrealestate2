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
  const display = slackUser.id ? `<@${slackUser.id}>` : slackUser.name;

  const channelId = payload.channel?.id ?? "";
  const messageTs = payload.message?.ts ?? "";
  if (!channelId || !messageTs) {
    return NextResponse.json({ ok: true });
  }

  const originalBlocks: any[] = payload.message?.blocks ?? [];
  const headerText =
    originalBlocks.find((b) => b.type === "header")?.text?.text ??
    payload.message?.text ??
    "";

  // CSV is best-effort (no-op on serverless). The message blocks are the
  // authoritative source of truth for whether the case has been claimed.
  const before = await getCase(caseId).catch(() => null);
  const claimedFromBlocks = originalBlocks.some(
    (b) =>
      b.type === "context" &&
      Array.isArray(b.elements) &&
      b.elements.some(
        (e: any) => typeof e?.text === "string" && e.text.includes("Claimed by")
      )
  );
  const alreadyClaimed = claimedFromBlocks || !!before?.claimed_by_user_id;

  if (alreadyClaimed) {
    const owner = before?.claimed_by_name;
    await postThreadReply(
      channelId,
      messageTs,
      owner
        ? `${display} also tried to claim — already owned by *${owner}*.`
        : `${display} also tried to claim — already taken.`
    );
    return NextResponse.json({ ok: true });
  }

  const claimedAt = new Date().toISOString();
  await claimCase(caseId, slackUser).catch(() => null);

  const newBlocks = buildClaimedBlocks(originalBlocks, slackUser.name, claimedAt);
  await updateMessage(channelId, messageTs, newBlocks, headerText);
  await postThreadReply(
    channelId,
    messageTs,
    `${display} has claimed this case (${caseId}). They'll reach out to the customer next.`
  );

  return NextResponse.json({ ok: true });
}
