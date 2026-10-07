import React from 'react';
import data from './voice.json';
import {ev} from './anim';
import {C, E, FONT} from './theme';

/**
 * Giọng đọc thật (giọng clone "AhitOfficial VN") và số đo của nó.
 * voice.json do scripts/analyze_voice.py sinh ra: mốc từng chữ + năng lượng
 * 28 dải tần cho mỗi frame. Sóng âm và chữ trên màn hình chạy theo đúng số này.
 */
type Clip = {durFrames: number; words: {text: string; at: number}[]; bands: number[][]};
export type {Clip};
export const VOICE = data as Record<string, Clip> & {hey: Clip; command: Clip};

/** Năng lượng một dải tại frame lẻ (nội suy giữa hai frame), 0 ngoài clip. */
const bandAt = (clip: Clip, f: number, b: number) => {
  if (f < 0 || f >= clip.bands.length - 1) return 0;
  const i = Math.floor(f);
  const t = f - i;
  return clip.bands[i][b] * (1 - t) + clip.bands[i + 1][b] * t;
};

/** Độ lớn chung của giọng tại frame — dùng cho nhịp "lắng nghe" của cặp mắt. */
export const loudness = (clip: Clip, f: number) => {
  let s = 0;
  for (let b = 4; b < 20; b++) s += bandAt(clip, f, b);
  return s / 16;
};

type WaveProps = {
  clip: Clip;
  /** frame tính từ lúc clip bắt đầu phát */
  f: number;
  /** frame tuyệt đối của cảnh, cho nhịp thở lúc im lặng */
  scene: number;
  width: number;
  height: number;
  bars?: number;
  color?: string;
  /** 0 → 1: mức hiện của cả dải sóng */
  on?: number;
};

/**
 * Sóng âm đối xứng: tần thấp ở giữa, tần cao ra hai bên. Khi chưa có tiếng thì
 * các cột "thở" nhẹ — vẫn đang nghe chứ không chết.
 */
export const VoiceWave: React.FC<WaveProps> = ({clip, f, scene, width, height, bars = 48, color = C.send, on = 1}) => {
  const half = bars / 2;
  const nb = clip.bands[0].length;
  const gap = width / bars;
  const w = Math.max(3, gap * 0.52);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow: 'visible', display: 'block'}}>
      {Array.from({length: bars}, (_, i) => {
        const d = Math.abs(i + 0.5 - half) / half; // 0 ở giữa → 1 ở mép
        const band = Math.min(nb - 1, Math.floor(d * (nb - 6)) + 2);
        const v = bandAt(clip, f - 0.5, band) * 0.5 + bandAt(clip, f, band) * 0.5;
        const idle = 0.08 + 0.05 * Math.sin(scene * 0.19 + i * 0.55) * Math.sin(scene * 0.07 + i * 0.21);
        const env = 1 - 0.55 * d * d; // giữa cao, mép thấp
        const h = Math.max(w, height * Math.max(idle, v * env) * on);
        return <rect key={i} x={i * gap + (gap - w) / 2} y={(height - h) / 2} width={w} height={h} rx={w / 2} fill={color} />;
      })}
    </svg>
  );
};

/**
 * Chữ hiện từng từ một, mỗi từ đi từ mờ nhoè sang sắc nét đúng lúc được đọc.
 * `start` = frame cảnh mà clip bắt đầu phát.
 */
export const BlurWords: React.FC<{
  clip: Clip;
  f: number;
  start: number;
  size: number;
  weight?: number;
  color?: string;
  gap?: number;
  out?: number;
  style?: React.CSSProperties;
}> = ({clip, f, start, size, weight = 800, color = C.ink, gap = 0.26, out = 0, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', gap: size * gap, fontFamily: FONT, fontSize: size, fontWeight: weight, letterSpacing: '-0.035em', lineHeight: 1.1, color, ...style}}>
    {clip.words.map((w) => {
      const a = start + w.at - 1;
      const t = ev(f, [a, a + 11], [0, 1], E.out);
      return (
        <span
          key={w.text}
          style={{
            display: 'inline-block',
            opacity: t * (1 - out),
            filter: `blur(${(1 - t) * 22 + out * 14}px)`,
            translate: `0px ${(1 - t) * size * 0.32 - out * size * 0.2}px`,
            scale: String(1.08 - 0.08 * t),
          }}
        >
          {w.text}
        </span>
      );
    })}
  </div>
);
