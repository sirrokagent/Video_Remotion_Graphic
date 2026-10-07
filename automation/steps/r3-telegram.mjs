import fs from "node:fs";
import path from "node:path";
import { log, need, Blocked } from "../lib/util.mjs";
import { getMe, sendText, sendDocument, chunkText, TELEGRAM_TEXT_LIMIT } from "../lib/telegram.mjs";

export async function run({ cfg, dir, slug, args, state }) {
  const f = path.join(dir, "reel.md");
  if (!fs.existsSync(f)) throw new Blocked("Chua co reel.md", "Chay lai buoc reel truoc.");
  const md = fs.readFileSync(f, "utf8");

  const tg = cfg.telegram || {};
  if (tg.enabled === false) { log.warn("telegram.enabled = false trong config — bo qua"); return; }

  const TOKEN_HOWTO =
    "Nhan tin cho @BotFather tren Telegram -> /newbot -> dat ten -> no tra ve token.\n" +
    "    Roi dat bien moi truong:  setx TELEGRAM_BOT_TOKEN \"<token>\"  (mo lai terminal sau khi dat)";
  const CHAT_HOWTO =
    "Nhan /start cho bot cua ban truoc, roi mo:\n" +
    "      https://api.telegram.org/bot<TOKEN>/getUpdates\n" +
    "    Doc so o message.chat.id, dien vao automation/config.json muc telegram.chatId\n" +
    "    (chat nhom thi so am, vi du -1001234567890 — nho giu ca dau tru)";

  // --dry-run ton tai de xem truoc khi CHUA co gi — nen no khong duoc doi khoa.
  // Thieu khoa thi bao, chu khong chan.
  const token = args?.dryRun
    ? process.env.TELEGRAM_BOT_TOKEN
    : need("TELEGRAM_BOT_TOKEN", "gui kich ban vao Telegram", TOKEN_HOWTO);

  const chatId = tg.chatId || process.env.TELEGRAM_CHAT_ID;
  if (!chatId && !args?.dryRun) {
    throw new Blocked("Chua biet gui vao dau (thieu telegram.chatId va TELEGRAM_CHAT_ID)", CHAT_HOWTO);
  }

  // tom tat nguon de nguoi doc biet kich ban nay dung tu dau ma ra
  // Chay khong co giam sat, nen moi thu doc tu dia deu coi la co the thieu truong.
  const tfile = path.join(dir, "transcripts.json");
  const sources = (fs.existsSync(tfile) ? JSON.parse(fs.readFileSync(tfile, "utf8")).got : []) || [];
  const check = fs.existsSync(path.join(dir, "reel-check.json"))
    ? JSON.parse(fs.readFileSync(path.join(dir, "reel-check.json"), "utf8")) : null;

  const header = [
    `KICH BAN REEL MOI — ${cfg.brand.name}`,
    `chu de: ${state.topic || slug}`,
    check ? `do dai: ${check.words} chu ≈ ${Math.floor(check.seconds / 60)}:${String(Math.round(check.seconds % 60)).padStart(2, "0")}` : null,
    `phan tich tu ${sources.length} video view cao:`,
    ...sources.map((v) => `  • ${Number(v.views || 0).toLocaleString()} view — ${String(v.title || "?").slice(0, 70)}\n    ${v.url || ""}`),
  ].filter(Boolean).join("\n");

  const body = `${header}\n\n${"—".repeat(20)}\n\n${md}`;

  if (args?.dryRun) {
    const parts = chunkText(body, TELEGRAM_TEXT_LIMIT - 200);
    log.warn(`--dry-run: KHONG gui gi ca.`);
    log.dim(`se gui ${parts.length} tin nhan${tg.sendFile !== false ? " + 1 file reel.md" : ""}`);
    log.dim(`TELEGRAM_BOT_TOKEN : ${token ? "da co" : "CHUA CO — " + TOKEN_HOWTO.split("\n")[0]}`);
    log.dim(`chat dich          : ${chatId || "CHUA CO — " + CHAT_HOWTO.split("\n")[0]}`);
    console.log("\n" + body.slice(0, 1200) + (body.length > 1200 ? "\n  [...]\n" : "\n"));
    return;
  }

  const who = await getMe(token);
  log.dim(`bot ${who} -> chat ${chatId}`);

  const sent = await sendText(token, chatId, body);
  log.ok(`da gui ${sent.length} tin nhan`);

  if (tg.sendFile !== false) {
    await sendDocument(token, chatId, f, `reel.md — ${slug}`);
    log.ok("da gui kem file reel.md");
  }
}
