import { NextResponse } from "next/server";
import { postToSlack } from "@/lib/slack-webhook";

type Category =
  | "instant_appraisal"
  | "inspection_booking"
  | "rental_application"
  | "formal_appraisal";

const META: Record<Category, { emoji: string; label: string }> = {
  instant_appraisal: { emoji: "💰", label: "INSTANT APPRAISAL" },
  inspection_booking: { emoji: "📅", label: "INSPECTION BOOKING" },
  rental_application: { emoji: "🔑", label: "RENTAL APPLICATION" },
  formal_appraisal: { emoji: "📋", label: "FORMAL APPRAISAL" },
};

export async function POST(req: Request) {
  const body = await req.json();
  const { category, title, subtitle, fields } = body as {
    category: Category;
    title?: string;
    subtitle?: string;
    fields?: { label: string; value: string }[];
  };

  const meta = META[category];
  if (!meta) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const slackPayload = {
    channel: "#customer-direct-requests",
    title: `[${meta.label}] ${title ?? ""}`.trim(),
    subtitle: subtitle ?? "",
    fields: fields ?? [],
    emoji: meta.emoji,
  };

  const result = await postToSlack(slackPayload);

  return NextResponse.json({
    ok: true,
    slackPayload,
    delivered: result.delivered,
  });
}
