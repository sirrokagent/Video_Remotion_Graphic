import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys, typed} from '../anim';
import {EyePair, Ghost} from '../logo';
import {C, E, FONT, H, W} from '../theme';
import {DESK, DesktopApp} from '../ui';
import {BlurWords, loudness, VOICE, VoiceWave} from '../voice';

/**
 * Cảnh 1 — Gọi bằng giọng nói.
 *   "Hey Sirrok."  → hai nét mắt thức dậy, sóng âm chạy theo giọng, chữ hiện từng từ mờ → nét.
 *   Mắt bay vào ô nhập, ô chuyển sang chế độ nghe: mắt lắng nghe, nút thu toả sóng.
 *   "Gửi báo giá cho khách." → sóng âm trong ô nhập chạy theo giọng thật,
 *   câu lệnh hiện thành chữ lớn từng từ một, đúng lúc được đọc. Rồi gửi đi.
 * Mọi mốc chữ lấy từ src/voice.json (đo trên file giọng), không đoán.
 */

export const HEY_AT = 22; // frame bắt đầu phát "Hey Sirrok."
export const CMD_AT = 132; // frame bắt đầu phát câu lệnh
export const HEY_END = HEY_AT + VOICE.hey.durFrames;
export const CMD_END = CMD_AT + VOICE.command.durFrames;
export const SEND = CMD_END + 8;

const WIN = {x: (W - DESK.w) / 2, y: (H - DESK.h) / 2};
const LISTEN_L = 170; // cỡ logo của cặp mắt khi nằm trong ô nhập
const SLOT_W = 84;
// tâm chỗ của mắt trong ô nhập (chế độ giọng nói)
const SLOT = {x: WIN.x + DESK.inputX + 34 + 36 + 22 + SLOT_W / 2, y: WIN.y + DESK.inputY + DESK.inputH / 2};
const EYE0 = {x: 960, y: 372};
export const ASK = 'Gửi báo giá cho khách';

export const S1Wake: React.FC = () => {
  const f = useCurrentFrame();

  /* --- pha 1: "Hey Sirrok." --- */
  const open = ev(f, [HEY_AT + 2, HEY_AT + 10], [1, 0], E.out);
  const heyLoud = loudness(VOICE.hey, f - HEY_AT);
  const wakeBlink = Math.max(open, blinkAt(f, [HEY_END + 8]));
  const wakeLook = {
    x: keys(f, [HEY_END + 16, HEY_END + 24, 78, 86], [0, 1.6, 1.6, 0], E.inOut),
    y: keys(f, [HEY_END + 16, HEY_END + 24, 78, 86], [0, -1.3, -1.3, 0], E.inOut),
  };
  const heyOut = ev(f, [76, 92], [0, 1], E.in);

  /* --- pha 2: mắt bay vào ô nhập, UI lắp quanh --- */
  const fly = ev(f, [84, 120], [0, 1], E.inOut);
  const eyeX = EYE0.x + (SLOT.x - EYE0.x) * fly;
  const eyeY = EYE0.y + (SLOT.y - EYE0.y) * E.out(fly);
  const eyeL = 700 + (LISTEN_L - 700) * fly;
  const flying = f < 121;
  const ui = ev(f, [88, 122], [0, 1], E.out);

  /* --- pha 3: chế độ nghe & câu lệnh --- */
  const listen = Math.min(ev(f, [114, 128], [0, 1], E.out), 1 - ev(f, [SEND, SEND + 10], [0, 1], E.in));
  const greet = 1 - ev(f, [112, 126], [0, 1], E.out);
  const cmdLoud = loudness(VOICE.command, f - CMD_AT);
  const listenBlink = blinkAt(f, [122, SEND]);
  const listenLook = {x: 1.4 * listen, y: -1.2 * listen};

  /* --- pha 4: gửi --- */
  const out = ev(f, [SEND + 4, SEND + 20], [0, 1], E.inOut);
  const reply = ev(f, [SEND + 18, SEND + 30], [0, 1], E.out);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {/* cửa sổ ứng dụng */}
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y, opacity: ui, scale: String(1.035 - 0.035 * ui), translate: `0px ${(1 - ui) * 40}px`}}>
        <DesktopApp
          greetOpacity={greet}
          sendPulse={ev(f, [SEND, SEND + 10], [0, 1], E.snap)}
          recording={listen}
          frame={f}
          inputOpacity={1 - out}
          voiceContent={
            // từ lúc mắt bắt đầu hạ xuống, ô nhập đã sang chế độ nghe — không để lộ placeholder dưới mắt
            f >= 90 ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <span style={{position: 'relative', display: 'inline-block', width: SLOT_W, height: 60, flexShrink: 0}}>
                  {flying ? null : (
                    <EyePair
                      logoWidth={LISTEN_L}
                      blink={listenBlink}
                      look={listenLook}
                      style={{left: '50%', top: '50%', scale: String(1 + 0.16 * cmdLoud)}}
                    />
                  )}
                </span>
                <div style={{opacity: listen}}>
                  <VoiceWave clip={VOICE.command} f={f - CMD_AT} scene={f} width={360} height={64} bars={36} on={listen} />
                </div>
              </div>
            ) : null
          }
        >
          {/* câu lệnh hiện thành chữ lớn, từng từ một, đúng lúc được đọc */}
          <div style={{position: 'absolute', left: DESK.side, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
            <div style={{fontSize: 36, fontWeight: 600, color: C.send, letterSpacing: '0.01em', opacity: listen * (1 - out), display: 'flex', alignItems: 'center', gap: 12}}>
              <span style={{width: 14, height: 14, borderRadius: 7, background: C.send, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f * 0.18))}} />
              Đang nghe
            </div>
            <BlurWords clip={VOICE.command} f={f} start={CMD_AT} size={88} out={out} />
          </div>

          {/* bong bóng việc vừa giao */}
          <div
            style={{
              position: 'absolute',
              right: 70,
              top: 150 + (1 - out) * 150,
              padding: '26px 38px',
              borderRadius: 34,
              background: C.ink,
              color: C.white,
              fontSize: 38,
              fontWeight: 500,
              opacity: out,
              scale: String(0.86 + 0.14 * out),
            }}
          >
            {ASK}
          </div>
          {/* Sirrok nhận việc */}
          <div style={{position: 'absolute', left: DESK.side + 70, top: 290, display: 'flex', alignItems: 'center', gap: 22, opacity: reply, translate: `0px ${(1 - reply) * 18}px`}}>
            <div style={{position: 'relative', width: 60, height: 52}}>
              <Ghost width={60} blink={blinkAt(f, [SEND + 30])} />
            </div>
            <div style={{fontSize: 38, fontWeight: 500, color: C.text}}>{typed('Rõ. Mình làm ngay.', f, SEND + 20, 1.6)}</div>
          </div>
        </DesktopApp>
      </div>

      {/* "Hey Sirrok." — sóng âm và chữ */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 530, display: 'flex', justifyContent: 'center', opacity: 1 - heyOut, filter: `blur(${heyOut * 12}px)`}}>
        <VoiceWave clip={VOICE.hey} f={f - HEY_AT} scene={f} width={720} height={110} bars={44} on={ev(f, [HEY_AT - 8, HEY_AT], [0, 1], E.out)} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690}}>
        <BlurWords clip={VOICE.hey} f={f} start={HEY_AT} size={120} out={heyOut} />
      </div>

      {/* hai nét mắt khi còn tự do */}
      {flying ? (
        <EyePair
          logoWidth={eyeL}
          blink={wakeBlink}
          look={wakeLook}
          style={{left: eyeX, top: eyeY, scale: String(1 + 0.08 * heyLoud * (1 - fly))}}
        />
      ) : null}
    </AbsoluteFill>
  );
};
