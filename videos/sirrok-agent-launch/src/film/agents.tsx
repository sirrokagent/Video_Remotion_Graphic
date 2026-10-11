import React from 'react';
import {ev} from '../anim';
import {LOGO} from '../logo';
import {E} from '../theme';

/**
 * Avatar agent của Sirrok — đúng bộ chọn trong màn "New Agent" (out/ref-new-agent.png):
 * 11 màu × 12 hình, hình nào cũng có hai mắt trắng.
 *
 * Mọi hình được lấy mẫu thành N điểm theo GÓC quanh một tâm (toạ độ cực) → hai hình bất kỳ
 * có cùng cấu trúc điểm, nên biến hình (morph) chỉ là nội suy từng điểm: mượt, không giật.
 * Hình ghost lấy thẳng viền logo thật (src/logo.json); khi đứng yên vẽ đúng path gốc.
 *
 * Tất định hoàn toàn — không Math.random, mọi thứ tính một lần lúc nạp module.
 */

// ── Bảng màu (đọc từ ảnh tham chiếu, chỉnh lại cho tươi & sạch) ──
export const AGENT_COLORS = {
  black: '#111111',
  brown: '#7A4E2D',
  red: '#E53935',
  orange: '#F57C1F',
  yellow: '#F4B400',
  green: '#1E8E3E',
  teal: '#0FA38A',
  blue: '#1877F2',
  purple: '#8E44EC',
  pink: '#E8338B',
  grey: '#9AA0A6',
} as const;
export type AgentColor = keyof typeof AGENT_COLORS;
export const COLOR_KEYS = Object.keys(AGENT_COLORS) as AgentColor[];

// ── Hình học ──
type P = {x: number; y: number};
type Seg = {x1: number; y1: number; x2: number; y2: number; w: number};

const N = 120; // số điểm lấy mẫu quanh tâm
const TAU = Math.PI * 2;

const circle = (cx: number, cy: number, r: number, n = 72): P[] =>
  Array.from({length: n}, (_, i) => ({x: cx + r * Math.cos((i / n) * TAU), y: cy + r * Math.sin((i / n) * TAU)}));

/** Đa giác bo góc: mỗi đỉnh thay bằng cung bậc hai bán kính r (lấy mẫu dày). */
const rounded = (v: P[], r: number, steps = 12): P[] => {
  const out: P[] = [];
  for (let i = 0; i < v.length; i++) {
    const p = v[i];
    const a = v[(i - 1 + v.length) % v.length];
    const b = v[(i + 1) % v.length];
    const la = Math.hypot(a.x - p.x, a.y - p.y);
    const lb = Math.hypot(b.x - p.x, b.y - p.y);
    const ra = Math.min(r, la / 2);
    const rb = Math.min(r, lb / 2);
    const s = {x: p.x + ((a.x - p.x) / la) * ra, y: p.y + ((a.y - p.y) / la) * ra};
    const e = {x: p.x + ((b.x - p.x) / lb) * rb, y: p.y + ((b.y - p.y) / lb) * rb};
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      out.push({x: u * u * s.x + 2 * u * t * p.x + t * t * e.x, y: u * u * s.y + 2 * u * t * p.y + t * t * e.y});
    }
  }
  return out;
};

const rect = (x0: number, y0: number, x1: number, y1: number, r: number) =>
  rounded(
    [
      {x: x0, y: y0},
      {x: x1, y: y0},
      {x: x1, y: y1},
      {x: x0, y: y1},
    ],
    r,
    16,
  );

/** Viền thân logo ghost (chỉ có M / C / Z) → đa giác dày, đặt vào hộp 100×100. */
const ghostPoly = (k: number, ox: number, oy: number): P[] => {
  const nums = LOGO.body.match(/-?\d*\.?\d+/g)!.map(Number);
  const pts: P[] = [];
  let cur = {x: nums[0], y: nums[1]};
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const [x1, y1, x2, y2, x, y] = nums.slice(i, i + 6);
    for (let s = 1; s <= 6; s++) {
      const t = s / 6;
      const u = 1 - t;
      pts.push({
        x: u * u * u * cur.x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
        y: u * u * u * cur.y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
      });
    }
    cur = {x, y};
  }
  return pts.map((p) => ({x: ox + p.x * k, y: oy + p.y * k}));
};

/** Khoảng cách xa nhất từ tâm c theo góc th tới viền (hợp của nhiều đa giác). */
const ray = (c: P, th: number, polys: P[][]) => {
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  let best = 0;
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const ex = b.x - a.x;
      const ey = b.y - a.y;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((a.x - c.x) * ey - (a.y - c.y) * ex) / den;
      const u = ((a.x - c.x) * dy - (a.y - c.y) * dx) / den;
      if (t > 0 && u >= 0 && u <= 1 && t > best) best = t;
    }
  }
  return best;
};

/** Hai mắt "chấm dài" kiểu tham chiếu: tâm (50+dx, y), cách nhau gap, dài len, nghiêng tilt độ. */
const dots = (y: number, gap: number, len: number, w: number, tilt = 0, dx = 0): [Seg, Seg] => {
  const a = (tilt * Math.PI) / 180;
  const hx = (Math.sin(a) * len) / 2;
  const hy = (Math.cos(a) * len) / 2;
  const mk = (cx: number): Seg => ({x1: cx - hx, y1: y - hy, x2: cx + hx, y2: y + hy, w});
  return [mk(50 + dx - gap / 2), mk(50 + dx + gap / 2)];
};

// ghost: logo 100×86.3 thu về rộng 84, đặt giữa hộp
const GK = 0.84;
const GX = 8;
const GY = 50 - (86.3 * GK) / 2 + 3;
const ghostEyes = LOGO.eyes.map((e) => ({x1: GX + e.x1 * GK, y1: GY + e.y1 * GK, x2: GX + e.x2 * GK, y2: GY + e.y2 * GK, w: e.w * GK})) as [Seg, Seg];

type Def = {c: P; polys: P[][]; eyes: [Seg, Seg]};

const flowerPolys = (() => {
  const ps: P[][] = [circle(50, 52, 22)];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * TAU;
    ps.push(circle(50 + Math.cos(a) * 21, 52 + Math.sin(a) * 21, 19));
  }
  return ps;
})();

const dropPoly = (() => {
  const C0 = {x: 50, y: 62};
  const r = 29;
  const tip = {x: 50, y: 8};
  const d = Math.hypot(tip.x - C0.x, tip.y - C0.y);
  const al = Math.acos(r / d); // góc từ hướng tâm→đỉnh tới điểm tiếp tuyến
  const base = Math.atan2(tip.y - C0.y, tip.x - C0.x);
  const pts: P[] = [tip];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const a = base + al + (i / n) * (TAU - 2 * al);
    pts.push({x: C0.x + r * Math.cos(a), y: C0.y + r * Math.sin(a)});
  }
  return pts;
})();

const blobPoly = Array.from({length: 180}, (_, i) => {
  const a = (i / 180) * TAU;
  const r = 36 + 4.6 * Math.sin(2 * a + 1.1) + 3.4 * Math.cos(3 * a - 0.4) + 1.6 * Math.sin(5 * a + 0.3);
  return {x: 50 + r * Math.cos(a), y: 52 + r * Math.sin(a)};
});

const shieldPoly = (() => {
  // vai phẳng bo tròn, hai cạnh cong dần về mũi dưới
  const pts: P[] = [];
  const top = rect(14, 14, 86, 60, 16).filter((p) => p.y <= 44);
  const n = 30;
  const right: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    // bậc hai: (86,44) → điều khiển (86,80) → (50,92)
    right.push({x: u * u * 86 + 2 * u * t * 86 + t * t * 50, y: u * u * 44 + 2 * u * t * 80 + t * t * 92});
  }
  const left = right.map((p) => ({x: 100 - p.x, y: p.y})).reverse();
  pts.push(...top, ...right, ...left);
  return pts;
})();

const hexPoly = rounded(
  Array.from({length: 6}, (_, i) => ({x: 50 + 43 * Math.cos((i / 6) * TAU), y: 52 + 37 * Math.sin((i / 6) * TAU)})),
  9,
);

const DEFS = {
  ghost: {c: {x: 50, y: 54}, polys: [ghostPoly(GK, GX, GY)], eyes: ghostEyes},
  circle: {c: {x: 50, y: 52}, polys: [circle(50, 52, 39, 120)], eyes: dots(48, 19, 3, 8.4)},
  shield: {c: {x: 50, y: 48}, polys: [shieldPoly], eyes: dots(40, 22, 7.5, 6.4, 90)},
  squircle: {c: {x: 50, y: 52}, polys: [rect(13, 15, 87, 89, 20)], eyes: dots(47, 19, 3, 8.2)},
  capsule: {c: {x: 50, y: 52}, polys: [rect(27, 10, 73, 94, 23)], eyes: dots(54, 16, 8, 7)},
  triangle: {c: {x: 50, y: 60}, polys: [rounded([{x: 50, y: 10}, {x: 92, y: 86}, {x: 8, y: 86}], 13)], eyes: dots(62, 16, 7, 6.6, 0)},
  hexagon: {c: {x: 50, y: 52}, polys: [hexPoly], eyes: dots(50, 20, 3, 8)},
  cloud: {
    c: {x: 50, y: 58},
    polys: [circle(33, 58, 19), circle(56, 46, 24), circle(75, 60, 16), rect(14, 56, 88, 80, 12), circle(26, 67, 13)],
    eyes: dots(56, 18, 3, 7.6, 0, 3),
  },
  drop: {c: {x: 50, y: 60}, polys: [dropPoly], eyes: dots(64, 17, 7, 6.8)},
  oval: {c: {x: 50, y: 52}, polys: [Array.from({length: 120}, (_, i) => ({x: 50 + 31 * Math.cos((i / 120) * TAU), y: 52 + 40 * Math.sin((i / 120) * TAU)}))], eyes: dots(47, 16, 5, 7.6, 90)},
  blob: {c: {x: 50, y: 52}, polys: [blobPoly], eyes: dots(50, 18, 4.4, 7.4, 90, -4)},
  flower: {c: {x: 50, y: 52}, polys: flowerPolys, eyes: dots(51, 15, 7.5, 6.8)},
} satisfies Record<string, Def>;

export type AgentShape = keyof typeof DEFS;
/** 12 hình theo đúng thứ tự trong lưới chọn của màn New Agent. */
export const SHAPE_KEYS: AgentShape[] = ['ghost', 'circle', 'shield', 'squircle', 'capsule', 'triangle', 'hexagon', 'cloud', 'drop', 'oval', 'blob', 'flower'];

/** Bán kính theo góc của từng hình (N mẫu) — tính một lần. */
const RADII = Object.fromEntries(
  SHAPE_KEYS.map((k) => {
    const d: Def = DEFS[k];
    return [k, Array.from({length: N}, (_, i) => ray(d.c, -Math.PI / 2 + (i / N) * TAU, d.polys))];
  }),
) as Record<AgentShape, number[]>;

export const AGENT_SHAPES = Object.fromEntries(SHAPE_KEYS.map((k) => [k, {center: DEFS[k].c, radii: RADII[k], eyes: DEFS[k].eyes}])) as Record<
  AgentShape,
  {center: P; radii: number[]; eyes: [Seg, Seg]}
>;

// ── Màu ──
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
/** Trộn hai màu hex: t = 0 → a, 1 → b. */
export const mixHex = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Path mượt đi qua trung điểm các cạnh (đỉnh là điểm điều khiển bậc hai). */
const smoothPath = (pts: P[]) => {
  const n = pts.length;
  const mid = (a: P, b: P) => ({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M${m0.x.toFixed(2)} ${m0.y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    d += `Q${p.x.toFixed(2)} ${p.y.toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}`;
  }
  return d + 'Z';
};

/** Path của hình đang biến từ `from` sang `to` (t: 0 → 1). */
export const shapePath = (to: AgentShape, from: AgentShape = to, t = 1) => {
  if (from === to || t >= 1) {
    if (to === 'ghost') return null; // vẽ đúng path logo gốc
    t = 1;
    from = to;
  }
  const A = AGENT_SHAPES[from];
  const B = AGENT_SHAPES[to];
  const cx = lerp(A.center.x, B.center.x, t);
  const cy = lerp(A.center.y, B.center.y, t);
  const pts = A.radii.map((ra, i) => {
    const r = lerp(ra, B.radii[i], t);
    const a = -Math.PI / 2 + (i / N) * TAU;
    return {x: cx + r * Math.cos(a), y: cy + r * Math.sin(a)};
  });
  return smoothPath(pts);
};

const GHOST_D = (() => {
  // path logo gốc, biến đổi vào hộp 100×100
  let i = 0;
  return LOGO.body.replace(/-?\d*\.?\d+/g, (s) => {
    const v = Number(s);
    const out = i % 2 === 0 ? GX + v * GK : GY + v * GK;
    i++;
    return out.toFixed(3);
  });
})();

/** Băm tất định → [0,1). */
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};

type AvatarProps = {
  shape: AgentShape;
  /** mã hex (dùng AGENT_COLORS[...] hoặc mixHex khi đang đổi màu) */
  color: string;
  size: number;
  /** frame hiện tại — cho nhịp thở & chớp mắt tự động */
  f: number;
  /** 0 mở → 1 nhắm; cộng dồn với chớp tự động */
  blink?: number;
  /** liếc mắt, đơn vị hộp 100 */
  look?: {x: number; y: number};
  /** đang biến hình từ hình này… */
  from?: AgentShape;
  /** …tiến độ 0 → 1 */
  mix?: number;
  /** bóp dẹt: >0 bè ngang & thấp xuống, <0 cao & thon (neo ở đáy) */
  squash?: number;
  /** tắt thở/chớp tự động (vd. khi đang bay) */
  still?: boolean;
  style?: React.CSSProperties;
};

/**
 * Avatar agent: hình `shape` tô màu `color`, đổ bóng mềm, hai mắt trắng.
 * Hộp vuông `size`×`size`, position relative (bọc absolute bên ngoài nếu cần).
 */
export const AgentAvatar: React.FC<AvatarProps> = ({shape, color, size, f, blink = 0, look = {x: 0, y: 0}, from, mix = 1, squash = 0, still = false, style}) => {
  const id = React.useId().replace(/:/g, '');
  const seed = hash(shape + color);
  const fromS = from ?? shape;
  const t = Math.max(0, Math.min(1, mix));
  const d = shapePath(shape, fromS, t) ?? GHOST_D;

  // chớp mắt tự động mỗi ~100–130 frame, lệch pha theo hình + màu
  const period = 100 + Math.round(seed * 30);
  const ph = (f + Math.round(seed * 97)) % period;
  const auto = still ? 0 : ph < 3 ? ev(ph, [0, 3], [0, 1], E.snap) : ph < 9 ? ev(ph, [3, 9], [1, 0], E.out) : 0;
  const bl = Math.min(1, Math.max(blink, auto));
  const breathe = still ? 0 : Math.sin(f * 0.09 + seed * TAU) * 0.012;

  // mắt: nội suy giữa hai bộ mắt, co về tâm khi chớp
  const EA = AGENT_SHAPES[fromS].eyes;
  const EB = AGENT_SHAPES[shape].eyes;
  const eyes = EB.map((b, i) => {
    const a = t >= 1 ? b : EA[i];
    const s = {x1: lerp(a.x1, b.x1, t), y1: lerp(a.y1, b.y1, t), x2: lerp(a.x2, b.x2, t), y2: lerp(a.y2, b.y2, t), w: lerp(a.w, b.w, t)};
    const cx = (s.x1 + s.x2) / 2;
    const cy = (s.y1 + s.y2) / 2;
    const k = 1 - 0.85 * bl;
    // mắt chấm (gần như tròn) khi chớp thì dẹt theo chiều dọc
    return {...s, cx, cy, k};
  });

  const sx = 1 + squash * 0.5 - breathe * 0.5;
  const sy = 1 - squash * 0.5 + breathe;
  const light = mixHex(color, '#FFFFFF', color === AGENT_COLORS.black ? 0.2 : 0.3);
  const dark = mixHex(color, '#000000', 0.2);

  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0, ...style}}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <radialGradient id={`g${id}`} cx="0.36" cy="0.26" r="0.86">
            <stop offset="0" stopColor={light} />
            <stop offset="0.55" stopColor={color} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>
        </defs>
        <g transform={`translate(50 92) scale(${sx} ${sy}) translate(-50 -92)`}>
          <path d={d} fill={`url(#g${id})`} />
          {eyes.map((e, i) => {
            const isDot = Math.hypot(e.x2 - e.x1, e.y2 - e.y1) < 4.5;
            // chấm tròn: khi chớp thì thành vạch ngang mảnh
            if (isDot) {
              const rx = e.w / 2;
              const ry = (e.w / 2 + Math.abs(e.y2 - e.y1) / 2) * e.k;
              return <ellipse key={i} cx={e.cx + look.x} cy={e.cy + look.y} rx={rx} ry={Math.max(0.9, ry)} fill="#FFFFFF" />;
            }
            return (
              <line
                key={i}
                x1={e.cx + (e.x1 - e.cx) * e.k + look.x}
                y1={e.cy + (e.y1 - e.cy) * e.k + look.y}
                x2={e.cx + (e.x2 - e.cx) * e.k + look.x}
                y2={e.cy + (e.y2 - e.cy) * e.k + look.y}
                stroke="#FFFFFF"
                strokeWidth={e.w}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
