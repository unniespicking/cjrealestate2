import { NextResponse } from "next/server";

// Server-side lead intake — forwards to Slack webhook + HubSpot when configured.
// In demo mode, just echoes the payload.

export async function POST(req: Request) {
  const lead = await req.json();
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  if (slackUrl) {
    try {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New lead: ${lead.name} — ${lead.intent} in ${lead.suburb}`,
          blocks: [
            { type: "header", text: { type: "plain_text", text: `${lead.intent} — ${lead.suburb}` } },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Name*\n${lead.name}` },
                { type: "mrkdwn", text: `*Contact*\n${lead.contact}` },
                { type: "mrkdwn", text: `*Language*\n${lead.language}` },
                { type: "mrkdwn", text: `*Suggested agent*\n${lead.agent ?? "queue"}` },
              ],
            },
          ],
        }),
      });
    } catch (err) {
      // Non-fatal in demo.
    }
  }

  return NextResponse.json({ ok: true, demo: !slackUrl, lead });
}
