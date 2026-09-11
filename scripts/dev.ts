import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname ?? ".", "..");
const procs: ChildProcess[] = [];

function start(name: string, cmd: string, args: string[]): void {
  const proc = spawn(cmd, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: true });
  const prefix = `[${name}] `;
  proc.stdout?.on("data", (chunk: Buffer) => {
    for (const line of String(chunk).split("\n")) {
      if (line.trim().length > 0) console.log(prefix + line);
    }
  });
  proc.stderr?.on("data", (chunk: Buffer) => {
    for (const line of String(chunk).split("\n")) {
      if (line.trim().length > 0) console.error(prefix + line);
    }
  });
  proc.on("exit", (code) => {
    console.log(`${prefix}berhenti (exit ${code}) — menghentikan sisanya...`);
    shutdown();
  });
  procs.push(proc);
}

let shuttingDown = false;
function shutdown(): void {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of procs) {
    if (!p.killed) p.kill();
  }
  setTimeout(() => process.exit(0), 500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Menjalankan API + web. Berhenti dengan Ctrl+C.\n");
start("api", "bun", ["run", "api/index.ts"]);
start("web", "bun", ["run", "dev", "--", "--port", "5173", "--strictPort"]);
