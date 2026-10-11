import {Easing} from 'remotion';

/**
 * Màu lấy THẲNG từ ảnh anh gửi (đo bằng pixel, không ước lượng):
 *   nền hero / lockup  #FDFDFD   ghost     #000000
 *   nền khung phone    #F1F0F5   nút gửi   #0B57D0  (ảnh desktop)
 *   pill "Beta"        #005EFB   sao ✦     #236EEE  (ảnh lockup)
 * Xám chữ phụ chọn theo kiểu Material mà UI đang dùng, đều ≥ 4.5:1 trên nền trắng.
 */
export const C = {
  bg: '#FDFDFD',
  phoneBackdrop: '#F1F0F5',
  ink: '#000000',
  text: '#0A0A0A',
  label: '#444746', // 9.39:1 trên trắng, 8.29:1 trên nền bàn
  muted: '#5F6368', // 6.05:1 trên trắng, 5.34:1 trên nền bàn
  hairline: '#E3E3E3',
  field: '#DADCE0',
  activePill: '#E8EAED',
  send: '#0B57D0',
  beta: '#005EFB',
  sparkle: '#236EEE',
  claude: '#D97757',
  ok: '#137333', // xanh lá Material, 5.95:1
  white: '#FFFFFF',
  trail: '#0A0A0A',
} as const;

export const FONT = 'Be Vietnam Pro';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** Bộ easing dùng chung. Không có linear nào trong video. */
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // vào cảnh, dừng mềm
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // di chuyển có chủ đích
  in: Easing.bezier(0.55, 0, 1, 0.45), // rời cảnh
  snap: Easing.bezier(0.2, 0.9, 0.1, 1), // chớp mắt, click
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // bật nhẹ quá đà
} as const;

/** Thời lượng từng cảnh (frame @30fps) và chuyển cảnh. Mọi mốc âm thanh tính từ đây. */
export const T = {
  wake: 270,
  work: 360,
  phone: 220,
  everywhere: 210,
  reveal: 240,
  wipe: 20,
} as const;

export const START = {
  wake: 0,
  work: T.wake - T.wipe,
  phone: T.wake - T.wipe + T.work - T.wipe,
  everywhere: T.wake - T.wipe + T.work - T.wipe + T.phone - T.wipe,
  reveal: T.wake - T.wipe + T.work - T.wipe + T.phone - T.wipe + T.everywhere,
} as const;

export const TOTAL = START.reveal + T.reveal;
