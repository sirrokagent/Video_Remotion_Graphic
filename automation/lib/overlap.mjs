/**
 * Canh chep nguyen van.
 *
 * Buoc viet kich ban nhet NGUYEN phu de cua nguoi khac vao prompt. Do la cach
 * duy nhat de phan tich duoc thu phap that, nhung no cung lam kha nang model
 * buong nguyen mot cau cua ho vao ban moi cao han han so voi khi chi dua tieu de.
 * Nen phai do, chu khong tin.
 */

/** Chuan hoa de so sanh: thuong hoa, bo dau cau, gop khoang trang. Giu dau tieng Viet. */
export function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[“”„"'’‘`]/g, "")
    .replace(/[.,!?;:()\[\]{}…—–\-/\\|*#>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const words = (s) => normalize(s).split(" ").filter(Boolean);

/** Tap hop moi cum n tu lien tiep cua mot van ban. */
export function ngrams(text, n) {
  const w = words(text);
  const set = new Set();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(" "));
  return set;
}

/**
 * Tim cac cum >= n tu xuat hien nguyen van trong ca ban moi lan ban goc.
 *
 * @param {string} draft ban kich ban moi
 * @param {{id?:string,title?:string,transcript:string}[]} sources cac ban goc
 * @param {number} n do dai cum coi la "chep" (mac dinh 8 tu)
 * @returns {{phrase:string, source:string}[]} danh sach cum trung, da gop cum con
 */
export function findVerbatim(draft, sources, n = 8) {
  const hits = [];
  const draftGrams = [...ngrams(draft, n)];
  if (!draftGrams.length) return hits;

  for (const src of sources) {
    const srcGrams = ngrams(src.transcript, n);
    for (const g of draftGrams) {
      if (srcGrams.has(g)) hits.push({ phrase: g, source: src.title || src.id || "?" });
    }
  }

  // gop: bo cum nao la con cua mot cum trung dai hon da ghi nhan
  hits.sort((a, b) => b.phrase.length - a.phrase.length);
  const kept = [];
  for (const h of hits) {
    if (kept.some((k) => k.source === h.source && k.phrase.includes(h.phrase))) continue;
    kept.push(h);
  }
  return kept;
}
