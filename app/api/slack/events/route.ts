import { NextResponse, after } from "next/server";
import crypto from "node:crypto";
import { describeImage } from "@/lib/gemini-vision";

// Slack Events API endpoint. Listens for image uploads in #news-letter-maker
// and replies in-thread with a Gemini-generated description.
//
// Slack App configuration required:
//   • Event Subscriptions → Request URL: https://<host>/api/slack/events
//   • Subscribe to bot events: message.channels, file_shared (optional)
//   • Bot Token Scopes: channels:history, channels:read, chat:write, files:read
//   • Reinstall app to workspace, invite bot to #news-letter-maker

export const runtime = "nodejs";

const TARGET_CHANNEL = process.env.SLACK_NEWSLETTER_CHANNEL || "news-letter-maker";

// Channel id → name cache (events only carry the id).
const channelNameCache = new Map<string, string>();

async function getChannelName(channelId: string): Promise<string | null> {
  const cached = channelNameCache.get(channelId);
  if (cached) return cached;
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return null;
  try {
    const r = await fetch(
      `https://slack.com/api/conversations.info?channel=${encodeURIComponent(channelId)}`,
      { headers: { Authorization: `Bearer ${botToken}` } }
    );
    const data = await r.json();
    if (!data.ok) {
      console.error("conversations.info failed:", data.error);
      return null;
    }
    const name = data.channel?.name as string | undefined;
    if (name) channelNameCache.set(channelId, name);
    return name ?? null;
  } catch (err: any) {
    console.error("conversations.info error:", err?.message);
    return null;
  }
}

function verifySignature(req: Request, rawBody: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    console.error("events: SLACK_SIGNING_SECRET not set");
    return false;
  }
  const ts = req.headers.get("x-slack-request-timestamp");
  const sig = req.headers.get("x-slack-signature");
  if (!ts || !sig) return false;
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

async function downloadSlackFile(
  urlPrivate: string
): Promise<{ bytes: Buffer; mime: string } | null> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return null;
  const r = await fetch(urlPrivate, {
    headers: { Authorization: `Bearer ${botToken}` },
  });
  if (!r.ok) {
    console.error("slack file download failed:", r.status, urlPrivate);
    return null;
  }
  const mime = r.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await r.arrayBuffer());
  return { bytes: buf, mime };
}

async function postThreadMessage(channel: string, thread_ts: string, text: string) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return;
  try {
    const r = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel, thread_ts, text, unfurl_links: false, unfurl_media: false }),
    });
    const data = await r.json();
    if (!data.ok) console.error("chat.postMessage failed:", data.error);
  } catch (err: any) {
    console.error("chat.postMessage error:", err?.message);
  }
}

async function handleImageMessage(event: any) {
  const channelId = event.channel as string;
  const ts = event.ts as string;
  const files = (event.files ?? []) as any[];
  const imageFiles = files.filter((f) => typeof f?.mimetype === "string" && f.mimetype.startsWith("image/"));
  console.log("handleImageMessage: image count =", imageFiles.length);
  if (!imageFiles.length) return;

  for (const file of imageFiles) {
    const label = file.name || "image";
    console.log("handleImageMessage: processing", { name: label, mime: file.mimetype });
    try {
      const dl = await downloadSlackFile(file.url_private);
      if (!dl) {
        console.error("handleImageMessage: download returned null for", label);
        await postThreadMessage(channelId, ts, `⚠️ 이미지를 불러오지 못했습니다 (${label}).`);
        continue;
      }
      console.log("handleImageMessage: downloaded", { bytes: dl.bytes.length, mime: dl.mime });

      await postThreadMessage(channelId, ts, `📤 \`${label}\` Gemini API로 전송 중...`);
      await postThreadMessage(channelId, ts, `⏳ AI 응답을 기다리는 중...`);

      const description = await describeImage(dl.bytes, dl.mime);
      console.log("handleImageMessage: gemini ok, length =", description.length);

      await postThreadMessage(channelId, ts, `✅ AI 분석 완료`);
      await postThreadMessage(channelId, ts, `🖼️ *${label}*\n${description}`);
    } catch (err: any) {
      console.error("gemini analysis failed:", err?.message ?? err);
      await postThreadMessage(
        channelId,
        ts,
        `❌ 이미지 분석 실패: ${err?.message ?? "unknown"}`
      );
    }
  }
}

// Naive in-memory dedupe — Slack retries the same event_id on timeouts.
const seenEventIds = new Set<string>();
function rememberEvent(id: string | undefined): boolean {
  if (!id) return false;
  if (seenEventIds.has(id)) return true;
  seenEventIds.add(id);
  if (seenEventIds.size > 1000) {
    const first = seenEventIds.values().next().value;
    if (first) seenEventIds.delete(first);
  }
  return false;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/slack/events",
    targetChannel: TARGET_CHANNEL,
    env: {
      SLACK_BOT_TOKEN: !!process.env.SLACK_BOT_TOKEN,
      SLACK_SIGNING_SECRET: !!process.env.SLACK_SIGNING_SECRET,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    },
    note: "POST endpoint for Slack Events API. Configure in Slack App > Event Subscriptions.",
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // URL verification handshake (during initial Slack App setup).
  if (body?.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (rememberEvent(body.event_id)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const event = body.event;
  console.log("slack/events received:", {
    type: event?.type,
    subtype: event?.subtype,
    channel: event?.channel,
    has_files: Array.isArray(event?.files),
    file_count: event?.files?.length ?? 0,
    bot_id: event?.bot_id,
  });

  if (!event || event.type !== "message") {
    return NextResponse.json({ ok: true });
  }

  // Ignore the bot's own messages (avoid loops).
  if (event.bot_id || event.subtype === "bot_message") {
    return NextResponse.json({ ok: true });
  }

  const hasImageFiles =
    Array.isArray(event.files) &&
    event.files.some((f: any) => typeof f?.mimetype === "string" && f.mimetype.startsWith("image/"));
  if (!hasImageFiles) {
    return NextResponse.json({ ok: true });
  }

  const channelName = await getChannelName(event.channel);
  console.log("slack/events channel resolved:", { id: event.channel, name: channelName, target: TARGET_CHANNEL });
  if (channelName !== TARGET_CHANNEL) {
    return NextResponse.json({ ok: true, skipped: "not target channel" });
  }

  // Slack expects a 200 within 3s. `after` keeps the serverless function alive
  // for the heavy lifting (Slack download → Gemini → post reply) instead of
  // killing it the moment we respond.
  after(async () => {
    try {
      await handleImageMessage(event);
    } catch (err: any) {
      console.error("handleImageMessage error:", err?.message ?? err);
    }
  });

  return NextResponse.json({ ok: true });
}
