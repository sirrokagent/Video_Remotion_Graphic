import {interpolate} from 'remotion';
import {E} from './theme';

type Ease = (t: number) => number;

/** interpolate có kẹp hai đầu và luôn có easing. */
export const ev = (f: number, inp: [number, number], out: [number, number], ease: Ease = E.inOut) =>
  interpolate(f, inp, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Nhiều mốc khoá liên tiếp, mỗi đoạn một easing. */
export const keys = (f: number, frames: number[], values: number[], ease: Ease = E.inOut) => {
  if (f <= frames[0]) return values[0];
  for (let i = 0; i < frames.length - 1; i++) {
    if (f <= frames[i + 1]) return ev(f, [frames[i], frames[i + 1]], [values[i], values[i + 1]], ease);
  }
  return values[values.length - 1];
};

/**
 * Chớp mắt: nhắm nhanh 3 frame, mở chậm 5 frame — nhịp của cả video.
 * Trả về 0 (mở) → 1 (nhắm).
 */
export const blinkAt = (f: number, at: number[]) => {
  let v = 0;
  for (const s of at) {
    if (f >= s && f < s + 3) v = Math.max(v, ev(f, [s, s + 3], [0, 1], E.snap));
    else if (f >= s + 3 && f <= s + 8) v = Math.max(v, ev(f, [s + 3, s + 8], [1, 0], E.out));
  }
  return v;
};

/** Hiện dần từng ký tự (gõ chữ). */
export const typed = (text: string, f: number, start: number, perChar = 2.2) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - start) / perChar)));
  return text.slice(0, n);
};

/** Đếm số có easing, định dạng kiểu Việt Nam 12.000.000. */
export const countVnd = (f: number, inp: [number, number], to: number) => {
  const v = Math.round(ev(f, inp, [0, to], E.out) / 1000) * 1000;
  return v.toLocaleString('de-DE');
};
