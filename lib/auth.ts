import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { agents, Agent } from "./data/agents";

// Stateless HMAC-signed tokens. Magic links and session cookies both use the
// same `<base64url(payload)>.<hmac-sha256(payload)>` shape and survive on
// read-only filesystems (Vercel/Lambda) where no session DB is available.

const SESSION_COOKIE = "cj_staff_session";
const TOKEN_TTL_MS = 1000 * 60 * 30; // magic link
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // signed-in session

type MagicPayload = {
  kind: "magic";
  email: string;
  agentSlug: string;
  exp: number;
};

type SessionPayload = {
  kind: "session";
  email: string;
  agentSlug: string;
  exp: number;
};

function getSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.SLACK_SIGNING_SECRET ||
    "cj-dev-fallback-secret-change-in-prod"
  );
}

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

function verify<T extends { exp?: number }>(token: string): T | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as T;
    if (typeof decoded.exp === "number" && decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function findStaffByEmail(email: string): Agent | undefined {
  const lower = email.trim().toLowerCase();
  return agents.find((a) => a.email.toLowerCase() === lower);
}

export async function createMagicToken(email: string): Promise<string | null> {
  const staff = findStaffByEmail(email);
  if (!staff) return null;
  return sign({
    kind: "magic",
    email: staff.email.toLowerCase(),
    agentSlug: staff.slug,
    exp: Date.now() + TOKEN_TTL_MS,
  } satisfies MagicPayload);
}

export async function consumeMagicToken(
  token: string
): Promise<{ email: string; agentSlug: string } | null> {
  const decoded = verify<MagicPayload>(token);
  if (!decoded || decoded.kind !== "magic") return null;
  return { email: decoded.email, agentSlug: decoded.agentSlug };
}

export async function setSessionCookie(magicToken: string) {
  const decoded = verify<MagicPayload>(magicToken);
  if (!decoded || decoded.kind !== "magic") return;
  const sessionToken = sign({
    kind: "session",
    email: decoded.email,
    agentSlug: decoded.agentSlug,
    exp: Date.now() + SESSION_TTL_MS,
  } satisfies SessionPayload);
  const c = await cookies();
  c.set(SESSION_COOKIE, sessionToken, {
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
  const decoded = verify<SessionPayload>(token);
  if (!decoded || decoded.kind !== "session") return null;
  return agents.find((a) => a.slug === decoded.agentSlug) ?? null;
}

export async function logout() {
  await clearSessionCookie();
}
