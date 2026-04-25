import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { agents, Agent } from "./data/agents";

const SESSIONS_PATH = path.join(process.cwd(), "database", "sessions.json");
const SESSION_COOKIE = "cj_staff_session";
const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 min for pending magic links
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h for active sessions

type SessionRecord = {
  email: string;
  agentSlug: string;
  verified: boolean;
  expires: number;
};

async function readSessions(): Promise<Record<string, SessionRecord>> {
  try {
    const txt = await fs.readFile(SESSIONS_PATH, "utf-8");
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

async function writeSessions(s: Record<string, SessionRecord>) {
  await fs.mkdir(path.dirname(SESSIONS_PATH), { recursive: true });
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(s, null, 2), "utf-8");
}

function clean(sessions: Record<string, SessionRecord>) {
  const now = Date.now();
  for (const k of Object.keys(sessions)) {
    if (sessions[k].expires < now) delete sessions[k];
  }
}

export function findStaffByEmail(email: string): Agent | undefined {
  const lower = email.trim().toLowerCase();
  return agents.find((a) => a.email.toLowerCase() === lower);
}

export async function createMagicToken(email: string): Promise<string | null> {
  const staff = findStaffByEmail(email);
  if (!staff) return null;
  const sessions = await readSessions();
  clean(sessions);
  const token = crypto.randomBytes(20).toString("hex");
  sessions[token] = {
    email: staff.email.toLowerCase(),
    agentSlug: staff.slug,
    verified: false,
    expires: Date.now() + TOKEN_TTL_MS,
  };
  await writeSessions(sessions);
  return token;
}

export async function consumeMagicToken(token: string): Promise<SessionRecord | null> {
  const sessions = await readSessions();
  clean(sessions);
  const record = sessions[token];
  if (!record || record.verified) return null;
  // upgrade to active session
  sessions[token] = { ...record, verified: true, expires: Date.now() + SESSION_TTL_MS };
  await writeSessions(sessions);
  return sessions[token];
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}

export async function getCurrentStaff(): Promise<Agent | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sessions = await readSessions();
  clean(sessions);
  const record = sessions[token];
  if (!record || !record.verified) return null;
  return agents.find((a) => a.slug === record.agentSlug) ?? null;
}

export async function logout() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) {
    const sessions = await readSessions();
    delete sessions[token];
    await writeSessions(sessions);
  }
  await clearSessionCookie();
}
