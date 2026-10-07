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

/**
 * sh() nem khi khong tim thay lenh (ENOENT), nen phai bat lai o day —
 * neu khong thi "chua cai yt-dlp" se roi ra thanh loi la thay vi mot cau
 * noi ro phai cai gi.
 */
function haveYtDlp() {
  try {
    const r = sh("yt-dlp", ["--version"]);
    return !r.error && r.status === 0;
  } catch {
    return false;
  }
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

  const reel = cfg.reel || {};
  const degradeOk = reel.allowNoTranscript ?? false;

  const hasTool = haveYtDlp();
  if (!hasTool && !degradeOk) throw new Blocked(
    "Chua cai yt-dlp (can de lay phu de video cua nguoi khac)",
    "Cai mot trong hai cach:\n" +
    "      pip install -U yt-dlp\n" +
    "      winget install yt-dlp.yt-dlp\n" +
    "    YouTube Data API khong thay the duoc: captions.download chi cho tai phu de video cua chinh ban."
  );
  if (!hasTool) log.warn("khong co yt-dlp — bo qua buoc lay phu de");
  const want = reel.transcriptCount ?? 6;
  const langs = reel.subtitleLangs ?? "vi,en,en-orig,en-US";
  const capChars = reel.transcriptMaxChars ?? 9000;

  const subsDir = path.join(dir, "subs");
  fs.mkdirSync(subsDir, { recursive: true });

  const got = [];
  const skipped = [];

  for (const v of research) {
    if (!hasTool) break;
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

  // YouTube chan IP trung tam du lieu. Tren GitHub Actions (runner cua Azure)
  // gan nhu chac chan dinh, nen phai nhan ra va goi dung ten, dung bao "khong co phu de".
  const botChecked = skipped.some((s) => /not a bot|Sign in to confirm|confirm you.re not/i.test(s.reason || ""));

  if (!got.length) {
    const why = botChecked
      ? "YouTube chan IP may dang chay (bot check). Day la chuyen BINH THUONG khi chay tren may chu\n" +
        "    hosted cua GitHub Actions — runner dung IP trung tam du lieu."
      : "Cac video dau bang khong bat phu de, hoac yt-dlp loi.";

    if (!(cfg.reel?.allowNoTranscript ?? false)) {
      throw new Blocked("Khong lay duoc phu de cua video nao.",
        `${why}\n` +
        "    Ba huong go:\n" +
        "      1. Chay tren may ca nhan (IP nha dan) — cach sach nhat, phu de lay duoc binh thuong.\n" +
        "      2. Dung self-hosted runner tren may minh thay cho runner hosted cua GitHub.\n" +
        "      3. Bat reel.allowNoTranscript = true de pipeline van chay, viet tu tieu de + mo ta.\n" +
        "    Ngoai ra co the noi rong 'subtitleLangs' hoac tang 'maxResults' de co them ung vien."
      );
    }

    log.warn("khong lay duoc phu de nao — chay tiep o che do RUT GON (chi tieu de + mo ta)");
    log.dim(why.replace(/\n\s+/g, " "));
  }

  // Luon kem 'meta' (tieu de + mo ta day du tu YouTube API) de buoc viet kich ban
  // van co tu lieu khi che do rut gon. Mo ta la thu duy nhat lay duoc ma khong
  // vuong bot check, vi no den tu API chu khong phai tu trang web.
  const meta = research.slice(0, Math.max(want, 8)).map((v) => ({
    id: v.id,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.title,
    channel: v.channelTitle,
    views: v.views,
    description: (v.description || "").slice(0, 1200),
  }));

  const mode = got.length ? "transcript" : "metadata";
  fs.writeFileSync(path.join(dir, "transcripts.json"),
    JSON.stringify({ mode, botChecked, got, skipped, meta }, null, 2));

  if (got.length) log.ok(`lay duoc phu de ${got.length}/${got.length + skipped.length} video (bo qua ${skipped.length})`);
}
