import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../anim';
import {EYE_MID, EyePair, Ghost, LOCKUP, LOGO, Sparkle, Wordmark} from '../logo';
import {C, E, FONT} from '../theme';

/**
 * Cảnh 5 — Khoảnh khắc đáng nhớ nhất: logo hé lộ.
 * Cặp mắt dừng giữa khung, chớp một cái — rồi thân ghost NỞ RA từ chính giữa hai
 * mắt, nuốt trọn chúng: mắt đen trên nền trắng lật thành mắt trắng trên thân đen.
 * Ghost thu về trái, chữ "Sirrok" trượt ra từ sau lưng, ngôi sao xanh bật sáng.
 */

const C0 = {x: 960, y: 520}; // tâm mắt ở đầu cảnh = điểm cuối của cảnh 4
const BIG = 360; // cỡ logo lúc hé lộ
const SMALL = 230; // cỡ ghost trong lockup

// lockup: ghost + khoảng + chữ + sao, căn giữa ngang
const lockW = SMALL + SMALL * LOCKUP.gap + SMALL * LOCKUP.textWidth + SMALL * LOCKUP.star;
const LX = (1920 - lockW) / 2; // mép trái ghost trong lockup
const LY = 400; // đỉnh ghost trong lockup

export const REVEAL = 40;
export const SETTLE = 96;
export const WORD = 112;
export const STAR = 136;

export const S5Reveal: React.FC = () => {
  const f = useCurrentFrame();

  // các vệt cuối cùng lao vào mắt
  const incoming = [
    {from: {x: -200, y: 120}, at: 0},
    {from: {x: 2120, y: 980}, at: 6},
    {from: {x: 2100, y: 60}, at: 12},
    {from: {x: -160, y: 1000}, at: 16},
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

  const textLeft = LX + SMALL + SMALL * LOCKUP.gap;
  const ghostTop = LY;
  const ghostH = SMALL * (LOGO.viewBox[3] / 100);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, scale: String(drift)}}>
      {/* vệt cuối lao vào */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
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

      {/* vòng sóng khi thân nở */}
      {f >= REVEAL && f < REVEAL + 30 ? (
        <div
          style={{
            position: 'absolute',
            left: C0.x,
            top: C0.y,
            width: 200 + 900 * ev(f, [REVEAL, REVEAL + 30], [0, 1], E.out),
            height: 200 + 900 * ev(f, [REVEAL, REVEAL + 30], [0, 1], E.out),
            translate: '-50% -50%',
            borderRadius: '50%',
            border: `${6 * (1 - ev(f, [REVEAL, REVEAL + 30], [0, 1], E.out))}px solid ${C.ink}`,
            opacity: 0.25 * (1 - ev(f, [REVEAL, REVEAL + 30], [0, 1], E.out)),
          }}
        />
      ) : null}

      {/* chữ "Sirrok" trượt ra từ sau lưng ghost */}
      <div
        style={{
          position: 'absolute',
          left: textLeft,
          top: ghostTop - 4,
          height: ghostH + 20,
          width: SMALL * LOCKUP.textWidth + 40,
          overflow: 'hidden',
          clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
        }}
      >
        <Wordmark ghostWidth={SMALL} style={{left: -60 * (1 - word), top: ghostH - SMALL * LOCKUP.textCap * 1.36 * 0.93}} />
      </div>

      {/* sao xanh */}
      <div style={{position: 'absolute', left: textLeft + SMALL * LOCKUP.textWidth + 22, top: ghostTop + ghostH * 0.2}}>
        <Sparkle size={SMALL * LOCKUP.star} style={{scale: String(star), rotate: `${(1 - star) * -90}deg`}} />
        {flash > 0 && flash < 1
          ? [0, 90, 180, 270].map((a) => (
              <div
                key={a}
                style={{
                  position: 'absolute',
                  left: (SMALL * LOCKUP.star) / 2,
                  top: (SMALL * LOCKUP.star) / 2,
                  width: 6,
                  height: 30 + 70 * flash,
                  borderRadius: 3,
                  background: C.sparkle,
                  opacity: 1 - flash,
                  rotate: `${a + 45}deg`,
                  transformOrigin: '50% 0',
                  translate: `-3px ${40 + 50 * flash}px`,
                }}
              />
            ))
          : null}
      </div>

      {/* nhãn Beta như trang ra mắt */}
      <div
        style={{
          position: 'absolute',
          left: textLeft + SMALL * LOCKUP.textWidth + SMALL * LOCKUP.star - 40,
          top: ghostTop - 70,
          padding: '12px 26px',
          borderRadius: 999,
          background: C.beta,
          color: C.white,
          fontSize: 38,
          fontWeight: 700,
          rotate: '-12deg',
          scale: String(beta),
          opacity: Math.min(1, beta * 2),
        }}
      >
        Beta
      </div>

      {/* câu chốt */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: ghostTop + ghostH + 90,
          textAlign: 'center',
          fontSize: 50,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: C.label,
          opacity: tag,
          translate: `0px ${(1 - tag) * 24}px`,
        }}
      >
        Ra lệnh bằng <b style={{color: C.ink, fontWeight: 800}}>“Hey Sirrok”</b>
      </div>
    </AbsoluteFill>
  );
};
