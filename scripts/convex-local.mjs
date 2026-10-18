// Runs the Convex dev server against Convex's account-free local backend ("anonymous agent
// mode"), with every file it downloads or stores kept in .convex-local/ inside the project
// instead of the user profile. Use it until the client's Convex account is connected; after
// that, run plain `npx convex dev`.
//
// usage: node scripts/convex-local.mjs [convex command and options]   (default: dev)
//   e.g. node scripts/convex-local.mjs env set ADMIN_TOKEN <token>
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const home = path.resolve(".convex-local");
const localAppData = path.join(home, "AppData", "Local");
const tmp = path.join(home, "tmp");
mkdirSync(localAppData, { recursive: true });
mkdirSync(tmp, { recursive: true });

const env = {
  ...process.env,
  CONVEX_AGENT_MODE: "anonymous",
  // Downloads land here first; keeping it on the project's drive lets the CLI move them, not copy.
  CONVEX_TMPDIR: tmp,
  // Where the CLI keeps the backend binary and local deployment data (Windows, then macOS/Linux).
  LOCALAPPDATA: localAppData,
  HOME: home,
  USERPROFILE: home,
};

const cli = path.resolve("node_modules/convex/bin/main.js");
const args = process.argv.slice(2);
const command = args.length && !args[0].startsWith("-") ? args : ["dev", ...args];
const child = spawn(process.execPath, [cli, ...command], { env, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
