#!/usr/bin/env node
/**
 * Day chuyen san xuat video A Hit Official.
 *
 *   node automation/run.mjs --topic "AI Agent kiem tien"
 *   node automation/run.mjs --resume <slug> --from 4
 *   node automation/run.mjs --resume <slug> --from 6 --confirm-publish
 *
 * Nguyen tac:
 *  - Moi buoc ghi ket qua vao runs/<slug>/, chay lai duoc tu bat ky buoc nao.
 *  - Buoc nao thieu khoa API thi DUNG HAN va in ra dung cach go, khong lam bua.
 *  - Buoc dang bai KHONG BAO GIO tu chay: phai co co --confirm-publish.
 */
import fs from "node:fs";
import path from "node:path";
import { log, loadConfig, runDir, readState, writeState, slugify, Blocked, AUTO } from "./lib/util.mjs";

const STEPS = [
  { n: 1, id: "research", t: "Tim va phan tich video view cao" },
  { n: 2, id: "script",   t: "Viet kich ban noi" },
  { n: 3, id: "voice",    t: "Giong doc" },
  { n: 4, id: "build",    t: "Dung composition HyperFrames" },
  { n: 5, id: "render",   t: "Kiem tra va render MP4" },
  { n: 6, id: "publish",  t: "Dang len nen tang" },
  { n: 7, id: "push",     t: "Commit va day len GitHub" },
];

function parseArgs(argv) {
  const a = { from: 1, to: 7, confirmPublish: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--topic") a.topic = argv[++i];
    else if (k === "--resume") a.resume = argv[++i];
    else if (k === "--from") a.from = +argv[++i];
    else if (k === "--to") a.to = +argv[++i];
    else if (k === "--confirm-publish") a.confirmPublish = true;
    else if (k === "--dry-run") a.dryRun = true;
    else if (k === "--list") a.list = true;
  }
  return a;
}

const args = parseArgs(process.argv);

if (args.list) {
  const d = path.join(AUTO, "runs");
  if (!fs.existsSync(d)) { console.log("Chua co lan chay nao."); process.exit(0); }
  for (const s of fs.readdirSync(d)) {
    const st = readState(path.join(d, s));
    console.log(`  ${s.padEnd(44)} ${(st.lastStep ? "buoc " + st.lastStep : "-").padEnd(10)} ${st.updatedAt || ""}`);
  }
  process.exit(0);
}

if (!args.topic && !args.resume) {
  console.log(`
Day chuyen san xuat video A Hit Official

  node automation/run.mjs --topic "<chu de>"           chay moi tu dau
  node automation/run.mjs --resume <slug> --from <n>   chay tiep tu buoc n
  node automation/run.mjs --list                       xem cac lan da chay
  node automation/run.mjs --topic "..." --dry-run      xem ke hoach, khong lam gi

Cac buoc:
${STEPS.map((s) => `  ${s.n}. ${s.id.padEnd(9)} ${s.t}`).join("\n")}

Dang bai (buoc 6) chi chay khi them co --confirm-publish.
`);
  process.exit(0);
}

const slug = args.resume || `${new Date().toISOString().slice(0, 10)}-${slugify(args.topic)}`;
const dir = runDir(slug);
if (args.topic) writeState(dir, { topic: args.topic, slug });

console.log(`\n  lan chay: ${slug}`);
console.log(`  thu muc : automation/runs/${slug}`);

if (args.dryRun) {
  console.log("\n  --dry-run: se chay cac buoc");
  for (const s of STEPS) if (s.n >= args.from && s.n <= args.to) console.log(`    ${s.n}. ${s.t}`);
  process.exit(0);
}

const cfg = loadConfig();

for (const s of STEPS) {
  if (s.n < args.from || s.n > args.to) continue;
  log.step(s.n, s.t);
  try {
    const mod = await import(`./steps/0${s.n}-${s.id}.mjs`);
    await mod.run({ cfg, dir, slug, args, state: readState(dir) });
    writeState(dir, { lastStep: s.n });
  } catch (e) {
    if (e instanceof Blocked) {
      log.err(e.what);
      console.log(`\n  Cach go:\n    ${e.howToFix}\n`);
      console.log(`  Go xong chay tiep:\n    node automation/run.mjs --resume ${slug} --from ${s.n}\n`);
      process.exit(2);
    }
    log.err(e.message);
    console.log(`\n  Chay lai buoc nay:\n    node automation/run.mjs --resume ${slug} --from ${s.n}\n`);
    process.exit(1);
  }
}

console.log(`\n  xong. ket qua o automation/runs/${slug}\n`);
