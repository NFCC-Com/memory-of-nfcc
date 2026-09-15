import { sql } from "../api/db/client.js";
import { verify } from "@node-rs/argon2";

const photo = await sql`select id, created_at from photos where id = '1332874c-6314-42fb-a785-bd65942f06ec'`;
console.log("photo row (dibuat via Vercel) ada di DB ini:", photo.length > 0);

const admins = await sql`select email, password_hash from admin_users order by email`;
console.log("admin_users di DB ini:", admins.map((a) => a.email));

const target = admins.find((a) => a.email === "ucup1122@gmail.com");
if (target) {
  console.log("verify 'ucup1122#':", await verify(target.password_hash, "ucup1122#"));
}
