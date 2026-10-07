/**
 * Doc phu de WebVTT thanh van ban thuan.
 *
 * Phu de tu dong cua YouTube la kieu "cuon": moi cue lap lai dong truoc roi
 * them mot tu moi, kem the thoi gian trong dong (<00:00:01.000><c> tu</c>).
 * Doc tho se ra van ban dai gap 5-10 lan va lap lien tuc, nen phai go the va
 * khu trung truoc khi dung.
 */

const TIMING = /^\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->/;

/** Go the trong dong, the <c>, va giai ma vai thuc the HTML hay gap. */
function cleanLine(s) {
  return s
    .replace(/<\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}>/g, "")  // moc thoi gian trong dong
    .replace(/<\/?[cviburs](?:\.[^>\s]*)?>/gi, "")      // <c>, <c.colorE5E5E5>, <v Speaker>, <i>, <b>...
    .replace(/<\/?v[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} vtt noi dung file .vtt
 * @returns {string} van ban thuan, da khu trung dong lap cua phu de cuon
 */
export function vttToText(vtt) {
  const out = [];

  for (const raw of String(vtt).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line === "WEBVTT") continue;
    if (/^(Kind|Language|NOTE|STYLE|REGION)\b/i.test(line)) continue;
    if (TIMING.test(line)) continue;
    if (/^\d+$/.test(line)) continue;               // so thu tu cue (kieu SRT)

    const text = cleanLine(line);
    if (!text) continue;

    // khu trung: bo qua neu dong nay da la mot trong vai dong vua phat ra,
    // hoac da nam gon trong dong vua phat ra (dac trung cua phu de cuon)
    const tail = out.slice(-3);
    if (tail.includes(text)) continue;
    if (tail.length && tail[tail.length - 1].endsWith(text)) continue;

    out.push(text);
  }

  // noi lai, roi don mot lan nua cac cum lap ke nhau con sot
  return out.join(" ").replace(/\s+/g, " ").trim();
}

/** Uoc luong so tu — dung de bao do dai, khong dung de tinh tien. */
export const wordCount = (s) => String(s).split(/\s+/).filter(Boolean).length;
