import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {EyePair, Ghost, LOCKUP, LOGO_H, Sparkle, Wordmark} from '../../logo';
import {C, E, FONT} from '../../theme';
import {PHONE, PhoneFrame} from '../../ui';
import {Mascot} from '../mascot';
import {Kinetic} from '../text';

/**
 * Cảnh Sleep — câu chốt của cả phim: "Làm việc cả khi bạn ngủ." Không thoại.
 * Đêm xuống (nền #05070D, trăng khuyết, sao) → đồng hồ cuộn 23:00 → 06:00 → người dùng ngủ (Zzz)
 * trong khi các ghost agent vẫn làm, thông báo xếp chồng trên màn khoá → tiêu đề lớn →
 * bình minh, agent "done" → ánh sáng tràn trắng → lockup ghost + "Sirrok Agent" đứng yên tới hết phim.
 * MỘT file cho cả khung ngang 1920×1080 và khung dọc 1080×1920.
 *
 * Mốc chính (frame của cảnh — dùng đặt SFX):
 *   6–40    đêm phủ từ trên xuống; 18 trăng mọc; 26 sao lấp lánh; 20–50 điện thoại + giường hiện
 *   30–160  đồng hồ cuộn 23:00 → 06:00 (đồng hồ lớn hiện 24–108, trên màn khoá tới hết)
 *   46 / 68 / 90 / 112   bốn thông báo đáp xuống màn khoá (chấm sáng bay từ agent vào máy trước ~12f)
 *   118     "Làm việc" · 128 "cả khi bạn ngủ."
 *   160     06:00 — bình minh bắt đầu; Dynamic Island chuyển ✓
 *   162 / 166 / 170   ba agent chuyển "done" (chấm xanh, nảy)
 *   196     tiêu đề rời; 200–222 ánh sáng tràn trắng từ đường chân trời
 *   214     hai nét mắt hiện · 220 chớp · 224 thân ghost nở · 232 chữ "Sirrok Agent" · 244 sao ✦
 *   258–300 lockup đứng yên — HẾT PHIM
 */

export const SLEEP_T = {
  night: 6,
  clock0: 30,
  clock1: 160,
  notif: [46, 68, 90, 112],
  head1: 118,
  head2: 128,
  dawn: 160,
  done: [162, 166, 170],
  headOut: 196,
  flood: 200,
  eyes: 214,
  blink: 220,
  reveal: 224,
  word: 232,
  star: 244,
  still: 258,
} as const;

const NIGHT = '#05070D';
const NAVY = '#0E1630';

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── màu ──
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

/** Giờ hiển thị: 23:00 → 06:00 theo easing (420 phút). */
const clockText = (f: number) => {
  const m = Math.floor(ev(f, [SLEEP_T.clock0, SLEEP_T.clock1], [0, 420], E.inOut));
  const t = (23 * 60 + m) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

const NOTES = [
  {text: 'Đã gửi 12 báo giá', body: '#1877F2'},
  {text: 'Đã trả lời 48 tin nhắn', body: '#FFFFFF'},
  {text: 'Đã đăng 3 bài', body: '#D97757'},
  {text: 'Đã chốt 5 lịch hẹn', body: '#1DB954'},
];

// ba agent làm việc quanh điện thoại (màu sáng để nổi trên nền đêm)
const HELPERS = ['#FFFFFF', '#1877F2', '#D97757'];

type Pt = {x: number; y: number};
type Layout = {
  phone: Pt & {scale: number}; // tâm điện thoại
  stand: {x: number; y: number; w: number};
  helpers: (Pt & {size: number})[];
  moon: Pt & {r: number};
  head: {x: number; y: number; size: number; lines: string[]};
  clock: {x: number; y: number; size: number};
  bed: {x: number; y: number; w: number};
  lock: {y: number; ghost: number; text: number; stack: boolean};
  sky: number; // độ cao vùng trời có sao
};

const LAND: Layout = {
  phone: {x: 1430, y: 528, scale: 0.84},
  stand: {x: 1430, y: 948, w: 560},
  helpers: [
    {x: 1110, y: 330, size: 96},
    {x: 1770, y: 290, size: 92},
    {x: 1785, y: 700, size: 100},
  ],
  moon: {x: 250, y: 170, r: 58},
  head: {x: 140, y: 300, size: 124, lines: ['Làm việc', 'cả khi bạn ngủ.']},
  clock: {x: 140, y: 300, size: 250},
  bed: {x: 90, y: 830, w: 900},
  lock: {y: 540, ghost: 180, text: 0, stack: false},
  sky: 1080,
};

const PORT: Layout = {
  phone: {x: 708, y: 1188, scale: 0.8},
  stand: {x: 708, y: 1590, w: 560},
  helpers: [
    {x: 330, y: 920, size: 104},
    {x: 300, y: 1170, size: 92},
    {x: 990, y: 860, size: 0}, // khung dọc: không đủ chỗ bên phải — ẩn
  ],
  moon: {x: 890, y: 330, r: 60},
  head: {x: 80, y: 290, size: 140, lines: ['Làm việc', 'cả khi', 'bạn ngủ.']},
  clock: {x: 80, y: 330, size: 250},
  bed: {x: 30, y: 1390, w: 470},
  lock: {y: 640, ghost: 300, text: 150, stack: true},
  sky: 1920,
};

/* ---------------- trăng & sao ---------------- */

const Moon: React.FC<{r: number}> = ({r}) => (
  <svg width={r * 4} height={r * 4} viewBox={`${-2 * r} ${-2 * r} ${4 * r} ${4 * r}`} style={{position: 'absolute', overflow: 'visible', translate: '-50% -50%'}}>
    <defs>
      <mask id="sleep-moon">
        <circle cx={0} cy={0} r={r} fill="#fff" />
        <circle cx={r * 0.45} cy={-r * 0.3} r={r * 0.86} fill="#000" />
      </mask>
      <radialGradient id="sleep-moon-glow">
        <stop offset="0%" stopColor="rgba(190,205,255,0.22)" />
        <stop offset="100%" stopColor="rgba(190,205,255,0)" />
      </radialGradient>
    </defs>
    <circle cx={0} cy={0} r={r * 2} fill="url(#sleep-moon-glow)" />
    <circle cx={0} cy={0} r={r} fill="#F4F1E6" mask="url(#sleep-moon)" />
  </svg>
);

/* ---------------- người ngủ ---------------- */

const Sleeper: React.FC<{f: number; w: number}> = ({f, w}) => {
  const breathe = 1 + 0.035 * Math.sin(f * 0.11);
  const k = w / 900;
  return (
    <div style={{position: 'relative', width: w, height: 260 * k}}>
      <svg width={w} height={260 * k} viewBox="0 0 900 260" style={{position: 'absolute', overflow: 'visible'}}>
        {/* đầu giường */}
        <rect x={0} y={20} width={34} height={240} rx={14} fill="#1A2238" />
        {/* nệm */}
        <rect x={20} y={150} width={880} height={110} rx={30} fill="#141B2E" />
        {/* gối */}
        <rect x={52} y={92} width={210} height={74} rx={37} fill="#2B3654" />
        {/* đầu người */}
        <circle cx={168} cy={92} r={46} fill="#8C96AE" />
        {/* chăn — phập phồng theo nhịp thở */}
        <g style={{transform: `scaleY(${breathe})`, transformOrigin: '500px 160px'}}>
          <path d="M210 160 C260 70 420 62 560 84 C700 104 840 110 900 132 L900 176 L210 176 Z" fill="#23407E" />
          <path d="M210 160 C260 70 420 62 560 84 C700 104 840 110 900 132" fill="none" stroke="#3460B8" strokeWidth={6} strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

/** "z z Z" bay lên theo vòng lặp, mỗi chữ một nhịp có easing. */
const Zzz: React.FC<{f: number; x: number; y: number; scale: number; fade: number}> = ({f, x, y, scale, fade}) => (
  <>
    {[0, 1, 2].map((i) => {
      const period = 54;
      const local = (f + i * 18) % period;
      const t = ev(local, [0, period], [0, 1], E.out);
      const op = ev(local, [0, 10], [0, 1], E.out) * (1 - ev(local, [34, period], [0, 1], E.in)) * fade;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + (20 + 70 * t) * scale,
            top: y - 120 * t * scale,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: (40 + 22 * t) * scale,
            color: '#9DB4F0',
            opacity: op,
            rotate: `${-10 + 14 * t}deg`,
          }}
        >
          z
        </div>
      );
    })}
  </>
);

/* ---------------- điện thoại: màn khoá ban đêm ---------------- */

const Ring: React.FC<{f: number; size: number; done: number}> = ({f, size, done}) => {
  // quay theo từng nhịp có easing, không quay đều tuyến tính
  const cyc = Math.floor(f / 24);
  const rot = (cyc + ev(f % 24, [0, 24], [0, 1], E.inOut)) * 300;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 30 30" style={{position: 'absolute', opacity: 1 - done, rotate: `${rot}deg`}}>
        <circle cx={15} cy={15} r={11} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={3.4} />
        <circle cx={15} cy={15} r={11} fill="none" stroke="#1877F2" strokeWidth={3.4} strokeLinecap="round" strokeDasharray="22 100" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: '#1DB954',
          display: 'grid',
          placeItems: 'center',
          scale: String(done),
        }}
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
    </div>
  );
};

const NightIsland: React.FC<{f: number}> = ({f}) => {
  const open = ev(f, [34, 46], [0, 1], E.back);
  const done = ev(f, [SLEEP_T.clock1, SLEEP_T.clock1 + 10], [0, 1], E.back);
  return (
    <div
      style={{
        position: 'absolute',
        top: PHONE.bezel + 18,
        left: '50%',
        translate: '-50% 0',
        width: 160 + 150 * open,
        height: 46,
        borderRadius: 23,
        background: '#000',
        overflow: 'hidden',
        boxShadow: `0 0 0 1.5px rgba(255,255,255,${0.08 * open})`,
      }}
    >
      <div style={{position: 'absolute', left: 14, top: 7, opacity: open}}>
        <Mascot size={36} state={done > 0.5 ? 'done' : 'work'} f={f} since={done > 0.5 ? SLEEP_T.clock1 : 34} body={C.white} eyes={C.ink} />
      </div>
      <div style={{position: 'absolute', right: 10, top: 8, opacity: open}}>
        <Ring f={f} size={30} done={done} />
      </div>
    </div>
  );
};

const NOTE_PITCH = 140;

const LockScreen: React.FC<{f: number; dawn: number}> = ({f, dawn}) => {
  const top = mix('#0B1124', '#2A3566', dawn);
  const bottom = mix('#05070D', '#B8672A', dawn);
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${top}, ${bottom})`, fontFamily: FONT, color: C.white}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 112, textAlign: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 600, color: 'rgba(255,255,255,0.78)'}}>Thứ Bảy, 11 tháng 10</div>
        <div style={{fontSize: 132, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'}}>{clockText(f)}</div>
      </div>
      {/* thông báo: mới nhất nằm trên, cũ bị đẩy xuống */}
      {NOTES.map((n, k) => {
        const at = SLEEP_T.notif[k];
        if (f < at) return null;
        let push = 0;
        for (let j = k + 1; j < NOTES.length; j++) push += ev(f, [SLEEP_T.notif[j], SLEEP_T.notif[j] + 14], [0, 1], E.out);
        const t = ev(f, [at, at + 16], [0, 1], E.out);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 18,
              right: 18,
              top: 316 + push * NOTE_PITCH,
              padding: '16px 20px 18px',
              borderRadius: 30,
              background: 'rgba(255,255,255,0.13)',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08)',
              opacity: t,
              translate: `0px ${(1 - t) * -40}px`,
              scale: String(0.9 + 0.1 * t),
              filter: `blur(${(1 - t) * 8}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <Mascot size={44} state="done" f={f} since={at + 4} body={n.body} eyes={n.body === '#FFFFFF' ? C.ink : C.white} />
              <span style={{fontSize: 29, fontWeight: 700, flex: 1}}>Sirrok Agent</span>
              <span style={{fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,0.72)'}}>bây giờ</span>
            </div>
            <div style={{fontSize: 32, fontWeight: 500, marginTop: 8, whiteSpace: 'nowrap'}}>{n.text}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', bottom: 18, left: '50%', translate: '-50% 0', width: 160, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.85)'}} />
    </div>
  );
};

/* ---------------- cảnh ---------------- */

export const Sleep: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const L = portrait ? PORT : LAND;

  // đêm phủ xuống từ trên; bình minh ấm dần từ đường chân trời
  const night = ev(f, [SLEEP_T.night, SLEEP_T.night + 34], [0, 1], E.inOut);
  const dawn = ev(f, [SLEEP_T.dawn, SLEEP_T.dawn + 40], [0, 1], E.inOut);
  const skyTop = mix(NIGHT, '#1B2650', dawn);
  const skyMid = mix(NAVY, '#3B3F72', dawn);
  const curtain = (1 - night) * 130; // % chưa phủ

  const roomIn = ev(f, [24, 52], [0, 1], E.out);
  const moonIn = ev(f, [18, 50], [0, 1], E.out);
  const moonSet = ev(f, [SLEEP_T.dawn, SLEEP_T.dawn + 40], [0, 1], E.in);
  const starsOp = ev(f, [26, 60], [0, 1], E.out) * (1 - ev(f, [SLEEP_T.dawn, SLEEP_T.dawn + 36], [0, 1], E.inOut));

  // đồng hồ lớn trước tiêu đề
  const clockIn = ev(f, [24, 40], [0, 1], E.out) * (1 - ev(f, [100, 112], [0, 1], E.in));
  const headOut = ev(f, [SLEEP_T.headOut, SLEEP_T.headOut + 12], [0, 1], E.in);

  // ánh sáng tràn trắng → lockup
  const flood = ev(f, [SLEEP_T.flood, SLEEP_T.flood + 22], [0, 1], E.inOut);
  const floodR = flood * Math.hypot(width, height) * 1.15;

  // lockup
  const eyesIn = ev(f, [SLEEP_T.eyes, SLEEP_T.eyes + 8], [0, 1], E.out);
  const reveal = ev(f, [SLEEP_T.reveal, SLEEP_T.reveal + 18], [0, 1], E.out);
  const eyeWhite = ev(f, [SLEEP_T.reveal + 1, SLEEP_T.reveal + 4], [0, 1], E.snap);
  const squash = keys(f, [SLEEP_T.reveal, SLEEP_T.reveal + 8, SLEEP_T.reveal + 18, SLEEP_T.reveal + 28], [0.88, 1.05, 0.99, 1], E.inOut);
  const word = ev(f, [SLEEP_T.word, SLEEP_T.word + 20], [0, 1], E.out);
  const star = ev(f, [SLEEP_T.star, SLEEP_T.star + 14], [0, 1], E.back);
  const blink = blinkAt(f, [SLEEP_T.blink]);

  const gw = L.lock.ghost;
  const gh = (gw * LOGO_H) / 100;
  const textGw = L.lock.text || gw; // khung dọc: chữ nhỏ hơn ghost
  const fontPx = textGw * LOCKUP.textCap * 1.36;
  const lockupRow = !L.lock.stack;

  const phoneScale = L.phone.scale;

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* bầu trời đêm phủ từ trên xuống (mép mềm) */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 70%, ${mix(NAVY, '#E08A3C', dawn)} 100%)`,
          maskImage: `linear-gradient(180deg, #000 ${100 - curtain}%, transparent ${130 - curtain}%)`,
          WebkitMaskImage: `linear-gradient(180deg, #000 ${100 - curtain}%, transparent ${130 - curtain}%)`,
        }}
      />
      {/* quầng bình minh từ chân trời */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 45% at 50% 100%, rgba(245,166,35,${0.5 * dawn}), transparent 70%)`}} />

      {/* sao */}
      {[...Array(46)].map((_, i) => {
        const x = rnd(i) * width;
        const y = rnd(i + 99) * L.sky * 0.62;
        const s = 2 + rnd(i + 7) * 3.5;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f * (0.05 + rnd(i + 3) * 0.08) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#DCE4FF', opacity: starsOp * tw}} />;
      })}

      {/* trăng khuyết */}
      <div style={{position: 'absolute', left: L.moon.x, top: L.moon.y + (1 - moonIn) * 40 + moonSet * 80, opacity: moonIn * (1 - moonSet)}}>
        <Moon r={L.moon.r} />
      </div>

      {/* người ngủ + Zzz */}
      <div style={{position: 'absolute', left: L.bed.x, top: L.bed.y + (1 - roomIn) * 60, opacity: roomIn}}>
        <Sleeper f={f} w={L.bed.w} />
        <Zzz f={f} x={(168 / 900) * L.bed.w} y={(40 / 900) * L.bed.w} scale={L.bed.w / 900} fade={ev(f, [40, 56], [0, 1], E.out) * (1 - ev(f, [SLEEP_T.dawn + 10, SLEEP_T.dawn + 30], [0, 1], E.out))} />
      </div>

      {/* tủ đầu giường */}
      <div
        style={{
          position: 'absolute',
          left: L.stand.x - L.stand.w / 2,
          top: L.stand.y + (1 - roomIn) * 60,
          width: L.stand.w,
          height: 400,
          borderRadius: '18px 18px 0 0',
          background: 'linear-gradient(180deg, #1C2540, #0D1222 40%)',
          boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.08)',
          opacity: roomIn,
        }}
      />

      {/* điện thoại trên tủ */}
      <div
        style={{
          position: 'absolute',
          left: L.phone.x - PHONE.w / 2,
          top: L.phone.y - PHONE.h / 2 + (1 - roomIn) * 80,
          scale: String(phoneScale),
          opacity: roomIn,
          filter: `drop-shadow(0 0 ${40 + 30 * dawn}px rgba(35,110,238,0.25))`,
        }}
      >
        <PhoneFrame island={<NightIsland f={f} />}>
          <LockScreen f={f} dawn={dawn} />
        </PhoneFrame>
      </div>

      {/* agent làm việc quanh điện thoại + chấm sáng bay vào máy */}
      {L.helpers.map((h, i) => {
        if (!h.size) return null;
        const inT = ev(f, [28 + i * 6, 48 + i * 6], [0, 1], E.back);
        const doneAt = SLEEP_T.done[i];
        const isDone = f >= doneAt;
        const hh = h.size * 0.863;
        const float = Math.sin(f * 0.07 + i * 2) * 8;
        return (
          <div key={i} style={{position: 'absolute', left: h.x - h.size / 2, top: h.y - hh / 2 + float, scale: String(inT), opacity: Math.min(1, inT * 2)}}>
            <Mascot size={h.size} state={isDone ? 'done' : 'work'} f={f} since={isDone ? doneAt : 28 + i * 6} body={HELPERS[i]} eyes={HELPERS[i] === '#FFFFFF' ? C.ink : C.white} />
          </div>
        );
      })}
      {SLEEP_T.notif.map((at, k) => {
        const hs = L.helpers.filter((h) => h.size);
        const h = hs[k % hs.length];
        const t = ev(f, [at - 12, at], [0, 1], E.inOut);
        if (t <= 0 || t >= 1) return null;
        const tx = L.phone.x;
        const ty = L.phone.y - (PHONE.h / 2 - 340) * phoneScale;
        const x = h.x + (tx - h.x) * t;
        const y = h.y + (ty - h.y) * t - Math.sin(Math.PI * t) * 60;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 16,
              height: 16,
              translate: '-50% -50%',
              borderRadius: '50%',
              background: '#8FB6FF',
              boxShadow: '0 0 18px 6px rgba(35,110,238,0.7)',
              opacity: ev(t, [0, 0.2], [0, 1], E.out),
            }}
          />
        );
      })}

      {/* đồng hồ lớn cuộn 23:00 → 06:00 */}
      {clockIn > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: L.clock.x,
            top: L.clock.y,
            fontSize: L.clock.size,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: C.white,
            fontVariantNumeric: 'tabular-nums',
            opacity: clockIn,
            filter: `blur(${(1 - clockIn) * 16}px)`,
          }}
        >
          {clockText(f)}
        </div>
      ) : null}

      {/* tiêu đề — câu chốt */}
      <div style={{position: 'absolute', left: L.head.x, top: L.head.y}}>
        {L.head.lines.map((line, i) => (
          <Kinetic
            key={i}
            text={line}
            f={f}
            start={i === 0 ? SLEEP_T.head1 : SLEEP_T.head2 + (i - 1) * 8}
            size={L.head.size}
            variant="blur"
            stagger={5}
            align="left"
            color={C.white}
            out={headOut}
          />
        ))}
      </div>

      {/* ánh sáng ban ngày tràn lên từ chân trời */}
      {flood > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: width / 2 - floodR,
            top: height + 80 - floodR,
            width: floodR * 2,
            height: floodR * 2,
            borderRadius: '50%',
            background: C.bg,
          }}
        />
      ) : null}

      {/* lockup cuối phim */}
      {f >= SLEEP_T.eyes ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: lockupRow ? height / 2 : L.lock.y,
            translate: lockupRow ? '0 -50%' : undefined,
            display: 'flex',
            flexDirection: lockupRow ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: lockupRow ? gw * LOCKUP.gap : 70,
          }}
        >
          <div style={{position: 'relative', width: gw, height: gh, opacity: eyesIn, scale: `${2 - squash} ${squash}`}}>
            {reveal <= 0 ? (
              <EyePair logoWidth={gw} blink={blink} style={{left: gw * 0.5, top: gh * 0.45}} />
            ) : null}
            {reveal > 0 ? <Ghost width={gw} reveal={reveal} blink={blink} eyeColor={mix('#000000', '#FFFFFF', eyeWhite)} style={{left: 0, top: 0}} /> : null}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              clipPath: `inset(-30% ${(1 - word) * 100}% -30% 0)`,
              translate: `${(1 - word) * -50}px 0`,
            }}
          >
            <Wordmark ghostWidth={textGw} style={{position: 'relative', lineHeight: 1.15}} />
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: fontPx, lineHeight: 1.15, letterSpacing: '-0.035em', color: C.ink, marginLeft: fontPx * 0.26}}>Agent</span>
            <div style={{position: 'relative', width: textGw * LOCKUP.star, height: textGw * LOCKUP.star, marginLeft: textGw * 0.1, marginTop: fontPx * 0.02}}>
              <Sparkle size={textGw * LOCKUP.star} style={{left: 0, top: 0, scale: String(star), rotate: `${(1 - star) * -90}deg`}} />
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
