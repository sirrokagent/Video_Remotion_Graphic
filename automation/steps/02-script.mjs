import fs from "node:fs";
import path from "node:path";
import { log, claude, ROOT, Blocked } from "../lib/util.mjs";

/** Dung Claude Code viet kich ban moi tu phan tich video view cao. */
export async function run({ cfg, dir, state }) {
  const rp = path.join(dir, "research.json");
  if (!fs.existsSync(rp)) throw new Blocked("Chua co research.json", "Chay lai buoc 1 truoc.");
  const research = JSON.parse(fs.readFileSync(rp, "utf8"));

  const brief = fs.existsSync(path.join(ROOT, cfg.brand.briefPath))
    ? fs.readFileSync(path.join(ROOT, cfg.brand.briefPath), "utf8").slice(0, 4000)
    : "";

  const words = Math.round(cfg.script.targetSeconds * cfg.script.wordsPerSecond);
  const top = research.slice(0, 12)
    .map((v) => `- ${v.views.toLocaleString()} view | ${v.channelTitle} | ${v.title}`)
    .join("\n");

  const prompt = `Bạn đang viết kịch bản cho kênh ${cfg.brand.name}.

GIỌNG THƯƠNG HIỆU: ${cfg.brand.voiceNote}

BRAND BRIEF (trích):
${brief}

CHỦ ĐỀ: ${state.topic}

CÁC VIDEO ĐANG CÓ VIEW CAO CÙNG CHỦ ĐỀ (dữ liệu YouTube thật, lấy hôm nay):
${top}

YÊU CẦU:
1. Phân tích xem các video trên dùng thủ pháp gì để giữ chân người xem (kiểu hook, cấu trúc, cách chốt).
2. Viết MỘT kịch bản nói HOÀN TOÀN MỚI theo giọng thương hiệu ở trên. Chỉ mượn KHUNG, tuyệt đối không chép câu chữ của ai.
3. Độ dài đúng ${words} chữ (tương đương ${cfg.script.targetSeconds} giây ở tốc độ ${cfg.script.wordsPerSecond} chữ/giây).
4. Chia thành các đoạn có tiêu đề, mỗi đoạn ghi mốc thời gian TÍNH TỪ SỐ CHỮ THẬT của đoạn đó chia cho ${cfg.script.wordsPerSecond} — không ước lượng.
5. Phải có một đoạn nói thẳng về GIỚI HẠN / rủi ro của thứ đang giới thiệu. Không hứa hẹn quá.
6. Không bịa số liệu. Chỉ dùng con số nào có thật trong chủ đề.
7. Kết thúc bằng kêu gọi để lại bình luận.

ĐỊNH DẠNG ĐẦU RA: markdown. Phần lời đọc đặt trong các mục "### [m:ss – m:ss] TÊN ĐOẠN".
Sau phần lời đọc, thêm mục "## GHI CHÚ DỰNG HÌNH" dạng bảng: mốc thời gian | hình cần hiện.
Chỉ in ra markdown, không giải thích gì thêm.`;

  log.dim("goi claude -p de viet kich ban...");
  const out = claude(prompt);
  if (out.length < 400) throw new Error("Claude tra ve qua ngan, co the bi loi:\n" + out.slice(0, 500));

  const f = path.join(dir, "script.md");
  fs.writeFileSync(f, out);

  // dem chu phan loi doc de bao do dai that
  const spoken = out.split(/^### \[/m).slice(1).join(" ").split(/^## /m)[0] || "";
  const n = spoken.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter(Boolean).length;
  const secs = n / cfg.script.wordsPerSecond;

  log.ok(`script.md — ${n} chữ ≈ ${Math.floor(secs / 60)} phút ${String(Math.round(secs % 60)).padStart(2, "0")}`);
  if (Math.abs(secs - cfg.script.targetSeconds) > cfg.script.targetSeconds * 0.25)
    log.warn(`lech nhieu so voi muc tieu ${cfg.script.targetSeconds}s — xem lai truoc khi thu am`);
}
