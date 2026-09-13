import { sql } from "../api/db/client.js";

const tables = await sql.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by 1",
);
console.log(JSON.stringify(tables.map((r) => r.table_name)));

const existing = await sql`select id, slug, status from periods where slug = ${"demo-2026"}`;
if (existing.length === 0) {
  await sql`insert into periods (name, slug, description, status) values (${"Demo Event 2026"}, ${"demo-2026"}, ${"Seed event untuk development"}, ${"ACTIVE"})`;
  console.log("seeded period demo-2026 (ACTIVE)");
} else {
  console.log("period demo-2026 exists:", JSON.stringify(existing[0]));
}
