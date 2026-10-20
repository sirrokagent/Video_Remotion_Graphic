import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys, typed} from '../../anim';
import {EYE_MID, EyePair, Ghost} from '../../logo';
import {ListenRings, Mascot} from '../mascot';
import {ASK, CMD_AT, HEY_AT, HEY_END, SEND} from '../../scenes/S1Wake';
import {C, E, FONT} from '../../theme';
import {ClaudeMark, IconPlus, IconWave, PhoneHeader} from '../../ui';
import {BlurWords, loudness, VOICE, VoiceWave} from '../../voice';
import {SAFE, VW} from './frame';

/**
 * Bản dọc của S1Wake — gọi bằng giọng nói, dựng lại cho khung 1080×1920.
 *   Mọi mốc thời gian lấy thẳng từ S1Wake (HEY_AT, CMD_AT, SEND…) — âm thanh dùng chung.
 *   Desktop 1720 px không vừa khung dọc → cả khung là màn hình app điện thoại (full-bleed):
 *   thanh đầu PhoneHeader phóng to ở trên, ô nhập giọng nói ở đáy vùng an toàn,
 *   câu lệnh chữ lớn nằm giữa, ngay phía trên ô nhập.
 *   Frame 0 khớp tuyệt đối với frame cuối của VIntro (mắt nhắm + hàng chấm sóng âm đang nghỉ).
 */

/* --- mốc nối với VIntro: VIntro import đúng các hằng này để cắt cảnh không lộ mối nối --- */
export const V_EYE = {x: VW / 2, y: 660}; // tâm hai mắt lúc mở cảnh
export const V_LW = 780; // cỡ logo của cặp mắt lúc mở cảnh
export const V_WAVE = {top: 860, width: 760, height: 120, bars: 44}; // hàng sóng âm "Hey Sirrok."

/* --- bố cục app dọc --- */
const HEAD_S = 1.9; // PhoneHeader (thiết kế cho màn 448 px) phóng to cho rộng 1080
const BAR = {x: SAFE.side, w: VW - SAFE.side * 2, y: 1350, h: 156}; // ô nhập — đáy 1506 < 1540 (vùng an toàn)
const PAD_L = 36;
const PLUS = 44;
const GAP = 22;
const SLOT_W = 120;
const LISTEN_L = 230; // cỡ logo của cặp mắt khi nằm trong ô nhập
const SLOT = {x: BAR.x + PAD_L + PLUS + GAP + SLOT_W / 2, y: BAR.y + BAR.h / 2};
const BTN = 108;
const CMD_TOP = 770; // khối "Đang nghe" + câu lệnh chữ lớn
const CMD_SIZE = 132;
const BUBBLE_TOP = 850; // bong bóng việc vừa giao (sau khi gửi)
const REPLY_TOP = 1040;
/* "Hey Sirrok." — con ghost hiện nguyên hình để LẮNG NGHE (mascot listen), rồi thu về cặp mắt (mốc như S1Wake) */
const GHOST_L = 360; // cỡ logo khi ghost hiện đủ thân
// tâm hai mắt khi có thân: thân giữa ngang khung, vòng hạt nằm gọn giữa vùng an toàn và hàng sóng âm (top 860)
const EYE1 = {x: VW / 2 + (EYE_MID.x - 50) * (GHOST_L / 100), y: 520 - (45 - EYE_MID.y) * (GHOST_L / 100)};
const BODY_IN: [number, number] = [HEY_AT + 4, HEY_AT + 22]; // thân nở ra khi giọng bắt đầu
const BODY_OUT: [number, number] = [64, 82]; // thân thu về cặp mắt, trước khi mắt bay vào ô nhập (84)
const RING_R = 52; // vòng hạt quanh cặp mắt trong ô nhập (px)

/* tách câu lệnh thành 2 dòng có chủ đích, giữ nguyên mốc từng chữ */
const CMD_L1 = {...VOICE.command, words: VOICE.command.words.slice(0, 3)}; // Gửi báo giá
const CMD_L2 = {...VOICE.command, words: VOICE.command.words.slice(3)}; // cho khách.

/** Ô nhập giọng nói kiểu điện thoại: +, chỗ cho mắt, sóng âm, mô hình, nút thu có vòng sóng. */
const VoiceBar: React.FC<{f: number; listen: number; out: number; voiceOn: boolean; sendPulse: number}> = ({f, listen, out, voiceOn, sendPulse}) => (
  <div
    style={{
      position: 'absolute',
      left: BAR.x,
      top: BAR.y,
      width: BAR.w,
      height: BAR.h,
      borderRadius: BAR.h / 2,
      border: `3px solid ${C.field}`,
      background: C.white,
      boxShadow: '0 10px 30px rgba(16,24,40,0.07)',
      display: 'flex',
      alignItems: 'center',
      padding: `0 24px 0 ${PAD_L - 3}px`,
      gap: GAP,
    }}
  >
    <IconPlus size={PLUS} />
    <div style={{position: 'relative', flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
      {/* chế độ nghe: chỗ trống cho mắt (mắt vẽ ở lớp trên cùng) + sóng âm theo giọng thật */}
      {voiceOn ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: 1 - out}}>
          <span style={{width: SLOT_W, height: 80, flexShrink: 0}} />
          <div style={{opacity: listen}}>
            <VoiceWave clip={VOICE.command} f={f - CMD_AT} scene={f} width={330} height={84} bars={30} on={listen} />
          </div>
        </div>
      ) : null}
      {/* placeholder: trước khi nghe, và trở lại sau khi gửi (đợi mắt tan hẳn) */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 500, color: C.muted, whiteSpace: 'nowrap', opacity: voiceOn ? ev(f, [SEND + 18, SEND + 32], [0, 1], E.out) : 1}}>
        Hỏi Sirrok Agent
      </div>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 26, fontWeight: 500, color: C.label, whiteSpace: 'nowrap', flexShrink: 0}}>
      <ClaudeMark size={26} />
      Sonnet 5.5
    </div>
    <div style={{position: 'relative', width: BTN, height: BTN, flexShrink: 0}}>
      {/* vòng sóng lan ra khi đang thu giọng — như nút thu của DesktopApp */}
      {listen > 0
        ? [0, 1].map((k) => {
            const t = ((f + k * 15) % 30) / 30;
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: C.send,
                  opacity: 0.28 * (1 - t) * listen,
                  scale: String(1 + 0.75 * (1 - (1 - t) * (1 - t))),
                }}
              />
            );
          })
        : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: BTN / 2,
          background: C.send,
          display: 'grid',
          placeItems: 'center',
          scale: String(1 - 0.12 * Math.sin(Math.PI * Math.min(1, sendPulse))),
        }}
      >
        <IconWave size={52} />
      </div>
    </div>
  </div>
);

export const VWake: React.FC = () => {
  const f = useCurrentFrame();

  /* --- pha 1: "Hey Sirrok." (mốc y hệt S1Wake) --- */
  const open = ev(f, [HEY_AT + 2, HEY_AT + 10], [1, 0], E.out);
  const heyLoud = loudness(VOICE.hey, f - HEY_AT);
  const wakeBlink = Math.max(open, blinkAt(f, [HEY_END + 8]));
  const wakeLook = {
    x: keys(f, [HEY_END + 16, HEY_END + 24, 78, 86], [0, 1.6, 1.6, 0], E.inOut),
    y: keys(f, [HEY_END + 16, HEY_END + 24, 78, 86], [0, -1.3, -1.3, 0], E.inOut),
  };
  const heyOut = ev(f, [76, 92], [0, 1], E.in);
  // thân ghost: nở từ giữa hai mắt khi "Hey" vang lên, giữ suốt câu, thu lại trước khi bay
  const bodyIn = ev(f, BODY_IN, [0, 1], E.out);
  const bodyOut = ev(f, BODY_OUT, [0, 1], E.inOut);
  const body = bodyIn * (1 - bodyOut);
  // cặp mắt co từ cỡ mở cảnh về cỡ ghost và dời lên — thân nở quanh mắt
  const grow = ev(f, [HEY_AT, HEY_AT + 14], [0, 1], E.out);
  const ghostL = V_LW + (GHOST_L - V_LW) * grow;
  const ghostX = V_EYE.x + (EYE1.x - V_EYE.x) * grow;
  const ghostY = V_EYE.y + (EYE1.y - V_EYE.y) * grow;
  const heyLevel = Math.min(1, heyLoud * 2.4);
  const asGhost = f >= HEY_AT && f < BODY_OUT[1];
  // mắt đen trên nền trắng khi chưa có thân → trắng ngay khi thân đã phủ tới mắt
  const eyeInk = interpolateColors(E.inOut(Math.min(1, Math.max(0, (body - 0.03) / 0.09))), [0, 1], [C.ink, C.white]);
  // nhìn lên chăm chú khi đang có thân (như mascot listen), về đúng wakeLook khi thu lại
  const ghostLook = {x: wakeLook.x + 0.8 * body, y: wakeLook.y - 1.9 * body};

  /* --- pha 2: mắt bay xuống ô nhập, app lắp quanh --- */
  const fly = ev(f, [84, 120], [0, 1], E.inOut);
  // trước "Hey": cặp mắt mở cảnh (khớp frame cuối VIntro); sau khi ghost thu lại: bay từ chỗ ghost
  const from = f < HEY_AT ? {...V_EYE, l: V_LW} : {x: ghostX, y: ghostY, l: ghostL};
  const eyeX = from.x + (SLOT.x - from.x) * E.out(fly);
  const eyeY = from.y + (SLOT.y - from.y) * fly;
  const eyeL = from.l + (LISTEN_L - from.l) * fly;
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
  // bong bóng vào khi chữ lớn đã tan gần hết — không chồng lên câu lệnh còn nét
  const bubble = ev(f, [SEND + 12, SEND + 24], [0, 1], E.out);
  const reply = ev(f, [SEND + 18, SEND + 30], [0, 1], E.out);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {/* app: thanh đầu + lời chào trượt nhẹ xuống, ô nhập trồi lên từ đáy */}
      <div style={{position: 'absolute', inset: 0, opacity: ui}}>
        <div style={{position: 'absolute', left: 0, top: 14, width: VW / HEAD_S, height: 220, scale: String(HEAD_S), transformOrigin: '0 0', translate: `0px ${(ui - 1) * 30}px`}}>
          <PhoneHeader />
        </div>
        <div
          style={{
            position: 'absolute',
            left: SAFE.side,
            right: SAFE.side,
            top: 420,
            textAlign: 'center',
            fontSize: 48,
            fontWeight: 500,
            color: C.text,
            letterSpacing: '-0.02em',
            opacity: greet,
            translate: `0px ${(1 - ui) * 24}px`,
          }}
        >
          Chào Sirrok, tiếp theo mình làm gì?
        </div>
        <div style={{position: 'absolute', inset: 0, translate: `0px ${(1 - ui) * 70}px`}}>
          <VoiceBar f={f} listen={listen} out={out} voiceOn={f >= 90} sendPulse={ev(f, [SEND, SEND + 10], [0, 1], E.snap)} />
        </div>
      </div>

      {/* câu lệnh hiện thành chữ lớn, từng từ một, đúng lúc được đọc — ngay trên ô nhập */}
      <div style={{position: 'absolute', left: SAFE.side, right: SAFE.side, top: CMD_TOP, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 40, fontWeight: 600, color: C.send, letterSpacing: '0.01em', opacity: listen * (1 - out), display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34}}>
          <span style={{width: 16, height: 16, borderRadius: 8, background: C.send, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f * 0.18))}} />
          Đang nghe
        </div>
        <BlurWords clip={CMD_L1} f={f} start={CMD_AT} size={CMD_SIZE} out={out} />
        <BlurWords clip={CMD_L2} f={f} start={CMD_AT} size={CMD_SIZE} out={out} style={{marginTop: 6}} />
      </div>

      {/* bong bóng việc vừa giao — nổi lên từ chỗ câu lệnh */}
      <div
        style={{
          position: 'absolute',
          right: SAFE.side,
          top: BUBBLE_TOP + (1 - bubble) * 120,
          padding: '34px 48px',
          borderRadius: 48,
          borderBottomRightRadius: 14,
          background: C.ink,
          color: C.white,
          fontSize: 54,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          opacity: bubble,
          scale: String(0.86 + 0.14 * bubble),
          transformOrigin: '100% 100%',
          whiteSpace: 'nowrap',
        }}
      >
        {ASK}
      </div>
      {/* Sirrok nhận việc */}
      <div style={{position: 'absolute', left: SAFE.side, top: REPLY_TOP, display: 'flex', alignItems: 'center', gap: 26, opacity: reply, translate: `0px ${(1 - reply) * 24}px`}}>
        <div style={{position: 'relative', width: 96, height: 83, flexShrink: 0}}>
          <Ghost width={96} blink={blinkAt(f, [SEND + 30])} />
        </div>
        <div style={{padding: '30px 42px', borderRadius: 48, borderTopLeftRadius: 14, background: '#F1F3F4', fontSize: 54, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', minWidth: 120, minHeight: 125}}>
          {/* gõ nhanh hơn bản ngang một chút để xong trước vệt chuyển cảnh (CUT.wake) */}
          {typed('Rõ. Mình làm ngay.', f, SEND + 20, 1.2)}
        </div>
      </div>

      {/* "Hey Sirrok." — sóng âm và chữ */}
      <div style={{position: 'absolute', left: 0, right: 0, top: V_WAVE.top, display: 'flex', justifyContent: 'center', opacity: 1 - heyOut, filter: `blur(${heyOut * 12}px)`}}>
        <VoiceWave clip={VOICE.hey} f={f - HEY_AT} scene={f} width={V_WAVE.width} height={V_WAVE.height} bars={V_WAVE.bars} on={ev(f, [HEY_AT - 8, HEY_AT], [0, 1], E.out)} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1040}}>
        <BlurWords clip={VOICE.hey} f={f} start={HEY_AT} size={136} out={heyOut} />
      </div>

      {/* vòng hạt lắng nghe quanh cặp mắt trong ô nhập */}
      {listen > 0 && !flying ? (
        <svg width={RING_R * 4} height={RING_R * 4} viewBox={`${-RING_R * 2} ${-RING_R * 2} ${RING_R * 4} ${RING_R * 4}`} style={{position: 'absolute', left: SLOT.x - RING_R * 2, top: SLOT.y - RING_R * 2, overflow: 'visible', opacity: 1 - out}}>
          <ListenRings t={f - 114} level={Math.min(1, cmdLoud * 2.4)} color={C.send} on={listen} cx={0} cy={0} r={RING_R} dotMin={1.4} dots={80} />
        </svg>
      ) : null}

      {/* "Hey Sirrok." — ghost hiện nguyên hình, lắng nghe: vòng hạt nhịp theo giọng */}
      {asGhost ? (
        <Mascot
          size={ghostL}
          state="listen"
          f={f}
          since={HEY_AT}
          level={heyLevel}
          reveal={body}
          blink={wakeBlink}
          look={ghostLook}
          eyes={eyeInk}
          style={{position: 'absolute', left: ghostX - (EYE_MID.x * ghostL) / 100, top: ghostY - (EYE_MID.y * ghostL) / 100}}
        />
      ) : null}

      {/* hai nét mắt: tự do lúc đầu, rồi nằm trong ô nhập lắng nghe */}
      {asGhost ? null : flying ? (
        <EyePair logoWidth={eyeL} blink={wakeBlink} look={wakeLook} style={{left: eyeX, top: eyeY, scale: String(1 + 0.08 * heyLoud * (1 - fly))}} />
      ) : (
        <EyePair
          logoWidth={LISTEN_L}
          blink={listenBlink}
          look={listenLook}
          style={{left: SLOT.x, top: SLOT.y, opacity: 1 - out, scale: String(1 + 0.16 * cmdLoud)}}
        />
      )}
    </AbsoluteFill>
  );
};
