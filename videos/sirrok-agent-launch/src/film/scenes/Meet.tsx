import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {EYE_MID, Ghost, LOGO, LOGO_H} from '../../logo';
import {C, E, FONT} from '../../theme';
import {VO} from '../timeline';
import {Kinetic, VoiceText} from '../text';

/**
 * Màn kết "Gặp Sirrok Agent" — dựng theo bố cục trang ra mắt (pill nhỏ, tiêu đề
 * có icon nằm giữa hai chữ, câu phụ xám, hai nút, cửa sổ app trồi lên từ đáy).
 * Thay icon tròn bằng ghost thương hiệu, avatar agent bằng ghost nhiều màu.
 *
 * Mốc chính (frame của cảnh):
 *   8   hai nét mắt mở ra (chỉ mắt, màu đen)
 *   22  chớp mắt lần đầu
 *   26  thân ghost nở ra quanh hai mắt (xong ~42)
 *   31  "Sirrok" · 44 "Agent" (theo giọng n9)
 *   71–106  "Bạn ra lệnh. Nó làm."
 *   120 chữ dời lên · 124 cửa sổ app trồi lên (xong ~164)
 *   150 / 172 / 196  ba tin nhắn trong khung chat
 *   210–250 khung kết tĩnh: chớp mắt, ghost nhấp nhô
 */

const n9 = VO.n9.at;

// ── Mốc thời gian ──────────────────────────────────────────────
export const T = {
  eyesIn: 8,
  firstBlink: 21,
  reveal: 26,
  pill: 58,
  btn: 106,
  lift: 118,
  win: 122,
  msg0: 150,
  typing: 160,
  msg1: 174,
  msg2: 198,
} as const;

// Bảng màu đội agent: các sắc xanh thương hiệu + đen + một màu ấm duy nhất.
export const AG = {
  blue: '#1877F2',
  deep: '#0B57D0',
  bright: '#236EEE',
  beta: '#005EFB',
  ink: C.ink,
  warm: '#D97757',
} as const;
// Chữ tên agent phải đạt ≥ 4.5:1 trên bong bóng xám → dùng sắc đậm hơn của cùng màu.
export const NAME = {deep: '#0B57D0', beta: AG.beta, warm: '#A4472A'} as const;

// ── Hai nét mắt (bản sao cách co mắt của logo.tsx để vẽ ghost hero) ──
const eyeLines = (blink: number, look: {x: number; y: number}) =>
  LOGO.eyes.map((e) => {
    const cx = (e.x1 + e.x2) / 2;
    const cy = (e.y1 + e.y2) / 2;
    const k = 1 - 0.86 * blink;
    return {
      x1: cx + (e.x1 - cx) * k + look.x,
      y1: cy + (e.y1 - cy) * k + look.y,
      x2: cx + (e.x2 - cx) * k + look.x,
      y2: cy + (e.y2 - cy) * k + look.y,
      w: e.w,
    };
  });

/**
 * Ghost của tiêu đề. Mắt đen xuất hiện trước trên nền trắng; khi thân nở ra
 * từ giữa hai mắt, phần mắt nằm trong vòng tròn đổi sang trắng — chuyển liền mạch,
 * không có khung nào mắt "biến mất".
 */
export const HeroGhost: React.FC<{width: number; reveal: number; blink: number; look: {x: number; y: number}; eyeScale: number}> = ({
  width,
  reveal,
  blink,
  look,
  eyeScale,
}) => {
  const r = 112 * reveal;
  const lines = eyeLines(blink, look);
  const eyes = (color: string) =>
    lines.map((l, i) => (
      <line
        key={i}
        x1={l.x1}
        y1={l.y1}
        x2={l.x2}
        y2={l.y2}
        stroke={color}
        strokeWidth={l.w * eyeScale}
        strokeLinecap="round"
      />
    ));
  return (
    <svg width={width} height={(width * LOGO_H) / 100} viewBox={`0 0 100 ${LOGO_H}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <clipPath id="meet-hero-r">
          <circle cx={EYE_MID.x} cy={EYE_MID.y} r={r} />
        </clipPath>
      </defs>
      {eyes(C.ink)}
      <g clipPath="url(#meet-hero-r)">
        <path d={LOGO.body} fill={C.ink} />
        {eyes(C.white)}
      </g>
    </svg>
  );
};

/** Ghost thương hiệu làm icon nội dòng / avatar (bọc Ghost vào khung có kích thước thật). */
export const GhostIcon: React.FC<{width: number; color: string; blink?: number; style?: React.CSSProperties}> = ({width, color, blink = 0, style}) => (
  <span style={{position: 'relative', display: 'inline-block', width, height: (width * LOGO_H) / 100, flexShrink: 0, ...style}}>
    <Ghost width={width} bodyColor={color} blink={blink} style={{left: 0, top: 0}} />
  </span>
);

export const ArrowUpRight: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export const Download: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </svg>
);

export const Monitor: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M12 16v4M8 20h8" />
  </svg>
);

/** Vào cảnh mềm: trồi + mờ → nét. */
export const pop = (f: number, at: number, dist = 40, dur = 18): React.CSSProperties => {
  const t = ev(f, [at, at + dur], [0, 1], E.out);
  return {opacity: t, translate: `0px ${(1 - t) * dist}px`, filter: `blur(${(1 - t) * 10}px)`};
};

/** Tin nhắn: trồi lên + phóng nhẹ từ góc neo của bong bóng. */
export const bubbleIn = (f: number, at: number, origin: string): React.CSSProperties => {
  const t = ev(f, [at, at + 20], [0, 1], E.out);
  return {
    opacity: ev(f, [at, at + 10], [0, 1], E.out),
    translate: `0px ${(1 - t) * 36}px`,
    scale: String(0.92 + 0.08 * t),
    transformOrigin: origin,
  };
};

export const SIDEBAR = [
  {color: AG.blue, blink: [188, 236]},
  {color: AG.ink, blink: [232]},
  {color: AG.deep, blink: [212, 244]},
  {color: AG.warm, blink: [224]},
  {color: AG.beta, blink: [240]},
] as const;
export const SELECTED = 1;

export const Meet: React.FC = () => {
  const f = useCurrentFrame();

  // ── Ghost tiêu đề ──
  const eyeOpen = ev(f, [T.eyesIn, T.eyesIn + 12], [1, 0], E.out); // mắt mọc ra từ hai chấm
  const eyeScale = ev(f, [T.eyesIn, T.eyesIn + 10], [0, 1], E.back);
  const reveal = ev(f, [T.reveal, T.reveal + 16], [0, 1], E.out);
  const ghostScale = keys(f, [0, T.reveal, T.reveal + 8, T.reveal + 20], [1.5, 1.5, 0.94, 1], E.out);
  const heroBlink = Math.max(eyeOpen, blinkAt(f, [T.firstBlink, 58, 150, 214, 238]));
  // mắt liếc sang chữ "Sirrok Agent" khi tên được đọc, rồi về giữa
  const lookX = keys(f, [30, 40, 78, 92], [0, 2.6, 2.6, 0], E.inOut);

  // ── Bố cục: khối chữ dời lên nhường chỗ cho cửa sổ app ──
  const lift = ev(f, [T.lift, T.lift + 40], [230, 0], E.inOut);
  const winY = ev(f, [T.win, T.win + 42], [560, 0], E.out);
  const winO = ev(f, [T.win, T.win + 14], [0, 1], E.out);

  const bob = (i: number) => (f > T.win ? Math.sin((f - T.win) * 0.07 + i * 1.3) * 3.5 * ev(f, [T.win + 30, T.win + 60], [0, 1], E.inOut) : 0);

  // lúc đầu chỉ có "Gặp [ghost]" → dời cả dòng cho cân giữa, rồi trượt về khi tên được đọc
  const rowShift = keys(f, [0, n9 + 4, n9 + 26], [362, 362, 0], E.inOut);

  const typingO = ev(f, [T.typing, T.typing + 8], [0, 1], E.out) * ev(f, [T.msg1 - 8, T.msg1], [1, 0], E.in);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* ── Khối chữ hero ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 64,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          translate: `0px ${lift}px`,
        }}
      >
        {/* pill nhỏ phía trên */}
        <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 72, ...pop(f, T.pill, 24)}}>
          <span style={{fontSize: 36, fontWeight: 500, color: C.text, letterSpacing: '-0.01em'}}>Sirrok Agent đã có mặt</span>
          <span
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              background: '#EDEDED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={28} />
          </span>
        </div>

        {/* tiêu đề: Gặp [ghost] Sirrok Agent */}
        <div style={{display: 'flex', alignItems: 'center', marginTop: 30, height: 160, translate: `${rowShift}px 0px`}}>
          <Kinetic text="Gặp" f={f} start={4} size={140} variant="rise" />
          <div style={{margin: '0 34px 0 30px', translate: '0px -4px', scale: String(ghostScale)}}>
            <HeroGhost width={132} reveal={reveal} blink={heroBlink} look={{x: lookX, y: 0}} eyeScale={eyeScale} />
          </div>
          <VoiceText id="n9" f={f} start={n9} size={140} pick={[0, 1]} replace={{1: 'Agent'}} variant="blur" />
        </div>

        {/* câu phụ theo giọng */}
        <VoiceText
          id="n9"
          f={f}
          start={n9}
          size={52}
          weight={500}
          color={C.muted}
          pick={[2, 3, 4, 5, 6]}
          variant="blur"
          style={{marginTop: 18, letterSpacing: '-0.015em'}}
        />

        {/* hai nút */}
        <div style={{display: 'flex', gap: 24, marginTop: 44}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              height: 88,
              padding: '0 46px 0 40px',
              borderRadius: 44,
              background: C.ink,
              color: C.white,
              fontSize: 36,
              fontWeight: 500,
              ...pop(f, T.btn, 30),
            }}
          >
            <Download size={36} />
            Tải ứng dụng
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 88,
              padding: '0 46px',
              borderRadius: 44,
              background: '#EDEDED',
              color: C.text,
              fontSize: 36,
              fontWeight: 500,
              ...pop(f, T.btn + 5, 30),
            }}
          >
            Dùng thử Beta
          </div>
        </div>
      </div>

      {/* ── Cửa sổ app trồi lên từ đáy ── */}
      <div
        style={{
          position: 'absolute',
          left: 250,
          width: 1420,
          top: 596,
          height: 640,
          borderRadius: 40,
          background: C.white,
          border: `2px solid ${C.hairline}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          translate: `0px ${winY}px`,
          opacity: winO,
          display: 'flex',
        }}
      >
        {/* thanh bên: đội agent */}
        <div style={{width: 176, background: '#FAFAFA', borderRight: `2px solid ${C.hairline}`, position: 'relative'}}>
          <div style={{position: 'absolute', left: 32, top: 32, display: 'flex', gap: 12}}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
              <span key={c} style={{width: 22, height: 22, borderRadius: 11, background: c}} />
            ))}
          </div>
          {SIDEBAR.map((a, i) => {
            const at = T.win + 14 + i * 5;
            const t = ev(f, [at, at + 18], [0, 1], E.back);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 20,
                  top: 92 + i * 112,
                  width: 136,
                  height: 100,
                  borderRadius: 24,
                  background: i === SELECTED ? '#EDEDED' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: ev(f, [at, at + 8], [0, 1], E.out),
                }}
              >
                <GhostIcon
                  width={68}
                  color={a.color}
                  blink={blinkAt(f, [...a.blink])}
                  style={{scale: String(0.4 + 0.6 * t), translate: `0px ${bob(i)}px`}}
                />
              </div>
            );
          })}
        </div>

        {/* vùng chính */}
        <div style={{flex: 1, position: 'relative'}}>
          {/* đầu khung chat */}
          <div
            style={{
              height: 96,
              borderBottom: `2px solid ${C.hairline}`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '0 40px',
            }}
          >
            <GhostIcon width={50} color={AG.ink} blink={blinkAt(f, [190, 232])} />
            <span style={{fontSize: 32, fontWeight: 500, color: C.text}}>Bán hàng</span>
            <span style={{flex: 1}} />
            <Monitor size={36} />
          </div>

          {/* khung chat */}
          <div style={{position: 'absolute', left: 48, right: 48, top: 124}}>
            {/* lệnh của người dùng */}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <div
                style={{
                  padding: '18px 30px',
                  borderRadius: 30,
                  borderBottomRightRadius: 10,
                  background: C.ink,
                  color: C.white,
                  fontSize: 28,
                  fontWeight: 500,
                  ...bubbleIn(f, T.msg0, 'right bottom'),
                }}
              >
                Chốt hết đơn tuần này giúp mình nhé.
              </div>
            </div>

            {/* agent báo cáo — chỉ báo "đang gõ" là hai nét mắt chớp */}
            <div style={{position: 'relative', marginTop: 26}}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 120,
                  height: 74,
                  borderRadius: 30,
                  background: '#F2F2F2',
                  opacity: typingO,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GhostIcon width={44} color={C.ink} blink={blinkAt(f, [T.typing + 4, T.typing + 12])} style={{translate: `0px ${Math.sin(f * 0.35) * 2}px`}} />
              </div>
              <div
                style={{
                  maxWidth: 880,
                  padding: '20px 30px',
                  borderRadius: 30,
                  borderTopLeftRadius: 10,
                  background: '#F2F2F2',
                  fontSize: 28,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: C.text,
                  ...bubbleIn(f, T.msg1, 'left top'),
                }}
              >
                <AgentTag width={30} color={AG.warm} name="Quản lý khách hàng" nameColor={NAME.warm} /> đã gửi báo giá cho 12 khách,{' '}
                <AgentTag width={30} color={AG.beta} name="Trưởng nhóm" nameColor={NAME.beta} /> đã đánh dấu 3 khách ưu tiên.
              </div>
            </div>

            <div style={{marginTop: 18, display: 'flex'}}>
              <div
                style={{
                  padding: '18px 30px',
                  borderRadius: 30,
                  borderTopLeftRadius: 10,
                  background: '#F2F2F2',
                  fontSize: 28,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: C.text,
                  ...bubbleIn(f, T.msg2, 'left top'),
                }}
              >
                <AgentTag width={30} color={AG.blue} name="Thư ký" nameColor={NAME.deep} /> đã chốt 5 lịch hẹn sáng mai.
                <span style={{color: C.ok, marginLeft: 12}}>✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Tên agent nội dòng: ghost mini + tên có màu, như nhắc tên đồng đội. */
export const AgentTag: React.FC<{width: number; color: string; name: string; nameColor: string}> = ({width, color, name, nameColor}) => (
  <span style={{whiteSpace: 'nowrap'}}>
    <GhostIcon width={width} color={color} style={{verticalAlign: '-0.12em', marginRight: 8}} />
    <span style={{color: nameColor}}>{name}</span>
  </span>
);
