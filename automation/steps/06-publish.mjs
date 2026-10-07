import fs from "node:fs";
import path from "node:path";
import { log, need, Blocked, ROOT } from "../lib/util.mjs";

/**
 * DANG BAI. Buoc duy nhat cham vao tai khoan that cua ban.
 *
 * Quy tac cung:
 *  - Khong co co --confirm-publish thi CHI chuan bi, khong dang.
 *  - YouTube mac dinh dang o che do 'private' de ban tu duyet roi mo cong khai.
 *  - Nen tang nao chua co API thi ghi vao hang doi de dang tay, khong im lang bo qua.
 */
export async function run({ cfg, dir, slug, args, state }) {
  const rj = path.join(dir, "render.json");
  if (!fs.existsSync(rj)) throw new Blocked("Chua render xong", "Chay lai buoc 5.");
  const render = JSON.parse(fs.readFileSync(rj, "utf8"));

  // lay tieu de / mo ta tu kich ban
  const md = fs.readFileSync(path.join(dir, "script.md"), "utf8");
  const title = (md.match(/^#\s+(.+)$/m)?.[1] || state.topic || slug).replace(/^KỊCH BẢN.*?—\s*/, "").replace(/^"|"$/g, "");
  const metaPath = path.join(dir, "publish-meta.json");
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
    : { title: title.slice(0, 95), description: state.topic || "", tags: cfg.research.keywords };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  const p = cfg.publish;
  const manual = [];
  for (const [name, v] of Object.entries(p)) {
    if (name.startsWith("_")) continue;
    if (!v.enabled) manual.push({ platform: name, reason: v._note || "tat trong config" });
  }

  if (!args.confirmPublish) {
    log.warn("chua co --confirm-publish nen KHONG dang gi ca");
    log.dim(`file   : ${render.file}`);
    log.dim(`tieu de: ${meta.title}`);
    log.dim(`sua tieu de/mo ta tai: automation/runs/${slug}/publish-meta.json`);
    console.log(`\n  Dang that:\n    node automation/run.mjs --resume ${slug} --from 6 --confirm-publish\n`);
    return;
  }

  // ---------- YouTube ----------
  if (p.youtube.enabled) {
    const token = need("YOUTUBE_OAUTH_TOKEN", "upload len YouTube",
      "Upload can OAuth chu khong dung duoc API key.\n" +
      "    Cach nhanh: cai Google Cloud SDK roi chay\n" +
      "      gcloud auth application-default login --scopes=https://www.googleapis.com/auth/youtube.upload\n" +
      "    Roi dat:  setx YOUTUBE_OAUTH_TOKEN \"<access token>\"");

    const body = {
      snippet: { title: meta.title, description: meta.description, tags: meta.tags, categoryId: "28" },
      status: { privacyStatus: p.youtube.privacyStatus, selfDeclaredMadeForKids: false },
    };
    const init = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      { method: "POST", headers: {
          Authorization: `Bearer ${token}`, "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": String(render.bytes),
        }, body: JSON.stringify(body) });

    if (!init.ok) throw new Error(`YouTube khoi tao upload loi ${init.status}: ${(await init.text()).slice(0, 400)}`);
    const url = init.headers.get("location");
    if (!url) throw new Error("YouTube khong tra ve URL upload");

    log.dim(`upload ${(render.bytes / 1048576).toFixed(1)} MB...`);
    const up = await fetch(url, { method: "PUT",
      headers: { "Content-Type": "video/mp4", "Content-Length": String(render.bytes) },
      body: fs.readFileSync(render.file) });
    if (!up.ok) throw new Error(`YouTube upload loi ${up.status}: ${(await up.text()).slice(0, 400)}`);
    const v = await up.json();
    log.ok(`YouTube: https://youtu.be/${v.id}  (che do: ${p.youtube.privacyStatus})`);
    fs.writeFileSync(path.join(dir, "published-youtube.json"), JSON.stringify(v, null, 2));
  }

  // ---------- Nen tang chua co API: ghi hang doi ----------
  if (manual.length) {
    const queue = path.join(ROOT, "EXPORT", "HANG-DOI-DANG-TAY.md");
    const rows = manual.map((m) => `| ${m.platform} | ${m.reason} |`).join("\n");
    fs.appendFileSync(queue,
`\n## ${slug}
File: \`${render.file}\`
Tiêu đề: ${meta.title}

| Nền tảng | Vì sao phải đăng tay |
|---|---|
${rows}
`);
    log.warn(`${manual.length} nen tang phai dang tay — da ghi vao EXPORT/HANG-DOI-DANG-TAY.md`);
    for (const m of manual) log.dim(`${m.platform}: ${m.reason}`);
  }
}
