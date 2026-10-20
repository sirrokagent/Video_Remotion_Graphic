import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {ev} from '../anim';
import {E, FONT} from '../theme';

/**
 * BMW M3 / M4 — phim quảng cáo 30 giây dựng từ ảnh trong brochure 2026.
 * 120 BPM: mỗi phách 15 frame, mọi cú cắt rơi đúng phách. Nhạc + SFX: scripts/make_music_bmw.py.
 * Tất định — không Math.random, không Date.now.
 */

export const BMW_DUR = 900;

// Màu sọc M (xanh nhạt · xanh đậm · đỏ)
const M = ['#4FA8E8', '#1C3F94', '#E1261C'];

type Shot = {
  from: number;
  to: number;
  img: string;
  pos?: string; // object-position
  zoom?: [number, number];
  pan?: [number, number]; // dịch ngang (px) đầu → cuối
  word?: string;
  sub?: string;
  dim?: number;
};

const SHOTS: Shot[] = [
  {from: 96, to: 216, img: 'desert', pos: '50% 62%', zoom: [1.22, 1.06], pan: [40, -40], word: 'THE ULTIMATE', sub: 'DRIVING MACHINE.'},
  {from: 216, to: 306, img: 'green', pos: '50% 56%', zoom: [1.05, 1.2], pan: [-60, 20], word: 'PERFORMANCE', sub: 'ICON.'},
  {from: 306, to: 396, img: 'drift', pos: '50% 68%', zoom: [1.12, 1.28], pan: [50, -30], word: 'HUYỀN THOẠI.', sub: 'M3 COMPETITION TOURING'},
  {from: 396, to: 426, img: 'interior', pos: '50% 50%', zoom: [1.2, 1.08], pan: [-30, 30], word: 'CHÍNH XÁC.'},
  {from: 426, to: 456, img: 'wheel', pos: '50% 48%', zoom: [1.08, 1.22], pan: [0, 0], word: 'HÀI HÒA.'},
  {from: 456, to: 486, img: 'seat', pos: '50% 50%', zoom: [1.18, 1.06], pan: [40, -10], word: 'KẾT NỐI.'},
  {from: 486, to: 516, img: 'blue', pos: '50% 56%', zoom: [1.04, 1.16], pan: [-20, 20], word: 'M3 TOURING.'},
  {from: 696, to: 786, img: 'purple', pos: '50% 84%', zoom: [1.1, 1.24], pan: [-40, 30], word: 'CẠNH TRANH', sub: 'LÀ BẢN NGÃ.'},
];

// Cảnh thông số: mỗi số 60 frame, nền đổi theo
const SPECS = [
  {at: 516, img: 'studio', value: 530, dec: 0, unit: 'HP', label: 'CÔNG SUẤT TỐI ĐA'},
  {at: 576, img: 'm4front', value: 650, dec: 0, unit: 'Nm', label: 'MÔ-MEN XOẮN'},
  {at: 636, img: 'studio-rear', value: 3.5, dec: 1, unit: 's', label: '0–100 KM/H'},
];

// Các cú hit — nháy sáng + rung máy
const HITS = [96, 306, 396, 516, 576, 636, 696, 786];

const BAR = 132; // letterbox ~2.35:1

const shake = (f: number) => {
  let a = 0;
  for (const h of HITS) if (f >= h && f < h + 14) a = Math.max(a, ev(f, [h, h + 14], [1, 0], E.out));
  return {x: Math.sin(f * 2.7) * 9 * a, y: Math.cos(f * 3.3) * 7 * a};
};

const flash = (f: number) => {
  let a = 0;
  for (const h of HITS) if (f >= h && f < h + 9) a = Math.max(a, ev(f, [h, h + 9], [0.85, 0], E.out));
  return a;
};

/** Ảnh tĩnh có Ken Burns + vào cảnh trượt mờ. */
const Photo: React.FC<{s: Shot; f: number}> = ({s, f}) => {
  const len = s.to - s.from;
  const k = ev(f, [s.from, s.to], [0, 1], E.inOut);
  const z = (s.zoom?.[0] ?? 1.1) + ((s.zoom?.[1] ?? 1.2) - (s.zoom?.[0] ?? 1.1)) * k;
  const px = (s.pan?.[0] ?? 0) + ((s.pan?.[1] ?? 0) - (s.pan?.[0] ?? 0)) * k;
  const enter = ev(f, [s.from, s.from + Math.min(10, len / 3)], [1, 0], E.out);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={staticFile(`bmw/${s.img}.jpg`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: s.pos ?? '50% 50%',
          transform: `translateX(${px + enter * 120}px) scale(${z + enter * 0.08})`,
          filter: `contrast(1.12) saturate(1.08) brightness(${1 - (s.dim ?? 0)}) blur(${enter * 10}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Chữ lớn: từng chữ cái trồi lên khỏi vạch che, chữ phụ giãn khoảng cách chữ. */
const Title: React.FC<{text: string; sub?: string; f: number; from: number; to: number; align?: 'left' | 'center'}> = ({text, sub, f, from, to, align = 'left'}) => {
  const out = ev(f, [to - 8, to], [0, 1], E.in);
  const short = to - from <= 30;
  const chars = [...text];
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'left' ? 120 : 0,
        right: align === 'left' ? undefined : 0,
        bottom: align === 'left' ? BAR + 70 : undefined,
        top: align === 'center' ? 0 : undefined,
        height: align === 'center' ? '100%' : undefined,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'left' ? 'flex-start' : 'center',
        fontFamily: FONT,
        color: '#fff',
        opacity: 1 - out,
        transform: `translateY(${-24 * out}px)`,
        textShadow: '0 4px 30px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{display: 'flex', overflow: 'hidden', paddingBottom: 6}}>
        {chars.map((c, i) => {
          const st = from + 2 + i * (short ? 0.7 : 1.3);
          const p = ev(f, [st, st + 10], [1, 0], E.out);
          return (
            <span key={i} style={{fontSize: short ? 132 : 112, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.04, display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${p * 110}%)`}}>
              {c}
            </span>
          );
        })}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: `${ev(f, [from + 10, from + 40], [0.6, 0.22], E.out)}em`,
            opacity: ev(f, [from + 10, from + 24], [0, 1], E.out),
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/** Ba sọc M chéo — quét qua màn hình. p: 0 → 1 */
const Stripes: React.FC<{p: number; y?: number; h?: number; w?: number}> = ({p, y = 540, h = 46, w = 2600}) => (
  <div style={{position: 'absolute', left: 0, top: y - (h * 3 + 16) / 2, width: '100%', height: h * 3 + 16, transform: 'skewX(-24deg)'}}>
    {M.map((c, i) => {
      const local = Math.min(1, Math.max(0, p * 1.25 - i * 0.12));
      const x = -w + (1920 + 2 * w) * E.inOut(local) - w * 0;
      return <div key={c} style={{position: 'absolute', top: i * (h + 8), left: x, width: w, height: h, background: c}} />;
    })}
  </div>
);

/** Mở đầu: sọc M vẽ vào, "THE M3 · M4" hiện ra, sọc bay đi. */
const Intro: React.FC<{f: number}> = ({f}) => {
  const draw = ev(f, [6, 40], [0, 1], E.out);
  const leave = ev(f, [78, 96], [0, 1], E.in);
  const t = ev(f, [34, 60], [0, 1], E.out);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 540 - 90, width: '100%', height: 180, transform: 'skewX(-24deg)'}}>
        {M.map((c, i) => (
          <div
            key={c}
            style={{
              position: 'absolute',
              top: i * 62,
              left: 560 + 1500 * leave - i * 20,
              width: 800 * draw * (1 - leave * 0.4),
              height: 52,
              background: c,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          color: '#fff',
          opacity: t * (1 - leave),
          transform: `scale(${1.08 - 0.08 * t + leave * 0.3})`,
          filter: `blur(${(1 - t) * 14 + leave * 10}px)`,
          mixBlendMode: 'normal',
        }}
      >
        <div style={{fontSize: 40, fontWeight: 500, letterSpacing: `${0.9 - 0.5 * t}em`, marginBottom: 6, textShadow: '0 2px 20px #000'}}>THE</div>
        <div style={{fontSize: 200, fontWeight: 800, letterSpacing: `${0.12 - 0.12 * t}em`, lineHeight: 1, textShadow: '0 6px 40px #000'}}>M3 · M4</div>
      </div>
    </AbsoluteFill>
  );
};

/** Bộ đếm thông số trên nền xe studio. */
const Spec: React.FC<{f: number; i: number}> = ({f, i}) => {
  const s = SPECS[i];
  const to = i < SPECS.length - 1 ? SPECS[i + 1].at : 696;
  const n = ev(f, [s.at + 2, s.at + 34], [0, s.value], E.out);
  const shown = s.dec ? n.toFixed(s.dec) : Math.round(n).toString();
  const out = ev(f, [to - 7, to], [0, 1], E.in);
  const enter = ev(f, [s.at, s.at + 16], [0, 1], E.out);
  const bar = ev(f, [s.at + 4, s.at + 40], [0, 1], E.out);
  return (
    <>
      <Photo s={{from: s.at, to, img: s.img, pos: '50% 62%', zoom: [1.32, 1.26], pan: [i % 2 ? 250 : 280, 230], dim: 0}} f={f} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', left: 120, top: 280, fontFamily: FONT, color: '#fff', opacity: 1 - out, transform: `translateX(${(1 - enter) * -60 - out * 40}px)`}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontSize: 260, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{shown}</span>
          <span style={{fontSize: 96, fontWeight: 800, color: M[0]}}>{s.unit}</span>
        </div>
        <div style={{display: 'flex', gap: 6, margin: '18px 0 22px', transform: 'skewX(-24deg)'}}>
          {M.map((c, k) => (
            <div key={c} style={{width: 150 * Math.min(1, Math.max(0, bar * 1.4 - k * 0.2)), height: 14, background: c}} />
          ))}
        </div>
        <div style={{fontSize: 44, fontWeight: 500, letterSpacing: '0.2em'}}>{s.label}</div>
      </div>
    </>
  );
};

/** Kết: ba xe, tên dòng xe, giá khởi điểm. */
const End: React.FC<{f: number}> = ({f}) => {
  const k = ev(f, [786, 900], [0, 1], E.out);
  const t = ev(f, [792, 822], [0, 1], E.out);
  const p = ev(f, [812, 840], [0, 1], E.out);
  const fade = ev(f, [884, 900], [0, 1], E.inOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img
          src={staticFile('bmw/trio.jpg')}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 58%', transform: `scale(${1.25 - 0.12 * k})`, filter: 'contrast(1.1) brightness(0.62)'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.0) 70%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: BAR + 60, textAlign: 'center', fontFamily: FONT, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>
        <div style={{fontSize: 150, fontWeight: 800, lineHeight: 1, letterSpacing: `${0.2 - 0.2 * t}em`, opacity: t, filter: `blur(${(1 - t) * 12}px)`}}>THE M3 · M4</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 8, margin: '26px 0', transform: 'skewX(-24deg)'}}>
          {M.map((c, i) => (
            <div key={c} style={{width: 120 * Math.min(1, Math.max(0, p * 1.4 - i * 0.2)), height: 14, background: c}} />
          ))}
        </div>
        <div style={{fontSize: 48, fontWeight: 500, letterSpacing: '0.12em', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>GIÁ TỪ 4,999 TỶ VNĐ</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};

/** Hạt phim tất định (seed theo frame). */
const Grain: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width="1920" height="1080">
      <filter id={`g${f % 8}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 8} />
      </filter>
      <rect width="1920" height="1080" filter={`url(#g${f % 8})`} />
    </svg>
  </AbsoluteFill>
);

export const BmwM: React.FC = () => {
  const f = useCurrentFrame();
  const sh = shake(f);
  const shot = SHOTS.find((s) => f >= s.from && f < s.to);
  const spec = SPECS.findIndex((s, i) => f >= s.at && f < (i < SPECS.length - 1 ? SPECS[i + 1].at : 696));
  // sọc M quét ngang ở các mốc chuyển đoạn lớn
  const wipes = [210, 510, 690, 780];
  const wipe = wipes.find((w) => f >= w && f < w + 16);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('bmw/score.mp3')} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.02)`}}>
        {f < 96 ? <Intro f={f} /> : null}
        {shot ? (
          <>
            <Photo s={shot} f={f} />
            <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 60%)'}} />
            <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
            {shot.word ? <Title text={shot.word} sub={shot.sub} f={f} from={shot.from} to={shot.to} /> : null}
          </>
        ) : null}
        {spec >= 0 ? <Spec f={f} i={spec} /> : null}
        {f >= 786 ? <End f={f} /> : null}
      </AbsoluteFill>
      {wipe !== undefined ? <Stripes p={ev(f, [wipe, wipe + 16], [0, 1], E.inOut)} /> : null}
      <AbsoluteFill style={{background: '#fff', opacity: flash(f), mixBlendMode: 'screen'}} />
      <Grain f={f} />
      {/* letterbox */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000'}} />
    </AbsoluteFill>
  );
};
