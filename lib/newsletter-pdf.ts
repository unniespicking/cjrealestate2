import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Builds a single-page A4 newsletter PDF combining the property photo,
// the user-submitted facts, and the Gemini-generated body copy.

export type NewsletterForm = {
  address: string;
  propertyType: string;
  price: string;
  bedsBaths: string;
  highlights: string;
  agent?: string;
};

const KOREAN_FONT_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Regular.otf";
const KOREAN_FONT_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Bold.otf";

let regularFontCache: ArrayBuffer | null = null;
let boldFontCache: ArrayBuffer | null = null;

async function fetchFont(url: string, bold: boolean): Promise<ArrayBuffer> {
  if (bold && boldFontCache) return boldFontCache;
  if (!bold && regularFontCache) return regularFontCache;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`font fetch failed: ${r.status} ${url}`);
  const buf = await r.arrayBuffer();
  if (bold) boldFontCache = buf;
  else regularFontCache = buf;
  return buf;
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let current = "";
    for (const ch of paragraph) {
      const next = current + ch;
      if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
        lines.push(current);
        current = ch;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    lines.push("");
  }
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export async function buildNewsletterPdf(opts: {
  form: NewsletterForm;
  body: string;
  imageBytes: Buffer;
  imageMime: string;
}): Promise<Uint8Array> {
  const { form, body, imageBytes, imageMime } = opts;

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const [regularBuf, boldBuf] = await Promise.all([
    fetchFont(KOREAN_FONT_URL, false),
    fetchFont(KOREAN_FONT_BOLD_URL, true),
  ]);
  const regular = await pdf.embedFont(regularBuf);
  const bold = await pdf.embedFont(boldBuf);

  // A4 portrait: 595 x 842 points
  const page = pdf.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 48;
  const ink = rgb(0.07, 0.07, 0.07);
  const muted = rgb(0.42, 0.42, 0.42);
  const copper = rgb(0.72, 0.45, 0.2);

  let cursorY = height - margin;

  // Header bar
  page.drawText("CJ REAL ESTATE", { x: margin, y: cursorY, font: bold, size: 11, color: copper });
  page.drawText("NEWSLETTER", { x: margin + 110, y: cursorY, font: regular, size: 11, color: muted });
  cursorY -= 28;

  // Address (headline)
  const addressLines = wrapText(form.address || "", bold, 22, width - margin * 2);
  for (const line of addressLines) {
    page.drawText(line, { x: margin, y: cursorY, font: bold, size: 22, color: ink });
    cursorY -= 28;
  }
  cursorY -= 4;

  // Image
  let image;
  if (imageMime.includes("png")) {
    image = await pdf.embedPng(imageBytes);
  } else {
    try {
      image = await pdf.embedJpg(imageBytes);
    } catch {
      image = await pdf.embedPng(imageBytes);
    }
  }
  const maxImgW = width - margin * 2;
  const maxImgH = 280;
  const scale = Math.min(maxImgW / image.width, maxImgH / image.height);
  const imgW = image.width * scale;
  const imgH = image.height * scale;
  page.drawImage(image, { x: margin, y: cursorY - imgH, width: imgW, height: imgH });
  cursorY -= imgH + 24;

  // Quick facts row
  const facts: { label: string; value: string }[] = [
    { label: "TYPE", value: form.propertyType || "—" },
    { label: "PRICE", value: form.price || "—" },
    { label: "BEDS / BATHS / CAR", value: form.bedsBaths || "—" },
  ];
  const colW = (width - margin * 2) / facts.length;
  for (let i = 0; i < facts.length; i++) {
    const x = margin + i * colW;
    page.drawText(facts[i].label, { x, y: cursorY, font: regular, size: 9, color: muted });
    page.drawText(facts[i].value, { x, y: cursorY - 16, font: bold, size: 13, color: ink });
  }
  cursorY -= 44;

  // Divider
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: width - margin, y: cursorY },
    thickness: 0.5,
    color: muted,
  });
  cursorY -= 20;

  // Body copy
  const bodyLines = wrapText(body, regular, 12, width - margin * 2);
  for (const line of bodyLines) {
    if (cursorY < margin + 80) break;
    page.drawText(line, { x: margin, y: cursorY, font: regular, size: 12, color: ink, lineHeight: 18 });
    cursorY -= 18;
  }

  // Highlights (smaller)
  if (form.highlights && cursorY > margin + 60) {
    cursorY -= 8;
    page.drawText("HIGHLIGHTS", { x: margin, y: cursorY, font: bold, size: 9, color: muted });
    cursorY -= 14;
    const hi = wrapText(form.highlights, regular, 10, width - margin * 2);
    for (const line of hi) {
      if (cursorY < margin + 30) break;
      page.drawText(line, { x: margin, y: cursorY, font: regular, size: 10, color: ink });
      cursorY -= 14;
    }
  }

  // Footer
  const footerY = margin - 12;
  const footer = form.agent
    ? `${form.agent} · CJ Real Estate · 02 9739 6000`
    : `CJ Real Estate · Shop 5, 46 Walker St Rhodes NSW · 02 9739 6000`;
  page.drawText(footer, { x: margin, y: footerY, font: regular, size: 9, color: muted });

  return await pdf.save();
}
