import React from 'react';
import data from './logo.json';
import {C, FONT} from './theme';

/**
 * Logo ghost của Sirrok, vẽ lại thành SVG từ ảnh gốc 1536×1536:
 * thân lấy viền theo từng hàng pixel rồi nối bằng spline, hai mắt đo bằng PCA
 * trên vùng trắng bên trong thân. Khớp 99,35% (IoU) với ảnh gốc.
 *
 * Toạ độ logo: rộng 100 đơn vị, cao 86.3.
 * Hai mắt KHÔNG đối xứng — mắt trái to hơn mắt phải đúng như bản gốc
 * (logo có phối cảnh, đang nhìn lên phía trước). Đừng "sửa" cho đều.
 */
export const LOGO = data as {
  viewBox: [number, number, number, number];
  body: string;
  eyes: {x1: number; y1: number; x2: number; y2: number; w: number}[];
};

export const LOGO_H = LOGO.viewBox[3];

const eyeCenter = (e: (typeof LOGO.eyes)[number]) => ({
  x: (e.x1 + e.x2) / 2,
  y: (e.y1 + e.y2) / 2,
});

/** Điểm giữa hai mắt — mỏ neo chung của mọi thứ trong video. */
export const EYE_MID = (() => {
  const a = eyeCenter(LOGO.eyes[0]);
  const b = eyeCenter(LOGO.eyes[1]);
  return {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
})();

/** Góc của nét mắt, độ, đo theo màn hình (y hướng xuống). Dùng cho chuyển cảnh. */
export const EYE_ANGLE_DEG = (() => {
  const e = LOGO.eyes[0];
  return (Math.atan2(e.y1 - e.y2, e.x1 - e.x2) * 180) / Math.PI;
})();

/** Hai nét mắt, co lại về tâm mỗi nét khi chớp (blink 0 = mở, 1 = nhắm). */
const eyeLines = (blink: number, look: {x: number; y: number}) =>
  LOGO.eyes.map((e) => {
    const c = eyeCenter(e);
    const k = 1 - 0.86 * blink;
    return {
      x1: c.x + (e.x1 - c.x) * k + look.x,
      y1: c.y + (e.y1 - c.y) * k + look.y,
      x2: c.x + (e.x2 - c.x) * k + look.x,
      y2: c.y + (e.y2 - c.y) * k + look.y,
      w: e.w,
    };
  });

type EyeProps = {
  /** Kích thước tính theo bề rộng logo mà cặp mắt này thuộc về (px). */
  logoWidth: number;
  blink?: number;
  color?: string;
  look?: {x: number; y: number};
  style?: React.CSSProperties;
};

/**
 * Chỉ hai nét mắt — ngôn ngữ chuyển động của cả video: con trỏ, dấu nháy,
 * chỉ báo đang gõ. Tâm phần tử = điểm giữa hai mắt, nên đặt ở đâu thì
 * mắt nằm đúng chỗ đó.
 */
export const EyePair: React.FC<EyeProps> = ({logoWidth, blink = 0, color = C.ink, look = {x: 0, y: 0}, style}) => {
  const k = logoWidth / 100;
  const vw = 52;
  const vh = 34;
  return (
    <svg
      width={vw * k}
      height={vh * k}
      viewBox={`${EYE_MID.x - vw / 2} ${EYE_MID.y - vh / 2} ${vw} ${vh}`}
      style={{position: 'absolute', overflow: 'visible', translate: '-50% -50%', ...style}}
    >
      {eyeLines(blink, look).map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={l.w} strokeLinecap="round" />
      ))}
    </svg>
  );
};

type GhostProps = {
  width: number;
  blink?: number;
  /** 0 → 1: thân ghost nở ra thành hình tròn từ giữa hai mắt. */
  reveal?: number;
  look?: {x: number; y: number};
  bodyColor?: string;
  eyeColor?: string;
  /** Neo theo điểm giữa hai mắt thay vì góc trên-trái. */
  anchorEyes?: boolean;
  style?: React.CSSProperties;
};

export const Ghost: React.FC<GhostProps> = ({
  width,
  blink = 0,
  reveal = 1,
  look = {x: 0, y: 0},
  bodyColor = C.ink,
  eyeColor = C.white,
  anchorEyes = false,
  style,
}) => {
  const k = width / 100;
  const id = React.useId().replace(/:/g, '');
  // bán kính đủ phủ hết thân tính từ giữa hai mắt
  const r = 112 * reveal;
  return (
    <svg
      width={width}
      height={LOGO_H * k}
      viewBox={`0 0 100 ${LOGO_H}`}
      style={{
        position: 'absolute',
        overflow: 'visible',
        ...(anchorEyes ? {left: -EYE_MID.x * k, top: -EYE_MID.y * k} : {}),
        ...style,
      }}
    >
      <defs>
        <clipPath id={`r${id}`}>
          <circle cx={EYE_MID.x} cy={EYE_MID.y} r={r} />
        </clipPath>
      </defs>
      <path d={LOGO.body} fill={bodyColor} clipPath={reveal < 1 ? `url(#r${id})` : undefined} />
      {eyeLines(blink, look).map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={eyeColor} strokeWidth={l.w} strokeLinecap="round" />
      ))}
    </svg>
  );
};

/** Sao 4 cánh lõm trong lockup — đo từ ảnh: rộng 127 px, eo theo cung bậc hai k = 0.2. */
export const Sparkle: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({
  size,
  color = C.sparkle,
  style,
}) => (
  <svg width={size} height={size} viewBox="-1 -1 2 2" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <path d="M0 -1 Q0.2 -0.2 1 0 Q0.2 0.2 0 1 Q-0.2 0.2 -1 0 Q-0.2 -0.2 0 -1 Z" fill={color} />
  </svg>
);

/**
 * Lockup đo từ ảnh 1254×1254: ghost rộng 225 px, chữ "Sirrok" cao 155 px
 * (đỉnh chữ k tới chân), khoảng ghost→chữ 70 px, sao rộng 127 px sát chữ k.
 * Mọi số dưới đây là tỉ lệ so với bề rộng ghost.
 */
export const LOCKUP = {
  gap: 70 / 225,
  textCap: 155 / 225,
  textWidth: 566 / 225,
  star: 127 / 225,
  ghostH: 187 / 225,
} as const;

export const Wordmark: React.FC<{ghostWidth: number; style?: React.CSSProperties}> = ({ghostWidth, style}) => (
  <div
    style={{
      position: 'absolute',
      fontFamily: FONT,
      fontWeight: 700,
      // cỡ chữ để chiều cao ascender ≈ textCap
      fontSize: ghostWidth * LOCKUP.textCap * 1.36,
      lineHeight: 1,
      letterSpacing: '-0.035em',
      color: C.ink,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    Sirrok
  </div>
);

/**
 * Icon agent: đúng con ghost của logo (thân + hai nét mắt), dùng làm avatar / icon.
 * Hộp rộng `size`, cao theo tỉ lệ logo. Trên nền tối dùng thân trắng, mắt đen.
 */
export const GhostMark: React.FC<{size: number; blink?: number; body?: string; eyes?: string; style?: React.CSSProperties}> = ({
  size,
  blink = 0,
  body = C.ink,
  eyes = C.white,
  style,
}) => (
  <div style={{position: 'relative', width: size, height: (size * LOGO_H) / 100, flexShrink: 0, ...style}}>
    <Ghost width={size} blink={blink} bodyColor={body} eyeColor={eyes} style={{left: 0, top: 0}} />
  </div>
);
