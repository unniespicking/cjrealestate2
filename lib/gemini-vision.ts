import "server-only";

// Image-aware Gemini call. Used by /api/slack/events to describe photos
// uploaded into #news-letter-maker.

const MODEL = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";

const DEFAULT_PROMPT = `이 이미지를 자세히 설명해주세요. 무엇이 보이고, 어떤 분위기·상황·맥락이 느껴지는지 알려주세요. 한국어로 3-5 문장으로 답변해주세요.`;

export async function describeImage(
  imageBytes: Buffer,
  mimeType: string,
  prompt: string = DEFAULT_PROMPT
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBytes.toString("base64"),
            },
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(`Gemini ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned no description");
  }
  return text.trim();
}
