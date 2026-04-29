import { NextResponse, after } from "next/server";
import crypto from "node:crypto";
import sharp from "sharp";
import { postThreadReply } from "@/lib/slack-webhook";
import { describeImage } from "@/lib/gemini-vision";
import { buildNewsletterPdf, NewsletterForm } from "@/lib/newsletter-pdf";
import { uploadFileToThread } from "@/lib/slack-files";

// Slack POSTs here whenever an interactive component is used.
// Handles three flows:
//   1. block_actions / claim_case        → existing "Click to Claim" thread reply
//   2. block_actions / start_newsletter_form → open the newsletter modal
//   3. view_submission / newsletter_submit   → run Gemini, build PDF, upload to thread

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/slack/interactions",
    env: {
      SLACK_BOT_TOKEN: !!process.env.SLACK_BOT_TOKEN,
      SLACK_SIGNING_SECRET: !!process.env.SLACK_SIGNING_SECRET,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    },
  });
}

function verifySignature(req: Request, rawBody: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    console.error("interactions: SLACK_SIGNING_SECRET not set");
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

async function slack(method: string, body: any) {
  const botToken = process.env.SLACK_BOT_TOKEN!;
  const r = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

function buildNewsletterModal(privateMetadata: string) {
  return {
    type: "modal",
    callback_id: "newsletter_submit",
    private_metadata: privateMetadata,
    title: { type: "plain_text", text: "뉴스레터 만들기" },
    submit: { type: "plain_text", text: "Submit" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "input",
        block_id: "address",
        label: { type: "plain_text", text: "매물 주소" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "예: 123 Walker St, Rhodes NSW 2138" },
        },
      },
      {
        type: "input",
        block_id: "property_type",
        label: { type: "plain_text", text: "매물 종류" },
        element: {
          type: "static_select",
          action_id: "value",
          options: [
            { text: { type: "plain_text", text: "Apartment" }, value: "Apartment" },
            { text: { type: "plain_text", text: "House" }, value: "House" },
            { text: { type: "plain_text", text: "Townhouse" }, value: "Townhouse" },
            { text: { type: "plain_text", text: "Studio" }, value: "Studio" },
            { text: { type: "plain_text", text: "Other" }, value: "Other" },
          ],
        },
      },
      {
        type: "input",
        block_id: "price",
        label: { type: "plain_text", text: "가격 (또는 가격대)" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "$850,000 또는 $800K – $900K" },
        },
      },
      {
        type: "input",
        block_id: "beds_baths",
        label: { type: "plain_text", text: "침실 / 욕실 / 주차" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "예: 3 / 2 / 1" },
        },
      },
      {
        type: "input",
        block_id: "highlights",
        label: { type: "plain_text", text: "주요 특징 / 강조 포인트" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "예: 워터프론트 뷰, 최근 리노베이션, 학군 우수",
          },
        },
      },
      {
        type: "input",
        block_id: "agent",
        optional: true,
        label: { type: "plain_text", text: "담당 에이전트 (선택)" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "예: Alex Lee" },
        },
      },
    ],
  };
}

async function fetchSlackImage(
  fileId: string
): Promise<{ bytes: Buffer; mime: string } | null> {
  const botToken = process.env.SLACK_BOT_TOKEN!;
  const info = await fetch(
    `https://slack.com/api/files.info?file=${encodeURIComponent(fileId)}`,
    { headers: { Authorization: `Bearer ${botToken}` } }
  ).then((r) => r.json());
  if (!info.ok) {
    console.error("files.info failed:", info.error);
    return null;
  }
  const url = info.file?.url_private as string | undefined;
  if (!url) return null;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${botToken}` } });
  if (!r.ok) {
    console.error("file download failed:", r.status);
    return null;
  }
  const mime = (info.file?.mimetype as string) || r.headers.get("content-type") || "image/jpeg";
  const bytes = Buffer.from(await r.arrayBuffer());
  return { bytes, mime };
}

const NEWSLETTER_PROMPT = `당신은 부동산 뉴스레터 카피라이터입니다. 첨부된 사진과 아래 매물 정보를 바탕으로 한국어로 200자 안팎(±30자)의 뉴스레터 본문을 작성해주세요.

규칙:
- 사진에서 보이는 시각적 특징(채광, 인테리어, 분위기, 전망, 주변 환경 등)을 자연스럽게 녹여주세요.
- 매물의 강점을 강조하되 과장하지 말 것.
- 부동산 광고 톤. 짧고 정돈된 문장.
- 본문만 출력하세요. 머리말, 라벨, 따옴표 등 부가 표현은 넣지 마세요.

매물 정보:
- 주소: {address}
- 종류: {property_type}
- 가격: {price}
- 침실/욕실/주차: {beds_baths}
- 강조 포인트: {highlights}
- 담당 에이전트: {agent}`;

function buildNewsletterPrompt(form: NewsletterForm): string {
  return NEWSLETTER_PROMPT.replace("{address}", form.address || "—")
    .replace("{property_type}", form.propertyType || "—")
    .replace("{price}", form.price || "—")
    .replace("{beds_baths}", form.bedsBaths || "—")
    .replace("{highlights}", form.highlights || "—")
    .replace("{agent}", form.agent || "—");
}

async function processNewsletterSubmission(opts: {
  channel: string;
  thread_ts: string;
  fileId: string;
  form: NewsletterForm;
  userId?: string;
}) {
  const { channel, thread_ts, fileId, form } = opts;

  await postThreadReply(channel, thread_ts, `📥 매물 정보 수신. 사진 가져오는 중...`);
  const dl = await fetchSlackImage(fileId);
  if (!dl) {
    await postThreadReply(channel, thread_ts, `❌ 사진을 가져오지 못했습니다.`);
    return;
  }

  await postThreadReply(channel, thread_ts, `📤 Gemini로 분석 요청 중...`);
  let body: string;
  try {
    body = await describeImage(dl.bytes, dl.mime, buildNewsletterPrompt(form));
    console.log("newsletter: gemini ok, length =", body.length);
  } catch (err: any) {
    console.error("newsletter: gemini failed:", err?.message);
    await postThreadReply(channel, thread_ts, `❌ AI 분석 실패: ${err?.message ?? "unknown"}`);
    return;
  }

  await postThreadReply(channel, thread_ts, `🧾 PDF 생성 중...`);

  // pdf-lib only embeds JPEG and PNG. Convert anything else (webp, heic, gif,
  // avif, …) to JPEG with sharp before passing it on.
  let imageBytes = dl.bytes;
  let imageMime = dl.mime;
  const isJpegOrPng =
    imageMime.includes("jpeg") || imageMime.includes("jpg") || imageMime.includes("png");
  if (!isJpegOrPng) {
    try {
      console.log("newsletter: converting", imageMime, "→ image/jpeg");
      const out = await sharp(dl.bytes).jpeg({ quality: 88 }).toBuffer();
      imageBytes = out;
      imageMime = "image/jpeg";
    } catch (err: any) {
      console.error("newsletter: sharp convert failed:", err?.message);
      await postThreadReply(
        channel,
        thread_ts,
        `❌ 이미지 변환 실패 (${dl.mime}): ${err?.message ?? "unknown"}`
      );
      return;
    }
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildNewsletterPdf({
      form,
      body,
      imageBytes,
      imageMime,
    });
  } catch (err: any) {
    console.error("newsletter: pdf build failed:", err?.message);
    await postThreadReply(channel, thread_ts, `❌ PDF 생성 실패: ${err?.message ?? "unknown"}`);
    return;
  }

  const filename = `newsletter-${Date.now()}.pdf`;
  const upload = await uploadFileToThread({
    channel,
    thread_ts,
    filename,
    title: form.address ? `${form.address} 뉴스레터` : "뉴스레터",
    initial_comment: `✅ 뉴스레터 PDF가 준비됐습니다. 아래 파일을 클릭해 다운로드하세요.`,
    bytes: pdfBytes,
  });
  if (!upload.ok) {
    await postThreadReply(channel, thread_ts, `❌ PDF 업로드 실패: ${upload.error ?? "unknown"}`);
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const payloadJson = params.get("payload");
  if (!payloadJson) return NextResponse.json({ error: "No payload" }, { status: 400 });

  let payload: any;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // ---- block_actions ----
  if (payload.type === "block_actions") {
    const action = payload.actions?.[0];
    const actionId = action?.action_id;

    if (actionId === "claim_case") {
      const channelId = payload.channel?.id ?? "";
      const messageTs = payload.message?.ts ?? "";
      if (!channelId || !messageTs) return NextResponse.json({ ok: true });
      const userId = payload.user?.id as string | undefined;
      const userName = payload.user?.name ?? payload.user?.username ?? "Unknown";
      const display = userId ? `<@${userId}>` : userName;
      await postThreadReply(
        channelId,
        messageTs,
        `${display} has taken ownership of this case. ${display} will follow up on this case and provide updates.`
      );
      return NextResponse.json({ ok: true });
    }

    if (actionId === "start_newsletter_form") {
      let value: { file_id: string; channel: string; thread_ts: string };
      try {
        value = JSON.parse(action.value);
      } catch {
        return NextResponse.json({ ok: true });
      }
      const view = buildNewsletterModal(JSON.stringify(value));
      const r = await slack("views.open", { trigger_id: payload.trigger_id, view });
      if (!r.ok) console.error("views.open failed:", r.error, r.response_metadata);
      return NextResponse.json({ ok: true });
    }

    console.warn("interactions: unhandled action_id", actionId);
    return NextResponse.json({ ok: true });
  }

  // ---- view_submission (newsletter form) ----
  if (payload.type === "view_submission" && payload.view?.callback_id === "newsletter_submit") {
    let meta: { file_id: string; channel: string; thread_ts: string };
    try {
      meta = JSON.parse(payload.view.private_metadata);
    } catch {
      return NextResponse.json({ response_action: "errors", errors: { address: "Internal error" } });
    }

    const v = payload.view.state.values;
    const form: NewsletterForm = {
      address: v.address?.value?.value ?? "",
      propertyType: v.property_type?.value?.selected_option?.value ?? "",
      price: v.price?.value?.value ?? "",
      bedsBaths: v.beds_baths?.value?.value ?? "",
      highlights: v.highlights?.value?.value ?? "",
      agent: v.agent?.value?.value ?? "",
    };

    after(async () => {
      try {
        await processNewsletterSubmission({
          channel: meta.channel,
          thread_ts: meta.thread_ts,
          fileId: meta.file_id,
          form,
          userId: payload.user?.id,
        });
      } catch (err: any) {
        console.error("processNewsletterSubmission error:", err?.message ?? err);
      }
    });

    // Close the modal immediately; the heavy work runs in `after`.
    return NextResponse.json({ response_action: "clear" });
  }

  return NextResponse.json({ ok: true });
}
