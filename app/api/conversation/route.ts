import { NextResponse } from "next/server";
import { generateConversationId, saveConversation } from "@/lib/conversations";
import { postToSlack } from "@/lib/slack-webhook";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SUMMARIZE_PROMPT = `You are a real estate intake assistant for CJ Real Estate, a Sydney Inner West agency covering Rhodes, Newington, Meadowbank, Liberty Grove, Wentworth Point, Lidcombe, Silverwater, and Ermington.

Read the conversation between a website visitor and our AI concierge "CJ RealEstate Agent". Extract structured information.

Output ONLY a single valid JSON object — no markdown, no commentary.

Schema:
{
  "intent": "buy" | "sell" | "lease" | "tenant" | "inspect" | "appraisal" | "general",
  "suburb": "<one of our suburbs above, or empty string>",
  "name": "<visitor's name, or empty string>",
  "contact": "<visitor's email or phone, or empty string>",
  "summary": "<2-3 sentences in English summarising what the visitor wants, key preferences and any next-step they expect — regardless of the conversation's original language>"
}

Be conservative: leave fields empty if not explicitly stated.`;

type SummaryShape = {
  intent: string;
  suburb: string;
  name: string;
  contact: string;
  summary: string;
};

async function summarize(messages: any[], language: string): Promise<SummaryShape> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      intent: "general",
      suburb: "",
      name: "",
      contact: "",
      summary: `Conversation in ${language} (${messages.length} messages). Demo mode — Gemini summarisation unavailable until GEMINI_API_KEY is set.`,
    };
  }

  const transcript = messages
    .map((m: any) => `${m.role === "user" ? "Visitor" : "CJ RealEstate Agent"}: ${m.text}`)
    .join("\n");

  const body = {
    systemInstruction: { parts: [{ text: SUMMARIZE_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: transcript }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
  };

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      console.error("Gemini summarise error:", data);
      throw new Error(data?.error?.message ?? "Gemini error");
    }
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(raw);
    return {
      intent: parsed.intent || "general",
      suburb: parsed.suburb || "",
      name: parsed.name || "",
      contact: parsed.contact || "",
      summary: parsed.summary || "(no summary)",
    };
  } catch (err: any) {
    return {
      intent: "general",
      suburb: "",
      name: "",
      contact: "",
      summary: `(Summary unavailable: ${err.message})`,
    };
  }
}

export async function POST(req: Request) {
  const { messages, language } = await req.json();
  if (!Array.isArray(messages) || messages.length < 2) {
    return NextResponse.json({ error: "Conversation too short" }, { status: 400 });
  }

  const summary = await summarize(messages, language || "EN");
  const id = await generateConversationId();
  const endedAt = new Date().toISOString();
  const startedAt = new Date(Date.now() - messages.length * 30 * 1000).toISOString();

  const conv = {
    id,
    started_at: startedAt,
    ended_at: endedAt,
    language: language || "EN",
    intent: summary.intent,
    suburb: summary.suburb,
    name: summary.name,
    contact: summary.contact,
    message_count: messages.length,
    summary: summary.summary,
    transcript: messages,
  };

  await saveConversation(conv);

  const langLabel =
    language === "KO" ? "한국어" : language === "ZH" ? "中文" : "English";

  const slackPayload = {
    channel: "#ai_conversation_received",
    title: `AI conversation — ${summary.intent}`,
    subtitle: [summary.suburb, langLabel].filter(Boolean).join(" · "),
    fields: [
      { label: "Intent", value: summary.intent || "general" },
      { label: "Suburb", value: summary.suburb || "—" },
      { label: "Language", value: langLabel },
      { label: "Name", value: summary.name || "—" },
      { label: "Contact", value: summary.contact || "—" },
      { label: "Messages", value: String(messages.length) },
      { label: "Summary", value: summary.summary },
    ],
    emoji: "🤖",
  };

  await postToSlack(slackPayload);

  return NextResponse.json({
    ok: true,
    conversationId: id,
    slackPayload,
    summary,
  });
}
