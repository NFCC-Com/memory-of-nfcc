import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "./client.ts";

const dir = join(dirname(fileURLToPath(import.meta.url)), "migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const text = await readFile(join(dir, file), "utf8");
  console.log(`applying ${file}...`);
  const statements = text
    .split(";")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
}
console.log("migrations done");
