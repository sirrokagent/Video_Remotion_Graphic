import React from 'react';
import {ev} from '../anim';
import {C, E, FONT} from '../theme';
import {VOICE} from '../voice';

/**
 * Chữ chuyển động mượt — dùng chung cho cả phim 90 giây.
 *
 *  <VoiceText id="n5" start={15} f={f} pick={[0,1,2]} />   chữ hiện ĐÚNG lúc được đọc
 *  <Kinetic text="Ở mọi nơi." start={30} f={f} variant="rise" />   chữ tự do, theo mốc cho trước
 *
 * Mọi biến thể đều có easing, không linear. Không ngẫu nhiên.
 */

export type Variant =
  | 'blur' // mờ nhoè → nét, trồi nhẹ (mặc định)
  | 'rise' // từng ký tự trồi lên từ dưới mặt nạ
  | 'track' // giãn chữ rộng → khít lại, mờ dần vào
  | 'scale'; // phóng từ to → đúng cỡ, mờ → nét

type Common = {
  f: number;
  size: number;
  weight?: number;
  color?: string;
  variant?: Variant;
  /** 0 → 1: rời cảnh (mờ + trôi lên) */
  out?: number;
  align?: 'center' | 'left';
  style?: React.CSSProperties;
};

/** Một đơn vị (chữ hoặc ký tự) đi vào tại frame `a`. */
const unitStyle = (variant: Variant, f: number, a: number, size: number, out: number): React.CSSProperties => {
  const dur = variant === 'rise' ? 14 : 12;
  const t = ev(f, [a, a + dur], [0, 1], E.out);
  const o = out;
  switch (variant) {
    case 'rise':
      return {opacity: Math.min(1, t * 1.6) * (1 - o), translate: `0px ${(1 - t) * size * 0.9 - o * size * 0.25}px`, filter: `blur(${o * 12}px)`};
    case 'track':
      return {opacity: t * (1 - o), filter: `blur(${(1 - t) * 14 + o * 12}px)`, marginRight: `${(1 - t) * size * 0.4}px`};
    case 'scale':
      return {opacity: t * (1 - o), filter: `blur(${(1 - t) * 18 + o * 12}px)`, scale: String(1.6 - 0.6 * t + o * 0.1)};
    default:
      return {
        opacity: t * (1 - o),
        filter: `blur(${(1 - t) * 22 + o * 14}px)`,
        translate: `0px ${(1 - t) * size * 0.32 - o * size * 0.2}px`,
        scale: String(1.08 - 0.08 * t),
      };
  }
};

const Line: React.FC<Common & {units: {text: string; at: number}[]; gap: number}> = ({units, gap, f, size, weight = 800, color = C.ink, variant = 'blur', out = 0, align = 'center', style}) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      columnGap: gap,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: '-0.035em',
      lineHeight: 1.12,
      color,
      ...style,
    }}
  >
    {units.map((u, i) =>
      variant === 'rise' ? (
        // mặt nạ để ký tự trồi lên từ dưới đường chân chữ
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12}}>
          <span style={{display: 'inline-block', ...unitStyle(variant, f, u.at, size, out)}}>{u.text}</span>
        </span>
      ) : (
        <span key={i} style={{display: 'inline-block', ...unitStyle(variant, f, u.at, size, out)}}>
          {u.text}
        </span>
      ),
    )}
  </div>
);

/**
 * Câu thoại thành chữ: mỗi chữ hiện đúng lúc giọng đọc tới nó.
 * `start` = frame cảnh mà câu bắt đầu phát. `pick` = chỉ số những chữ muốn hiện
 * (luật thương hiệu: ≤ 6 chữ một màn hình) — chữ không chọn thì bỏ qua.
 * `replace` đổi cách viết một chữ (vd bỏ dấu phẩy cuối) mà giữ mốc thời gian.
 */
export const VoiceText: React.FC<Common & {id: string; start: number; pick?: number[]; replace?: Record<number, string>; lead?: number}> = ({
  id,
  start,
  pick,
  replace,
  lead = 1,
  ...rest
}) => {
  const words = VOICE[id].words;
  const idx = pick ?? words.map((_, i) => i);
  const units = idx.map((i) => ({text: replace?.[i] ?? words[i].text, at: start + words[i].at - lead}));
  return <Line {...rest} units={units} gap={rest.size * 0.26} />;
};

/**
 * Chữ tự do. Theo chữ (mặc định) hoặc theo ký tự (`by="char"`), cách nhau `stagger` frame.
 */
export const Kinetic: React.FC<Common & {text: string; start: number; stagger?: number; by?: 'word' | 'char'}> = ({text, start, stagger, by = 'word', ...rest}) => {
  const st = stagger ?? (by === 'char' ? 1.4 : 4);
  if (by === 'char') {
    // giữ khoảng trắng như ký tự để từ không dính nhau
    const units = [...text].map((ch, i) => ({text: ch === ' ' ? ' ' : ch, at: start + i * st}));
    return <Line {...rest} units={units} gap={0} />;
  }
  const units = text.split(' ').map((w, i) => ({text: w, at: start + i * st}));
  return <Line {...rest} units={units} gap={rest.size * 0.26} />;
};

/** Độ dài (frame) của một câu thoại — để cảnh biết khi nào câu đọc xong. */
export const voDur = (id: string) => VOICE[id].durFrames;
