import { NextResponse } from "next/server";

const PROMPT = `You are a relevance classifier for a real estate tenant chat.
The visitor has just selected ONE tenant topic and is now describing their situation in their own words.

Output ONLY a single valid JSON object with this exact shape (no markdown, no commentary):
{ "relevant": true | false }

Decide:
- "relevant": true — the visitor's message could plausibly describe the selected topic, even briefly or vaguely. Be lenient with short or partial descriptions.
- "relevant": false — the message is clearly unrelated: a different tenancy topic, off-topic chat, jokes, programming, weather, philosophy, abuse, or random nonsense.

When in doubt, prefer true.`;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: Request) {
  const { topic, message } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ relevant: true, demo: true });
  }

  const userPrompt = `Selected topic: ${topic}\nVisitor message: """${String(message ?? "").slice(0, 1500)}"""`;

  const body = {
    systemInstruction: { parts: [{ text: PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 64,
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
      console.error("tenant-check Gemini error:", r.status, JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ relevant: true, error: "api" });
    }
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(raw);
    return NextResponse.json({ relevant: parsed.relevant !== false });
  } catch (err: any) {
    console.error("tenant-check failed:", err?.message);
    return NextResponse.json({ relevant: true, error: "exception" });
  }
}
