import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {ev} from '../anim';
import {E, FONT} from '../theme';
import IB from './iphone-beats.json';

/**
 * "Shot on iPhone 15 Pro" — giữ NGUYÊN đoạn phim gốc (không cắt, không đổi tốc độ, không đổi khung),
 * chỉ phủ hiệu ứng theo video mẫu:
 *   khung cụm camera vẽ dần → các ống kính bay vào ghép thành cụm camera iPhone 15 Pro (3 ống kính tam giác,
 *   đèn flash, LiDAR) → tên máy + thông số hiện ra → thu nhỏ về góc thành watermark, giữ tới hết.
 *   Loé sáng ống kính (lens flare) nhịp theo nhạc.
 * Tất định — không Math.random.
 */

export const IPHONE_FPS = 30;
export const IPHONE_DUR = 1760; // = độ dài footage (58,7 giây)
const BEATS = (IB as {beats: number[]}).beats.map((b) => Math.round(b * IPHONE_FPS));

const W = 1080;
const H = 1920;

/* ---------- cụm camera iPhone 15 Pro (nét trắng) ---------- */

/** Vị trí các chi tiết trong cụm (tỉ lệ theo cạnh cụm). */
const PARTS = [
  {x: 0.29, y: 0.28, r: 0.205, kind: 'lens'}, // Wide
  {x: 0.29, y: 0.72, r: 0.205, kind: 'lens'}, // Ultra Wide
  {x: 0.71, y: 0.5, r: 0.205, kind: 'lens'}, // Telephoto 3x
  {x: 0.74, y: 0.19, r: 0.075, kind: 'flash'},
  {x: 0.74, y: 0.81, r: 0.07, kind: 'lidar'},
  {x: 0.53, y: 0.5, r: 0.022, kind: 'mic'},
] as const;

/** Điểm bay vào (tất định) cho từng chi tiết, toạ độ khung hình. */
const FROM = [
  {x: 180, y: 520},
  {x: 260, y: 1240},
  {x: 900, y: 640},
  {x: 940, y: 1180},
  {x: 120, y: 900},
  {x: 760, y: 1360},
];

const Lens: React.FC<{r: number; kind: string; glint: number}> = ({r, kind, glint}) => {
  if (kind === 'mic') return <circle r={r} fill="#fff" />;
  if (kind === 'flash')
    return (
      <g>
        <circle r={r} fill="none" stroke="#fff" strokeWidth={r * 0.22} />
        <circle r={r * 0.45} fill="rgba(255,236,190,0.9)" />
      </g>
    );
  if (kind === 'lidar')
    return (
      <g>
        <circle r={r} fill="none" stroke="#fff" strokeWidth={r * 0.24} />
        <circle r={r * 0.42} fill="rgba(255,255,255,0.55)" />
      </g>
    );
  return (
    <g>
      <circle r={r} fill="rgba(10,14,22,0.35)" stroke="#fff" strokeWidth={r * 0.1} />
      <circle r={r * 0.72} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={r * 0.05} />
      <circle r={r * 0.44} fill="rgba(40,60,110,0.55)" stroke="rgba(255,255,255,0.7)" strokeWidth={r * 0.04} />
      <circle r={r * 0.18} fill="rgba(0,0,0,0.6)" />
      {/* ánh sáng phản chiếu trên kính */}
      <ellipse cx={-r * 0.22} cy={-r * 0.26} rx={r * 0.16} ry={r * 0.09} fill="#fff" opacity={0.55 + 0.4 * glint} transform={`rotate(-35 ${-r * 0.22} ${-r * 0.26})`} />
    </g>
  );
};

/** Cụm camera: khung bo tròn vẽ dần + các chi tiết đặt theo tiến độ `assemble` (0 → 1 từng chi tiết). */
const Module: React.FC<{size: number; draw: number; parts: number[]; glint: number; fill?: number}> = ({size, draw, parts, glint, fill = 0}) => {
  const per = 4 * size * 0.92;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow: 'visible', display: 'block'}}>
      <rect
        x={size * 0.02}
        y={size * 0.02}
        width={size * 0.96}
        height={size * 0.96}
        rx={size * 0.26}
        fill={`rgba(20,22,28,${0.35 * fill})`}
        stroke="#fff"
        strokeWidth={Math.max(2.5, size * 0.022)}
        strokeDasharray={per}
        strokeDashoffset={per * (1 - draw)}
        strokeLinecap="round"
      />
      {PARTS.map((p, i) => {
        const k = parts[i];
        if (k <= 0.001) return null;
        return (
          <g key={i} transform={`translate(${p.x * size} ${p.y * size}) scale(${0.4 + 0.6 * k})`} opacity={Math.min(1, k * 1.6)}>
            <Lens r={p.r * size} kind={p.kind} glint={glint} />
          </g>
        );
      })}
    </svg>
  );
};

/** Bong bóng ống kính đang bay vào (vẽ ở toạ độ khung hình). */
const Flying: React.FC<{i: number; t: number; to: {x: number; y: number}; size: number}> = ({i, t, to, size}) => {
  const p = PARTS[i];
  const fr = FROM[i];
  const e = E.inOut(t);
  // cung cong nhẹ khi bay
  const x = fr.x + (to.x - fr.x) * e + Math.sin(Math.PI * e) * (i % 2 ? 60 : -60);
  const y = fr.y + (to.y - fr.y) * e - Math.sin(Math.PI * e) * 40;
  const r = p.r * size * (1.6 - 0.6 * e);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <g transform={`translate(${x} ${y})`} opacity={ev(t, [0, 0.15], [0, 1], E.out)}>
        <circle r={r} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.9)" strokeWidth={3} />
        <circle r={r * 0.55} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      </g>
    </svg>
  );
};

/* ---------- loé sáng ống kính ---------- */

const Flare: React.FC<{f: number; k: number}> = ({f, k}) => {
  if (k <= 0.01) return null;
  // nguồn sáng trôi chậm theo khung (mặt trời phía trên)
  const sx = 760 + 120 * Math.sin(f * 0.006);
  const sy = 330 + 40 * Math.cos(f * 0.005);
  const cx = W / 2;
  const cy = H / 2;
  const orbs = [0.35, 0.62, 0.9, 1.25, 1.6];
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', opacity: k}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="sun">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.95} />
            <stop offset="25%" stopColor="#fff6e0" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#ffd9a0" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="streak" x1="0" x2="1">
            <stop offset="0%" stopColor="#7fb6ff" stopOpacity={0} />
            <stop offset="50%" stopColor="#cfe3ff" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#7fb6ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <circle cx={sx} cy={sy} r={220} fill="url(#sun)" />
        {/* vệt anamorphic ngang */}
        <rect x={sx - 700} y={sy - 3} width={1400} height={6} fill="url(#streak)" />
        {orbs.map((o, i) => {
          const x = sx + (cx - sx) * o * 2;
          const y = sy + (cy - sy) * o * 2;
          const rr = [26, 48, 18, 70, 34][i];
          return <circle key={i} cx={x} cy={y} r={rr} fill={i % 2 ? 'rgba(120,200,255,0.16)' : 'rgba(255,180,120,0.14)'} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */

// mốc (frame)
const T = {
  draw: [8, 34] as [number, number],
  fly: 22, // chi tiết đầu tiên bắt đầu bay
  flyEach: 6,
  flyDur: 26,
  title: 84,
  dock: [176, 204] as [number, number],
};

export const ShotOnIphone: React.FC = () => {
  const f = useCurrentFrame();

  // nhịp gần nhất cho glint / flare
  const last = BEATS.filter((b) => b <= f).pop() ?? -99;
  const sinceBeat = f - last;
  const beatIdx = BEATS.indexOf(last);
  const pulse = ev(sinceBeat, [0, 10], [1, 0], E.out);

  // cụm camera: to ở giữa → trượt trái nhường chỗ cho chữ → thu về góc
  const dock = ev(f, T.dock, [0, 1], E.inOut);
  const side = ev(f, [T.title - 12, T.title + 10], [0, 1], E.inOut);
  const bigSize = 380;
  const smallSize = 70;
  const size = bigSize + (230 - bigSize) * side + (smallSize - 230) * dock;
  const centerX = W / 2 + (-250) * side * (1 - dock);
  const centerY = 860;
  const dockX = 70 + smallSize / 2;
  const dockY = 1490;
  const mx = centerX + (dockX - centerX) * dock;
  const my = centerY + (dockY - centerY) * dock;

  const draw = ev(f, T.draw, [0, 1], E.inOut);
  const partT = PARTS.map((_, i) => (f - (T.fly + i * T.flyEach)) / T.flyDur);
  const parts = partT.map((t) => (t >= 1 ? ev(t, [1, 1.25], [0.85, 1], E.back) : 0));
  const glint = Math.max(ev(f, [70, 82], [0, 1], E.out) * ev(f, [82, 100], [1, 0], E.in), pulse * 0.6 * dock);

  // tên máy + thông số
  const titleIn = ev(f, [T.title, T.title + 16], [0, 1], E.out);
  const titleOut = ev(f, [T.dock[0] - 6, T.dock[0] + 10], [0, 1], E.in);
  const specIn = (i: number) => ev(f, [T.title + 12 + i * 5, T.title + 26 + i * 5], [0, 1], E.out);

  // watermark góc trái dưới
  const wm = ev(f, [T.dock[1] - 10, T.dock[1] + 8], [0, 1], E.out);

  // loé sáng: mạnh lúc đầu (cảnh mặt trời), sau đó nhói nhẹ mỗi 4 nhịp
  const flare = Math.max(ev(f, [0, 30], [0, 0.85], E.out) * ev(f, [150, 230], [1, 0.25], E.inOut), beatIdx >= 0 && beatIdx % 4 === 0 ? 0.25 + 0.45 * pulse : 0.25);

  // nền tối nhẹ khi cụm camera to ở giữa, để nét trắng nổi
  const dim = Math.min(ev(f, [0, 20], [0, 0.32], E.out), 1 - ev(f, T.dock, [0, 1], E.inOut)) ;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* đoạn phim gốc — nguyên tốc độ, nguyên khung */}
      <Video src={staticFile('viral/footage.mp4')} muted objectFit="cover" style={{width: '100%', height: '100%'}} />

      <Flare f={f} k={flare} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />

      {/* ống kính đang bay */}
      {partT.map((t, i) =>
        t > 0 && t < 1 ? <Flying key={i} i={i} t={t} size={size} to={{x: mx - size / 2 + PARTS[i].x * size, y: my - size / 2 + PARTS[i].y * size}} /> : null,
      )}

      {/* cụm camera */}
      <div style={{position: 'absolute', left: mx - size / 2, top: my - size / 2, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.35))'}}>
        <Module size={size} draw={draw} parts={parts} glint={glint} fill={side} />
      </div>

      {/* tên máy + thông số (khi cụm camera đã sang trái) */}
      {titleIn > 0 && titleOut < 1 ? (
        <div style={{position: 'absolute', left: centerX + 230 / 2 + 36, top: centerY - 120, fontFamily: FONT, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.4)', opacity: 1 - titleOut, translate: `${-30 * titleOut}px 0px`}}>
          <div style={{fontSize: 92, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, opacity: titleIn, filter: `blur(${(1 - titleIn) * 14}px)`, translate: `${(1 - titleIn) * 40}px 0px`}}>
            iPhone
          </div>
          <div style={{fontSize: 92, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, opacity: titleIn, filter: `blur(${(1 - titleIn) * 14}px)`, translate: `${(1 - titleIn) * 60}px 0px`}}>
            15 Pro
          </div>
          {['48MP Main · 12MP Ultra Wide', '12MP 3x Telephoto', '4K60 Dolby Vision · ProRes'].map((s, i) => (
            <div key={s} style={{fontSize: 30, fontWeight: 500, opacity: 0.92 * specIn(i), marginTop: i === 0 ? 22 : 6, translate: `${(1 - specIn(i)) * 24}px 0px`, whiteSpace: 'nowrap'}}>
              {s}
            </div>
          ))}
        </div>
      ) : null}

      {/* watermark */}
      {wm > 0 ? (
        <div style={{position: 'absolute', left: dockX + smallSize / 2 + 18, top: dockY - 24, fontFamily: FONT, color: '#fff', fontSize: 40, fontWeight: 600, letterSpacing: '-0.01em', opacity: wm, translate: `${(1 - wm) * -16}px 0px`, textShadow: '0 2px 12px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>
          iPhone 15 Pro
        </div>
      ) : null}

      {/* viền tối nhẹ kiểu ống kính */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.28) 100%)', pointerEvents: 'none'}} />

      <Audio src={staticFile('viral/iphone-music.mp3')} />
    </AbsoluteFill>
  );
};

