import { NextResponse } from "next/server";
import crypto from "node:crypto";

// Slack Events API endpoint. When an image is uploaded to #news-letter-maker,
// post a "📋 뉴스레터 만들기" button in-thread. Clicking it opens a modal
// (handled in /api/slack/interactions) that captures listing data and triggers
// the Gemini-powered PDF newsletter build.
//
// Slack App configuration required:
//   • Event Subscriptions → Request URL: https://<host>/api/slack/events
//   • Subscribe to bot events: message.channels
//   • Bot Token Scopes: channels:history, channels:read, chat:write, files:read
//   • Reinstall app to workspace, invite bot to #news-letter-maker

export const runtime = "nodejs";

const TARGET_CHANNEL = process.env.SLACK_NEWSLETTER_CHANNEL || "news-letter-maker";

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

async function postNewsletterButton(opts: {
  channel: string;
  thread_ts: string;
  fileId: string;
  fileName: string;
}) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return;

  const buttonValue = JSON.stringify({
    file_id: opts.fileId,
    channel: opts.channel,
    thread_ts: opts.thread_ts,
  });

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🏠 *${opts.fileName}* 사진을 받았습니다.\n뉴스레터로 만들려면 아래 버튼을 눌러 매물 정보를 입력해주세요.`,
      },
    },
    {
      type: "actions",
      block_id: "newsletter_actions",
      elements: [
        {
          type: "button",
          action_id: "start_newsletter_form",
          value: buttonValue,
          style: "primary",
          text: { type: "plain_text", text: "📋 뉴스레터 만들기", emoji: true },
        },
      ],
    },
  ];

  try {
    const r = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: opts.channel,
        thread_ts: opts.thread_ts,
        text: "뉴스레터 만들기",
        blocks,
        unfurl_links: false,
        unfurl_media: false,
      }),
    });
    const data = await r.json();
    if (!data.ok) console.error("postNewsletterButton failed:", data.error);
  } catch (err: any) {
    console.error("postNewsletterButton error:", err?.message);
  }
}

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
  if (event.bot_id || event.subtype === "bot_message") {
    return NextResponse.json({ ok: true });
  }

  const imageFile = Array.isArray(event.files)
    ? event.files.find((f: any) => typeof f?.mimetype === "string" && f.mimetype.startsWith("image/"))
    : null;
  if (!imageFile) {
    return NextResponse.json({ ok: true });
  }

  const channelName = await getChannelName(event.channel);
  console.log("slack/events channel resolved:", {
    id: event.channel,
    name: channelName,
    target: TARGET_CHANNEL,
  });
  if (channelName !== TARGET_CHANNEL) {
    return NextResponse.json({ ok: true, skipped: "not target channel" });
  }

  await postNewsletterButton({
    channel: event.channel,
    thread_ts: event.ts,
    fileId: imageFile.id,
    fileName: imageFile.name || "image",
  });

  return NextResponse.json({ ok: true });
}
