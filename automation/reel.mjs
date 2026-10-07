#!/usr/bin/env node
/**
 * Day chuyen REEL — A Hit Official.
 *
 * Tim video AI view cao -> lay phu de that cua chung -> viet lai thanh mot
 * kich ban reel 1-2 phut theo giong thuong hieu -> gui thang vao Telegram.
 *
 *   node automation/reel.mjs --topic "AI Agent kiem tien"
 *   node automation/reel.mjs                       # dung reel.defaultTopic trong config
 *   node automation/reel.mjs --dry-run             # chay het, nhung KHONG gui Telegram
 *   node automation/reel.mjs --resume <slug> --from 3
 *
 * Khac voi run.mjs (day chuyen dung video day du 7 buoc): day chuyen nay dung
 * o kich ban, khong thu am, khong render, khong dang.
 */
import fs from "node:fs";
import path from "node:path";
import { log, loadConfig, runDir, readState, writeState, slugify, Blocked, AUTO } from "./lib/util.mjs";

const STEPS = [
  { n: 1, file: "01-research",   t: "Tim video AI view cao" },
  { n: 2, file: "r1-transcript", t: "Lay phu de that cua chung" },
  { n: 3, file: "r2-reel",       t: "Viet kich ban reel 1-2 phut" },
  { n: 4, file: "r3-telegram",   t: "Gui vao Telegram" },
];

function parseArgs(argv) {
  const a = { from: 1, to: STEPS.length };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--topic") a.topic = argv[++i];
    else if (k === "--resume") a.resume = argv[++i];
    else if (k === "--from") a.from = +argv[++i];
    else if (k === "--to") a.to = +argv[++i];
    else if (k === "--dry-run") a.dryRun = true;
    else if (k === "--list") a.list = true;
    else if (k === "--help" || k === "-h") a.help = true;
  }
  return a;
}

const args = parseArgs(process.argv);

if (args.help) {
  console.log(`
Day chuyen REEL — A Hit Official

  node automation/reel.mjs --topic "<chu de>"       chay moi tu dau
  node automation/reel.mjs                          dung reel.defaultTopic trong config
  node automation/reel.mjs --dry-run                chay het nhung KHONG gui Telegram
  node automation/reel.mjs --resume <slug> --from n chay tiep tu buoc n
  node automation/reel.mjs --list                   xem cac lan da chay

Cac buoc:
${STEPS.map((s) => `  ${s.n}. ${s.t}`).join("\n")}
`);
  process.exit(0);
}

if (args.list) {
  const d = path.join(AUTO, "runs");
  if (!fs.existsSync(d)) { console.log("Chua co lan chay nao."); process.exit(0); }
  for (const s of fs.readdirSync(d)) {
    const st = readState(path.join(d, s));
    if (st.kind !== "reel") continue;
    console.log(`  ${s.padEnd(44)} ${(st.lastStep ? "buoc " + st.lastStep : "-").padEnd(10)} ${st.updatedAt || ""}`);
  }
  process.exit(0);
}

let cfg;
try {
  cfg = loadConfig();
} catch (e) {
  if (e instanceof Blocked) { log.err(e.what); console.log(`\n  Cach go:\n    ${e.howToFix}\n`); process.exit(2); }
  throw e;
}

// Muc reel duoc phep thay rieng cau hinh tim kiem cho luong nay,
// de day chuyen video day du (run.mjs) khong bi anh huong.
if (cfg.reel?.research) cfg = { ...cfg, research: { ...cfg.research, ...cfg.reel.research } };

const topic = args.topic || cfg.reel?.defaultTopic;
if (!topic && !args.resume) {
  log.err("Chua co chu de.");
  console.log(`\n  Cach go:\n    node automation/reel.mjs --topic "AI Agent kiem tien"\n` +
              `    hoac dien 'reel.defaultTopic' trong automation/config.json\n`);
  process.exit(2);
}

const slug = args.resume || `reel-${new Date().toISOString().slice(0, 10)}-${slugify(topic)}`;
const dir = runDir(slug);
if (!args.resume) writeState(dir, { kind: "reel", topic, slug });

console.log(`\n  lan chay: ${slug}`);
console.log(`  thu muc : automation/runs/${slug}`);
if (args.dryRun) log.warn("--dry-run: buoc 4 se KHONG gui gi vao Telegram");

for (const s of STEPS) {
  if (s.n < args.from || s.n > args.to) continue;
  log.step(s.n, s.t);
  try {
    const mod = await import(`./steps/${s.file}.mjs`);
    await mod.run({ cfg, dir, slug, args, state: readState(dir) });
    writeState(dir, { lastStep: s.n });
  } catch (e) {
    if (e instanceof Blocked) {
      log.err(e.what);
      console.log(`\n  Cach go:\n    ${e.howToFix}\n`);
      console.log(`  Go xong chay tiep:\n    node automation/reel.mjs --resume ${slug} --from ${s.n}\n`);
      process.exit(2);
    }
    log.err(e.message);
    console.log(`\n  Chay lai buoc nay:\n    node automation/reel.mjs --resume ${slug} --from ${s.n}\n`);
    process.exit(1);
  }
}

console.log(`\n  xong. kich ban o automation/runs/${slug}/reel.md\n`);
