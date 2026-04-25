import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { writeCsvRows, parseCsv } from "./csv";

const CSV_PATH = path.join(process.cwd(), "database", "conversations.csv");

// Vercel/Lambda-style serverless filesystems are read-only — skip persistence.
const SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const HEADERS = [
  "id",
  "started_at",
  "ended_at",
  "language",
  "intent",
  "suburb",
  "name",
  "contact",
  "message_count",
  "summary",
  "transcript",
];

export type Conversation = {
  id: string;
  started_at: string;
  ended_at: string;
  language: string;
  intent: string;
  suburb: string;
  name: string;
  contact: string;
  message_count: number;
  summary: string;
  transcript: { role: string; text: string }[];
};

async function ensure() {
  try {
    await fs.mkdir(path.dirname(CSV_PATH), { recursive: true });
    await fs.access(CSV_PATH);
  } catch {
    try {
      await fs.writeFile(CSV_PATH, writeCsvRows(HEADERS, []), "utf-8");
    } catch {
      // Read-only filesystem — readers/writers below will no-op.
    }
  }
}

function safeJson<T>(v: string, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export async function getConversations(): Promise<Conversation[]> {
  if (SERVERLESS) return [];
  await ensure();
  let text: string;
  try {
    text = await fs.readFile(CSV_PATH, "utf-8");
  } catch {
    return [];
  }
  const { rows } = parseCsv(text);
  return rows.map((r) => ({
    id: r.id,
    started_at: r.started_at,
    ended_at: r.ended_at,
    language: r.language,
    intent: r.intent,
    suburb: r.suburb,
    name: r.name,
    contact: r.contact,
    message_count: Number(r.message_count || 0),
    summary: r.summary,
    transcript: safeJson<Conversation["transcript"]>(r.transcript, []),
  }));
}

export async function saveConversation(c: Conversation) {
  if (SERVERLESS) return;
  const all = await getConversations();
  all.push(c);
  const rows = all.map((x) => ({
    id: x.id,
    started_at: x.started_at,
    ended_at: x.ended_at,
    language: x.language,
    intent: x.intent,
    suburb: x.suburb,
    name: x.name,
    contact: x.contact,
    message_count: String(x.message_count),
    summary: x.summary,
    transcript: JSON.stringify(x.transcript),
  }));
  try {
    await fs.writeFile(CSV_PATH, writeCsvRows(HEADERS, rows), "utf-8");
  } catch {
    // Read-only filesystem — drop the write.
  }
}

export async function generateConversationId(): Promise<string> {
  if (SERVERLESS) {
    return `conv-${Date.now().toString(36)}`;
  }
  const all = await getConversations();
  return `conv-${String(all.length + 1).padStart(4, "0")}`;
}
