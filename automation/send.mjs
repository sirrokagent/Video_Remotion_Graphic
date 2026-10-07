#!/usr/bin/env node
/**
 * Gui mot file markdown bat ky vao Telegram.
 *
 *   node automation/send.mjs automation/runs/<slug>/reel.md
 *   node automation/send.mjs <file> --dry-run
 *
 * Dung khi kich ban da co san roi, chi con thieu moi buoc gui — vi du kich ban
 * duoc viet o mot may khac, hoac buoc 4 cua reel.mjs dung giua chung.
 *
 * Doc TELEGRAM_BOT_TOKEN tu bien moi truong, va chat id tu telegram.chatId
 * trong config.json hoac TELEGRAM_CHAT_ID.
 */
import fs from "node:fs";
import path from "node:path";
import { log, loadConfig, need, Blocked } from "./lib/util.mjs";
import { getMe, sendText, sendDocument, chunkText, TELEGRAM_TEXT_LIMIT } from "./lib/telegram.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const file = args.find((a) => !a.startsWith("--"));

if (!file) {
  console.log(`
Gui mot file markdown vao Telegram

  node automation/send.mjs <file.md>
  node automation/send.mjs <file.md> --dry-run    xem truoc, khong gui

Can TELEGRAM_BOT_TOKEN, va chat id o telegram.chatId trong config.json
hoac bien moi truong TELEGRAM_CHAT_ID.
`);
  process.exit(args.length ? 2 : 0);
}

function fail(e) {
  if (e instanceof Blocked) {
    log.err(e.what);
    console.log(`\n  Cach go:\n    ${e.howToFix}\n`);
    process.exit(2);
  }
  log.err(e.message);
  process.exit(1);
}

try {
  if (!fs.existsSync(file)) throw new Blocked(`Khong co file: ${file}`, "Kiem tra lai duong dan.");
  const body = fs.readFileSync(file, "utf8");

  // config.json co the chua co — van gui duoc neu co du bien moi truong
  let cfg = {};
  try { cfg = loadConfig(); } catch { /* khong sao */ }
  const tg = cfg.telegram || {};

  const token = dryRun
    ? process.env.TELEGRAM_BOT_TOKEN
    : need("TELEGRAM_BOT_TOKEN", "gui file vao Telegram",
        "Nhan tin cho @BotFather -> /newbot -> lay token.\n" +
        "    setx TELEGRAM_BOT_TOKEN \"<token>\"   (mo lai terminal sau khi dat)");

  const chatId = tg.chatId || process.env.TELEGRAM_CHAT_ID;
  if (!chatId && !dryRun) throw new Blocked(
    "Chua biet gui vao dau",
    "Dien telegram.chatId trong automation/config.json, hoac dat TELEGRAM_CHAT_ID."
  );

  if (dryRun) {
    const parts = chunkText(body, TELEGRAM_TEXT_LIMIT - 200);
    log.warn("--dry-run: KHONG gui gi ca.");
    log.dim(`se gui ${parts.length} tin nhan + 1 file ${path.basename(file)}`);
    log.dim(`TELEGRAM_BOT_TOKEN : ${token ? "da co" : "CHUA CO"}`);
    log.dim(`chat dich          : ${chatId || "CHUA CO"}`);
    process.exit(0);
  }

  const who = await getMe(token);
  log.dim(`bot ${who} -> chat ${chatId}`);
  const sent = await sendText(token, chatId, body);
  log.ok(`da gui ${sent.length} tin nhan`);
  await sendDocument(token, chatId, file, path.basename(file));
  log.ok(`da gui kem file ${path.basename(file)}`);
} catch (e) {
  fail(e);
}
