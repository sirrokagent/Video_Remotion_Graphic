import fs from "node:fs";
import path from "node:path";
import { log, claude, ROOT, Blocked } from "../lib/util.mjs";
import { findVerbatim } from "../lib/overlap.mjs";

/**
 * Lay phan loi doc (bo ghi chu dung hinh va danh sach nguon) de dem chu cho dung.
 *
 * Tieu de muc do model viet ra, nen phai chap nhan ca co dau lan khong dau:
 * "GHI CHU DUNG HINH" va "GHI CHÚ DỰNG HÌNH" deu phai cat duoc, neu khong thi
 * bang ghi chu bi tinh vao do dai va con so bao ra se sai.
 */
const END_OF_SPOKEN = /^##\s+(GHI\s*CH[UÚ]|NGU[OỒ]N)/im;

export function spokenOnly(md) {
  const afterHeads = md.split(/^### /m).slice(1).join("\n");
  const body = (afterHeads || md).split(END_OF_SPOKEN)[0];
  return body
    .replace(/^\[[^\]]*\].*$/gm, "")   // dong tieu de co moc thoi gian
    .replace(/\[[^\]]*\]/g, " ")        // moc thoi gian con sot trong dong
    .replace(/^[|>#*\-].*$/gm, " ")     // bang, trich dan, gach dau dong
    .trim();
}

const countWords = (s) => s.split(/\s+/).filter(Boolean).length;

export async function run({ cfg, dir, state }) {
  const tp = path.join(dir, "transcripts.json");
  if (!fs.existsSync(tp)) throw new Blocked("Chua co transcripts.json", "Chay lai buoc transcript truoc.");
  const { got } = JSON.parse(fs.readFileSync(tp, "utf8"));

  const reel = cfg.reel || {};
  const targetSeconds = reel.targetSeconds ?? 90;
  const wps = reel.wordsPerSecond ?? cfg.script?.wordsPerSecond ?? 4.42;
  const minSeconds = reel.minSeconds ?? 60;
  const maxSeconds = reel.maxSeconds ?? 120;
  const targetWords = Math.round(targetSeconds * wps);

  const brief = fs.existsSync(path.join(ROOT, cfg.brand.briefPath))
    ? fs.readFileSync(path.join(ROOT, cfg.brand.briefPath), "utf8").slice(0, 3500)
    : "";

  const sources = got.map((v, i) => `
--- NGUON ${i + 1} ---
Tieu de: ${v.title}
Kenh: ${v.channel} · ${v.views.toLocaleString()} view · ngon ngu phu de: ${v.lang}
Link: ${v.url}
Phu de${v.truncated ? " (da cat bot phan duoi)" : ""}:
${v.transcript}
`).join("\n");

  const prompt = `Bạn đang viết kịch bản REEL cho kênh ${cfg.brand.name}.

GIỌNG THƯƠNG HIỆU: ${cfg.brand.voiceNote}

BRAND BRIEF (trích):
${brief}

CHỦ ĐỀ: ${state.topic}

DƯỚI ĐÂY LÀ PHỤ ĐỀ THẬT CỦA ${got.length} VIDEO ĐANG CÓ VIEW CAO CÙNG CHỦ ĐỀ.
Đây là TƯ LIỆU PHÂN TÍCH, không phải thứ để chép.
${sources}

NHIỆM VỤ

Bước 1 — đọc và rút ra: các video trên dùng thủ pháp gì để giữ chân người xem?
Hook mở đầu kiểu gì, chuyển ý ra sao, chốt bằng gì, chúng hứa hẹn điều gì.

Bước 2 — viết MỘT kịch bản reel HOÀN TOÀN MỚI bằng tiếng Việt, theo giọng thương hiệu ở trên.

RÀNG BUỘC CỨNG

1. CHỈ MƯỢN KHUNG VÀ Ý. Tuyệt đối không chép lại câu chữ của bất kỳ nguồn nào.
   Không có cụm nào từ 8 từ trở lên được trùng nguyên văn với phụ đề ở trên.
   Bản nháp sẽ bị máy dò trùng lặp kiểm tra tự động và trả về nếu vi phạm.
2. Độ dài: khoảng ${targetWords} chữ (${targetSeconds} giây ở tốc độ ${wps} chữ/giây).
   Bắt buộc nằm trong khoảng ${minSeconds}–${maxSeconds} giây. Reel dài hơn là hỏng.
3. Mở đầu phải có hook trong 3 giây đầu. Không chào hỏi, không "xin chào các bạn".
4. Một reel nói ĐÚNG MỘT Ý. Không liệt kê 5 mẹo.
5. Phải có một câu nói thẳng về giới hạn hoặc cái giá phải trả. Không hứa hẹn quá.
6. Không bịa số liệu. Số nào không có trong tư liệu trên thì đừng nêu.
7. Câu ngắn, đọc được thành tiếng. Viết để NÓI, không phải để đọc bằng mắt.

ĐỊNH DẠNG ĐẦU RA (markdown, không giải thích gì thêm)

# <tiêu đề reel>

## LỜI ĐỌC

### [0:00 – 0:03] HOOK
<lời đọc>

### [0:03 – 0:xx] <tên đoạn>
<lời đọc>

(tiếp tục cho tới hết)

## GHI CHU DUNG HINH

| mốc | hình cần hiện |
|---|---|
| 0:00 | ... |

## NGUỒN THAM KHẢO
<liệt kê link các video đã phân tích, mỗi dòng một link>`;

  log.dim(`goi claude -p de viet reel (~${targetWords} chu)...`);
  const out = claude(prompt);
  if (out.length < 300) throw new Error("Claude tra ve qua ngan:\n" + out.slice(0, 500));

  const f = path.join(dir, "reel.md");
  fs.writeFileSync(f, out);

  // --- kiem tra do dai that ---
  const spoken = spokenOnly(out);
  const n = countWords(spoken);
  const secs = n / wps;
  const mmss = `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, "0")}`;
  log.ok(`reel.md — ${n} chu ≈ ${mmss}`);

  if (secs < minSeconds || secs > maxSeconds) {
    log.warn(`do dai ${mmss} nam ngoai khoang ${minSeconds}-${maxSeconds}s — sua tay truoc khi thu am`);
  }

  // --- canh chep nguyen van ---
  const hits = findVerbatim(spoken, got, reel.verbatimWindow ?? 8);
  const report = { words: n, seconds: +secs.toFixed(1), verbatimHits: hits };
  fs.writeFileSync(path.join(dir, "reel-check.json"), JSON.stringify(report, null, 2));

  if (hits.length) {
    log.err(`tim thay ${hits.length} cum trung nguyen van voi ban goc:`);
    for (const h of hits.slice(0, 5)) log.dim(`  "${h.phrase}"  <- ${h.source.slice(0, 50)}`);
    throw new Blocked(
      `Ban nhap chep lai ${hits.length} cum tu ban goc — khong gui di duoc.`,
      "Xem automation/runs/<slug>/reel-check.json, sua cac cum do trong reel.md roi chay tiep tu buoc telegram:\n" +
      "      node automation/reel.mjs --resume <slug> --from 4"
    );
  }
  log.ok("khong co cum nao trung nguyen van voi ban goc");
}
