import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {ev} from '../anim';
import {E, FONT} from '../theme';
import BEATS from './beats.json';

/**
 * Ba video dọc "viral" dựng từ CÙNG một đoạn phim thiên nhiên (public/viral/footage.mp4)
 * với BA bài nhạc khác nhau — mỗi bài một kiểu dựng:
 *   cinematic  (a1, 76 BPM)  khung phim 2.39, màu phim, hạt film, cắt theo nhịp, bùng ở "drop"
 *   dreamy     (a2, 103 BPM) mềm, mờ chuyển cảnh, vệt sáng ấm, chữ hiện mờ → nét
 *   flash      (a3, 112 BPM) cắt mỗi nhịp, zoom giật, chớp trắng, rung, tách màu RGB
 * Mốc nhịp đo bằng librosa → src/viral/beats.json. Tất định: không Math.random.
 */

export const VFPS = 30;
type Key = 'a1' | 'a2' | 'a3';
type Clip = {dur: number; tempo: number; beats: number[]; beatStrength: number[]; hits: number[]};
const B = BEATS as Record<Key, Clip>;
const SRC_LEN = 58.6; // giây của footage

/** Những khoảnh khắc đẹp trong footage (giây) — mỗi cảnh cắt bắt đầu từ một trong số này. */
const MOMENTS = [0.4, 4.2, 9.2, 12.4, 15.8, 19.6, 23.4, 27.0, 30.2, 33.4, 36.6, 39.6, 42.6, 45.6, 48.6, 51.6, 54.4];

type Shot = {from: number; dur: number; src: number; rate: number; hit: boolean; idx: number};

/** Biến danh sách mốc cắt (giây) thành các shot; nguồn đi vòng qua MOMENTS theo bước `step`. */
const plan = (cuts: number[], end: number, rateAt: (t: number) => number, step: number, offset: number, hits: number[]): Shot[] => {
  const shots: Shot[] = [];
  for (let i = 0; i < cuts.length; i++) {
    const a = cuts[i];
    const b = i + 1 < cuts.length ? cuts[i + 1] : end;
    const rate = rateAt(a);
    const need = (b - a) * rate + 0.3;
    let src = MOMENTS[(offset + i * step) % MOMENTS.length];
    if (src + need > SRC_LEN) src = Math.max(0, SRC_LEN - need);
    shots.push({
      from: Math.round(a * VFPS),
      dur: Math.max(1, Math.round(b * VFPS) - Math.round(a * VFPS)),
      src,
      rate,
      hit: hits.some((h) => Math.abs(h - a) < 0.12),
      idx: i,
    });
  }
  return shots;
};

/** Lấy mỗi n nhịp trong khoảng [a, b). */
const every = (beats: number[], a: number, b: number, n: number) => beats.filter((t) => t >= a && t < b).filter((_, i) => i % n === 0);

/* ---------------- kế hoạch dựng cho từng mẫu ---------------- */

const A1_DROP = 17.07;
const A1_BREAK = 33.4;
const A2_PEAK = 25.9;
const A3_DIP = [5.4, 7.0];

export const TEMPLATES = {
  cinematic: {
    audio: 'a1' as Key,
    cuts: [0, ...every(B.a1.beats, 1.9, A1_DROP - 0.1, 2), A1_DROP, ...every(B.a1.beats, A1_DROP + 0.3, A1_BREAK, 1), A1_BREAK, ...every(B.a1.beats, A1_BREAK + 1.5, B.a1.dur - 1, 3)],
    rate: (t: number) => (t < A1_DROP ? 0.7 : t < A1_BREAK ? 1.35 : 0.6),
    step: 5,
    offset: 0,
  },
  dreamy: {
    audio: 'a2' as Key,
    cuts: [0, ...every(B.a2.beats, 2.0, A2_PEAK, 4), ...every(B.a2.beats, A2_PEAK, B.a2.dur - 2, 2)],
    rate: (t: number) => (t < A2_PEAK ? 0.65 : 0.9),
    step: 3,
    offset: 8,
  },
  flash: {
    audio: 'a3' as Key,
    cuts: [0, ...every(B.a3.beats, 0.45, A3_DIP[0], 1), ...every(B.a3.beats, A3_DIP[0], A3_DIP[1], 2), ...every(B.a3.beats, A3_DIP[1], B.a3.dur - 0.4, 1)],
    rate: (t: number) => (t >= A3_DIP[0] && t < A3_DIP[1] ? 0.6 : 1.6),
    step: 7,
    offset: 3,
  },
} as const;
export type TemplateKey = keyof typeof TEMPLATES;

export const durationOf = (k: TemplateKey) => Math.round(B[TEMPLATES[k].audio].dur * VFPS);

const shotsOf = (k: TemplateKey) => {
  const t = TEMPLATES[k];
  const clip = B[t.audio];
  const cuts = [...new Set(t.cuts.map((c) => Math.round(c * 100) / 100))].sort((a, b) => a - b);
  return plan(cuts, clip.dur, t.rate, t.step, t.offset, clip.hits);
};

/* ---------------- chữ ---------------- */

type Cue = {at: number; to: number; lines: string[]; big?: boolean};
const CUES: Record<TemplateKey, Cue[]> = {
  cinematic: [
    {at: 0.4, to: 4.6, lines: ['Chậm lại', 'một chút thôi.'], big: true},
    {at: A1_DROP, to: A1_DROP + 3.2, lines: ['Đi để thấy.'], big: true},
    {at: 37.5, to: 43.1, lines: ['Lưu lại', 'cho chuyến đi sau.']},
  ],
  dreamy: [
    {at: 0.6, to: 5.2, lines: ['Một ngày', 'trời thật trong.'], big: true},
    {at: 12.0, to: 16.0, lines: ['Gió. Mây.', 'Và mặt hồ.']},
    {at: A2_PEAK + 0.6, to: 31.5, lines: ['Bình yên', 'là ở đây.'], big: true},
    {at: 31.8, to: 35.1, lines: ['Gửi người', 'muốn đi cùng.']},
  ],
  flash: [
    {at: 0.0, to: 2.6, lines: ['POV:', 'trốn phố 1 ngày'], big: true},
    {at: 7.0, to: 10.2, lines: ['Trời xanh.', 'Hồ xanh.'], big: true},
    {at: 14.6, to: 18.9, lines: ['Đi không?'], big: true},
  ],
};

/** Chữ hiện mờ → nét theo từng chữ, có easing; rời đi mờ + trôi lên. */
const Caption: React.FC<{cue: Cue; f: number; kind: TemplateKey}> = ({cue, f, kind}) => {
  const a = cue.at * VFPS;
  const b = cue.to * VFPS;
  const out = ev(f, [b - 10, b], [0, 1], E.in);
  if (f < a - 2 || f > b + 2) return null;
  const want = kind === 'cinematic' ? (cue.big ? 100 : 64) : kind === 'dreamy' ? (cue.big ? 112 : 68) : cue.big ? 150 : 84;
  // tự co cỡ chữ để dòng dài nhất vừa 940px, không xuống dòng sai
  const longest = Math.max(...cue.lines.map((l) => l.length));
  const big = Math.min(want, Math.floor(940 / (longest * 0.56)));
  const weight = kind === 'cinematic' ? (cue.big ? 600 : 500) : 800;
  const track = kind === 'cinematic' ? '0.06em' : kind === 'dreamy' ? '-0.02em' : '-0.04em';
  let w = 0;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: big * 0.08}}>
      {cue.lines.map((line, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'nowrap', whiteSpace: 'nowrap', justifyContent: 'center', columnGap: big * 0.24}}>
          {line.split(' ').map((word) => {
            const st = a + (w++) * (kind === 'flash' ? 3 : 5);
            const t = ev(f, [st, st + (kind === 'flash' ? 7 : 14)], [0, 1], kind === 'flash' ? E.back : E.out);
            return (
              <span
                key={`${li}-${word}-${w}`}
                style={{
                  display: 'inline-block',
                  fontFamily: FONT,
                  fontSize: big,
                  fontWeight: weight,
                  letterSpacing: track,
                  lineHeight: 1.08,
                  color: '#FFFFFF',
                  textShadow: '0 4px 28px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.5)',
                  opacity: Math.min(1, t * 1.2) * (1 - out),
                  filter: `blur(${(1 - t) * (kind === 'flash' ? 6 : 18) + out * 10}px)`,
                  translate: `0px ${(1 - t) * (kind === 'flash' ? 0 : big * 0.3) - out * big * 0.25}px`,
                  scale: String(kind === 'flash' ? 1.5 - 0.5 * t : 1.06 - 0.06 * t),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ---------------- lớp hiệu ứng ---------------- */

/** Hạt film tất định: seed đổi theo frame. */
const Grain: React.FC<{f: number; opacity: number}> = ({f, opacity}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id={`g${f % 12}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 12} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#g${f % 12})`} />
  </svg>
);

const Vignette: React.FC<{k: number}> = ({k}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none'}} />
);

/* ---------------- shot ---------------- */

const ShotView: React.FC<{s: Shot; kind: TemplateKey; f: number; xfade: number}> = ({s, kind, f, xfade}) => {
  const local = f - s.from;
  const p = Math.min(1, Math.max(0, local / (s.dur + xfade)));
  // Ken Burns / zoom punch
  let scale = 1.04;
  let tx = 0;
  if (kind === 'cinematic') scale = 1.06 + 0.06 * E.inOut(p);
  if (kind === 'dreamy') {
    scale = 1.12 - 0.08 * E.out(p);
    tx = (s.idx % 2 ? -1 : 1) * 24 * E.inOut(p);
  }
  if (kind === 'flash') scale = 1.05 + ev(local, [0, 6], [s.hit ? 0.28 : 0.16, 0], E.out);
  const fadeIn = xfade > 0 ? ev(local, [0, xfade], [0, 1], E.inOut) : 1;
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <Video
        src={staticFile('viral/footage.mp4')}
        trimBefore={Math.round(s.src * VFPS)}
        playbackRate={s.rate}
        muted
        objectFit="cover"
        style={{width: '100%', height: '100%', scale: String(scale), translate: `${tx}px 0px`}}
      />
    </AbsoluteFill>
  );
};

/* ---------------- composition ---------------- */

export const ViralCut: React.FC<{kind: TemplateKey}> = ({kind}) => {
  const f = useCurrentFrame();
  const t = TEMPLATES[kind];
  const clip = B[t.audio];
  const shots = shotsOf(kind);
  const xfade = kind === 'dreamy' ? 14 : 0;
  const T = f / VFPS;

  // nhịp gần nhất (cho chớp / rung)
  const lastBeat = clip.beats.filter((b) => b <= T + 0.001).pop() ?? -10;
  const sinceBeat = (T - lastBeat) * VFPS;
  const lastHit = clip.hits.filter((h) => h <= T + 0.001).pop() ?? -10;
  const sinceHit = (T - lastHit) * VFPS;

  // màu theo mẫu
  const grade =
    kind === 'cinematic'
      ? 'contrast(1.12) saturate(1.08) sepia(0.12) hue-rotate(-6deg) brightness(0.96)'
      : kind === 'dreamy'
        ? 'contrast(0.94) saturate(1.12) brightness(1.06)'
        : 'contrast(1.16) saturate(1.3)';

  // flash: rung + tách màu khi có hit
  const shake = kind === 'flash' ? ev(sinceHit, [0, 8], [1, 0], E.out) : 0;
  const sx = shake * 14 * Math.sin(f * 2.3);
  const sy = shake * 10 * Math.cos(f * 1.7);
  const flashWhite =
    kind === 'flash'
      ? Math.max(ev(sinceHit, [0, 3], [0.7, 0], E.out), ev(sinceBeat, [0, 2], [0.18, 0], E.out))
      : kind === 'cinematic'
        ? ev(T, [A1_DROP - 0.02, A1_DROP + 0.3], [0.9, 0], E.out) * (T >= A1_DROP - 0.02 ? 1 : 0)
        : 0;

  // cinematic: khung 2.39 trượt vào
  const bar = kind === 'cinematic' ? ev(f, [0, 24], [0, 1], E.out) * 300 : 0;
  // dreamy: vệt sáng ấm quét chéo
  const leak = kind === 'dreamy' ? 0.35 + 0.25 * Math.sin(f * 0.035) : 0;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: grade, translate: `${sx}px ${sy}px`}}>
        {shots.map((s) => (
          <Sequence key={s.idx} from={s.from} durationInFrames={s.dur + xfade} premountFor={30}>
            <ShotView s={s} kind={kind} f={f} xfade={s.idx === 0 ? 0 : xfade} />
          </Sequence>
        ))}
        {kind === 'flash' && shake > 0.05 ? (
          <>
            <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55 * shake, translate: `${18 * shake}px 0px`, background: 'rgba(255,0,60,0.18)'}} />
            <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55 * shake, translate: `${-18 * shake}px 0px`, background: 'rgba(0,200,255,0.18)'}} />
          </>
        ) : null}
      </AbsoluteFill>

      {kind === 'dreamy' ? (
        <>
          <AbsoluteFill style={{background: `radial-gradient(circle at ${30 + 40 * Math.sin(f * 0.012)}% 18%, rgba(255,190,120,${leak}) 0%, rgba(255,140,80,0) 55%)`, mixBlendMode: 'screen'}} />
          <AbsoluteFill style={{backdropFilter: 'blur(0px)', boxShadow: 'inset 0 0 220px rgba(255,255,255,0.25)'}} />
        </>
      ) : null}

      <Vignette k={kind === 'cinematic' ? 0.55 : kind === 'dreamy' ? 0.25 : 0.4} />
      <Grain f={f} opacity={kind === 'cinematic' ? 0.22 : kind === 'dreamy' ? 0.1 : 0.12} />

      {/* chớp trắng */}
      {flashWhite > 0.01 ? <AbsoluteFill style={{background: '#fff', opacity: flashWhite}} /> : null}

      {/* khung phim */}
      {bar > 0 ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
        </>
      ) : null}

      {/* nền tối mềm sau chữ để chữ trắng luôn đọc rõ trên trời sáng */}
      {(() => {
        const on = Math.max(0, ...CUES[kind].map((c) => Math.min(ev(f, [c.at * VFPS - 8, c.at * VFPS + 6], [0, 1], E.out), 1 - ev(f, [c.to * VFPS - 6, c.to * VFPS + 8], [0, 1], E.in))));
        if (on <= 0.01) return null;
        return kind === 'flash' ? (
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 30% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)', opacity: on}} />
        ) : (
          <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0.35) 38%, rgba(0,0,0,0) 56%)', opacity: on}} />
        );
      })()}

      {/* chữ — trong vùng an toàn (tránh 220px trên, 380px dưới) */}
      <AbsoluteFill style={{justifyContent: kind === 'flash' ? 'center' : 'flex-end', alignItems: 'center', paddingBottom: kind === 'flash' ? 0 : 520, paddingLeft: 70, paddingRight: 70}}>
        {CUES[kind].map((c, i) => (
          <div key={i} style={{position: kind === 'flash' ? 'absolute' : 'absolute', bottom: kind === 'flash' ? undefined : 520, left: 70, right: 70}}>
            <Caption cue={c} f={f} kind={kind} />
          </div>
        ))}
      </AbsoluteFill>

      <Audio src={staticFile(`viral/${t.audio}.mp3`)} volume={(fr) => ev(fr, [durationOf(kind) - 18, durationOf(kind)], [1, 0], E.in)} />
    </AbsoluteFill>
  );
};
