import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {AppTile} from '../../brands';
import {Ghost, LOGO_H} from '../../logo';
import {C, E} from '../../theme';
import {CONNECT_MARKS, FLY, GHOST_W, NODES, Node, STEP} from '../scenes/Connect';
import {VoiceText} from '../text';
import {VO} from '../timeline';
import {SAFE, VH, VW} from './frame';

/**
 * Cảnh Connect — bản DỌC 1080×1920. Cùng 14 ứng dụng, cùng thứ tự & mốc bay vào
 * (NODES / FLY / CONNECT_MARKS của bản ngang), cùng nhịp chớp mắt.
 * Khác bản ngang: hai quỹ đạo là elip ĐỨNG lấp đầy khung dọc, ghost to hơn ở giữa,
 * tiêu đề ngắt hai dòng ở vùng an toàn phía dưới — không chạm ô ứng dụng hay logo.
 * Ứng dụng bay vào từ trên/dưới (trục dài của khung), hơi xoáy.
 */

const S = VO.n7.at;

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const CENTER = {x: VW / 2, y: 735};
const GK = 1.25; // ghost to hơn bản ngang một chút cho khung dọc
const GW = GHOST_W * GK;
const RING = [
  {rx: 262, ry: 300, size: 108, base: -90, drift: 20},
  {rx: 420, ry: 462, size: 100, base: -90 + STEP / 2, drift: 15},
];

/** Vị trí một ứng dụng tại frame f (bay vào + trôi theo quỹ đạo). */
const nodePos = (n: Node, f: number) => {
  const r = RING[n.ring];
  const drift = ev(f, [0, 200], [0, r.drift], E.inOut);
  const ang = ((r.base + STEP * n.k + drift) * Math.PI) / 180;
  const p = ev(f, [n.start, n.start + FLY], [0, 1], E.out);
  // khung dọc: bay vào chủ yếu theo chiều dọc (xa theo trục dài), hơi xoáy
  const farX = 1.25 - 0.25 * p;
  const farY = 2.4 - 1.4 * p;
  const twist = (1 - p) * 0.35 * (n.ring ? -1 : 1);
  const a2 = ang + twist;
  return {
    x: CENTER.x + Math.cos(a2) * r.rx * farX,
    y: CENTER.y + Math.sin(a2) * r.ry * farY,
    p,
  };
};

/** Hai nét song song từ ứng dụng về ghost, vẽ dần + chấm sáng chạy về tâm (y như bản ngang). */
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
  const nx = -uy * 5;
  const ny = ux * 5;
  const color = n.ring ? C.sparkle : C.send;
  const lines = [1, -1].map((s) => ({x1: q.x + nx * s, y1: q.y + ny * s, x2: CENTER.x + nx * s, y2: CENTER.y + ny * s}));
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
      const stop = Math.max(0, len - GW * 0.42);
      for (const s of [1, -1]) {
        pulses.push(<circle key={s} cx={q.x + nx * s + ux * stop * t} cy={q.y + ny * s + uy * stop * t} r={6} fill={color} opacity={o} />);
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
          strokeWidth={3.2}
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

const HEAD = 116;

export const VConnect: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = ev(f, [2, 22], [0, 1], E.out);
  const blink = blinkAt(f, CONNECT_MARKS.blinks);
  const look = {
    x: keys(f, [30, 46, 70, 96, 120], [0, -1.6, 1.8, 0.6, 0], E.inOut),
    y: keys(f, [30, 46, 70, 96, 120], [0, -0.8, 0.4, 1, 0], E.inOut),
  };
  const breathe = 1 + 0.02 * ev(f, [20, 200], [0, 1], E.inOut);
  const ringDraw = (i: number) => ev(f, [6 + i * 8, 46 + i * 8], [0, 1], E.inOut);
  const linked = NODES.filter((n) => f >= n.start + FLY + 8).length / NODES.length;
  const gh = (GW * LOGO_H) / 100;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {/* vầng sáng */}
      <div
        style={{
          position: 'absolute',
          left: CENTER.x,
          top: CENTER.y,
          width: 980,
          height: 1100,
          translate: '-50% -50%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(35,110,238,${0.06 + 0.12 * ev(linked, [0, 1], [0, 1], E.out)}) 0%, rgba(35,110,238,0) 62%)`,
          scale: String(0.6 + 0.4 * reveal),
        }}
      />
      <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
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
      <div style={{position: 'absolute', left: CENTER.x - GW / 2, top: CENTER.y - gh / 2, scale: String(breathe)}}>
        <Ghost width={GW} reveal={reveal} blink={blink} look={look} />
      </div>

      {/* tiêu đề hai dòng ở vùng an toàn phía dưới: "Kết nối / mọi công cụ." */}
      <div style={{position: 'absolute', left: 0, right: 0, top: VH - SAFE.bottom - HEAD * 1.12 * 2 - 10}}>
        <VoiceText id="n7" f={f} start={S} size={HEAD} pick={[0, 1]} />
        <VoiceText id="n7" f={f} start={S} size={HEAD} pick={[3, 4, 5]} replace={{5: 'cụ.'}} />
      </div>
    </AbsoluteFill>
  );
};
