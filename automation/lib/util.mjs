import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
export const AUTO = path.join(ROOT, "automation");

const C = { d: "\x1b[2m", r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", b: "\x1b[36m", x: "\x1b[0m" };
export const log = {
  step: (n, t) => console.log(`\n${C.b}[${n}]${C.x} ${t}`),
  ok:   (m) => console.log(`  ${C.g}✓${C.x} ${m}`),
  warn: (m) => console.log(`  ${C.y}!${C.x} ${m}`),
  err:  (m) => console.log(`  ${C.r}✗${C.x} ${m}`),
  dim:  (m) => console.log(`  ${C.d}${m}${C.x}`),
};

/** Dung ngay va in ra dung viec phai lam de go tac. */
export class Blocked extends Error {
  constructor(what, howToFix) {
    super(what);
    this.what = what;
    this.howToFix = howToFix;
  }
}

export function loadConfig() {
  const p = path.join(AUTO, "config.json");
  if (!fs.existsSync(p)) {
    throw new Blocked(
      "Chua co automation/config.json",
      "Chay: cp automation/config.example.json automation/config.json  roi dien thong tin."
    );
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function need(envName, forWhat, howToGet) {
  const v = process.env[envName];
  if (!v) throw new Blocked(`Thieu bien moi truong ${envName} (can cho: ${forWhat})`, howToGet);
  return v;
}

/** Thu muc lam viec cua mot lan chay. */
export function runDir(slug) {
  const d = path.join(AUTO, "runs", slug);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function readState(dir) {
  const p = path.join(dir, "state.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
}
export function writeState(dir, patch) {
  const p = path.join(dir, "state.json");
  const s = { ...readState(dir), ...patch, updatedAt: new Date().toISOString() };
  fs.writeFileSync(p, JSON.stringify(s, null, 2));
  return s;
}

export function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });
  if (r.error) throw r.error;
  return r;
}

/** Goi Claude Code o che do khong tuong tac. Day la "bo nao" cua pipeline. */
export function claude(prompt, { cwd = ROOT, timeoutMs = 15 * 60 * 1000 } = {}) {
  const r = spawnSync("claude", ["-p", prompt], {
    cwd, encoding: "utf8", timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) throw new Blocked("Khong goi duoc Claude CLI: " + r.error.message,
    "Kiem tra 'claude --version'. Pipeline dung 'claude -p' lam buoc sang tao.");
  if (r.status !== 0) throw new Error("claude -p that bai:\n" + (r.stderr || r.stdout || "").slice(0, 2000));
  return (r.stdout || "").trim();
}

export const ffprobeDuration = (f) => {
  const r = sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]);
  return parseFloat((r.stdout || "0").trim()) || 0;
};

export const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
   .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
