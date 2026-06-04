#!/usr/bin/env node

import { spawn } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requiredMajor = 22;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nextCli = resolve(repoRoot, "node_modules/next/dist/bin/next");
const currentMajor = Number(process.versions.node.split(".")[0]);

const node22Candidates = [
  process.env.LESSONLOOP_NODE22,
  "/opt/homebrew/opt/node@22/bin/node",
  "/usr/local/opt/node@22/bin/node"
].filter(Boolean);

function canExecute(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

const nodeBinary =
  currentMajor === requiredMajor
    ? process.execPath
    : node22Candidates.find((candidate) => canExecute(candidate));

if (!nodeBinary) {
  console.error(`LessonLoop requires Node ${requiredMajor}.x for local Next.js development.`);
  console.error(`Current Node is ${process.version}.`);
  console.error("Install Node 22 or set LESSONLOOP_NODE22=/path/to/node before running this command.");
  process.exit(1);
}

if (currentMajor !== requiredMajor) {
  console.log(`LessonLoop: current Node is ${process.version}; relaunching Next with ${nodeBinary}.`);
}

const child = spawn(nodeBinary, [nextCli, ...process.argv.slice(2)], {
  cwd: repoRoot,
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? "1"
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
