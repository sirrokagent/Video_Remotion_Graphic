import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {EYE_MID, EyePair, LOGO, LOGO_H} from '../../logo';
import {C, E, FONT} from '../../theme';
import {eyeSegs, FX} from '../ghostfx';
import {BEAT, CALM_AT, CLOSE, COLLAPSE, SHOTS, SPEED} from '../scenes/Intro';
import {VoiceText} from '../text';
import {VO} from '../timeline';
import {VOICE, VoiceWave} from '../../voice';
import {VW} from './frame';
import {V_EYE, V_LW, V_WAVE} from './VWake';

/**
 * Bản dọc của cảnh mở phim (290 frame) — cùng nhịp cắt, cùng mốc với Intro ngang.
 *   0–161  montage: ghost đổi hiệu ứng mỗi 18 frame, to ở nửa trên khung dọc;
 *          chữ "hàng trăm việc / đang chờ bạn." xuống dòng có chủ đích ở dưới.
 *   162–   lặng lại: thân ghost thu về giữa hai mắt, còn hai nét mắt.
 *          "chỉ cần nói / một câu." hiện dưới mắt rồi tan.
 *   ~279   mắt nhắm đúng vị trí/cỡ của VWake frame 0, hàng chấm sóng âm đã nằm sẵn → cắt liền.
 */

const SIZE_UP = 1.45; // cỡ ghost montage so với bản ngang (520/540 → ~755/785), chừa lề cho hiệu ứng toả ra
const GHOST_CY = 660; // tâm dọc của ghost trong montage — trùng tầm mắt cảnh sau
const TEXT_TOP = 1090; // dòng chữ thoại — dưới ghost, trên vùng an toàn đáy (1540)
const N1_SIZE = 112;
const N2_SIZE = 128;
const KK = V_LW / 100;

const Montage: React.FC<{f: number}> = ({f}) => {
  const i = Math.min(SHOTS.length - 1, Math.floor(f / BEAT));
  const s = SHOTS[i];
  const lf = f - i * BEAT;
  const Comp = FX[s.fx];
  const size = Math.round(s.size * SIZE_UP);
  const push = 1.06 - 0.06 * ev(lf, [0, 12], [0, 1], E.out);
  const h = (size * LOGO_H) / 100;
  const color = s.dark ? C.white : C.ink;
  const out = ev(f, [150, 161], [0, 1], E.in);
  return (
    <AbsoluteFill style={{background: s.dark ? C.ink : C.bg}}>
      <div style={{position: 'absolute', left: VW / 2 - size / 2, top: GHOST_CY - h / 2, scale: String(push)}}>
        <Comp f={s.off + lf * SPEED} size={size} dark={s.dark} />
      </div>
      {/* "hàng trăm việc / đang chờ bạn." — hai dòng, mỗi chữ hiện đúng lúc được đọc */}
      <div style={{position: 'absolute', left: 0, right: 0, top: TEXT_TOP}}>
        <VoiceText id="n1" f={f} start={VO.n1.at} size={N1_SIZE} pick={[3, 4, 5]} variant="rise" color={color} out={out} />
        <VoiceText id="n1" f={f} start={VO.n1.at} size={N1_SIZE} pick={[6, 7, 8]} variant="rise" color={color} out={out} />
      </div>
    </AbsoluteFill>
  );
};

const Calm: React.FC<{f: number}> = ({f}) => {
  const id = React.useId().replace(/:/g, '');
  const settle = ev(f, [CALM_AT, CALM_AT + 16], [0, 1], E.out);
  const scale = 1.045 - 0.045 * settle;
  // thân bị hút về điểm giữa hai mắt
  const collapse = ev(f, COLLAPSE, [0, 1], E.in);
  const r = 112 * (1 - collapse);
  // mắt liếc xuống chữ rồi về giữa trước khi nhắm
  const look = {x: 0, y: keys(f, [206, 216, 250, 262], [0, 1.3, 1.3, 0], E.inOut)};
  const blink = Math.max(blinkAt(f, [168, 232]), ev(f, CLOSE, [0, 1], E.snap));
  const k = 1 - 0.86 * blink;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: V_EYE.x, top: V_EYE.y, scale: String(scale)}}>
        {/* lớp dưới: hai nét mắt đen — chính là EyePair của VWake frame 0 */}
        <EyePair logoWidth={V_LW} blink={blink} look={look} style={{left: 0, top: 0}} />
        {/* lớp trên: thân đen + mắt trắng, cắt theo vòng tròn co về giữa hai mắt */}
        {r > 0.05 ? (
          <svg
            width={V_LW}
            height={LOGO_H * KK}
            viewBox={`0 0 100 ${LOGO_H}`}
            style={{position: 'absolute', left: -EYE_MID.x * KK, top: -EYE_MID.y * KK, overflow: 'visible'}}
          >
            <defs>
              <clipPath id={`k${id}`}>
                <circle cx={EYE_MID.x} cy={EYE_MID.y} r={r} />
              </clipPath>
            </defs>
            <g clipPath={`url(#k${id})`}>
              <path d={LOGO.body} fill={C.ink} />
              {eyeSegs(k, look).map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={C.white} strokeWidth={l.w} strokeLinecap="round" />
              ))}
            </g>
          </svg>
        ) : null}
      </div>
      {/* hàng chấm sóng âm đang nghỉ — VWake frame 0 có sẵn hàng này, hiện dần để cắt liền */}
      {f >= 260 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: V_WAVE.top, display: 'flex', justifyContent: 'center', opacity: ev(f, [262, 282], [0, 1], E.inOut)}}>
          <VoiceWave clip={VOICE.hey} f={-22} scene={0} width={V_WAVE.width} height={V_WAVE.height} bars={V_WAVE.bars} on={0} />
        </div>
      ) : null}
      {/* "chỉ cần nói / một câu." */}
      <div style={{position: 'absolute', left: 0, right: 0, top: TEXT_TOP - 50}}>
        {[
          [2, 3, 4],
          [5, 6],
        ].map((pick) => (
          <VoiceText key={pick[0]} id="n2" f={f} start={VO.n2.at} size={N2_SIZE} pick={pick} variant="blur" out={ev(f, [254, 270], [0, 1], E.in)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const VIntro: React.FC = () => {
  const f = useCurrentFrame();
  return f < CALM_AT ? <Montage f={f} /> : <Calm f={f} />;
};
