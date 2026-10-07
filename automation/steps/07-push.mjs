import { log, sh, ROOT, Blocked } from "../lib/util.mjs";

export async function run({ cfg, slug }) {
  const g = cfg.git;
  if (!g.enabled) { log.dim("git tat trong config, bo qua"); return; }

  const opt = { cwd: ROOT };
  sh("git", ["add", "-A"], opt);

  const st = sh("git", ["diff", "--cached", "--name-only"], opt).stdout.trim();
  if (!st) { log.dim("khong co thay doi nao de commit"); }
  else {
    const n = st.split("\n").length;
    sh("git", ["-c", "user.name=A Hit Official", "-c", "user.email=ahitofficial.com@gmail.com",
      "commit", "-q", "-m", `Video ${slug}\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>`], opt);
    log.ok(`commit ${n} file`);
  }

  if (!g.remote) {
    log.warn("chua dat git.remote trong config.json — chi commit, khong push");
    log.dim("dat remote roi chay lai buoc 7, hoac: git remote add origin <url> && git push -u origin main");
    return;
  }

  const has = sh("git", ["remote"], opt).stdout.split("\n").includes("origin");
  if (!has) sh("git", ["remote", "add", "origin", g.remote], opt);

  const r = sh("git", ["push", "-u", "origin", g.branch], opt);
  if (r.status !== 0) {
    const e = (r.stderr || "").slice(0, 400);
    throw new Blocked(`git push that bai: ${e}`,
      "Thuong la chua co quyen. Cai GitHub CLI roi dang nhap:\n" +
      "      winget install --id GitHub.cli -e\n" +
      "      gh auth login\n" +
      "    Hoac dung SSH key / Personal Access Token.");
  }
  log.ok(`da push len ${g.remote} (${g.branch})`);
}
