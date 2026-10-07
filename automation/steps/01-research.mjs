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

  // Mot "thi truong" la mot cap (quoc gia, ngon ngu). De trong thi dung cap don
  // o cap tren — giu nguyen cach cu cho day chuyen video day du.
  const markets = r.markets?.length
    ? r.markets
    : [{ regionCode: r.regionCode, relevanceLanguage: r.relevanceLanguage }];

  // Moi loi goi search ton 100 don vi quota (han muc 10.000/ngay).
  const calls = r.keywords.length * markets.length;
  if (calls * 100 > 8000) log.warn(`${calls} loi goi search ≈ ${calls * 100} don vi quota — sat han muc 10.000/ngay`);

  for (const m of markets) {
    for (const kw of r.keywords) {
      const q = new URLSearchParams({
        part: "snippet", type: "video", q: kw, maxResults: "25",
        order: "viewCount", publishedAfter: after,
        regionCode: m.regionCode, relevanceLanguage: m.relevanceLanguage, key,
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
      for (const it of j.items || []) {
        if (!seen.has(it.id.videoId)) {
          seen.set(it.id.videoId, { id: it.id.videoId, kw, market: m.regionCode, ...it.snippet });
        }
      }
      log.dim(`[${m.regionCode}/${m.relevanceLanguage}] "${kw}": ${(j.items || []).length} ket qua`);
    }
  }

  // Lay thong ke that de loc theo view.
  // Xin luon 'snippet' de co MO TA DAY DU: videos.list tinh 1 don vi quota du
  // xin bao nhieu part, nen day la mien phi. Mo ta la tu lieu du phong cho buoc
  // viet kich ban khi khong lay duoc phu de (hay gap khi chay tren may chu).
  const ids = [...seen.keys()];
  const stats = {};
  for (let i = 0; i < ids.length; i += 50) {
    const q = new URLSearchParams({ part: "statistics,contentDetails,snippet", id: ids.slice(i, i + 50).join(","), key });
    const j = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?${q}`)).json();
    for (const v of j.items || []) stats[v.id] = v;
  }

  const picked = [...seen.values()]
    .map((v) => ({
      ...v,
      views: +(stats[v.id]?.statistics?.viewCount || 0),
      duration: stats[v.id]?.contentDetails?.duration,
      description: (stats[v.id]?.snippet?.description || v.description || "").slice(0, 1500),
    }))
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
