import fs from "node:fs";
import path from "node:path";
import { log, sh, ROOT, Blocked, ffprobeDuration } from "../lib/util.mjs";

const HF = "D:/npm-global/hyperframes.cmd";

export async function run({ cfg, dir, slug }) {
  const projDir = path.join(ROOT, "videos", slug);
  if (!fs.existsSync(path.join(projDir, "index.html")))
    throw new Blocked(`Khong co videos/${slug}/index.html`, "Chay lai buoc 4.");

  // --- check truoc khi render, khong render bua ---
  log.dim("hyperframes check...");
  const chk = sh(HF, ["check"], { cwd: projDir });
  const outTxt = (chk.stdout || "") + (chk.stderr || "");
  const errLine = outTxt.match(/(\d+) error\(s\)/g) || [];
  const totalErr = errLine.reduce((a, s) => a + parseInt(s), 0);
  if (totalErr > 0 || /Check failed/.test(outTxt)) {
    fs.writeFileSync(path.join(dir, "check-failed.log"), outTxt);
    throw new Blocked(`hyperframes check bao ${totalErr} loi`,
      `Xem automation/runs/${slug}/check-failed.log roi sua, hoac chay lai buoc 4.`);
  }
  log.ok("check qua, 0 loi");

  // --- render ---
  const outFile = path.join(projDir, "renders", `${slug}.mp4`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  log.dim("render... (thuong 6-9 phut cho video ~2,5 phut)");
  const t0 = Date.now();
  const r = sh(HF, ["render", "--quality", cfg.render.quality, "--output", `renders/${slug}.mp4`], { cwd: projDir });
  if (!fs.existsSync(outFile)) {
    fs.writeFileSync(path.join(dir, "render-failed.log"), (r.stdout || "") + (r.stderr || ""));
    throw new Error(`Render khong tao ra file. Xem automation/runs/${slug}/render-failed.log`);
  }

  // --- xuat ban sach de upload ---
  const exportDir = path.join(ROOT, "EXPORT");
  fs.mkdirSync(exportDir, { recursive: true });
  const finalFile = path.join(exportDir, `${slug}.mp4`);
  sh("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", outFile,
    "-c", "copy", "-movflags", "+faststart", finalFile]);

  const dur = ffprobeDuration(finalFile);
  const size = fs.statSync(finalFile).size;
  const probe = sh("ffprobe", ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,codec_name,r_frame_rate", "-of", "csv=p=0", finalFile]).stdout.trim();

  fs.writeFileSync(path.join(dir, "render.json"), JSON.stringify(
    { file: finalFile, seconds: dur, bytes: size, video: probe, renderedInSeconds: (Date.now() - t0) / 1000 }, null, 2));

  log.ok(`${path.basename(finalFile)} — ${probe} — ${dur.toFixed(1)}s — ${(size / 1048576).toFixed(1)} MB` +
         ` (render ${((Date.now() - t0) / 60000).toFixed(1)} phut)`);
}
