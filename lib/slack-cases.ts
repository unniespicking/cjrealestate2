import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { writeCsvRows, parseCsv } from "./csv";

const CSV_PATH = path.join(process.cwd(), "database", "cases.csv");

const HEADERS = [
  "id",
  "posted_at",
  "channel",
  "channel_id",
  "message_ts",
  "title",
  "subtitle",
  "category",
  "claimed_by_user_id",
  "claimed_by_name",
  "claimed_at",
];

export type Case = {
  id: string;
  posted_at: string;
  channel: string;
  channel_id: string;
  message_ts: string;
  title: string;
  subtitle: string;
  category: string;
  claimed_by_user_id: string;
  claimed_by_name: string;
  claimed_at: string;
};

async function ensure() {
  await fs.mkdir(path.dirname(CSV_PATH), { recursive: true });
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(CSV_PATH, writeCsvRows(HEADERS, []), "utf-8");
  }
}

export async function listCases(): Promise<Case[]> {
  await ensure();
  const text = await fs.readFile(CSV_PATH, "utf-8");
  const { rows } = parseCsv(text);
  return rows as unknown as Case[];
}

async function writeAll(all: Case[]) {
  const rows = all.map((c) => ({ ...c })) as unknown as Record<string, string>[];
  await fs.writeFile(CSV_PATH, writeCsvRows(HEADERS, rows), "utf-8");
}

export async function createCase(input: {
  channel: string;
  channel_id?: string;
  message_ts?: string;
  title: string;
  subtitle?: string;
  category?: string;
}): Promise<Case> {
  await ensure();
  const all = await listCases();
  const c: Case = {
    id: `case-${crypto.randomBytes(4).toString("hex")}`,
    posted_at: new Date().toISOString(),
    channel: input.channel,
    channel_id: input.channel_id ?? "",
    message_ts: input.message_ts ?? "",
    title: input.title,
    subtitle: input.subtitle ?? "",
    category: input.category ?? "",
    claimed_by_user_id: "",
    claimed_by_name: "",
    claimed_at: "",
  };
  all.push(c);
  await writeAll(all);
  return c;
}

export async function setCaseTs(id: string, channel_id: string, message_ts: string) {
  const all = await listCases();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], channel_id, message_ts };
  await writeAll(all);
}

export async function claimCase(
  id: string,
  user: { id: string; name: string }
): Promise<Case | null> {
  const all = await listCases();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  if (all[idx].claimed_by_user_id) return all[idx]; // already claimed
  all[idx] = {
    ...all[idx],
    claimed_by_user_id: user.id,
    claimed_by_name: user.name,
    claimed_at: new Date().toISOString(),
  };
  await writeAll(all);
  return all[idx];
}

export async function getCase(id: string): Promise<Case | null> {
  const all = await listCases();
  return all.find((c) => c.id === id) ?? null;
}
