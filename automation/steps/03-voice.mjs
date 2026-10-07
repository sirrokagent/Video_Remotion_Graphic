import fs from "node:fs";
import path from "node:path";
import { log, need, Blocked, ffprobeDuration, AUTO } from "../lib/util.mjs";

/**
 * mode "manual"     : ban tu thu am, bo file .mp3 vao automation/inbox/<slug>/
 * mode "elevenlabs" : pipeline tu sinh giong (can ELEVENLABS_API_KEY)
 */
export async function run({ cfg, dir, slug }) {
  const outDir = path.join(dir, "audio");
  fs.mkdirSync(outDir, { recursive: true });

  if (cfg.voice.mode === "manual") {
    const inbox = path.join(AUTO, "inbox", slug);
    fs.mkdirSync(inbox, { recursive: true });
    const files = fs.readdirSync(inbox).filter((f) => /\.(mp3|wav|m4a)$/i.test(f)).sort();

    if (!files.length) throw new Blocked(
      `Chua co file giong doc nao trong automation/inbox/${slug}/`,
      `Doc kich ban o automation/runs/${slug}/script.md, thu am, roi bo file mp3 vao:\n` +
      `      automation/inbox/${slug}/\n` +
      `    Nhieu file thi dat ten theo thu tu: 01.mp3, 02.mp3, ...`
    );

    let total = 0;
    for (const f of files) {
      const src = path.join(inbox, f);
      const dst = path.join(outDir, f);
      fs.copyFileSync(src, dst);
      const d = ffprobeDuration(dst);
      total += d;
      log.dim(`${f} — ${d.toFixed(2)}s`);
    }
    fs.writeFileSync(path.join(dir, "audio.json"), JSON.stringify({ files, totalSeconds: total }, null, 2));
    log.ok(`${files.length} file, tong ${total.toFixed(2)}s`);
    return;
  }

  if (cfg.voice.mode === "elevenlabs") {
    const key = need("ELEVENLABS_API_KEY", "sinh giong doc",
      "Lay tai elevenlabs.io -> Profile -> API Key. Luu y goi free chi 10.000 ky tu/thang.");
    const voiceId = cfg.voice.elevenlabs.voiceId;
    if (!voiceId) throw new Blocked("Chua chon voiceId trong config.json",
      "Mo elevenlabs.io -> Voices -> copy Voice ID vao automation/config.json muc voice.elevenlabs.voiceId");

    const md = fs.readFileSync(path.join(dir, "script.md"), "utf8");
    const spoken = md.split(/^### \[/m).slice(1)
      .map((s) => s.split("\n").slice(1).join("\n")).join("\n")
      .split(/^## /m)[0]
      .replace(/\/\//g, " ").replace(/\s+/g, " ").trim();

    if (spoken.length > 9000) log.warn(`${spoken.length} ky tu — co the vuot han muc free 10.000/thang`);

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text: spoken, model_id: cfg.voice.elevenlabs.modelId }),
    });
    if (!res.ok) {
      const b = await res.text();
      if (res.status === 401) throw new Blocked("ElevenLabs tu choi khoa (401)", "Kiem tra lai ELEVENLABS_API_KEY.");
      throw new Error(`ElevenLabs loi ${res.status}: ${b.slice(0, 300)}`);
    }
    const dst = path.join(outDir, "vo-01.mp3");
    fs.writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
    const d = ffprobeDuration(dst);
    fs.writeFileSync(path.join(dir, "audio.json"), JSON.stringify({ files: ["vo-01.mp3"], totalSeconds: d }, null, 2));
    log.ok(`vo-01.mp3 — ${d.toFixed(2)}s`);
    return;
  }

  throw new Blocked(`voice.mode khong hop le: ${cfg.voice.mode}`, "Dat 'manual' hoac 'elevenlabs' trong config.json.");
}
