import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../anim';
import {EYE_ANGLE_DEG, EYE_MID, LOGO, LOGO_H} from '../logo';
import {C, E, FONT} from '../theme';
import {Kinetic} from './text';

/**
 * Thư viện hiệu ứng cho icon ghost của Sirrok.
 *
 *   <FX.glitch f={f - start} size={520} dark />
 *
 * Mỗi hiệu ứng là hàm thuần của `f` (số frame kể từ lúc hiệu ứng bắt đầu):
 * chạy phần "trình diễn" trong ~40 frame đầu rồi đứng yên thành logo sạch,
 * sau đó chỉ còn nhịp sống nhẹ (chớp mắt, quầng sáng, sóng nghe…).
 * Vẽ đúng logo thật (LOGO.body + hai nét mắt nghiêng song song), không ngẫu nhiên:
 * mọi thứ "lộn xộn" đều lấy từ hàm băm tất định `rnd`.
 * `dark` = đang đặt trên nền đen → thân trắng, mắt đen.
 */

/* ================= hình học dùng chung ================= */

/** Hàm băm tất định thay cho Math.random. */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Pt = {x: number; y: number};

const BODY = LOGO.body;
const CX = 50;
const CY = LOGO_H / 2;
const BLUE = '#1877F2';
const CYAN = '#2ED3F0';
const DEEP = '#0A2E6B';

/** Thân ghost trải thành đa giác (mỗi đoạn cubic 10 điểm) để thử điểm-trong-hình. */
const POLY: Pt[] = (() => {
  const tk = BODY.match(/[MCZ]|-?\d*\.?\d+/g) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cmd = '';
  let cur: Pt = {x: 0, y: 0};
  const num = () => parseFloat(tk[i++]);
  while (i < tk.length) {
    const t = tk[i];
    if (t === 'M' || t === 'C' || t === 'Z') {
      cmd = t;
      i++;
      continue;
    }
    if (cmd === 'M') {
      cur = {x: num(), y: num()};
      pts.push(cur);
    } else if (cmd === 'C') {
      const x1 = num();
      const y1 = num();
      const x2 = num();
      const y2 = num();
      const x = num();
      const y = num();
      for (let s = 1; s <= 10; s++) {
        const u = s / 10;
        const v = 1 - u;
        pts.push({
          x: v * v * v * cur.x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x,
          y: v * v * v * cur.y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y,
        });
      }
      cur = {x, y};
    } else i++;
  }
  return pts;
})();

/** Độ dài cộng dồn dọc viền — để tìm điểm ngòi bút cho hiệu ứng "nét vẽ". */
const CUM: number[] = (() => {
  const c = [0];
  for (let i = 1; i < POLY.length; i++) c.push(c[i - 1] + Math.hypot(POLY[i].x - POLY[i - 1].x, POLY[i].y - POLY[i - 1].y));
  return c;
})();

const pointAt = (frac: number): Pt => {
  const L = CUM[CUM.length - 1] * Math.min(1, Math.max(0, frac));
  let i = 1;
  while (i < CUM.length - 1 && CUM[i] < L) i++;
  const a = POLY[i - 1];
  const b = POLY[i];
  const seg = CUM[i] - CUM[i - 1] || 1;
  const t = (L - CUM[i - 1]) / seg;
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
};

const inside = (x: number, y: number) => {
  let c = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const a = POLY[i];
    const b = POLY[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};

/** Khoảng cách tới mép nét mắt gần nhất (âm = nằm trong nét mắt). */
const eyeGap = (x: number, y: number) => {
  let m = Infinity;
  for (const e of LOGO.eyes) {
    const dx = e.x2 - e.x1;
    const dy = e.y2 - e.y1;
    const t = Math.max(0, Math.min(1, ((x - e.x1) * dx + (y - e.y1) * dy) / (dx * dx + dy * dy)));
    m = Math.min(m, Math.hypot(x - (e.x1 + dx * t), y - (e.y1 + dy * t)) - e.w / 2);
  }
  return m;
};

/** Lưới lục giác các điểm nằm trong thân, chừa chỗ hai mắt. */
const sample = (step: number): Pt[] => {
  const out: Pt[] = [];
  const dy = step * 0.866;
  for (let r = 0, y = dy / 2; y < LOGO_H; r++, y += dy) {
    for (let x = r % 2 ? step / 2 : 0; x <= 100; x += step) {
      if (inside(x, y) && eyeGap(x, y) > 0.5) out.push({x, y});
    }
  }
  return out;
};

/**
 * Hai nét mắt, công thức y hệt src/logo.tsx (eyeLines) để khớp từng pixel với
 * EyePair/Ghost. `k` = độ dài nét (1 = mở, 0.14 = nhắm).
 */
export const eyeSegs = (k = 1, look: Pt = {x: 0, y: 0}) =>
  LOGO.eyes.map((e) => {
    const cx = (e.x1 + e.x2) / 2;
    const cy = (e.y1 + e.y2) / 2;
    return {
      x1: cx + (e.x1 - cx) * k + look.x,
      y1: cy + (e.y1 - cy) * k + look.y,
      x2: cx + (e.x2 - cx) * k + look.x,
      y2: cy + (e.y2 - cy) * k + look.y,
      w: e.w,
    };
  });

const Eyes: React.FC<{k?: number; look?: Pt; color: string; opacity?: number; widthMul?: number; filter?: string}> = ({
  k = 1,
  look,
  color,
  opacity = 1,
  widthMul = 1,
  filter,
}) => (
  <g opacity={opacity} filter={filter}>
    {eyeSegs(k, look).map((l, i) => (
      <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={l.w * widthMul} strokeLinecap="round" />
    ))}
  </g>
);

const pal = (dark?: boolean) => ({body: dark ? C.white : C.ink, eye: dark ? C.ink : C.white});

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** Trộn hai màu hex (t: 0 → a, 1 → b). */
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = Math.min(1, Math.max(0, t));
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};

/** Chớp mắt khi đứng yên: lần đầu ở frame 52, rồi cứ 84 frame một lần. Trả về độ dài nét mắt. */
const idleK = (f: number) => {
  if (f < 46) return 1;
  const s = 46 + 84 * Math.floor((f - 46) / 84);
  return 1 - 0.86 * blinkAt(f, [s + 6]);
};

const Stage: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={(size * LOGO_H) / 100} viewBox={`0 0 100 ${LOGO_H}`} style={{display: 'block', overflow: 'visible'}}>
    {children}
  </svg>
);

const useSvgId = () => React.useId().replace(/:/g, '');

export type FxProps = {f: number; size: number; dark?: boolean};
type Fx = React.FC<FxProps>;

/* ================= 1. Nét vẽ ================= */
/** Viền chạy ra từ đỉnh đầu về hai phía, gặp nhau ở chân, rồi đổ đầy; mắt bật ra. */
const Draw: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const line = ev(f, [0, 26], [0, 1], E.inOut);
  const fill = ev(f, [22, 36], [0, 1], E.out);
  const pop = ev(f, [28, 40], [0, 1], E.back);
  const half = line / 2;
  const tipO = ev(f, [0, 3], [0, 1], E.out) * (1 - ev(f, [22, 28], [0, 1], E.in));
  const tips = [pointAt(half), pointAt(1 - half)];
  const sw = 1.4 * (1 - fill);
  return (
    <Stage size={size}>
      <path d={BODY} fill={p.body} fillOpacity={fill} stroke="none" />
      {sw > 0.01 ? (
        <>
          <path d={BODY} fill="none" stroke={p.body} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={`${half} 2`} />
          <path d={BODY} fill="none" stroke={p.body} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={`${half} 2`} strokeDashoffset={-(1 - half)} />
        </>
      ) : null}
      {tips.map((t, i) => (
        <g key={i} opacity={tipO}>
          <circle cx={t.x} cy={t.y} r={5.5} fill={BLUE} opacity={0.22} />
          <circle cx={t.x} cy={t.y} r={2.1} fill={BLUE} />
        </g>
      ))}
      <Eyes k={Math.max(0, pop) * idleK(f)} color={p.eye} opacity={ev(f, [28, 31], [0, 1], E.out)} />
    </Stage>
  );
};

/* ================= 2. Chất lỏng ================= */
/** Các giọt mực bay vào, nhập vào thân (gooey), thân gợn sóng rồi lặng. */
const DROPS = Array.from({length: 10}, (_, i) => {
  const a = (i / 10) * Math.PI * 2 + rnd(i + 40) * 0.5;
  const R = 46 + rnd(i + 50) * 22;
  return {dx: Math.cos(a) * R * 1.2, dy: Math.sin(a) * R * 0.85, r: 4 + rnd(i + 60) * 4.5, d: rnd(i + 70) * 10};
});

const Liquid: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const id = useSvgId();
  const amt = 1 - ev(f, [0, 38], [0, 1], E.out);
  const grow = ev(f, [0, 28], [0.35, 1], E.back);
  const clean = ev(f, [30, 40], [0, 1], E.inOut);
  const bf = 0.05 + 0.018 * amt * Math.sin(f * 0.27);
  return (
    <Stage size={size}>
      <defs>
        <filter id={`g${id}`} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={bf} numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={24 * amt} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={1.8} result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
      </defs>
      {clean < 1 ? (
        <g filter={`url(#g${id})`} opacity={1 - clean}>
          <path d={BODY} fill={p.body} transform={`translate(${CX} ${CY}) scale(${grow}) translate(${-CX} ${-CY})`} />
          {DROPS.map((d, i) => {
            const t = ev(f, [d.d, d.d + 20], [0, 1], E.inOut);
            return <circle key={i} cx={CX + d.dx * (1 - t)} cy={CY + d.dy * (1 - t)} r={d.r * (1 - 0.6 * t)} fill={p.body} />;
          })}
        </g>
      ) : null}
      <path d={BODY} fill={p.body} opacity={clean} />
      <Eyes k={Math.max(0, ev(f, [24, 36], [0, 1], E.back)) * idleK(f)} color={p.eye} opacity={ev(f, [24, 28], [0, 1], E.out)} />
    </Stage>
  );
};

/* ================= 3. Nhiễu số ================= */
/** Tách kênh xanh/lục lam, các lát ngang trượt lệch, khựng rồi khoá về sạch. Thỉnh thoảng giật nhẹ. */
const Glitch: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const id = useSvgId();
  let A = keys(f, [0, 12, 30], [1, 0.75, 0], E.in);
  if (f > 50) {
    const c = (f - 50) % 76;
    if (c < 3) A = 0.22;
  }
  const s = Math.floor(f / 2);
  const N = 9;
  const ys = Array.from({length: N + 1}, (_, k) =>
    k === 0 ? -12 : k === N ? LOGO_H + 12 : (k * LOGO_H) / N + (rnd(k + s * 17) - 0.5) * 5 * Math.min(1, A * 3),
  );
  const split = A > 0.01 ? 3.6 * A + 0.5 : 0;
  const hide = f < 10 && rnd(s + 99) < 0.35;
  const k = idleK(f);
  return (
    <Stage size={size}>
      <defs>
        {ys.slice(0, N).map((y, i) => (
          <clipPath key={i} id={`c${id}${i}`}>
            <rect x={-60} y={y} width={220} height={ys[i + 1] - y} />
          </clipPath>
        ))}
      </defs>
      {hide
        ? null
        : ys.slice(0, N).map((_, i) => {
            const dx = rnd(i * 7 + s * 31) < 0.45 ? 0 : (rnd(i * 3 + s * 11) - 0.5) * 46 * A;
            return (
              <g key={i} clipPath={`url(#c${id}${i})`}>
                <g transform={`translate(${dx} 0)`}>
                  {split > 0 ? (
                    <>
                      <path d={BODY} fill={BLUE} transform={`translate(${-split} ${split * 0.25})`} />
                      <path d={BODY} fill={CYAN} transform={`translate(${split} ${-split * 0.25})`} />
                    </>
                  ) : null}
                  <path d={BODY} fill={p.body} />
                  <Eyes k={k} color={p.eye} />
                </g>
              </g>
            );
          })}
      {A > 0.2
        ? Array.from({length: 7}, (_, i) => (
            <rect
              key={i}
              x={-10 + rnd(i * 5 + s * 13) * 110}
              y={rnd(i * 9 + s * 7) * LOGO_H}
              width={4 + rnd(i * 2 + s) * 22}
              height={0.8 + rnd(i * 4 + s * 3) * 2.4}
              fill={i % 3 === 0 ? CYAN : i % 3 === 1 ? BLUE : p.body}
              opacity={A}
            />
          ))
        : null}
    </Stage>
  );
};

/* ================= 4. Hạt tụ ================= */
/** ~300 hạt từ khắp nơi xoáy về, xếp thành thân ghost rồi liền khối. */
const PART = sample(4.1);
const PART_START = PART.map((pt, i) => {
  const a = rnd(i * 3 + 1) * Math.PI * 2;
  const R = 55 + rnd(i * 5 + 2) * 75;
  return {x: CX + Math.cos(a) * R * 1.3, y: CY + Math.sin(a) * R * 0.8, d: rnd(i * 7 + 3) * 10, sw: (rnd(i * 11 + 4) - 0.5) * 34};
});

const Particles: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const solid = ev(f, [30, 40], [0, 1], E.inOut);
  return (
    <Stage size={size}>
      {solid < 1 ? (
        <g opacity={1 - solid}>
          {PART.map((pt, i) => {
            const s0 = PART_START[i];
            const t = ev(f, [s0.d, s0.d + 22], [0, 1], E.inOut);
            const vx = pt.x - s0.x;
            const vy = pt.y - s0.y;
            const len = Math.hypot(vx, vy) || 1;
            const sw = Math.sin(t * Math.PI) * s0.sw;
            const x = s0.x + vx * t + (-vy / len) * sw;
            const y = s0.y + vy * t + (vx / len) * sw;
            return <circle key={i} cx={x} cy={y} r={0.75 + t * t * 1.85} fill={i % 6 === 0 && t < 0.97 ? BLUE : p.body} />;
          })}
        </g>
      ) : null}
      <path d={BODY} fill={p.body} opacity={solid} />
      <Eyes k={Math.max(0, ev(f, [30, 40], [0, 1], E.back)) * idleK(f)} color={p.eye} opacity={ev(f, [30, 33], [0, 1], E.out)} />
    </Stage>
  );
};

/* ================= 5. Đèn neon ================= */
/** Ống neon xanh nhấp nháy khi bật, mắt sáng sau, rồi thân đổ đầy; quầng xanh còn "rung" nhẹ. */
const FLK = [0, 0.9, 0.1, 0, 1, 1, 0.15, 1, 0.55, 1, 1, 0.3, 1, 1, 1, 1];
const flick = (f: number, from: number) => {
  const i = Math.floor(f - from);
  return i < 0 ? 0 : i >= FLK.length ? 1 : FLK[i];
};

const Neon: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const id = useSvgId();
  const on = flick(f, 0);
  const eyeOn = flick(f, 12);
  const fill = ev(f, [28, 40], [0, 1], E.inOut);
  const hum = 0.88 + 0.12 * Math.sin(f * 0.33);
  const glow = on * (1 - 0.55 * fill) * hum;
  return (
    <Stage size={size}>
      <defs>
        <filter id={`n${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={3.2} result="a" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={1} result="b" />
          <feMerge>
            <feMergeNode in="a" />
            <feMergeNode in="a" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={BODY} fill="none" stroke={BLUE} strokeWidth={1.8} filter={`url(#n${id})`} opacity={glow} />
      <path d={BODY} fill={p.body} opacity={fill} />
      <path d={BODY} fill="none" stroke="#D6E7FF" strokeWidth={0.5} opacity={on * (1 - fill)} />
      <Eyes k={idleK(f)} color={BLUE} widthMul={0.4} filter={`url(#n${id})`} opacity={eyeOn * (1 - fill)} />
      <Eyes k={idleK(f)} color="#D6E7FF" widthMul={0.14} opacity={eyeOn * (1 - fill)} />
      <Eyes k={idleK(f)} color={p.eye} opacity={fill} />
    </Stage>
  );
};

/* ================= 6. Chấm lưới ================= */
/** Lưới chấm halftone: sóng thứ nhất toả từ giữa hai mắt (chấm xanh), sóng thứ hai làm chấm to ra liền khối. */
const HALF = sample(2.9);
const HALF_D = HALF.map((pt) => Math.hypot(pt.x - EYE_MID.x, pt.y - EYE_MID.y) * 0.25);

const Halftone: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const solid = ev(f, [37, 42], [0, 1], E.inOut);
  return (
    <Stage size={size}>
      {solid < 1
        ? HALF.map((pt, i) => {
            const d = HALF_D[i];
            const w1 = ev(f, [d, d + 10], [0, 1], E.back);
            const w2 = ev(f, [d + 12, d + 22], [0, 1], E.out);
            const r = 2.9 * (0.34 * w1 + 0.28 * w2);
            return r > 0.02 ? <circle key={i} cx={pt.x} cy={pt.y} r={r} fill={mix(BLUE, p.body === C.ink ? '#000000' : '#FFFFFF', w2)} /> : null;
          })
        : null}
      <path d={BODY} fill={p.body} opacity={solid} />
      <Eyes k={idleK(f)} color={p.eye} opacity={solid} />
    </Stage>
  );
};

/* ================= 7. Dư ảnh ================= */
/** Ghost lướt vào, kéo theo sáu bóng xanh mờ dần; các bóng đuổi kịp và chập làm một. */
const echoState = (t: number) => {
  const u = ev(t, [0, 28], [0, 1], E.out);
  return {x: 62 * (1 - u), rot: -12 * (1 - u), sc: 0.82 + 0.18 * u, o: ev(t, [0, 4], [0, 1], E.out)};
};

const Echo: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const tf = (s: ReturnType<typeof echoState>) => `translate(${s.x} 0) translate(${CX} ${CY}) rotate(${s.rot}) scale(${s.sc}) translate(${-CX} ${-CY})`;
  const main = echoState(f);
  return (
    <Stage size={size}>
      {[6, 5, 4, 3, 2, 1].map((j) => {
        const s = echoState(f - j * 2.2);
        return <path key={j} d={BODY} fill={j % 2 ? BLUE : CYAN} opacity={s.o * 0.62 * (1 - j / 7)} transform={tf(s)} />;
      })}
      <g transform={tf(main)} opacity={main.o}>
        <path d={BODY} fill={p.body} />
        <Eyes k={idleK(f)} color={p.eye} />
      </g>
    </Stage>
  );
};

/* ================= 8. Mảnh vỡ ================= */
/** Thân cắt thành lát song song với nét mắt; các lát bay vào từ hai đầu và khoá khớp. */
const SH_A = (EYE_ANGLE_DEG * Math.PI) / 180;
const SH_U = {x: Math.cos(SH_A), y: Math.sin(SH_A)};
const SH_N = {x: -SH_U.y, y: SH_U.x};
const SH_COUNT = 9;
const SH_BANDS = Array.from({length: SH_COUNT}, (_, i) => {
  const s0 = -62 + (124 / SH_COUNT) * i;
  const s1 = s0 + 124 / SH_COUNT;
  const P = (s: number, l: number) => `${CX + SH_N.x * s + SH_U.x * l},${CY + SH_N.y * s + SH_U.y * l}`;
  return {
    pts: [P(s0, 120), P(s1, 120), P(s1, -120), P(s0, -120)].join(' '),
    mid: (s0 + s1) / 2,
    order: Math.abs(i - (SH_COUNT - 1) / 2),
    dir: i % 2 ? 1 : -1,
    dist: 70 + rnd(i + 200) * 45,
    drift: (rnd(i + 210) - 0.5) * 16,
  };
});

const Shatter: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const id = useSvgId();
  const seam = ev(f, [16, 24], [0, 1], E.out) * (1 - ev(f, [30, 42], [0, 1], E.inOut));
  return (
    <Stage size={size}>
      <defs>
        {SH_BANDS.map((b, i) => (
          <clipPath key={i} id={`s${id}${i}`}>
            <polygon points={b.pts} />
          </clipPath>
        ))}
        <clipPath id={`sb${id}`}>
          <path d={BODY} />
        </clipPath>
      </defs>
      {SH_BANDS.map((b, i) => {
        const a = b.order * 2.2;
        const t = ev(f, [a, a + 20], [0, 1], E.out);
        const off = (1 - t) * b.dir * b.dist;
        const ox = SH_U.x * off + SH_N.x * b.drift * (1 - t);
        const oy = SH_U.y * off + SH_N.y * b.drift * (1 - t);
        const bx = CX + SH_N.x * b.mid;
        const by = CY + SH_N.y * b.mid;
        return (
          <g key={i} opacity={ev(f, [a, a + 5], [0, 1], E.out)} transform={`translate(${ox} ${oy}) rotate(${(1 - t) * b.dir * 9} ${bx} ${by})`}>
            <g clipPath={`url(#s${id}${i})`}>
              <path d={BODY} fill={p.body} />
              <Eyes k={idleK(f)} color={p.eye} />
            </g>
          </g>
        );
      })}
      {seam > 0.01 ? (
        <g clipPath={`url(#sb${id})`} opacity={seam}>
          {SH_BANDS.slice(1).map((b, i) => {
            const s = b.mid - 124 / SH_COUNT / 2;
            return (
              <line
                key={i}
                x1={CX + SH_N.x * s + SH_U.x * 120}
                y1={CY + SH_N.y * s + SH_U.y * 120}
                x2={CX + SH_N.x * s - SH_U.x * 120}
                y2={CY + SH_N.y * s - SH_U.y * 120}
                stroke={BLUE}
                strokeWidth={0.7}
              />
            );
          })}
        </g>
      ) : null}
    </Stage>
  );
};

/* ================= 9. Khối 3D ================= */
/** Ghost có bề dày (các lớp xanh xếp chồng), xoay từ nghiêng về chính diện. Đứng yên vẫn lắc rất nhẹ. */
const Extrude: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const u = ev(f, [0, 40], [0, 1], E.out);
  const sway = ev(f, [40, 70], [0, 1], E.inOut) * 3.5 * Math.sin((f - 40) * 0.055);
  const th = ((-62 * (1 - u) + sway) * Math.PI) / 180;
  const ph = ((16 * (1 - u)) * Math.PI) / 180;
  const cos = Math.cos(th);
  const N = 18;
  const dz = 0.85;
  const sc = 0.78 + 0.22 * u;
  const mat = (d: number) => `matrix(${cos} 0 0 1 ${CX - CX * cos + d * dz * Math.sin(th)} ${-d * dz * Math.sin(ph)})`;
  return (
    <Stage size={size}>
      <g transform={`translate(${CX} ${CY}) scale(${sc}) translate(${-CX} ${-CY})`} opacity={ev(f, [0, 5], [0, 1], E.out)}>
        {Array.from({length: N}, (_, i) => N - i).map((d) => (
          <path key={d} d={BODY} fill={mix(BLUE, DEEP, d / N)} transform={mat(d)} />
        ))}
        <g transform={mat(0)}>
          <path d={BODY} fill={p.body} />
          <Eyes k={idleK(f)} color={p.eye} />
        </g>
      </g>
    </Stage>
  );
};

/* ================= 10. Hologram ================= */
/** Tia quét dựng ghost xanh trong suốt có vân quét, chập chờn, rồi đông đặc lại. Đứng yên: thỉnh thoảng một tia quét lướt qua. */
const Hologram: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const id = useSvgId();
  const reveal = ev(f, [0, 24], [0, 1], E.inOut);
  const yEdge = -4 + reveal * (LOGO_H + 8);
  const flick = f < 30 ? 0.62 + 0.38 * rnd(Math.floor(f / 2) + 3) : 1;
  const jit = f < 28 && rnd(f * 1.3 + 9) > 0.8 ? (rnd(f + 2) - 0.5) * 8 : 0;
  const holo = 1 - ev(f, [30, 40], [0, 1], E.inOut);
  const cyc = f >= 46 ? (f - 46) % 96 : -1;
  const idleY = cyc >= 0 && cyc <= 32 ? ev(cyc, [0, 32], [-4, LOGO_H + 4], E.inOut) : -99;
  return (
    <Stage size={size}>
      <defs>
        <linearGradient id={`hg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8EC2FF" />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <pattern id={`hp${id}`} width={100} height={1.7} patternUnits="userSpaceOnUse">
          <rect width={100} height={0.65} fill={dark ? '#000000' : '#FFFFFF'} opacity={0.6} />
        </pattern>
        <clipPath id={`hr${id}`}>
          <rect x={-20} y={-20} width={140} height={yEdge + 20} />
        </clipPath>
        <clipPath id={`hb${id}`}>
          <path d={BODY} />
        </clipPath>
        <filter id={`hf${id}`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation={1.2} />
        </filter>
      </defs>
      {holo > 0 ? (
        <g opacity={holo * flick} transform={`translate(${jit} 0)`}>
          <g clipPath={`url(#hr${id})`}>
            <path d={BODY} fill={`url(#hg${id})`} opacity={0.72} />
            <rect x={0} y={0} width={100} height={LOGO_H} fill={`url(#hp${id})`} clipPath={`url(#hb${id})`} />
            <path d={BODY} fill="none" stroke="#CFE4FF" strokeWidth={0.6} />
            <Eyes k={idleK(f)} color={dark ? '#03122B' : C.white} />
          </g>
          {reveal < 1 ? (
            <g>
              <rect x={-14} y={yEdge - 1.4} width={128} height={2.8} fill={BLUE} filter={`url(#hf${id})`} />
              <rect x={-14} y={yEdge - 0.35} width={128} height={0.7} fill="#E6F1FF" />
            </g>
          ) : null}
        </g>
      ) : null}
      <g opacity={1 - holo}>
        <path d={BODY} fill={p.body} />
        <Eyes k={idleK(f)} color={p.eye} />
      </g>
      {idleY > -50 ? (
        <g clipPath={`url(#hb${id})`} opacity={0.75}>
          <rect x={0} y={idleY - 1.6} width={100} height={3.2} fill={BLUE} filter={`url(#hf${id})`} />
        </g>
      ) : null}
    </Stage>
  );
};

/* ================= 11. Sóng lắng nghe ================= */
/** Ghost bật vào, các vòng sóng hình viên thuốc toả ra từ từng nét mắt; mắt chớp hai lần. Đứng yên vẫn nghe. */
const EYE_GEOM = LOGO.eyes.map((e) => ({
  cx: (e.x1 + e.x2) / 2,
  cy: (e.y1 + e.y2) / 2,
  len: Math.hypot(e.x2 - e.x1, e.y2 - e.y1),
  ang: (Math.atan2(e.y2 - e.y1, e.x2 - e.x1) * 180) / Math.PI,
  w: e.w,
}));

const Pulse: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const pop = ev(f, [0, 12], [0, 1], E.back);
  const blink = blinkAt(f, [16, 30]);
  const emits: {s: number; life: number; o: number}[] = [0, 9, 18, 27].map((s) => ({s, life: 26, o: 1}));
  if (f >= 46) emits.push({s: 46 + 40 * Math.floor((f - 46) / 40), life: 32, o: 0.5});
  const rings: React.ReactNode[] = [];
  emits.forEach((em, j) => {
    const a = f - em.s;
    if (a < 0 || a > em.life) return;
    const q = ev(a, [0, em.life], [0, 1], E.out);
    const R = 1.2 + q * 20;
    EYE_GEOM.forEach((e, i) => {
      const h = e.w + 2 * R;
      rings.push(
        <rect
          key={`${j}-${i}`}
          x={-e.len / 2 - e.w / 2 - R}
          y={-h / 2}
          width={e.len + h}
          height={h}
          rx={h / 2}
          transform={`translate(${e.cx} ${e.cy}) rotate(${e.ang})`}
          fill="none"
          stroke={BLUE}
          strokeWidth={0.3 + 1.1 * (1 - q)}
          opacity={em.o * (1 - q)}
        />,
      );
    });
  });
  return (
    <Stage size={size}>
      <g transform={`translate(${CX} ${CY}) scale(${0.8 + 0.2 * pop}) translate(${-CX} ${-CY})`} opacity={ev(f, [0, 4], [0, 1], E.out)}>
        <path d={BODY} fill={p.body} />
        {rings}
        <Eyes k={(1 - 0.86 * blink) * idleK(f)} color={p.eye} />
      </g>
    </Stage>
  );
};

/* ================= 12. Điểm ảnh ================= */
/** Khảm ô vuông từ thô tới mịn (6 bậc, mỗi bậc 5 frame), mép ô màu xanh, rồi thành vector sạch. */
const PX_LEVELS = [15, 10, 6.5, 4.2, 2.7, 1.8];
const PX_CACHE: Record<number, {x: number; y: number; v: number}[]> = {};
const pxCells = (s: number) => {
  if (PX_CACHE[s]) return PX_CACHE[s];
  const out: {x: number; y: number; v: number}[] = [];
  const nx = Math.ceil(110 / s);
  const ny = Math.ceil((LOGO_H + 10) / s);
  const x0 = CX - (nx * s) / 2;
  const y0 = CY - (ny * s) / 2;
  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      let hit = 0;
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          const x = x0 + c * s + ((a + 0.5) * s) / 3;
          const y = y0 + r * s + ((b + 0.5) * s) / 3;
          if (inside(x, y) && eyeGap(x, y) > 0) hit++;
        }
      }
      if (hit > 0) out.push({x: x0 + c * s, y: y0 + r * s, v: hit / 9});
    }
  }
  PX_CACHE[s] = out;
  return out;
};

const Pixel: Fx = ({f, size, dark}) => {
  const p = pal(dark);
  const lv = Math.min(PX_LEVELS.length - 1, Math.max(0, Math.floor(f / 5)));
  const s = PX_LEVELS[lv];
  const clean = ev(f, [29, 34], [0, 1], E.inOut);
  const popS = 1 + 0.05 * (1 - ev(f - lv * 5, [0, 4], [0, 1], E.out));
  return (
    <Stage size={size}>
      {clean < 1 ? (
        <g opacity={(1 - clean) * ev(f, [0, 3], [0, 1], E.out)} transform={`translate(${CX} ${CY}) scale(${popS}) translate(${-CX} ${-CY})`}>
          {pxCells(s).map((c, i) => {
            const q = Math.round(c.v * 4) / 4;
            if (q <= 0) return null;
            const edge = q < 1 && lv < 4;
            return <rect key={i} x={c.x} y={c.y} width={s + 0.06} height={s + 0.06} fill={edge ? BLUE : p.body} opacity={edge ? 0.55 + 0.45 * q : q} />;
          })}
        </g>
      ) : null}
      <g opacity={clean}>
        <path d={BODY} fill={p.body} />
        <Eyes k={idleK(f)} color={p.eye} />
      </g>
    </Stage>
  );
};

/* ================= danh mục ================= */

export const FX = {
  draw: Draw,
  liquid: Liquid,
  glitch: Glitch,
  particles: Particles,
  neon: Neon,
  halftone: Halftone,
  echo: Echo,
  shatter: Shatter,
  extrude: Extrude,
  hologram: Hologram,
  pulse: Pulse,
  pixel: Pixel,
} satisfies Record<string, Fx>;

export type FxKey = keyof typeof FX;

/** Tên tiếng Việt + nền đẹp nhất cho từng hiệu ứng. */
export const FX_META: Record<FxKey, {name: string; dark: boolean}> = {
  draw: {name: 'Nét vẽ', dark: false},
  liquid: {name: 'Chất lỏng', dark: false},
  glitch: {name: 'Nhiễu số', dark: true},
  particles: {name: 'Hạt tụ', dark: true},
  neon: {name: 'Đèn neon', dark: true},
  halftone: {name: 'Chấm lưới', dark: false},
  echo: {name: 'Dư ảnh', dark: false},
  shatter: {name: 'Mảnh ghép', dark: false},
  extrude: {name: 'Khối 3D', dark: false},
  hologram: {name: 'Hologram', dark: true},
  pulse: {name: 'Sóng lắng nghe', dark: false},
  pixel: {name: 'Điểm ảnh', dark: true},
};

export const FX_KEYS = Object.keys(FX) as FxKey[];

/* ================= trang trưng bày ================= */

const SC_TITLE = 48;
const SC_EACH = 45;
const SC_GRID = 180;
const GRID_AT = SC_TITLE + SC_EACH * FX_KEYS.length;
export const GHOSTFX_DURATION = GRID_AT + SC_GRID; // 768

/** Màu chữ nhấn: xanh đậm trên nền trắng (6.4:1), xanh thương hiệu trên nền đen (5.3:1). */
const accent = (dark: boolean) => (dark ? BLUE : C.send);

const TitleCard: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <div style={{position: 'absolute', left: 960 - 170, top: 170}}>
      <FX.pulse f={f} size={340} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 560}}>
      <Kinetic text="Một ghost," f={f} start={6} size={110} variant="rise" />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 690}}>
      <Kinetic text="mười hai hiệu ứng." f={f} start={14} size={110} variant="rise" color={C.send} />
    </div>
  </AbsoluteFill>
);

const Solo: React.FC<{k: FxKey; i: number; f: number}> = ({k, i, f}) => {
  const {name, dark} = FX_META[k];
  const Comp = FX[k];
  const size = 600;
  const push = 1.035 - 0.035 * ev(f, [0, 14], [0, 1], E.out);
  const ink = dark ? C.white : C.ink;
  return (
    <AbsoluteFill style={{background: dark ? C.ink : C.bg, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 960 - size / 2, top: 96, scale: String(push)}}>
        <Comp f={f} size={size} dark={dark} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{fontSize: 38, fontWeight: 500, color: accent(dark), letterSpacing: '0.12em', opacity: ev(f, [0, 8], [0, 1], E.out)}}>
          {String(i + 1).padStart(2, '0')} / {FX_KEYS.length}
        </div>
        <Kinetic text={name} f={f} start={2} size={104} variant="rise" by="char" stagger={1.1} color={ink} />
      </div>
      {/* thanh tiến độ 12 vạch */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', gap: 10}}>
        {FX_KEYS.map((_, j) => (
          <div
            key={j}
            style={{
              width: j === i ? 56 : 22,
              height: 6,
              borderRadius: 3,
              background: j === i ? accent(dark) : dark ? '#3A3A3A' : C.hairline,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Grid: React.FC<{f: number}> = ({f}) => {
  const cols = 4;
  const tw = 420;
  const th = 300;
  const gap = 28;
  const left = (1920 - cols * tw - (cols - 1) * gap) / 2;
  const top = (1080 - 3 * th - 2 * gap) / 2;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {FX_KEYS.map((k, i) => {
        const {name, dark} = FX_META[k];
        const Comp = FX[k];
        const r = Math.floor(i / cols);
        const c = i % cols;
        const at = (r + c) * 3;
        const enter = ev(f, [at, at + 16], [0, 1], E.out);
        // mỗi ô lặp lại hiệu ứng của nó, chu kỳ 110 frame, lệch nhau theo đường chéo
        const lf = Math.max(0, f - at) % 110;
        const size = 210;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: left + c * (tw + gap),
              top: top + r * (th + gap),
              width: tw,
              height: th,
              borderRadius: 28,
              overflow: 'hidden',
              background: dark ? C.ink : C.phoneBackdrop,
              opacity: enter,
              scale: String(0.92 + 0.08 * enter),
            }}
          >
            <div style={{position: 'absolute', left: (tw - size) / 2, top: 34}}>
              <Comp f={lf} size={size} dark={dark} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontSize: 30, fontWeight: 500, color: dark ? C.white : C.ink}}>
              {name}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const GhostFXShowcase: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SC_TITLE) return <TitleCard f={f} />;
  if (f < GRID_AT) {
    const i = Math.floor((f - SC_TITLE) / SC_EACH);
    return <Solo k={FX_KEYS[i]} i={i} f={f - SC_TITLE - i * SC_EACH} />;
  }
  return <Grid f={f - GRID_AT} />;
};
