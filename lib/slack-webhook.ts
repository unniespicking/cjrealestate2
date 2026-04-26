import "server-only";
import { createCase, setCaseTs } from "./slack-cases";

// Server-side Slack delivery.
//   • Preferred: SLACK_BOT_TOKEN — uses chat.postMessage, returns ts, supports
//     interactive buttons (Claim) and threaded replies on click.
//   • Fallback: per-channel incoming webhooks (no interactivity).

export type SlackBlock = {
  title: string;
  subtitle?: string;
  fields: { label: string; value: string }[];
  channel: string;
  emoji?: string;
  category?: string;
};

function getWebhookFor(channel: string): string | undefined {
  switch (channel) {
    case "#customer-direct-requests":
      return process.env.SLACK_CUSTOMER_REQUESTS_WEBHOOK_URL;
    case "#ai_conversation_received":
      return process.env.SLACK_AI_CONVERSATIONS_WEBHOOK_URL ?? process.env.SLACK_WEBHOOK_URL;
    default:
      return process.env.SLACK_WEBHOOK_URL;
  }
}

const CLAIM_CHANNELS = new Set([
  "#ai_conversation_received",
  "#customer-direct-requests",
]);

function buildBlocks(block: SlackBlock, caseId: string) {
  const blocks: any[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${block.emoji ?? ""} ${block.title}`.trim() },
    },
  ];
  if (block.subtitle) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: block.subtitle }],
    });
  }
  if (block.fields.length) {
    blocks.push({
      type: "section",
      fields: block.fields.slice(0, 10).map((f) => ({
        type: "mrkdwn",
        text: `*${f.label}*\n${f.value}`,
      })),
    });
  }
  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: `_Case ID: \`${caseId}\`_` }],
  });
  if (CLAIM_CHANNELS.has(block.channel)) {
    blocks.push({
      type: "actions",
      block_id: "claim_actions",
      elements: [
        {
          type: "button",
          action_id: "claim_case",
          value: caseId,
          style: "primary",
          text: { type: "plain_text", text: "Click to Claim", emoji: true },
        },
      ],
    });
  }
  return blocks;
}

export async function postToSlack(block: SlackBlock): Promise<{
  delivered: boolean;
  caseId: string;
  via: "bot" | "webhook" | "none";
  ts?: string;
  channel_id?: string;
}> {
  // Always create a case row first so the demo panel + real Slack share an id.
  const c = await createCase({
    channel: block.channel,
    title: block.title,
    subtitle: block.subtitle,
    category: block.category,
  });
  const caseId = c.id;

  const blocks = buildBlocks(block, caseId);
  const text = block.title;

  // Path 1: Bot token (preferred — supports interactivity)
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (botToken) {
    try {
      const r = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${botToken}`,
        },
        body: JSON.stringify({
          channel: block.channel,
          text,
          blocks,
          unfurl_links: false,
          unfurl_media: false,
        }),
      });
      const data = await r.json();
      if (data.ok) {
        await setCaseTs(caseId, data.channel, data.ts);
        return {
          delivered: true,
          caseId,
          via: "bot",
          ts: data.ts,
          channel_id: data.channel,
        };
      }
      console.error("Slack bot post failed:", data.error);
    } catch (err) {
      console.error("Slack bot post error:", err);
    }
  }

  // Path 2: Incoming webhook (no interactivity)
  const url = getWebhookFor(block.channel);
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          channel: block.channel,
          blocks,
        }),
      });
      return { delivered: true, caseId, via: "webhook" };
    } catch {}
  }

  return { delivered: false, caseId, via: "none" };
}

export async function postThreadReply(
  channel_id: string,
  thread_ts: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    console.error("postThreadReply: SLACK_BOT_TOKEN not set");
    return { ok: false, error: "missing_bot_token" };
  }
  try {
    const r = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channel_id, thread_ts, text }),
    });
    const data = await r.json();
    if (!data.ok) {
      console.error("postThreadReply Slack error:", data.error, "channel:", channel_id, "thread_ts:", thread_ts);
      return { ok: false, error: data.error };
    }
    return { ok: true };
  } catch (err: any) {
    console.error("postThreadReply fetch error:", err?.message);
    return { ok: false, error: err?.message };
  }
}

export async function updateMessage(
  channel_id: string,
  ts: string,
  blocks: any[],
  text: string
): Promise<{ ok: boolean }> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return { ok: false };
  try {
    const r = await fetch("https://slack.com/api/chat.update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channel_id, ts, blocks, text }),
    });
    const data = await r.json();
    return { ok: !!data.ok };
  } catch {
    return { ok: false };
  }
}

export function buildClaimedBlocks(originalBlocks: any[], claimerName: string, claimedAt: string): any[] {
  // Strip old action button, append a "claimed by" context.
  const filtered = originalBlocks.filter(
    (b) => !(b.type === "actions" || (b.type === "context" && b.elements?.[0]?.text?.includes("Click Claim")))
  );
  filtered.push({
    type: "context",
    elements: [
      { type: "mrkdwn", text: `✅ *Claimed by ${claimerName}* · ${new Date(claimedAt).toLocaleString("en-AU", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}` },
    ],
  });
  return filtered;
}
