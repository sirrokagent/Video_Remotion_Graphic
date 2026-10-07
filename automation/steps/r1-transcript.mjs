import fs from "node:fs";
import path from "node:path";
import { log, sh, Blocked } from "../lib/util.mjs";
import { vttToText, wordCount } from "../lib/vtt.mjs";

/**
 * Lay phu de that cua cac video view cao, de buoc viet kich ban co NOI DUNG
 * ma phan tich chu khong chi co tieu de.
 *
 * Dung yt-dlp vi YouTube Data API khong cho tai phu de cua video nguoi khac:
 * endpoint captions.download doi OAuth cua CHINH chu kenh.
 */

function haveYtDlp() {
  const r = sh("yt-dlp", ["--version"]);
  return !r.error && r.status === 0;
}

/** Tai phu de mot video. Tra ve null neu video khong co phu de nao dung duoc. */
function fetchOne(videoId, subsDir, langs) {
  const stem = path.join(subsDir, videoId);
  const r = sh("yt-dlp", [
    "--skip-download",
    "--write-subs", "--write-auto-subs",
    "--sub-langs", langs,
    "--sub-format", "vtt",
    "--no-playlist",
    "--no-warnings",
    "-o", stem,
    `https://www.youtube.com/watch?v=${videoId}`,
  ], { timeout: 120_000 });

  // yt-dlp tra 0 ngay ca khi khong co phu de, nen phai tu kiem file
  const files = fs.readdirSync(subsDir).filter((f) => f.startsWith(videoId + ".") && f.endsWith(".vtt"));
  if (!files.length) return { ok: false, reason: r.status === 0 ? "khong co phu de" : (r.stderr || "").split("\n")[0]?.slice(0, 120) || "yt-dlp loi" };

  // uu tien theo dung thu tu ngon ngu da yeu cau
  const order = langs.split(",").map((s) => s.trim());
  files.sort((a, b) => {
    const rank = (f) => {
      const code = f.slice(videoId.length + 1).replace(/\.vtt$/, "");
      const i = order.findIndex((l) => code === l || code.startsWith(l));
      return i === -1 ? 999 : i;
    };
    return rank(a) - rank(b);
  });

  const chosen = files[0];
  const lang = chosen.slice(videoId.length + 1).replace(/\.vtt$/, "");
  const text = vttToText(fs.readFileSync(path.join(subsDir, chosen), "utf8"));
  if (wordCount(text) < 80) return { ok: false, reason: `phu de qua ngan (${wordCount(text)} tu)` };
  return { ok: true, lang, text };
}

export async function run({ cfg, dir }) {
  const rp = path.join(dir, "research.json");
  if (!fs.existsSync(rp)) throw new Blocked("Chua co research.json", "Chay lai buoc research truoc.");
  const research = JSON.parse(fs.readFileSync(rp, "utf8"));

  if (!haveYtDlp()) throw new Blocked(
    "Chua cai yt-dlp (can de lay phu de video cua nguoi khac)",
    "Cai mot trong hai cach:\n" +
    "      pip install -U yt-dlp\n" +
    "      winget install yt-dlp.yt-dlp\n" +
    "    YouTube Data API khong thay the duoc: captions.download chi cho tai phu de video cua chinh ban."
  );

  const reel = cfg.reel || {};
  const want = reel.transcriptCount ?? 6;
  const langs = reel.subtitleLangs ?? "vi,en,en-orig,en-US";
  const capChars = reel.transcriptMaxChars ?? 9000;

  const subsDir = path.join(dir, "subs");
  fs.mkdirSync(subsDir, { recursive: true });

  const got = [];
  const skipped = [];

  for (const v of research) {
    if (got.length >= want) break;
    let res;
    try {
      res = fetchOne(v.id, subsDir, langs);
    } catch (e) {
      res = { ok: false, reason: e.message.slice(0, 120) };
    }
    if (!res.ok) {
      skipped.push({ id: v.id, title: v.title, reason: res.reason });
      log.dim(`bo qua ${v.id} — ${res.reason}`);
      continue;
    }
    const full = res.text;
    got.push({
      id: v.id,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      title: v.title,
      channel: v.channelTitle,
      views: v.views,
      lang: res.lang,
      words: wordCount(full),
      truncated: full.length > capChars,
      transcript: full.slice(0, capChars),
    });
    log.dim(`${String(v.views).padStart(9)} view · ${res.lang} · ${wordCount(full)} tu · ${v.title.slice(0, 50)}`);
  }

  if (!got.length) throw new Blocked(
    "Khong lay duoc phu de cua video nao.",
    "Thuong do: (1) cac video dau bang khong bat phu de, (2) YouTube chan IP may chu.\n" +
    "    Thu: noi rong 'subtitleLangs' trong config, hoac tang 'maxResults' o muc research de co them ung vien."
  );

  fs.writeFileSync(path.join(dir, "transcripts.json"), JSON.stringify({ got, skipped }, null, 2));
  log.ok(`lay duoc phu de ${got.length}/${got.length + skipped.length} video (bo qua ${skipped.length})`);
}
