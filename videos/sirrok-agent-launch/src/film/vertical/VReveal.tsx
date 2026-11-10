import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {EYE_MID, EyePair, Ghost, LOCKUP, LOGO, Sparkle, Wordmark} from '../../logo';
import {REVEAL, SETTLE, STAR, WORD} from '../../scenes/S5Reveal';
import {C, E, FONT} from '../../theme';
import {VH, VW} from './frame';

/**
 * Cảnh 5 (bản dọc 9:16) — logo hé lộ.
 * Giữ nguyên mọi mốc của S5Reveal: chớp 26 · thân nở 40 · thu về lockup 96
 * · chữ "Sirrok" 112 · sao xanh 136 · Beta ~164. Cảnh bị cắt ở 180 (wipe 160–180).
 *
 * Khác bản ngang: cặp mắt bắt đầu ở CHÍNH GIỮA khung dọc (540, 960) — nơi cảnh
 * VEverywhere gom mọi thứ về; lockup ngang thật (ghost + chữ + sao + Beta) thu nhỏ
 * cho vừa bề ngang 1080 với lề an toàn, đặt quanh tâm quang học của khung dọc.
 */

const C0 = {x: VW / 2, y: VH / 2}; // tâm mắt ở đầu cảnh = điểm cuối của cảnh trước
const BIG = 360; // cỡ logo lúc hé lộ (cùng cỡ mắt cuối cảnh trước)
const SMALL = 188; // cỡ ghost trong lockup — vừa 1080 kể cả nhãn Beta chìa ra

// lockup: ghost + khoảng + chữ + sao
const lockW = SMALL + SMALL * LOCKUP.gap + SMALL * LOCKUP.textWidth + SMALL * LOCKUP.star;
const BETA_OVER = 96; // phần nhãn Beta chìa ra bên phải lockup
// căn giữa cả cụm (lockup + nhãn Beta) để hai lề trái/phải đều nhau
const LX = (VW - (lockW + BETA_OVER)) / 2 + 6;
const ghostH = SMALL * (LOGO.viewBox[3] / 100);
// cả khối (nhãn Beta → câu chốt) cân quanh tâm khung, nhích lên một chút
const LY = VH / 2 - ghostH / 2 - 70;

export const VReveal: React.FC = () => {
  const f = useCurrentFrame();

  // các vệt cuối cùng lao vào mắt — từ bốn phía của khung dọc
  const incoming = [
    {from: {x: -160, y: 380}, at: 0},
    {from: {x: VW + 160, y: 1560}, at: 6},
    {from: {x: VW + 140, y: 260}, at: 12},
    {from: {x: -140, y: 1680}, at: 16},
  ];

  const reveal = ev(f, [REVEAL, REVEAL + 22], [0, 1], E.out);
  // mắt đổi màu đúng lúc thân phủ qua chúng
  const eyeWhite = ev(f, [REVEAL + 1, REVEAL + 4], [0, 1], E.snap);
  const squash = keys(f, [REVEAL, REVEAL + 8, REVEAL + 20, REVEAL + 30], [0.86, 1.06, 0.985, 1], E.inOut);

  // thu về vị trí trong lockup
  const move = ev(f, [SETTLE, SETTLE + 26], [0, 1], E.inOut);
  const size = BIG + (SMALL - BIG) * move;
  const ax = C0.x + (LX + EYE_MID.x * (SMALL / 100) - C0.x) * move;
  const ay = C0.y + (LY + EYE_MID.y * (SMALL / 100) - C0.y) * move;

  const blink = Math.max(blinkAt(f, [26, REVEAL + 36, 196]), 0);
  const look = {x: keys(f, [REVEAL + 46, REVEAL + 54, 180, 188], [0, 1.2, 1.2, 0], E.inOut), y: keys(f, [REVEAL + 46, REVEAL + 54, 180, 188], [0, -1, -1, 0], E.inOut)};

  const word = ev(f, [WORD, WORD + 24], [0, 1], E.out);
  const star = ev(f, [STAR, STAR + 16], [0, 1], E.back);
  const flash = ev(f, [STAR + 4, STAR + 22], [0, 1], E.out);
  const tag = ev(f, [STAR + 18, STAR + 36], [0, 1], E.out);
  const beta = ev(f, [STAR + 28, STAR + 42], [0, 1], E.back);
  const drift = ev(f, [150, 240], [1, 1.025], E.inOut);
  const ring = ev(f, [REVEAL, REVEAL + 30], [0, 1], E.out);

  const textLeft = LX + SMALL + SMALL * LOCKUP.gap;
  const starSize = SMALL * LOCKUP.star;

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, scale: String(drift)}}>
      {/* vệt cuối lao vào */}
      <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
        {incoming.map((s, i) => {
          const t = ev(f, [s.at, s.at + 24], [0, 1], E.in);
          const tail = ev(f, [s.at + 6, s.at + 28], [0, 1], E.in);
          if (t <= 0 || tail >= 1) return null;
          const hx = s.from.x + (C0.x - s.from.x) * t;
          const hy = s.from.y + (C0.y - s.from.y) * t;
          const tx = s.from.x + (C0.x - s.from.x) * tail;
          const ty = s.from.y + (C0.y - s.from.y) * tail;
          return [-9, 9].map((o) => (
            <line key={`${i}${o}`} x1={tx + o} y1={ty - o * 0.2} x2={hx + o} y2={hy - o * 0.2} stroke={C.ink} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          ));
        })}
      </svg>

      {/* trước khi nở: chỉ có hai nét mắt */}
      {f < REVEAL + 2 ? (
        <EyePair logoWidth={BIG} blink={blink} style={{left: C0.x, top: C0.y, scale: String(1 + 0.04 * ev(f, [18, 28], [0, 1], E.out))}} />
      ) : (
        <div style={{position: 'absolute', left: ax, top: ay, scale: `${2 - squash} ${squash}`, transformOrigin: '0 0'}}>
          <Ghost
            width={size}
            anchorEyes
            reveal={reveal}
            blink={blink}
            look={look}
            eyeColor={eyeWhite >= 1 ? C.white : `rgba(${Math.round(10 + 245 * eyeWhite)},${Math.round(10 + 245 * eyeWhite)},${Math.round(10 + 245 * eyeWhite)},1)`}
          />
        </div>
      )}

      {/* vòng sóng khi thân nở — khung dọc cao, cho vòng lan rộng hơn */}
      {f >= REVEAL && f < REVEAL + 30 ? (
        <div
          style={{
            position: 'absolute',
            left: C0.x,
            top: C0.y,
            width: 200 + 1100 * ring,
            height: 200 + 1100 * ring,
            translate: '-50% -50%',
            borderRadius: '50%',
            border: `${6 * (1 - ring)}px solid ${C.ink}`,
            opacity: 0.25 * (1 - ring),
          }}
        />
      ) : null}

      {/* chữ "Sirrok" trượt ra từ sau lưng ghost */}
      <div
        style={{
          position: 'absolute',
          left: textLeft,
          top: LY - 4,
          height: ghostH + 20,
          width: SMALL * LOCKUP.textWidth + 40,
          overflow: 'hidden',
          clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
        }}
      >
        <Wordmark ghostWidth={SMALL} style={{left: -50 * (1 - word), top: ghostH - SMALL * LOCKUP.textCap * 1.36 * 0.93}} />
      </div>

      {/* sao xanh */}
      <div style={{position: 'absolute', left: textLeft + SMALL * LOCKUP.textWidth + 18, top: LY + ghostH * 0.2}}>
        <Sparkle size={starSize} style={{scale: String(star), rotate: `${(1 - star) * -90}deg`}} />
        {flash > 0 && flash < 1
          ? [0, 90, 180, 270].map((a) => (
              <div
                key={a}
                style={{
                  position: 'absolute',
                  left: starSize / 2,
                  top: starSize / 2,
                  width: 6,
                  height: 26 + 60 * flash,
                  borderRadius: 3,
                  background: C.sparkle,
                  opacity: 1 - flash,
                  rotate: `${a + 45}deg`,
                  transformOrigin: '50% 0',
                  translate: `-3px ${34 + 44 * flash}px`,
                }}
              />
            ))
          : null}
      </div>

      {/* nhãn Beta như trang ra mắt */}
      <div
        style={{
          position: 'absolute',
          left: LX + lockW - 36,
          top: LY - 62,
          padding: '10px 24px',
          borderRadius: 999,
          background: C.beta,
          color: C.white,
          fontSize: 36,
          fontWeight: 700,
          rotate: '-12deg',
          scale: String(beta),
          opacity: Math.min(1, beta * 2),
        }}
      >
        Beta
      </div>

      {/* câu chốt — hai dòng cho khung dọc, chữ to dễ đọc trên điện thoại */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: LY + ghostH + 96,
          textAlign: 'center',
          fontSize: 56,
          lineHeight: 1.25,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: C.label,
          opacity: tag,
          translate: `0px ${(1 - tag) * 24}px`,
        }}
      >
        Ra lệnh bằng
        <br />
        <b style={{color: C.ink, fontWeight: 800, fontSize: 72}}>“Hey Sirrok”</b>
      </div>
    </AbsoluteFill>
  );
};
