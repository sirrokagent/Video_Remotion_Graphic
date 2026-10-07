import fs from "node:fs";
import path from "node:path";
import { log, claude, sh, ROOT, Blocked } from "../lib/util.mjs";

/**
 * Dung composition HyperFrames.
 * Buoc then chot: DO MOC NOI THAT bang silencedetect truoc, roi dua so lieu do cho Claude,
 * de moi element bat dung giay tu do duoc doc — khong doan.
 */
export async function run({ cfg, dir, slug, state }) {
  const audioDir = path.join(dir, "audio");
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "audio.json"), "utf8"));
  const projDir = path.join(ROOT, "videos", slug);

  // --- do moc noi that ---
  const segs = [];
  let offset = 0;
  for (const f of meta.files) {
    const p = path.join(audioDir, f);
    const r = sh("ffmpeg", ["-hide_banner", "-nostats", "-i", p,
      "-af", "silencedetect=noise=-34dB:d=0.18", "-f", "null", "-"]);
    const marks = [...(r.stderr || "").matchAll(/silence_(start|end): ([0-9.]+)/g)]
      .map((m) => ({ kind: m[1], t: parseFloat(m[2]) + offset }));
    let lastEnd = null;
    for (const m of marks) {
      if (m.kind === "end") lastEnd = m.t;
      else if (lastEnd !== null) { segs.push([+lastEnd.toFixed(2), +m.t.toFixed(2)]); lastEnd = null; }
    }
    const dur = (await import("../lib/util.mjs")).ffprobeDuration(p);
    if (lastEnd !== null) segs.push([+lastEnd.toFixed(2), +(offset + dur).toFixed(2)]);
    offset += dur;
  }
  fs.writeFileSync(path.join(dir, "speech-segments.json"), JSON.stringify(segs, null, 2));
  log.ok(`do duoc ${segs.length} doan noi, tong ${offset.toFixed(2)}s`);

  if (!segs.length) throw new Blocked("Khong do duoc doan noi nao",
    "File audio co the bi im hoan toan hoac qua nho. Kiem tra lai file trong automation/inbox/.");

  // --- giao cho Claude dung project ---
  const script = fs.readFileSync(path.join(dir, "script.md"), "utf8");
  const refProject = "videos/ai-agent-vs-ai-chat";

  const prompt = `Dựng một project HyperFrames mới tại thư mục: videos/${slug}

NGUỒN:
- Kịch bản: automation/runs/${slug}/script.md
- Giọng đọc: automation/runs/${slug}/audio/ (${meta.files.join(", ")}), tổng ${offset.toFixed(2)} giây
- Mốc nói đã đo sẵn bằng silencedetect: automation/runs/${slug}/speech-segments.json
  (mảng [bắt_đầu, kết_thúc] tính bằng giây, đã cộng offset giữa các file)

LÀM MẪU THEO: ${refProject} — copy y hệt bộ nhận diện của nó:
- Font Google Sans Flex (3 subset latin/latin-ext/vietnamese) + IBM Plex Mono, copy từ ${refProject}/assets/fonts/
- Khung ${cfg.render.width}x${cfg.render.height} @ ${cfg.render.fps}fps
- Nền đổi màu giữa các cảnh (trắng / đen / xanh #0b5ed7) + lưới đốm li ti
- Linh vật Agent: hiện → nảy → ẩn mỗi 2–5 giây, đảo màu trên nền tối
- Chuyển cảnh glitch + màn chập máy ảnh
- Chữ đen thật #000000, không dùng xám mờ

RÀNG BUỘC BẮT BUỘC:
- Mỗi element chỉ được hiện ĐÚNG HOẶC SAU giây mà từ tương ứng được đọc. Dùng speech-segments.json để căn, phân bổ âm tiết trong từng đoạn. Tuyệt đối không để motion chạy trước giọng.
- Không dùng Math.random() hay Date.now().
- Mọi chuyển động phải có easing, không dùng linear.
- Không được có khoảng nào dài quá 1 giây mà khung gần như trống.
- Chạy "D:/npm-global/hyperframes.cmd check" đến khi 0 lỗi.

Khi xong, in ra đúng một dòng: DONE <đường dẫn index.html>`;

  log.dim("goi claude -p de dung composition (co the mat vai phut)...");
  const out = claude(prompt, { timeoutMs: 45 * 60 * 1000 });
  log.dim(out.split("\n").slice(-6).join("\n"));

  if (!fs.existsSync(path.join(projDir, "index.html")))
    throw new Error(`Khong thay videos/${slug}/index.html sau khi dung. Xem log tren.`);

  log.ok(`videos/${slug}/index.html`);
}
