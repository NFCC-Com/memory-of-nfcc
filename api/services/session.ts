import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "../db/client.js";

export const SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await sql`insert into admin_sessions (user_id, token_hash, expires_at) values (${userId}, ${hashToken(token)}, ${expiresAt.toISOString()})`;
  return { token, expiresAt };
}

export async function getSessionUser(token: string | undefined): Promise<{ id: string; email: string } | null> {
  if (!token) return null;
  const rows = await sql`
    select u.id, u.email from admin_sessions s
    join admin_users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()
    limit 1
  `;
  return (rows[0] as { id: string; email: string } | undefined) ?? null;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await sql`delete from admin_sessions where token_hash = ${hashToken(token)}`;
}

export function sessionCookie(token: string, expiresAt: Date): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}
