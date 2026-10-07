import fs from "node:fs";
import path from "node:path";
import { Blocked } from "./util.mjs";

const API = "https://api.telegram.org";

/** Gioi han cua Telegram Bot API cho mot tin nhan van ban. */
export const TELEGRAM_TEXT_LIMIT = 4096;

/**
 * Cat van ban thanh cac manh duoi `limit` ky tu, uu tien cat o ranh gioi tu nhien:
 * doan trang -> xuong dong -> khoang trang -> cat cung.
 * Khong bao gio tra ve manh rong, va khong bao gio lam mat ky tu nao.
 */
export function chunkText(text, limit = 3900) {
  if (limit < 1) throw new Error("limit phai >= 1");
  const out = [];
  let rest = String(text);

  while (rest.length > limit) {
    const window = rest.slice(0, limit);
    // tim diem cat dep nhat con nam trong cua so
    let cut = -1;
    for (const sep of ["\n\n", "\n", " "]) {
      const i = window.lastIndexOf(sep);
      // chi nhan neu diem cat khong qua som (tranh tao ra manh ti hon)
      if (i > limit * 0.5) { cut = i + (sep === " " ? 1 : sep.length); break; }
    }
    if (cut <= 0) cut = limit; // khong co ranh gioi nao dung duoc -> cat cung
    const piece = rest.slice(0, cut);
    out.push(piece.replace(/\s+$/, ""));
    rest = rest.slice(cut).replace(/^\n+/, "");
  }

  if (rest.trim()) out.push(rest);
  return out.filter((s) => s.length);
}

async function call(token, method, body) {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.ok === false) {
    const desc = j.description || `HTTP ${res.status}`;
    if (res.status === 401) throw new Blocked(
      `Telegram tu choi token (401): ${desc}`,
      "Kiem tra lai TELEGRAM_BOT_TOKEN. Lay token bang cach nhan tin cho @BotFather -> /newbot."
    );
    if (res.status === 400 && /chat not found/i.test(desc)) throw new Blocked(
      `Telegram khong tim thay chat (${desc})`,
      "Kiem tra TELEGRAM_CHAT_ID. Nho: ban phai nhan /start voi bot truoc thi bot moi nhan tin cho ban duoc.\n" +
      "    Lay chat id: nhan /start cho bot, roi mo https://api.telegram.org/bot<TOKEN>/getUpdates va doc message.chat.id"
    );
    throw new Error(`Telegram ${method} loi: ${desc}`);
  }
  return j.result;
}

/** Kiem tra token song va tra ve ten bot. */
export async function getMe(token) {
  const me = await call(token, "getMe", {});
  return me.username ? `@${me.username}` : me.first_name || "bot";
}

/**
 * Gui van ban, tu dong cat thanh nhieu tin neu dai.
 * Khong dung parse_mode: van ban kich ban co rat nhieu ky tu dac biet (* _ [ ] `),
 * bat parse_mode len la Telegram tra 400 ngay.
 */
export async function sendText(token, chatId, text, { silent = false } = {}) {
  const parts = chunkText(text, TELEGRAM_TEXT_LIMIT - 200);
  const sent = [];
  for (let i = 0; i < parts.length; i++) {
    const head = parts.length > 1 ? `(${i + 1}/${parts.length})\n` : "";
    sent.push(await call(token, "sendMessage", {
      chat_id: chatId,
      text: head + parts[i],
      disable_web_page_preview: true,
      disable_notification: silent,
    }));
  }
  return sent;
}

/** Gui kem file .md de luu lai nguyen ban. */
export async function sendDocument(token, chatId, filePath, caption = "") {
  if (!fs.existsSync(filePath)) throw new Error(`Khong co file de gui: ${filePath}`);
  const fd = new FormData();
  fd.set("chat_id", String(chatId));
  if (caption) fd.set("caption", caption.slice(0, 1024));
  fd.set("document", new Blob([fs.readFileSync(filePath)], { type: "text/markdown" }), path.basename(filePath));

  const res = await fetch(`${API}/bot${token}/sendDocument`, { method: "POST", body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.ok === false) throw new Error(`Telegram sendDocument loi: ${j.description || res.status}`);
  return j.result;
}
