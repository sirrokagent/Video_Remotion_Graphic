import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {FONT} from '../theme';

/**
 * "BE DIFFERENT" — đám đông người xám bước đều trên con đường uốn lượn trong sương tối.
 * Một người mặc vest, cà vạt đỏ dừng lại ở ngã rẽ, ném chiếc cặp, rồi đi một mình sang lối khác;
 * máy quay bay lên cao, lộ ra ngã rẽ chữ V: một người một đường, cả đám đông một đường.
 *
 * Cảnh 3D tự dựng: phép chiếu phối cảnh viết tay, vẽ lên canvas mỗi frame (không thư viện 3D).
 * Tất định: mọi "ngẫu nhiên" lấy từ hàm băm theo chỉ số — không Math.random, không Date.now.
 */

export const DIFF_FPS = 30;
export const DIFF_DUR = 735; // 24,5 giây
const W = 1080;
const H = 1920;

type V3 = [number, number, number];

// ---------- tiện ích ----------
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// ---------- con đường ----------
// Đường chính: s ≤ 0, ngã rẽ ở gốc toạ độ. Hai nhánh: u ≥ 0.
const mainC = (s: number): V3 => {
  const taper = 1 - Math.exp(s / 22);
  return [(16 * Math.sin(s / 28) + 9 * Math.sin(s / 61)) * taper, 0, s];
};
const leftC = (u: number): V3 => [-0.62 * (u - 18 * (1 - Math.exp(-u / 18))) - 7 * Math.sin(u / 34) * (1 - Math.exp(-u / 40)), 0, u];
const rightC = (u: number): V3 => [0.72 * (u - 14 * (1 - Math.exp(-u / 14))) + 5 * Math.sin(u / 40) * (1 - Math.exp(-u / 50)), 0, u];

const normalOf = (fn: (s: number) => V3, s: number): V3 => {
  const a = fn(s - 0.25);
  const b = fn(s + 0.25);
  const d = norm(sub(b, a));
  return [d[2], 0, -d[0]]; // vuông góc, hướng sang phải khi đi về +z
};
const onRoad = (fn: (s: number) => V3, s: number, off: number): V3 => {
  const c = fn(s);
  const n = normalOf(fn, s);
  return [c[0] + n[0] * off, 0, c[2] + n[2] * off];
};

const ROADS = [
  {fn: mainC, from: -330, to: 0.5, width: 10.5},
  {fn: leftC, from: 0, to: 230, width: 5.6},
  {fn: rightC, from: 0, to: 230, width: 9.5},
];

// ---------- nhân vật ----------
const SPEED = 1.6;
const ROWS = 92;
const LANES = 6;
type Walker = {s0: number; lane: number; tone: number; phase: number; jx: number};
const CROWD: Walker[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let j = 0; j < LANES; j++) {
    const i = r * LANES + j;
    CROWD.push({
      s0: -18 - r * 1.22 + (hash(i, 1) - 0.5) * 0.7,
      lane: -3.9 + j * 1.56 + (hash(i, 2) - 0.5) * 0.5,
      tone: hash(i, 3),
      phase: hash(i, 4) * 6.28,
      jx: (hash(i, 5) - 0.5) * 0.25,
    });
  }
}

const crowdPos = (w: Walker, t: number): {p: V3; s: number} => {
  const s = w.s0 + SPEED * t;
  // gần ngã rẽ, đám đông dạt sang phải để vào nhánh phải
  const k = smooth(-22, 0, s);
  const target = -0.3 + ((w.lane + 3.9) / 7.8) * 4.6;
  const off = lerp(w.lane, target, k) + w.jx;
  if (s <= 0) return {p: onRoad(mainC, s, off), s};
  return {p: onRoad(rightC, s, off), s};
};

// Người khác biệt
const HERO_STOP = 10.5; // tới ngã rẽ
const HERO_GO = 13.4; // quay lưng bước đi
const HERO_SPEED = 2.05;
const heroState = (t: number) => {
  if (t < HERO_STOP) {
    const s = SPEED * (t - HERO_STOP);
    return {p: onRoad(mainC, s, -2.5), dist: s, walking: 1, front: true};
  }
  if (t < HERO_GO) return {p: [-2.5, 0, 0] as V3, dist: 0, walking: 0, front: true};
  const u = HERO_SPEED * (t - HERO_GO) * smooth(HERO_GO, HERO_GO + 0.8, t) + 0;
  const off = -2.5 * (1 - smooth(0, 7, u));
  return {p: onRoad(leftC, u, off), dist: u, walking: smooth(HERO_GO, HERO_GO + 0.5, t), front: false};
};

// Chiếc cặp: rời tay lúc 11,85 s, bay vòng cung rồi rơi xuống đường
const CASE_THROW = 11.85;
const CASE_LAND = 12.45;
const caseState = (t: number, hero: V3): {p: V3; rot: number; inHand: boolean} => {
  if (t < CASE_THROW) return {p: hero, rot: 0, inHand: true};
  const k = clamp((t - CASE_THROW) / (CASE_LAND - CASE_THROW));
  const from: V3 = [-2.2, 1.15, 0.15];
  const to: V3 = [-4.0, 0.16, 1.4];
  const p = lerp3(from, to, easeOut(k));
  p[1] = lerp(from[1], to[1], k * k) + Math.sin(Math.PI * k) * 0.9;
  const bounce = t > CASE_LAND ? Math.abs(Math.sin((t - CASE_LAND) * 18)) * Math.exp(-(t - CASE_LAND) * 9) * 0.25 : 0;
  p[1] += bounce;
  const rot = t < CASE_LAND ? k * 4.2 : 4.2 + 0.3 * Math.exp(-(t - CASE_LAND) * 6);
  return {p, rot, inHand: false};
};

// ---------- máy quay ----------
type Cam = {pos: V3; tgt: V3};
const KEYS: {t: number; cam: Cam}[] = [
  {t: 0, cam: {pos: add(mainC(-150), [5, 24, 0]), tgt: mainC(-62)}},
  {t: 5.2, cam: {pos: add(mainC(-78), [6, 15, 0]), tgt: add(mainC(-8), [0, 0, 0])}},
  {t: 8.4, cam: {pos: [3.2, 2.6, 13], tgt: [-1.6, 1.4, -9]}},
  {t: 10.4, cam: {pos: [-1.75, 1.42, 4.6], tgt: [-2.5, 1.12, 0]}},
  {t: 12.6, cam: {pos: [-1.95, 1.3, 3.9], tgt: [-2.5, 1.05, 0]}},
];
const ORBIT = {from: 12.6, to: 14.6};
export const camAt = (t: number): Cam => {
  if (t <= KEYS[KEYS.length - 1].t) {
    for (let i = 0; i < KEYS.length - 1; i++) {
      const a = KEYS[i];
      const b = KEYS[i + 1];
      if (t <= b.t) {
        const k = easeInOut(clamp((t - a.t) / (b.t - a.t)));
        const pos = lerp3(a.cam.pos, b.cam.pos, k);
        // khi bay qua đám đông, giữ máy trên đầu người
        if (i === 1) pos[1] = Math.max(pos[1], lerp(15, 2.6, k) + Math.sin(Math.PI * k) * 5);
        return {pos, tgt: lerp3(a.cam.tgt, b.cam.tgt, k)};
      }
    }
    return KEYS[0].cam;
  }
  const pivot: V3 = [-2.5, 1.2, 0];
  if (t <= ORBIT.to) {
    // vòng quanh người khác biệt: từ trước mặt sang sau lưng (đi qua phía trái)
    const k = easeInOut(clamp((t - ORBIT.from) / (ORBIT.to - ORBIT.from)));
    const a0 = Math.atan2(0.55, 3.9);
    const a1 = Math.atan2(-3.6, -4.2);
    const a = lerp(a0, a1, k);
    const r = lerp(3.94, 5.53, k);
    const pos: V3 = [pivot[0] + Math.sin(a) * r, lerp(1.3, 2.3, k), pivot[2] + Math.cos(a) * r];
    const hero = heroState(t).p;
    const tgt = lerp3([-2.5, 1.05, 0], add(hero, [0, 1.1, 0]), k);
    return {pos, tgt};
  }
  const hero = heroState(t).p;
  const stay: V3 = [-6.1, 2.3, -4.2];
  const k = easeInOut(clamp((t - 17.0) / (24.5 - 17.0)));
  const end: Cam = {pos: [2.5, 44, -34], tgt: [0, 0, 26]};
  const follow: Cam = {pos: stay, tgt: add(hero, [0, 1.0, 0])};
  return {pos: lerp3(follow.pos, end.pos, k), tgt: lerp3(follow.tgt, end.tgt, k)};
};

// ---------- phép chiếu ----------
const FOCAL = H / 2 / Math.tan((54 * Math.PI) / 180 / 2);
type Proj = {x: number; y: number; z: number};
export const makeCamera = (c: Cam) => {
  const f = norm(sub(c.tgt, c.pos));
  let r = cross([0, 1, 0], f);
  if (Math.hypot(r[0], r[1], r[2]) < 1e-3) r = [1, 0, 0];
  r = norm(r);
  const u = cross(f, r);
  const toCam = (p: V3): V3 => {
    const d = sub(p, c.pos);
    return [dot(d, r), dot(d, u), dot(d, f)];
  };
  const screen = (q: V3): Proj => ({x: W / 2 + (q[0] / q[2]) * FOCAL, y: H / 2 - (q[1] / q[2]) * FOCAL, z: q[2]});
  const project = (p: V3): Proj | null => {
    const q = toCam(p);
    if (q[2] < 0.15) return null;
    return screen(q);
  };
  return {toCam, screen, project, pos: c.pos};
};
type Camera = ReturnType<typeof makeCamera>;

const NEAR = 0.15;
const clipPoly = (pts: V3[]): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const ain = a[2] >= NEAR;
    const bin = b[2] >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin) {
      const k = (NEAR - a[2]) / (b[2] - a[2]);
      out.push(lerp3(a, b, k));
    }
  }
  return out;
};

const BG = [11, 11, 12];
const fogMix = (rgb: number[], dist: number, density = 95) => {
  const f = Math.exp(-dist / density);
  return `rgb(${Math.round(lerp(BG[0] + 14, rgb[0], f))},${Math.round(lerp(BG[1] + 14, rgb[1], f))},${Math.round(lerp(BG[2] + 15, rgb[2], f))})`;
};

// ---------- vẽ nền + đường ----------
export const drawWorld = (ctx: CanvasRenderingContext2D, cam: Camera) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1b1d');
  g.addColorStop(0.45, '#111112');
  g.addColorStop(1, '#09090a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // quầng sáng trong sương
  for (const G of [[-70, 60, 420], [80, 60, -460]] as V3[]) {
    const q = cam.toCam(G);
    if (q[2] <= 1) continue;
    const s = cam.screen(q);
    const rad = 420;
    const rg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad);
    rg.addColorStop(0, 'rgba(235,235,240,0.42)');
    rg.addColorStop(0.18, 'rgba(200,200,210,0.2)');
    rg.addColorStop(0.55, 'rgba(120,120,130,0.06)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(s.x - rad, s.y - rad, rad * 2, rad * 2);
  }

  // các đoạn mặt đường (xa vẽ trước) + thành đường dày
  type Quad = {pts: V3[]; side: boolean; depth: number; dist: number};
  const quads: Quad[] = [];
  const THICK = 2.2;
  for (const road of ROADS) {
    const step = 1;
    for (let s = road.from; s < road.to; s += step) {
      const s1 = Math.min(road.to, s + step);
      const a0 = onRoad(road.fn, s, -road.width / 2);
      const a1 = onRoad(road.fn, s, road.width / 2);
      const b0 = onRoad(road.fn, s1, -road.width / 2);
      const b1 = onRoad(road.fn, s1, road.width / 2);
      const mid: V3 = [(a0[0] + b1[0]) / 2, 0, (a0[2] + b1[2]) / 2];
      const dist = Math.hypot(...sub(mid, cam.pos));
      const depth = cam.toCam(mid)[2];
      if (depth < -8) continue;
      quads.push({pts: [a0, a1, b1, b0], side: false, depth, dist});
      // thành đường hai bên
      quads.push({pts: [a0, b0, [b0[0], -THICK, b0[2]], [a0[0], -THICK, a0[2]]], side: true, depth: depth + 0.01, dist});
      quads.push({pts: [a1, b1, [b1[0], -THICK, b1[2]], [a1[0], -THICK, a1[2]]], side: true, depth: depth + 0.01, dist});
    }
  }
  quads.sort((a, b) => b.depth - a.depth);
  for (const q of quads) {
    const cp = clipPoly(q.pts.map(cam.toCam));
    if (cp.length < 3) continue;
    ctx.beginPath();
    cp.forEach((p, i) => {
      const s = cam.screen(p);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    ctx.fillStyle = q.side ? fogMix([20, 20, 22], q.dist) : fogMix([44, 44, 47], q.dist, 120);
    ctx.fill();
    if (!q.side) {
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // viền sáng hai mép đường
  for (const road of ROADS) {
    for (const side of [-1, 1]) {
      let prev: V3 | null = null;
      for (let s = road.from; s <= road.to; s += 1) {
        const p = cam.toCam(onRoad(road.fn, s, (side * road.width) / 2));
        if (prev) {
          let a = prev;
          let b = p;
          if (a[2] >= NEAR || b[2] >= NEAR) {
            if (a[2] < NEAR) a = lerp3(a, b, (NEAR - a[2]) / (b[2] - a[2]));
            if (b[2] < NEAR) b = lerp3(b, a, (NEAR - b[2]) / (a[2] - b[2]));
            const sa = cam.screen(a);
            const sb = cam.screen(b);
            const dist = Math.hypot(...sub(onRoad(road.fn, s, (side * road.width) / 2), cam.pos));
            ctx.strokeStyle = fogMix([205, 205, 210], dist, 110);
            ctx.lineWidth = clamp(140 / Math.max(1, a[2]), 1.2, 7);
            ctx.beginPath();
            ctx.moveTo(sa.x, sa.y);
            ctx.lineTo(sb.x, sb.y);
            ctx.stroke();
          }
        }
        prev = p;
      }
    }
  }
};

// ---------- người ----------
type FigOpts = {
  body: string;
  head: string;
  phase: number;
  walk: number;
  hero?: boolean;
  front?: boolean;
  caseInHand?: boolean;
  throwArm?: number; // 0..1 vung tay ném
  lean?: number;
};
const drawFigure = (ctx: CanvasRenderingContext2D, x: number, y: number, h: number, o: FigOpts) => {
  const sw = Math.sin(o.phase) * 0.42 * o.walk;
  const bob = Math.abs(Math.cos(o.phase)) * 0.012 * h * o.walk;
  ctx.save();
  ctx.translate(x, y - bob);
  ctx.rotate((o.lean ?? 0) * 0.25);
  const limb = (ox: number, oy: number, len: number, wdt: number, ang: number, col: string) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(ang);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(-wdt / 2, 0, wdt, len, wdt / 2);
    ctx.fill();
    ctx.restore();
  };
  const legW = 0.085 * h;
  const hipY = -0.48 * h;
  const dark = o.hero ? '#2e2e33' : o.body;
  // chân
  limb(-0.045 * h, hipY, 0.48 * h, legW, sw, dark);
  limb(0.045 * h, hipY, 0.48 * h, legW, -sw, dark);
  // giày
  if (o.hero) {
    ctx.fillStyle = '#151517';
    for (const [ox, ang] of [[-0.045 * h, sw], [0.045 * h, -sw]]) {
      ctx.beginPath();
      ctx.ellipse(ox - Math.sin(ang) * 0.48 * h, hipY + Math.cos(ang) * 0.48 * h, 0.06 * h, 0.03 * h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // thân
  const bodyTop = -0.83 * h;
  ctx.fillStyle = o.body;
  ctx.beginPath();
  ctx.roundRect(-0.135 * h, bodyTop, 0.27 * h, hipY - bodyTop + 0.03 * h, 0.06 * h);
  ctx.fill();
  if (o.hero && o.front) {
    // áo sơ mi trắng chữ V + cà vạt đỏ
    ctx.fillStyle = '#e9e9ec';
    ctx.beginPath();
    ctx.moveTo(-0.05 * h, bodyTop);
    ctx.lineTo(0.05 * h, bodyTop);
    ctx.lineTo(0, bodyTop + 0.16 * h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d3192b';
    ctx.beginPath();
    ctx.moveTo(-0.014 * h, bodyTop + 0.012 * h);
    ctx.lineTo(0.014 * h, bodyTop + 0.012 * h);
    ctx.lineTo(0.022 * h, bodyTop + 0.17 * h);
    ctx.lineTo(0, bodyTop + 0.2 * h);
    ctx.lineTo(-0.022 * h, bodyTop + 0.17 * h);
    ctx.closePath();
    ctx.fill();
  }
  // tay
  const armLen = 0.36 * h;
  const armW = 0.07 * h;
  const handCol = o.hero ? '#f4f4f6' : '#e2e2e6';
  const arm = (sgn: number, ang: number, withCase: boolean) => {
    const ox = sgn * 0.15 * h;
    const oy = bodyTop + 0.03 * h;
    limb(ox, oy, armLen, armW, ang, o.body);
    const hx = ox - Math.sin(ang) * armLen;
    const hy = oy + Math.cos(ang) * armLen;
    ctx.fillStyle = handCol;
    ctx.beginPath();
    ctx.arc(hx, hy, 0.034 * h, 0, Math.PI * 2);
    ctx.fill();
    if (withCase) {
      ctx.fillStyle = '#3c3c40';
      ctx.beginPath();
      ctx.roundRect(hx - 0.09 * h, hy + 0.02 * h, 0.18 * h, 0.13 * h, 0.012 * h);
      ctx.fill();
      ctx.strokeStyle = '#5a5a5f';
      ctx.lineWidth = Math.max(1, 0.008 * h);
      ctx.strokeRect(hx - 0.09 * h, hy + 0.02 * h, 0.18 * h, 0.13 * h);
    }
  };
  const throwA = (o.throwArm ?? 0) * -2.3;
  arm(-1, -sw * 0.8 + 0.05, false);
  arm(1, sw * 0.8 - 0.05 + throwA, !!o.caseInHand);
  // đầu
  const headR = (o.hero ? 0.105 : 0.095) * h;
  ctx.fillStyle = o.head;
  ctx.beginPath();
  ctx.arc(0, bodyTop - headR * 0.95, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const grey = (v: number) => `rgb(${v},${v},${v + 3})`;

export const BeDifferent: React.FC = () => {
  const frame = useCurrentFrame();
  const worldRef = useRef<HTMLCanvasElement>(null);
  const crowdRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLCanvasElement>(null);
  const t = frame / DIFF_FPS;

  // độ nhoè hậu cảnh (chiều sâu trường ảnh) khi cận cảnh người khác biệt
  const dof = smooth(8.9, 10.2, t) * (1 - smooth(14.6, 16.6, t));
  const heroSeparate = dof > 0.001;

  useLayoutEffect(() => {
    const cam = makeCamera(camAt(t));
    const wctx = worldRef.current!.getContext('2d')!;
    const cctx = crowdRef.current!.getContext('2d')!;
    const hctx = heroRef.current!.getContext('2d')!;
    drawWorld(wctx, cam);
    cctx.clearRect(0, 0, W, H);
    hctx.clearRect(0, 0, W, H);

    type Item = {z: number; draw: (ctx: CanvasRenderingContext2D) => void; hero: boolean};
    const items: Item[] = [];
    const figureItem = (foot: V3, height: number, opts: FigOpts, hero: boolean, fogRgb: number[]) => {
      const q = cam.toCam(foot);
      if (q[2] < 0.6) return;
      const a = cam.screen(q);
      const top = cam.screen(cam.toCam(add(foot, [0, height, 0])));
      const hpx = Math.hypot(top.x - a.x, top.y - a.y);
      if (a.x < -hpx || a.x > W + hpx || a.y < -hpx * 0.2 || top.y > H + hpx) return;
      if (hpx < 0.8 || hpx > H * 1.6) return;
      const dist = Math.hypot(...sub(foot, cam.pos));
      const body = fogMix(fogRgb, dist, 80);
      const head = fogMix([fogRgb[0] + 70, fogRgb[1] + 70, fogRgb[2] + 72], dist, 80);
      items.push({
        z: q[2],
        hero,
        draw: (ctx) => {
          // phản chiếu trên mặt đường bóng
          ctx.save();
          ctx.globalAlpha = 0.17;
          ctx.translate(a.x, a.y);
          ctx.scale(1, -0.9);
          drawFigure(ctx, 0, 0, hpx, {...opts, body, head: opts.hero ? '#f2f2f4' : head});
          ctx.restore();
          drawFigure(ctx, a.x, a.y, hpx, {...opts, body, head: opts.hero ? '#f2f2f4' : head});
        },
      });
    };

    for (let i = 0; i < CROWD.length; i++) {
      const w = CROWD[i];
      const {p, s} = crowdPos(w, t);
      if (s > 228) continue;
      const tone = 112 + Math.round(w.tone * 40);
      figureItem(p, 1.78 + w.tone * 0.08, {body: grey(tone), head: grey(tone + 60), phase: s * 3.6 + w.phase, walk: 1}, false, [tone, tone, tone + 3]);
    }

    const hs = heroState(t);
    const cs = caseState(t, hs.p);
    const throwArm = t < CASE_THROW ? smooth(11.35, CASE_THROW, t) : 1 - smooth(CASE_THROW + 0.1, 12.6, t);
    const lean = smooth(11.35, CASE_THROW, t) * (1 - smooth(CASE_THROW + 0.1, 12.8, t));
    const heroPhase = t < HERO_STOP ? hs.dist * 3.6 : t < HERO_GO ? 0 : hs.dist * 3.0;
    figureItem(hs.p, 1.86, {body: '#4b4b51', head: '#f2f2f4', phase: heroPhase, walk: hs.walking, hero: true, front: hs.front, caseInHand: cs.inHand, throwArm, lean: -lean}, true, [75, 75, 81]);

    if (!cs.inHand) {
      const q = cam.toCam(cs.p);
      if (q[2] > 0.5) {
        const a = cam.screen(q);
        const top = cam.screen(cam.toCam(add(cs.p, [0, 0.36, 0])));
        const sz = Math.hypot(top.x - a.x, top.y - a.y);
        items.push({
          z: q[2],
          hero: true,
          draw: (ctx) => {
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(cs.rot);
            ctx.fillStyle = '#3c3c40';
            ctx.beginPath();
            ctx.roundRect(-sz * 0.65, -sz * 0.5, sz * 1.3, sz, sz * 0.08);
            ctx.fill();
            ctx.fillStyle = '#5a5a5f';
            ctx.fillRect(-sz * 0.2, -sz * 0.68, sz * 0.4, sz * 0.18);
            ctx.restore();
          },
        });
      }
    }

    items.sort((a, b) => b.z - a.z);
    for (const it of items) it.draw(it.hero && heroSeparate ? hctx : cctx);
  }, [t, heroSeparate]);

  const textIn = smooth(0.3, 1.8, t);
  const fadeOut = smooth(23.9, 24.5, t);
  return (
    <AbsoluteFill style={{background: '#0b0b0c'}}>
      <Audio src={staticFile('different/score.mp3')} />
      <canvas ref={worldRef} width={W} height={H} style={{position: 'absolute', inset: 0, filter: `blur(${dof * 2.2}px)`}} />
      <canvas ref={crowdRef} width={W} height={H} style={{position: 'absolute', inset: 0, filter: `blur(${dof * 9}px)`}} />
      <canvas ref={heroRef} width={W} height={H} style={{position: 'absolute', inset: 0}} />
      {/* hạt sương / vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 38,
          letterSpacing: '0.55em',
          paddingLeft: '0.55em',
          color: '#a9a9ae',
          opacity: textIn,
        }}
      >
        BE DIFFERENT
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
