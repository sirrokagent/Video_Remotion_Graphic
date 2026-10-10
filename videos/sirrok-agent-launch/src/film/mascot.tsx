import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../anim';
import {EYE_MID, LOGO, LOGO_H} from '../logo';
import {C, E, FONT} from '../theme';
import {loudness, VOICE} from '../voice';

/**
 * Mascot Sirrok — con ghost của logo có trạng thái cảm xúc (theo kiểu mascot động):
 *   idle     thở nhẹ (co giãn), nhấp nhô, chớp mắt thỉnh thoảng, mắt lơ đãng trôi
 *   listen   lắng nghe: vòng hạt sóng âm toả ra, nhịp theo `level`; mắt ngước lên, người nghiêng nhẹ
 *   work     đang làm: nước xanh thương hiệu dâng từ đáy thân, mặt sóng mềm; huy hiệu "•••" nảy
 *   pending  đang chờ: mắt liếc trái/phải, thân xẹp nhẹ, huy hiệu cam có đồng hồ cát lật
 *   done     xong: nảy lên + co giãn khi chạm đất, mắt ngước lên vui, chấm xanh lá bật ra
 *   sleep    ngủ: mắt khép thành nét ngang, thở chậm, "z z" bay lên
 *   greet    chào: hai "tay" tròn nhỏ hai bên, tay phải vẫy
 *
 * API cố định — mọi cảnh dùng chung:
 *   <Mascot size={160} state="work" f={f} since={startFrameOfState} level={0..1} body={C.ink} eyes={C.white} />
 * Hộp rộng `size`, cao theo tỉ lệ logo, đặt relative (bọc absolute bên ngoài nếu cần).
 * Nền trắng: thân đen, mắt trắng (mặc định). Nền đen: body="#fff" eyes="#000".
 * Mọi thứ vẽ trong hệ toạ độ logo (rộng 100, cao 86.3) — vòng hạt, huy hiệu, tay, "z" tràn ra ngoài hộp (overflow visible).
 * Chuyển trạng thái: hiệu ứng của trạng thái mới "ăn" dần vào trong ~12 frame tính từ `since`.
 * Tất định — không Math.random, không Date.now; "ngẫu nhiên" dùng hàm băm `rnd`.
 */
export type MascotState = 'idle' | 'listen' | 'work' | 'pending' | 'done' | 'sleep' | 'greet';

type Props = {
  size: number;
  state: MascotState;
  /** frame hiện tại của cảnh */
  f: number;
  /** frame bắt đầu trạng thái hiện tại (cho chuyển trạng thái mượt) */
  since?: number;
  /** 0 → 1: độ lớn giọng (listen) */
  level?: number;
  body?: string;
  eyes?: string;
  style?: React.CSSProperties;
  /** (tuỳ chọn) 0 → 1: thân nở ra từ giữa hai mắt — 0 = chỉ còn cặp mắt. Mặc định 1. */
  reveal?: number;
  /** (tuỳ chọn) ép độ nhắm mắt 0..1 thay cho nhịp chớp tự động (cảnh cần khớp mốc chớp riêng). */
  blink?: number;
  /** (tuỳ chọn) ép hướng nhìn (đơn vị logo) thay cho mắt tự trôi của trạng thái. */
  look?: {x: number; y: number};
};

/* ---------- hằng & tiện ích ---------- */

const BLUE_TOP = '#1877F2';
const BLUE_BOT = '#0B57D0';
const AMBER = '#F5A623';
const GREEN = '#1DB954';
const TAU = Math.PI * 2;
/** tâm thân ghost (đơn vị logo) — tâm các vòng hạt */
const BODY_C = {x: 50, y: 45};
/** chân thân — gốc co giãn / nghiêng */
const FOOT = {x: 50, y: LOGO_H};
/** chỗ huy hiệu: mép trên-trái của thân, như mascot tham khảo */
const BADGE = {x: 15, y: 13};

/** băm tất định 0..1 */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const eyeCenters = LOGO.eyes.map((e) => ({x: (e.x1 + e.x2) / 2, y: (e.y1 + e.y2) / 2}));

/** Chu kỳ 0..1 (răng cưa) — luôn đi qua easing trước khi thành chuyển động. */
const cyc = (t: number, period: number, offset = 0) => {
  const v = (t + offset) / period;
  return v - Math.floor(v);
};

/** Nhịp chớp mắt tự động: mỗi ~3,4 giây một lần, thỉnh thoảng chớp đôi. */
const autoBlink = (f: number) => {
  const p = ((f % 103) + 103) % 103;
  const n = Math.floor(f / 103);
  return blinkAt(p, rnd(n) > 0.6 ? [88, 96] : [88]);
};

/* ---------- các mảnh vẽ (toạ độ logo) ---------- */

/** Vòng hạt sóng âm (listen) — xuất ra để cảnh có thể đặt quanh cặp mắt nhỏ trong ô nhập. */
export const ListenRings: React.FC<{
  /** frame từ lúc bắt đầu nghe */
  t: number;
  level: number;
  color: string;
  /** 0 → 1 mức hiện */
  on: number;
  /** tâm + bán kính gốc (đơn vị của svg chứa nó) */
  cx: number;
  cy: number;
  r: number;
  /** số hạt mỗi vòng */
  dots?: number;
}> = ({t, level, color, on, cx, cy, r, dots = 150}) => {
  if (on <= 0.001) return null;
  const lv = Math.max(0, Math.min(1, level));
  const out: React.ReactNode[] = [];
  // vòng tĩnh sát thân: hạt mịn dày, "thở" theo giọng
  const inner = r * (1 + 0.1 * lv);
  for (let i = 0; i < dots * 1.3; i++) {
    const a = (TAU * i) / (dots * 1.3) + rnd(i + 7) * 0.05;
    const wob = Math.sin(a * 5 + t * 0.21) * 0.5 + Math.sin(a * 9 - t * 0.17) * 0.5;
    const rr = inner + r * (0.05 * (rnd(i + 31) - 0.5) + 0.07 * lv * wob);
    out.push(
      <circle key={`i${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={r * (0.009 + 0.011 * rnd(i + 3))} fill={color} opacity={on * (0.3 + 0.45 * rnd(i + 11)) * (0.65 + 0.35 * lv)} />,
    );
  }
  // ba đợt sóng hạt lan ra ngoài (sonar), biên độ theo giọng
  const PERIOD = 42;
  for (let j = 0; j < 3; j++) {
    const p = cyc(t, PERIOD, (j * PERIOD) / 3);
    const grow = E.out(p);
    const fade = Math.sin(Math.PI * Math.min(1, p * 1.05)) * (1 - p * 0.35);
    const base = r * (1.1 + 0.48 * grow);
    for (let i = 0; i < dots; i++) {
      const a = (TAU * i) / dots + rnd(i * 3 + j) * 0.06 + j * 0.37;
      const shape = Math.sin(a * 6 + t * 0.25 + j) * 0.6 + Math.sin(a * 11 - t * 0.19) * 0.4;
      const rr = base + r * ((rnd(i * 7 + j * 13) - 0.5) * 0.09 + (0.04 + 0.16 * lv) * shape * grow);
      out.push(
        <circle
          key={`w${j}-${i}`}
          cx={cx + Math.cos(a) * rr}
          cy={cy + Math.sin(a) * rr}
          r={r * (0.008 + 0.012 * rnd(i + j * 101))}
          fill={color}
          opacity={on * fade * (0.22 + 0.5 * rnd(i * 5 + j)) * (0.5 + 0.5 * lv)}
        />,
      );
    }
  }
  return <g>{out}</g>;
};

/** Các điểm mặt nước có sóng (work). */
const wavePts = (surf: number, t: number, amp: number, phase: number) => {
  const pts: string[] = [];
  for (let x = -6; x <= 106; x += 4) {
    const y = surf + amp * (Math.sin(x * 0.11 + t * 0.16 + phase) * 0.65 + Math.sin(x * 0.23 - t * 0.11 + phase * 2) * 0.35);
    pts.push(`${x} ${y.toFixed(2)}`);
  }
  return pts;
};
/** Khối nước: từ mặt sóng xuống đáy. */
const wavePath = (surf: number, t: number, amp: number, phase: number) =>
  `M -6 ${LOGO_H + 6} L ${wavePts(surf, t, amp, phase).join(' L ')} L 106 ${LOGO_H + 6} Z`;
/** Chỉ đường mặt nước (vệt sáng). */
const waveLine = (surf: number, t: number, amp: number, phase: number) => `M ${wavePts(surf, t, amp, phase).join(' L ')}`;

/** Huy hiệu "•••" xanh (work): ba chấm nảy so le. */
const WorkBadge: React.FC<{t: number; k: number; ring: string}> = ({t, k, ring}) => {
  const s = ev(t, [0, 12], [0, 1], E.back) * k;
  if (s <= 0.001) return null;
  return (
    <g transform={`translate(${BADGE.x} ${BADGE.y}) scale(${s})`}>
      <rect x={-13} y={-7.2} width={26} height={14.4} rx={7.2} fill={BLUE_TOP} stroke={ring} strokeWidth={2.2} />
      {[0, 1, 2].map((i) => {
        const p = cyc(t, 24, -i * 4);
        const hop = keys(p, [0, 0.22, 0.45, 1], [0, -2.2, 0, 0], E.inOut);
        return <circle key={i} cx={-6 + i * 6} cy={hop + 0.4} r={1.9} fill={C.white} />;
      })}
    </g>
  );
};

/** Huy hiệu cam (pending): đồng hồ cát lật 180° có easing mỗi nhịp. */
const PendingBadge: React.FC<{t: number; k: number; ring: string}> = ({t, k, ring}) => {
  const s = ev(t, [0, 12], [0, 1], E.back) * k;
  if (s <= 0.001) return null;
  const n = Math.floor(t / 36);
  const flip = (n + ev(t - n * 36, [24, 34], [0, 1], E.inOut)) * 180;
  // cát chảy: tam giác trên vơi dần, dưới đầy dần, rồi đảo khi lật
  const sand = ev(t - n * 36, [0, 24], [0, 1], E.inOut);
  return (
    <g transform={`translate(${BADGE.x} ${BADGE.y}) scale(${s})`}>
      <circle r={9} fill={AMBER} stroke={ring} strokeWidth={2.2} />
      <g transform={`rotate(${flip})`}>
        <path d="M -3.4 -4.4 L 3.4 -4.4 L 0 0 L 3.4 4.4 L -3.4 4.4 L 0 0 Z" fill="none" stroke={C.white} strokeWidth={1.25} strokeLinejoin="round" />
        <path d={`M ${-2.6 * (1 - sand)} ${-3.6 + 3.2 * sand} L ${2.6 * (1 - sand)} ${-3.6 + 3.2 * sand} L 0 -0.2 Z`} fill={C.white} />
        <path d={`M ${-2.6 * sand} ${3.6 - 3 * sand} L ${2.6 * sand} ${3.6 - 3 * sand} L 2.8 3.7 L -2.8 3.7 Z`} fill={C.white} opacity={sand > 0.02 ? 1 : 0} />
      </g>
    </g>
  );
};

/** Chấm xanh lá (done): bật ra quá đà rồi đứng yên, kèm một vòng loé. */
const DoneBadge: React.FC<{t: number; k: number; ring: string}> = ({t, k, ring}) => {
  const s = ev(t, [8, 20], [0, 1], E.back) * k;
  if (s <= 0.001) return null;
  const flash = ev(t, [10, 30], [0, 1], E.out);
  return (
    <g transform={`translate(${BADGE.x} ${BADGE.y})`}>
      <circle r={6 + 9 * flash} fill="none" stroke={GREEN} strokeWidth={1.4 * (1 - flash)} opacity={(1 - flash) * k} />
      <circle r={6 * s} fill={GREEN} stroke={ring} strokeWidth={2.2 * s} />
    </g>
  );
};

/* ---------- Mascot ---------- */

export const Mascot: React.FC<Props> = ({
  size,
  state,
  f,
  since = 0,
  level = 0,
  body = C.ink,
  eyes = C.white,
  style,
  reveal = 1,
  blink: blinkOverride,
  look: lookOverride,
}) => {
  const id = React.useId().replace(/:/g, '');
  const t = Math.max(0, f - since);
  // mức "ăn vào" của trạng thái mới
  const k = ev(t, [0, 14], [0, 1], E.out);
  const is = (s: MascotState) => (state === s ? k : 0);
  const kListen = is('listen');
  const kWork = is('work');
  const kPend = is('pending');
  const kDone = is('done');
  const kSleep = is('sleep');
  const kGreet = is('greet');
  const lv = Math.max(0, Math.min(1, level));

  /* --- thở & nhấp nhô: ngủ thì chậm và sâu hơn --- */
  const breathFast = Math.sin((f * TAU) / 78);
  const breathSlow = Math.sin((f * TAU) / 120);
  const breath = breathFast * (1 - kSleep) + breathSlow * kSleep;
  const bAmp = 0.022 + 0.018 * kSleep;
  let sx = 1 - breath * bAmp * 0.75;
  let sy = 1 + breath * bAmp;
  let dy = Math.sin((f * TAU) / 96 + 0.8) * 1.3 * (1 - kSleep) + kSleep * 1.2;
  let rot = 0;

  // listen: nghiêng nhẹ về phía trước, phồng theo giọng
  rot += 4 * kListen;
  sx *= 1 + 0.035 * lv * kListen;
  sy *= 1 + 0.045 * lv * kListen;

  // pending: xẹp nhẹ, lắc lư theo hướng liếc
  const glance = Math.tanh(3 * Math.sin((t * TAU) / 64));
  sx *= 1 + 0.035 * kPend;
  sy *= 1 - 0.06 * kPend;
  rot += 2.2 * glance * kPend;

  // work: hơi "gồng", rung nhẹ theo sóng nước
  sy *= 1 + 0.01 * Math.sin(t * 0.32) * kWork;

  // done: lấy đà → bật lên → chạm đất co giãn → ổn định; lặp lại mỗi 90 frame
  if (kDone > 0) {
    const h = t % 90;
    const jump = keys(h, [0, 5, 15, 21, 90], [0, 0, -15, 0, 0], E.inOut);
    const squash = keys(h, [0, 5, 10, 21, 25, 34], [0, -0.1, 0.09, 0, -0.12, 0], E.inOut);
    dy += jump;
    sy *= 1 + squash;
    sx *= 1 - squash * 0.7;
  }

  // greet: lắc nhẹ trái phải theo nhịp vẫy
  const wave = Math.sin(t * 0.36);
  rot += -2.5 * wave * kGreet;

  /* --- mắt --- */
  const drift = {x: 1.3 * Math.sin(f * 0.043) + 0.5 * Math.sin(f * 0.11 + 1), y: 0.7 * Math.sin(f * 0.031 + 2)};
  const target = {
    x: drift.x * (1 - k) + (state === 'idle' ? drift.x : 0) * k + 0.8 * kListen + 2.4 * glance * kPend + 1.0 * kDone + 0.6 * kGreet + drift.x * 0.4 * kWork,
    y: drift.y * (1 - k) + (state === 'idle' ? drift.y : 0) * k - 1.9 * kListen - 2.6 * kDone - 0.8 * kGreet + 0.6 * kPend + 1.2 * kWork,
  };
  const look = lookOverride ?? target;
  const autoB = state === 'sleep' ? 0 : autoBlink(f) * (1 - kSleep);
  const blink = blinkOverride ?? autoB;

  // nét mắt: mở (nghiêng như logo) ↔ ngủ (nét ngang ngắn, hạ thấp)
  const eyeLines = LOGO.eyes.map((e, i) => {
    const c = eyeCenters[i];
    const kk = (1 - 0.86 * blink) * (1 - 0.1 * kDone);
    const open = {
      x1: c.x + (e.x1 - c.x) * kk + look.x,
      y1: c.y + (e.y1 - c.y) * kk + look.y,
      x2: c.x + (e.x2 - c.x) * kk + look.x,
      y2: c.y + (e.y2 - c.y) * kk + look.y,
    };
    const half = 4.6 - i * 0.6;
    const shut = {x1: c.x + half, y1: c.y + 2.6, x2: c.x - half, y2: c.y + 2.6};
    const s = kSleep;
    return {
      x1: open.x1 + (shut.x1 - open.x1) * s,
      y1: open.y1 + (shut.y1 - open.y1) * s,
      x2: open.x2 + (shut.x2 - open.x2) * s,
      y2: open.y2 + (shut.y2 - open.y2) * s,
      w: e.w * (1 - 0.45 * s),
    };
  });

  /* --- nước dâng (work) --- */
  const rise = ev(t, [0, 40], [0, 1], E.out) * kWork;
  const surf = LOGO_H + 4 - rise * (52 + 2.5 * Math.sin(t * 0.07));

  const bodyT = `translate(${FOOT.x} ${FOOT.y + dy}) rotate(${rot}) scale(${sx} ${sy}) translate(${-FOOT.x} ${-FOOT.y})`;
  const r = 112 * Math.max(0, Math.min(1, reveal));
  const extras = Math.max(0, Math.min(1, reveal)); // huy hiệu, tay, z… chỉ hiện khi đã có thân

  return (
    <div style={{position: 'relative', width: size, height: (size * LOGO_H) / 100, flexShrink: 0, ...style}}>
      <svg width={size} height={(size * LOGO_H) / 100} viewBox={`0 0 100 ${LOGO_H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id={`b${id}`}>
            <path d={LOGO.body} />
          </clipPath>
          <clipPath id={`r${id}`}>
            <circle cx={EYE_MID.x} cy={EYE_MID.y} r={r} />
          </clipPath>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BLUE_TOP} />
            <stop offset="1" stopColor={BLUE_BOT} />
          </linearGradient>
        </defs>

        {/* vòng hạt sóng âm — sau lưng thân */}
        {kListen > 0 ? <ListenRings t={t} level={lv} color={body} on={kListen * extras} cx={BODY_C.x} cy={BODY_C.y + dy * 0.5} r={56} /> : null}

        {/* tay (greet): hai viên tròn, tay phải vẫy quanh "vai" */}
        {kGreet > 0 && extras > 0
          ? (() => {
              const pop = ev(t, [2, 14], [0, 1], E.back) * extras;
              const popR = ev(t, [6, 18], [0, 1], E.back) * extras;
              const la = (200 + 8 * Math.sin(t * 0.18)) * (Math.PI / 180);
              const ra = (-28 + 30 * wave) * (Math.PI / 180);
              const L = {x: 30 + Math.cos(la) * 38, y: 66 + dy + Math.sin(la) * 38};
              const R = {x: 74 + Math.cos(ra) * 36, y: 56 + dy + Math.sin(ra) * 36};
              return (
                <g fill={body}>
                  <ellipse cx={L.x} cy={L.y} rx={6.6 * pop} ry={5.6 * pop} transform={`rotate(-20 ${L.x} ${L.y})`} />
                  <ellipse cx={R.x} cy={R.y} rx={6.6 * popR} ry={5.6 * popR} transform={`rotate(${-30 + 25 * wave} ${R.x} ${R.y})`} />
                </g>
              );
            })()
          : null}

        <g transform={bodyT}>
          <g clipPath={reveal < 1 ? `url(#r${id})` : undefined}>
            <path d={LOGO.body} fill={body} />
            {rise > 0.001 ? (
              <g clipPath={`url(#b${id})`}>
                <path d={wavePath(surf - 1.5, t + 9, 2.2, 1.7)} fill={BLUE_TOP} opacity={0.45} />
                <path d={wavePath(surf, t, 1.9, 0)} fill={`url(#g${id})`} />
                {/* bọt khí li ti nổi lên trong nước */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const p = cyc(t, 46, i * 9.2 + rnd(i) * 10);
                  const y = LOGO_H - 2 - (LOGO_H - 2 - surf - 3) * E.inOut(p);
                  return <circle key={i} cx={22 + i * 13 + 2 * Math.sin(p * 9 + i)} cy={y} r={0.9 + 0.7 * rnd(i + 4)} fill={C.white} opacity={0.5 * Math.sin(Math.PI * p) * rise} />;
                })}
                {/* vệt sáng mặt nước */}
                <path d={waveLine(surf, t, 1.9, 0)} fill="none" stroke={C.white} strokeOpacity={0.35} strokeWidth={0.8} />
              </g>
            ) : null}
          </g>
          {eyeLines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={eyes} strokeWidth={l.w} strokeLinecap="round" />
          ))}
          {/* huy hiệu bám theo thân */}
          {kWork > 0 && extras > 0 ? <WorkBadge t={t} k={kWork * extras} ring={eyes} /> : null}
          {kPend > 0 && extras > 0 ? <PendingBadge t={t} k={kPend * extras} ring={eyes} /> : null}
          {kDone > 0 && extras > 0 ? <DoneBadge t={t} k={kDone * extras} ring={eyes} /> : null}
        </g>

        {/* "z z" bay lên khi ngủ */}
        {kSleep > 0 && extras > 0
          ? [0, 1].map((i) => {
              const p = cyc(t, 80, -i * 40);
              const e = E.out(p);
              const o = Math.sin(Math.PI * p) * kSleep * extras * (t > i * 40 - 4 || i === 0 ? 1 : 0);
              return (
                <text
                  key={i}
                  x={86 + 9 * e + 2.5 * Math.sin(p * 7)}
                  y={8 - 26 * e}
                  fontFamily={FONT}
                  fontWeight={800}
                  fontSize={9 + 6 * e}
                  fill={body}
                  opacity={o}
                >
                  z
                </text>
              );
            })
          : null}
      </svg>
    </div>
  );
};

/* ---------- Trang trưng bày (composition "Mascot") ---------- */

const SHOW: {state: MascotState; label: string; note: string}[] = [
  {state: 'idle', label: 'Thảnh thơi', note: 'thở, chớp mắt'},
  {state: 'listen', label: 'Lắng nghe', note: 'vòng sóng theo giọng'},
  {state: 'work', label: 'Đang làm', note: 'nước xanh dâng lên'},
  {state: 'pending', label: 'Đang chờ', note: 'liếc mắt, đồng hồ cát'},
  {state: 'done', label: 'Xong việc', note: 'nảy lên, chấm xanh'},
  {state: 'sleep', label: 'Đi ngủ', note: 'mắt khép, z z'},
  {state: 'greet', label: 'Xin chào', note: 'hai tay vẫy'},
];
const SEG = 60; // mỗi trạng thái 2 giây
const GRID_AT = SEG * SHOW.length; // 420
export const MASCOT_SHOWCASE = GRID_AT + 150;

/** Mức giọng giả lập cho trang trưng bày: lấy từ giọng thật, lặp lại. */
const demoLevel = (f: number) => {
  const d = VOICE.command.durFrames;
  return Math.min(1, loudness(VOICE.command, ((f % d) + d) % d) * 1.4);
};

export const MascotShowcase: React.FC = () => {
  const f = useCurrentFrame();
  const seg = Math.min(SHOW.length - 1, Math.floor(f / SEG));
  const cur = SHOW[seg];
  const segT = f - seg * SEG;
  const toGrid = ev(f, [GRID_AT - 10, GRID_AT + 10], [0, 1], E.inOut);
  // nửa sau mỗi đoạn: đổi sang nền đen để thấy bản thân trắng
  const dark = keys(segT, [0, 30, 36, 60], [0, 0, 1, 1], E.inOut) * (1 - toGrid);
  const labelIn = ev(segT, [2, 16], [0, 1], E.out);
  const labelOut = seg < SHOW.length - 1 ? ev(segT, [SEG - 8, SEG], [0, 1], E.in) : ev(f, [GRID_AT - 14, GRID_AT - 2], [0, 1], E.in);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {/* một trạng thái — lớn, giữa khung; nền đen quét vào từ phải, thân đổi màu đúng theo mép quét */}
      {toGrid < 1
        ? [false, true].map((isDark) => {
            const bgc = isDark ? C.ink : C.bg;
            const fgc = isDark ? C.white : C.ink;
            const clip = isDark ? `inset(0 0 0 ${(1 - dark) * 100}%)` : `inset(0 ${dark * 100}% 0 0)`;
            return (
              <AbsoluteFill key={String(isDark)} style={{background: bgc, clipPath: clip}}>
                <AbsoluteFill style={{opacity: 1 - toGrid, scale: String(1 - 0.06 * toGrid)}}>
                  <div style={{position: 'absolute', left: 960 - 210, top: 205}}>
                    <Mascot size={420} state={cur.state} f={f} since={seg * SEG} level={demoLevel(f)} body={fgc} eyes={bgc} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 770,
                      textAlign: 'center',
                      color: fgc,
                      opacity: labelIn * (1 - labelOut),
                      translate: `0px ${(1 - labelIn) * 24 - labelOut * 12}px`,
                      filter: `blur(${(1 - labelIn) * 10 + labelOut * 8}px)`,
                    }}
                  >
                    <div style={{fontSize: 88, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1}}>{cur.label}</div>
                    <div style={{fontSize: 40, fontWeight: 500, marginTop: 14, color: isDark ? '#BDC1C6' : C.muted}}>{cur.note}</div>
                  </div>
                  {/* chỉ số trạng thái */}
                  <div style={{position: 'absolute', left: 0, right: 0, top: 990, display: 'flex', justifyContent: 'center', gap: 14}}>
                    {SHOW.map((_, i) => (
                      <div key={i} style={{width: i === seg ? 40 : 12, height: 12, borderRadius: 6, background: fgc, opacity: i === seg ? 0.9 : 0.25}} />
                    ))}
                  </div>
                </AbsoluteFill>
              </AbsoluteFill>
            );
          })
        : null}

      {/* lưới tổng: hàng trên nền trắng, hàng dưới nền đen */}
      {toGrid > 0 ? (
        <AbsoluteFill style={{opacity: toGrid}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 540, bottom: 0, background: C.ink}} />
          {SHOW.map((s, i) => {
            const x = 137 + i * 274;
            const pop = ev(f, [GRID_AT + i * 4, GRID_AT + i * 4 + 16], [0, 1], E.back);
            const sinceG = GRID_AT + i * 4;
            return (
              <React.Fragment key={s.state}>
                <div style={{position: 'absolute', left: x - 80, top: 150, scale: String(pop)}}>
                  <Mascot size={160} state={s.state} f={f} since={sinceG} level={demoLevel(f + i * 9)} />
                </div>
                <div style={{position: 'absolute', left: x - 80, top: 670, scale: String(pop)}}>
                  <Mascot size={160} state={s.state} f={f} since={sinceG} level={demoLevel(f + i * 9)} body={C.white} eyes={C.ink} />
                </div>
                <div style={{position: 'absolute', left: x - 137, width: 274, top: 380, textAlign: 'center', fontSize: 36, fontWeight: 700, color: C.ink, opacity: pop > 0 ? Math.min(1, pop) : 0}}>
                  {s.label}
                </div>
                <div style={{position: 'absolute', left: x - 137, width: 274, top: 900, textAlign: 'center', fontSize: 36, fontWeight: 700, color: C.white, opacity: pop > 0 ? Math.min(1, pop) : 0}}>
                  {s.label}
                </div>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
