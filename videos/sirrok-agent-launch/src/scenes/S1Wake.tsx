import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys, typed} from '../anim';
import {EyePair, Ghost} from '../logo';
import {C, E, FONT, H, W} from '../theme';
import {DESK, DesktopApp} from '../ui';

/**
 * Cảnh 1 — Thức dậy & giao việc.
 * Chỉ có hai nét mắt giữa khung trắng. "Hey Sirrok." Mắt thu nhỏ, bay vào ô nhập
 * và TRỞ THÀNH dấu nháy. Người dùng gõ việc, bấm gửi.
 */

const WIN = {x: (W - DESK.w) / 2, y: (H - DESK.h) / 2};
const CARET_L = 160; // cỡ logo của cặp mắt khi làm dấu nháy
const CARET_W = CARET_L * 0.4;
// tâm dấu nháy khi chưa gõ chữ: lề trái ô nhập + icon + khoảng cách + nửa dấu nháy
const CARET_HOME = {
  x: WIN.x + DESK.inputX + 34 + 36 + 22 + CARET_W / 2,
  y: WIN.y + DESK.inputY + DESK.inputH / 2,
};
const ASK = 'Gửi báo giá cho khách';
const TYPE_START = 150;
const PER_CHAR = 2.6;
const SEND = 230;

export const S1Wake: React.FC = () => {
  const f = useCurrentFrame();

  /* --- pha 1: hai nét mắt thức dậy --- */
  const open = ev(f, [10, 30], [1, 0], E.out); // từ nhắm (1) sang mở (0)
  const blinkWake = Math.max(open, blinkAt(f, [48, 76]));
  const look = {x: keys(f, [58, 68, 86, 96], [0, 1.6, 1.6, 0], E.inOut), y: keys(f, [58, 68, 86, 96], [0, -1.2, -1.2, 0], E.inOut)};

  // bay vào ô nhập: 100 → 140
  const fly = ev(f, [100, 140], [0, 1], E.inOut);
  const eyeX = 960 + (CARET_HOME.x - 960) * fly;
  const eyeY = 470 + (CARET_HOME.y - 470) * E.out(fly);
  const eyeL = 700 + (CARET_L - 700) * fly;
  const flying = f < 141;

  /* --- pha 2: UI lắp ráp quanh dấu nháy --- */
  const ui = ev(f, [104, 140], [0, 1], E.out);

  /* --- pha 3: gõ việc --- */
  const text = typed(ASK, f, TYPE_START, PER_CHAR);
  const typingDone = TYPE_START + ASK.length * PER_CHAR;
  const caretBlink = blinkAt(f, [144, typingDone + 6, SEND]);
  const sendPulse = ev(f, [SEND, SEND + 10], [0, 1], E.snap);

  /* --- pha 4: gửi đi — chữ bay thành bong bóng tin nhắn --- */
  const out = ev(f, [SEND + 4, SEND + 22], [0, 1], E.inOut);
  const greet = ev(f, [SEND, SEND + 14], [1, 0], E.out);
  const reply = ev(f, [SEND + 16, SEND + 30], [0, 1], E.out);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {/* cửa sổ ứng dụng */}
      <div
        style={{
          position: 'absolute',
          left: WIN.x,
          top: WIN.y,
          opacity: ui,
          scale: String(1.035 - 0.035 * ui),
          translate: `0px ${(1 - ui) * 40}px`,
        }}
      >
        <DesktopApp
          typedText={f < SEND + 4 ? text : ''}
          inputOpacity={1 - out}
          greetOpacity={greet}
          sendPulse={sendPulse}
          caret={
            // luôn giữ chỗ cho dấu nháy, kể cả lúc mắt còn đang bay tới, để placeholder không bị đè
            <span style={{position: 'relative', display: 'inline-block', flexShrink: 0, width: CARET_W, height: 50, marginLeft: text ? 6 : 0, marginRight: text ? 0 : 8, opacity: 1 - out}}>
              {flying ? null : <EyePair logoWidth={CARET_L} blink={caretBlink} style={{left: '50%', top: '50%'}} />}
            </span>
          }
        >
          {/* bong bóng việc vừa giao */}
          <div
            style={{
              position: 'absolute',
              right: 70,
              top: 150 + (1 - out) * 330,
              padding: '26px 38px',
              borderRadius: 34,
              background: C.ink,
              color: C.white,
              fontSize: 38,
              fontWeight: 500,
              opacity: out,
              scale: String(0.9 + 0.1 * out),
            }}
          >
            {ASK}
          </div>
          {/* Sirrok nhận việc */}
          <div
            style={{
              position: 'absolute',
              left: DESK.side + 70,
              top: 290,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              opacity: reply,
              translate: `0px ${(1 - reply) * 18}px`,
            }}
          >
            <div style={{position: 'relative', width: 60, height: 52}}>
              <Ghost width={60} blink={blinkAt(f, [SEND + 26])} />
            </div>
            <div style={{fontSize: 38, fontWeight: 500, color: C.text}}>{typed('Rõ. Mình làm ngay.', f, SEND + 18, 1.6)}</div>
          </div>
        </DesktopApp>
      </div>

      {/* "Hey Sirrok." */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 640,
          textAlign: 'center',
          fontSize: 108,
          fontWeight: 800,
          letterSpacing: '-0.035em',
          color: C.ink,
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {['Hey', 'Sirrok.'].map((w, i) => (
          <span
            key={w}
            style={{
              display: 'inline-block',
              opacity: Math.min(ev(f, [32 + i * 8, 50 + i * 8], [0, 1], E.out), ev(f, [96, 110], [1, 0], E.in)),
              translate: `0px ${ev(f, [32 + i * 8, 50 + i * 8], [46, 0], E.out) - ev(f, [96, 110], [0, 30], E.in)}px`,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* hai nét mắt khi còn bay tự do */}
      {flying ? <EyePair logoWidth={eyeL} blink={blinkWake} look={look} style={{left: eyeX, top: eyeY}} /> : null}
    </AbsoluteFill>
  );
};
