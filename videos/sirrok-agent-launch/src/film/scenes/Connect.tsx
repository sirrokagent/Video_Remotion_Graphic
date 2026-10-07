import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {AppTile, BrandKey} from '../../brands';
import {Ghost, LOGO_H} from '../../logo';
import {C, E} from '../../theme';
import {VoiceText} from '../text';
import {VO} from '../timeline';

/**
 * Cảnh Connect (200 frame) — "Kết nối với mọi công cụ bạn đang dùng."
 * Ghost ở giữa (lệch lên trên), 14 ứng dụng bay vào theo nhịp lời đọc, xếp lên
 * hai quỹ đạo elip rồi trôi chậm. Mỗi ứng dụng nối về ghost bằng HAI nét song
 * song (motif hai nét mắt), có chấm sáng chạy dọc dây về phía ghost.
 * 180–200 tĩnh để vệt mắt chuyển cảnh. Không ngẫu nhiên thật, không linear.
 */

const S = VO.n7.at; // câu n7 bắt đầu ở frame 15

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const CENTER = {x: 960, y: 430};
const GHOST_W = 230;

/** Hai vòng quỹ đạo: trong 6 ứng dụng làm việc, ngoài 8 ứng dụng mạng xã hội / nhắn tin. */
const INNER: BrandKey[] = ['gmail', 'calendar', 'sheets', 'drive', 'notion', 'slack'];
const OUTER: BrandKey[] = ['facebook', 'zalo', 'instagram', 'telegram', 'tiktok', 'linkedin', 'youtube', 'x'];
const RING = [
  {rx: 360, ry: 220, size: 100, base: -90, drift: 22},
  {rx: 700, ry: 330, size: 92, base: -90 + 22.5, drift: -14},
];

type Node = {brand: BrandKey; ring: 0 | 1; k: number; n: number; idx: number; start: number};

// Thứ tự bay vào xen kẽ hai vòng, rải theo lời đọc (Kết≈19 … dùng≈70)
const NODES: Node[] = (() => {
  const order: {brand: BrandKey; ring: 0 | 1; k: number; n: number}[] = [];
  const a = INNER.map((b, k) => ({brand: b, ring: 0 as const, k, n: INNER.length}));
  const b = OUTER.map((x, k) => ({brand: x, ring: 1 as const, k, n: OUTER.length}));
  // trong, ngoài, ngoài, trong, ngoài, ...
  const pattern = [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
  let ia = 0;
  let ib = 0;
  for (const p of pattern) order.push(p === 0 ? a[ia++] : b[ib++]);
  return order.map((o, idx) => ({...o, idx, start: Math.round(14 + idx * 4.3)}));
})();

const FLY = 22; // số frame bay vào
export const CONNECT_MARKS = {
  ghostIn: 2,
  /** frame từng logo chạm vị trí trên quỹ đạo (đặt tiếng "tách" nhẹ) */
  arrivals: NODES.map((n) => ({brand: n.brand, f: n.start + FLY})),
  blinks: [34, 92, 140, 168],
};

/** Vị trí một ứng dụng tại frame f (đã gồm bay vào + trôi quỹ đạo). */
const nodePos = (n: Node, f: number) => {
  const r = RING[n.ring];
  const drift = ev(f, [0, 200], [0, r.drift], E.inOut);
  const ang = ((r.base + (360 / n.n) * n.k + drift) * Math.PI) / 180;
  const p = ev(f, [n.start, n.start + FLY], [0, 1], E.out);
  // bay từ xa theo hướng xuyên tâm, hơi xoáy
  const far = 2.4 - 1.4 * p;
  const twist = (1 - p) * 0.5 * (n.ring ? -1 : 1);
  const a2 = ang + twist;
  return {
    x: CENTER.x + Math.cos(a2) * r.rx * far,
    y: CENTER.y + Math.sin(a2) * r.ry * far,
    p,
  };
};

/** Hai nét song song từ ứng dụng về ghost, vẽ dần + chấm sáng chạy về tâm. */
const Link: React.FC<{n: Node; f: number}> = ({n, f}) => {
  const arrive = n.start + FLY;
  const draw = ev(f, [arrive - 6, arrive + 14], [0, 1], E.inOut);
  if (draw <= 0) return null;
  const q = nodePos(n, f);
  const dx = CENTER.x - q.x;
  const dy = CENTER.y - q.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // pháp tuyến: tách hai nét như hai mắt
  const nx = -uy * 5;
  const ny = ux * 5;
  const color = n.ring ? C.sparkle : C.send;
  const lines = [1, -1].map((s) => ({x1: q.x + nx * s, y1: q.y + ny * s, x2: CENTER.x + nx * s, y2: CENTER.y + ny * s}));
  // chấm sáng: mỗi vòng 44 frame, chạy có easing từ ứng dụng về ghost
  const period = 44;
  const phase = rnd(n.idx) * period;
  const tt = f - arrive - 10 - phase;
  const pulses: React.ReactNode[] = [];
  if (tt > 0) {
    const cyc = Math.floor(tt / period);
    const local = (tt - cyc * period) / period;
    const t = E.inOut(Math.min(1, local / 0.8));
    const o = ev(local, [0, 0.12], [0, 1], E.out) * (1 - ev(local, [0.62, 0.8], [0, 1], E.in));
    if (o > 0.01) {
      // dừng trước thân ghost
      const stop = Math.max(0, len - GHOST_W * 0.42);
      for (const s of [1, -1]) {
        pulses.push(
          <circle
            key={s}
            cx={q.x + nx * s + ux * stop * t}
            cy={q.y + ny * s + uy * stop * t}
            r={5.5}
            fill={color}
            opacity={o}
          />,
        );
      }
    }
  }
  return (
    <g>
      {lines.map((l, i) => (
        <line
          key={i}
          {...l}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={0.42}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
      ))}
      {pulses}
    </g>
  );
};

export const Connect: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = ev(f, [2, 22], [0, 1], E.out);
  const blink = blinkAt(f, CONNECT_MARKS.blinks);
  // ghost liếc theo vài ứng dụng vừa tới rồi nhìn thẳng
  const look = {
    x: keys(f, [30, 46, 70, 96, 120], [0, -1.6, 1.8, 0.6, 0], E.inOut),
    y: keys(f, [30, 46, 70, 96, 120], [0, -0.8, 0.4, 1, 0], E.inOut),
  };
  const breathe = 1 + 0.02 * ev(f, [20, 200], [0, 1], E.inOut);
  const ringDraw = (i: number) => ev(f, [6 + i * 8, 46 + i * 8], [0, 1], E.inOut);
  // vầng sáng sau ghost sáng dần lên khi càng nhiều ứng dụng kết nối
  const linked = NODES.filter((n) => f >= n.start + FLY + 8).length / NODES.length;
  const gh = (GHOST_W * LOGO_H) / 100;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {/* vầng sáng */}
      <div
        style={{
          position: 'absolute',
          left: CENTER.x,
          top: CENTER.y,
          width: 760,
          height: 760,
          translate: '-50% -50%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(35,110,238,${0.06 + 0.12 * ev(linked, [0, 1], [0, 1], E.out)}) 0%, rgba(35,110,238,0) 62%)`,
          scale: String(0.6 + 0.4 * reveal),
        }}
      />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {/* hai quỹ đạo mảnh */}
        {RING.map((r, i) => {
          const perim = Math.PI * (3 * (r.rx + r.ry) - Math.sqrt((3 * r.rx + r.ry) * (r.rx + 3 * r.ry)));
          return (
            <ellipse
              key={i}
              cx={CENTER.x}
              cy={CENTER.y}
              rx={r.rx}
              ry={r.ry}
              fill="none"
              stroke={C.hairline}
              strokeWidth={2}
              strokeDasharray={perim}
              strokeDashoffset={perim * (1 - ringDraw(i))}
            />
          );
        })}
        {NODES.map((n) => (
          <Link key={n.brand} n={n} f={f} />
        ))}
      </svg>

      {/* ứng dụng */}
      {NODES.map((n) => {
        if (f < n.start) return null;
        const q = nodePos(n, f);
        const size = RING[n.ring].size;
        const arrive = n.start + FLY;
        // nảy nhẹ khi chạm quỹ đạo
        const pop = keys(f, [arrive - 2, arrive + 3, arrive + 12], [1, 1.1, 1], E.out);
        return (
          <div
            key={n.brand}
            style={{
              position: 'absolute',
              left: q.x - size / 2,
              top: q.y - size / 2,
              opacity: ev(f, [n.start, n.start + 8], [0, 1], E.out),
              scale: String((0.5 + 0.5 * q.p) * pop),
              filter: q.p < 0.6 ? `blur(${(0.6 - q.p) * 14}px)` : undefined,
            }}
          >
            <AppTile brand={n.brand} size={size} />
          </div>
        );
      })}

      {/* ghost: thân nở ra từ giữa hai mắt */}
      <div style={{position: 'absolute', left: CENTER.x - GHOST_W / 2, top: CENTER.y - gh / 2, scale: String(breathe)}}>
        <Ghost width={GHOST_W} reveal={reveal} blink={blink} look={look} />
      </div>

      {/* tiêu đề dưới cùng, tách khỏi quỹ đạo */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 870}}>
        <VoiceText id="n7" f={f} start={S} size={84} pick={[0, 1, 3, 4, 5]} replace={{5: 'cụ.'}} />
      </div>
    </AbsoluteFill>
  );
};
