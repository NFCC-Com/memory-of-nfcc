import { sql } from "./client.ts";
import { hashPassword } from "../services/session.ts";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set ADMIN_EMAIL dan ADMIN_PASSWORD dulu. Contoh:");
  console.error('  $env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="rahasia-kuat"; bun run api/db/seed-admin.ts');
  process.exit(1);
}

const existing = await sql`select id from admin_users where email = ${email} limit 1`;
if (existing.length > 0) {
  await sql`update admin_users set password_hash = ${await hashPassword(password)} where email = ${email}`;
  console.log(`admin ${email} diperbarui`);
} else {
  await sql`insert into admin_users (email, password_hash) values (${email}, ${await hashPassword(password)})`;
  console.log(`admin ${email} dibuat`);
}
