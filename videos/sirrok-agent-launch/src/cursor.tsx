import React from 'react';
import {EYE_MID, EyePair, LOGO} from './logo';
import {E} from './theme';
import {ev} from './anim';

/**
 * Con trỏ của agent = cặp mắt. Di chuyển theo các điểm khoá, mỗi đoạn có easing
 * riêng và hơi cong; phía sau để lại HAI vệt song song — mỗi vệt đi qua tâm
 * một con mắt — mờ dần như đuôi sao chổi.
 */

export type Key = {f: number; x: number; y: number};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const cursorAt = (keys: Key[], f: number) => {
  if (f <= keys[0].f) return {x: keys[0].x, y: keys[0].y};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) {
      const t = ev(f, [a.f, b.f], [0, 1], E.inOut);
      // cong nhẹ vuông góc với hướng đi, đổi chiều xen kẽ — chuyển động có hồn, không máy móc
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const bow = Math.sin(Math.PI * t) * Math.min(90, len * 0.18) * (i % 2 === 0 ? 1 : -1);
      return {x: lerp(a.x, b.x, t) + (-dy / len) * bow, y: lerp(a.y, b.y, t) + (dx / len) * bow};
    }
  }
  const last = keys[keys.length - 1];
  return {x: last.x, y: last.y};
};

const e0 = LOGO.eyes[0];
const e1 = LOGO.eyes[1];
// nửa vector nối tâm hai mắt (đơn vị logo)
const HALF = {
  x: ((e1.x1 + e1.x2) / 2 - (e0.x1 + e0.x2) / 2) / 2,
  y: ((e1.y1 + e1.y2) / 2 - (e0.y1 + e0.y2) / 2) / 2,
};

type Props = {
  keys: Key[];
  f: number;
  logoWidth: number;
  blink?: number;
  color?: string;
  trailFrames?: number;
  opacity?: number;
};

export const AgentCursor: React.FC<Props> = ({keys, f, logoWidth, blink = 0, color = '#0A0A0A', trailFrames = 16, opacity = 1}) => {
  const k = logoWidth / 100;
  const p = cursorAt(keys, f);
  const pts = Array.from({length: trailFrames}, (_, i) => cursorAt(keys, f - i * 0.75));
  // tâm mắt lệch so với điểm giữa — vẽ vệt đúng qua tâm từng mắt
  const offs = [
    {x: ((e0.x1 + e0.x2) / 2 - EYE_MID.x) * k, y: ((e0.y1 + e0.y2) / 2 - EYE_MID.y) * k},
    {x: HALF.x * k, y: HALF.y * k},
  ];
  const segs: React.ReactNode[] = [];
  offs.forEach((o, j) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (Math.hypot(a.x - b.x, a.y - b.y) < 0.6) continue;
      segs.push(
        <line
          key={`${j}-${i}`}
          x1={a.x + o.x}
          y1={a.y + o.y}
          x2={b.x + o.x}
          y2={b.y + o.y}
          stroke={color}
          strokeWidth={LOGO.eyes[j].w * k * 0.8 * (1 - i / pts.length)}
          strokeLinecap="round"
          opacity={0.22 * (1 - i / pts.length)}
        />,
      );
    }
  });
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {segs}
      </svg>
      <EyePair logoWidth={logoWidth} blink={blink} color={color} style={{left: p.x, top: p.y}} />
    </div>
  );
};

/** Vòng gợn khi agent "bấm" — mở rộng và tắt dần. */
export const ClickRipple: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  if (f < at || f > at + 18) return null;
  const t = ev(f, [at, at + 18], [0, 1], E.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 40 + 90 * t,
        height: 40 + 90 * t,
        translate: '-50% -50%',
        borderRadius: '50%',
        border: `${3 - 2 * t}px solid rgba(11,87,208,${0.55 * (1 - t)})`,
      }}
    />
  );
};
