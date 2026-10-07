#!/usr/bin/env node
/**
 * Dung automation/config.json cho mot lan chay tren CI.
 *
 *   node automation/ci-config.mjs
 *
 * config.json nam ngoai git (no chua chat id va duong dan ca nhan), nen tren
 * GitHub Actions khong co san. Script nay lay config.example.json lam nen roi
 * ap cac gia tri rieng cua lan chay vao, doc tu bien moi truong:
 *
 *   TELEGRAM_CHAT_ID          chat dich
 *   REEL_ALLOW_NO_TRANSCRIPT  "1" = khong lay duoc phu de thi van chay tiep
 *   REEL_TOPIC                chu de, de trong thi dung reel.defaultTopic
 *   REEL_MIN_VIEWS            nguong view, mac dinh theo file mau
 *
 * Khong in ra gia tri nao cua bien moi truong — log cua Actions la cong khai
 * voi bat ky ai doc duoc repo.
 */
import fs from "node:fs";
import path from "node:path";
import { AUTO } from "./lib/util.mjs";

const src = path.join(AUTO, "config.example.json");
const dst = path.join(AUTO, "config.json");

if (!fs.existsSync(src)) {
  console.error("Khong thay automation/config.example.json");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(src, "utf8"));
cfg.reel ||= {};
cfg.telegram ||= {};

const applied = [];

if (process.env.TELEGRAM_CHAT_ID) {
  cfg.telegram.chatId = process.env.TELEGRAM_CHAT_ID;
  applied.push("telegram.chatId");
}
if (process.env.REEL_ALLOW_NO_TRANSCRIPT === "1") {
  cfg.reel.allowNoTranscript = true;
  applied.push("reel.allowNoTranscript=true");
}
if (process.env.REEL_TOPIC) {
  cfg.reel.defaultTopic = process.env.REEL_TOPIC;
  applied.push("reel.defaultTopic");
}
if (process.env.REEL_MIN_VIEWS) {
  const n = Number(process.env.REEL_MIN_VIEWS);
  if (!Number.isFinite(n) || n < 0) {
    console.error(`REEL_MIN_VIEWS khong phai so hop le: ${process.env.REEL_MIN_VIEWS}`);
    process.exit(1);
  }
  cfg.reel.research ||= {};
  cfg.reel.research.minViews = n;
  applied.push(`reel.research.minViews=${n}`);
}

fs.writeFileSync(dst, JSON.stringify(cfg, null, 2));
console.log(`da dung automation/config.json tu config.example.json`);
console.log(`da ap: ${applied.length ? applied.join(", ") : "(khong co gi)"}`);
if (!cfg.telegram.chatId) console.log("luu y: chua co chat id — buoc telegram se dung lai");
