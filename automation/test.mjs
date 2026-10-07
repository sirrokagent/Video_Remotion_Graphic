#!/usr/bin/env node
/**
 * Tu kiem tra phan logic thuan cua day chuyen — khong can API key, khong goi mang.
 *
 *   node automation/test.mjs
 *
 * Nhung buoc goi YouTube / Claude / Telegram khong kiem o day duoc. Cai kiem
 * duoc la phan de sai nhat ma lai im lang nhat: doc phu de, cat tin nhan,
 * va may do chep nguyen van.
 */
import { vttToText, wordCount } from "./lib/vtt.mjs";
import { chunkText, TELEGRAM_TEXT_LIMIT } from "./lib/telegram.mjs";
import { findVerbatim, normalize, ngrams } from "./lib/overlap.mjs";
import { spokenOnly } from "./steps/r2-reel.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${extra ? "\n      " + extra : ""}`); }
};
const section = (s) => console.log(`\n\x1b[36m${s}\x1b[0m`);

// ---------------------------------------------------------------- vtt
section("doc phu de WebVTT");

const rolling = `WEBVTT
Kind: captions
Language: en

00:00:00.120 --> 00:00:02.500
if you want to build

00:00:02.500 --> 00:00:04.900
if you want to build an AI agent

00:00:04.900 --> 00:00:07.100
an AI agent that actually makes money

00:00:07.100 --> 00:00:09.000
<00:00:07.500><c> you</c><00:00:07.900><c> need</c> one thing
`;
const t1 = vttToText(rolling);
ok("go het moc thoi gian va the <c>", !/\d\d:\d\d|<c>|-->/.test(t1), t1);
ok("khu duoc dong lap cua phu de cuon", !/build an AI agent.*build an AI agent/.test(t1), t1);
ok("giu lai het y", /if you want to build/.test(t1) && /makes money/.test(t1) && /need one thing/.test(t1), t1);
ok("khong con dong WEBVTT / Kind", !/WEBVTT|Kind:|Language:/.test(t1), t1);

const viet = `WEBVTT

00:00:01.000 --> 00:00:03.000
tôi đã dùng AI để &quot;tự động hóa&quot; toàn bộ

00:00:03.000 --> 00:00:05.000
quy trình &amp; tiết kiệm 20 giờ mỗi tuần
`;
const t2 = vttToText(viet);
ok("giu nguyen dau tieng Viet", /tự động hóa/.test(t2) && /tiết kiệm/.test(t2), t2);
ok("giai ma thuc the HTML", t2.includes('"tự động hóa"') && t2.includes("&") && !/&quot;|&amp;/.test(t2), t2);

ok("van ban rong khong lam vo", vttToText("") === "" && vttToText("WEBVTT\n") === "");
ok("dem tu", wordCount("một hai ba  bốn ") === 4);

// ---------------------------------------------------------------- chunk
section("cat tin nhan Telegram");

const long = Array.from({ length: 400 }, (_, i) => `Dong so ${i} co mot it chu de day do dai len.`).join("\n");
const parts = chunkText(long, 3900);
ok("moi manh deu duoi gioi han", parts.every((p) => p.length <= 3900), `dai nhat ${Math.max(...parts.map((p) => p.length))}`);
ok("khong co manh rong", parts.every((p) => p.trim().length > 0));
ok("khong mat chu nao", parts.join(" ").replace(/\s+/g, "") === long.replace(/\s+/g, ""));
ok("cat o ranh gioi dong, khong giua tu", parts.slice(0, -1).every((p) => !/\S$/.test(p) || long.includes(p)), parts[0]?.slice(-40));

const oneWord = "x".repeat(10000);
const hard = chunkText(oneWord, 100);
ok("mot tu dai hon gioi han van cat duoc", hard.length === 100 && hard.every((p) => p.length <= 100));

ok("van ban ngan tra ve dung mot manh", chunkText("ngan gon", 3900).length === 1);
ok("gioi han Telegram la 4096", TELEGRAM_TEXT_LIMIT === 4096);

// ---------------------------------------------------------------- overlap
section("may do chep nguyen van");

const src = [{
  id: "abc",
  title: "Nguon thu nghiem",
  transcript: "Cach nhanh nhat de kiem tien voi AI nam 2026 la xay mot con agent biet tu lam viec thay ban moi ngay.",
}];

const copied = "Nghe day. Cach nhanh nhat de kiem tien voi AI nam 2026 la xay mot con agent biet tu lam viec. Het.";
const hits = findVerbatim(copied, src, 8);
ok("bat duoc doan chep nguyen van", hits.length > 0, JSON.stringify(hits.slice(0, 2)));

const original = "Ban khong thieu cong cu. Ban thieu mot he thong chiu chay khi ban ngu. Do la khac biet duy nhat.";
ok("khong bao dong nham voi ban viet moi", findVerbatim(original, src, 8).length === 0);

const short = "Cach nhanh nhat de kiem tien";
ok("cum ngan hon nguong thi bo qua", findVerbatim(short, src, 8).length === 0);

ok("bo dau cau khi so sanh", normalize("Xin chào, các sếp!") === "xin chào các sếp");
ok("khong phan biet hoa thuong", normalize("AI Agent") === normalize("ai agent"));
ok("cum n tu dung so luong", ngrams("mot hai ba bon nam", 3).size === 3);

const multi = findVerbatim(copied, [...src, { id: "x", title: "B", transcript: "khong lien quan gi het" }], 8);
ok("nhieu nguon van chi quy ve dung nguon co loi", multi.every((h) => h.source === "Nguon thu nghiem"));

// ---------------------------------------------------------------- do dai
section("tach phan loi doc de dem chu");

const mk = (ghiChu) => `# Tieu de

## LỜI ĐỌC

### [0:00 – 0:03] HOOK
mot hai ba bon nam

### [0:03 – 0:10] DOAN HAI
sau bay tam chin muoi

## ${ghiChu}

| mốc | hình cần hiện |
|---|---|
| 0:00 | mot bang rat dai khong duoc tinh vao do dai loi doc chut nao |

## NGUỒN THAM KHẢO
https://www.youtube.com/watch?v=aaa
`;

// Tieu de muc la do model viet, nen phai cat duoc ca hai kieu go.
for (const heading of ["GHI CHU DUNG HINH", "GHI CHÚ DỰNG HÌNH"]) {
  const spoken = spokenOnly(mk(heading));
  const n = spoken.split(/\s+/).filter(Boolean).length;
  ok(`cat dung o "${heading}" (dem ra ${n} chu)`, n === 10, JSON.stringify(spoken));
}

const spoken = spokenOnly(mk("GHI CHU DUNG HINH"));
ok("khong con moc thoi gian trong phan dem", !/0:00|0:03/.test(spoken), spoken);
ok("khong con dong bang va link nguon", !/youtube|hình cần hiện/.test(spoken), spoken);

// ---------------------------------------------------------------- ket
console.log(`\n${fail ? "\x1b[31m" : "\x1b[32m"}${pass} dat, ${fail} hong\x1b[0m\n`);
process.exit(fail ? 1 : 0);
