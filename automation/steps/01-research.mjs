import fs from "node:fs";
import path from "node:path";
import { log, need, Blocked } from "../lib/util.mjs";

/** Tim video view cao theo tu khoa, loc theo nguong view va thoi gian dang. */
export async function run({ cfg, dir, state }) {
  const key = need(
    "YOUTUBE_API_KEY",
    "tim video view cao tren YouTube",
    "Vao console.cloud.google.com -> tao project -> bat 'YouTube Data API v3' -> Credentials -> API key.\n" +
    "    Roi dat bien moi truong:  setx YOUTUBE_API_KEY \"<khoa>\"  (mo lai terminal sau khi dat)"
  );

  const r = cfg.research;
  const after = new Date(Date.now() - r.publishedWithinDays * 864e5).toISOString();
  const seen = new Map();

  for (const kw of r.keywords) {
    const q = new URLSearchParams({
      part: "snippet", type: "video", q: kw, maxResults: "25",
      order: "viewCount", publishedAfter: after,
      regionCode: r.regionCode, relevanceLanguage: r.relevanceLanguage, key,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${q}`);
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 403) throw new Blocked(
        "YouTube API tu choi (403). Thuong la chua bat API hoac het quota ngay.",
        "Kiem tra da bat 'YouTube Data API v3' chua, va quota con khong (10.000 don vi/ngay)."
      );
      throw new Error(`YouTube search loi ${res.status}: ${body.slice(0, 300)}`);
    }
    const j = await res.json();
    for (const it of j.items || []) seen.set(it.id.videoId, { id: it.id.videoId, kw, ...it.snippet });
    log.dim(`"${kw}": ${(j.items || []).length} ket qua`);
  }

  // lay thong ke that de loc theo view
  const ids = [...seen.keys()];
  const stats = {};
  for (let i = 0; i < ids.length; i += 50) {
    const q = new URLSearchParams({ part: "statistics,contentDetails", id: ids.slice(i, i + 50).join(","), key });
    const j = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?${q}`)).json();
    for (const v of j.items || []) stats[v.id] = v;
  }

  const picked = [...seen.values()]
    .map((v) => ({ ...v, views: +(stats[v.id]?.statistics?.viewCount || 0), duration: stats[v.id]?.contentDetails?.duration }))
    .filter((v) => v.views >= r.minViews)
    .sort((a, b) => b.views - a.views)
    .slice(0, r.maxResults);

  if (!picked.length) throw new Blocked(
    `Khong co video nao dat nguong ${r.minViews.toLocaleString()} view trong ${r.publishedWithinDays} ngay.`,
    "Ha 'minViews' hoac noi rong 'publishedWithinDays' trong automation/config.json."
  );

  fs.writeFileSync(path.join(dir, "research.json"), JSON.stringify(picked, null, 2));
  log.ok(`${picked.length} video dat nguong, cao nhat ${picked[0].views.toLocaleString()} view`);
  for (const v of picked.slice(0, 5)) log.dim(`${String(v.views).padStart(9)}  ${v.title.slice(0, 64)}`);
}
