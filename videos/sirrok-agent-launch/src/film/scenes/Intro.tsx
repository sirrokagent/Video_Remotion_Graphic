import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {EYE_MID, EyePair, LOGO, LOGO_H} from '../../logo';
import {C, E, FONT} from '../../theme';
import {eyeSegs, FX, FxKey} from '../ghostfx';
import {VoiceText} from '../text';
import {VO} from '../timeline';
import {VOICE, VoiceWave} from '../../voice';

/**
 * Cảnh mở phim (290 frame).
 *   0–161  montage dồn dập: ghost đổi hiệu ứng mỗi 18 frame (nhịp 100 BPM), nền trắng/đen xen kẽ.
 *          Ghost ở nửa trên, một phần ba dưới để chữ: "hàng trăm việc đang chờ bạn."
 *   162–   lặng lại: một ghost sạch trên nền trắng, thân thu về giữa hai mắt (ngược với reveal),
 *          còn lại hai nét mắt. "chỉ cần nói một câu." hiện dưới mắt rồi tan.
 *   ~276   mắt nhắm (blink = 1) đúng vị trí/cỡ của S1Wake frame 0 → cắt sang không thấy mối nối.
 */

export const BEAT = 18;
export const CALM_AT = 162;

export type Shot = {fx: FxKey; dark: boolean; off: number; size: number};
/** off = hiệu ứng bắt đầu từ frame nào; mỗi shot chạy hiệu ứng nhanh gấp 1.5 lần để kịp "đã" trong 18 frame. */
export const SHOTS: Shot[] = [
  {fx: 'draw', dark: false, off: 2, size: 520},
  {fx: 'glitch', dark: true, off: 2, size: 540},
  {fx: 'liquid', dark: false, off: 4, size: 520},
  {fx: 'neon', dark: true, off: 0, size: 540},
  {fx: 'shatter', dark: false, off: 2, size: 520},
  {fx: 'particles', dark: true, off: 6, size: 540},
  {fx: 'extrude', dark: false, off: 4, size: 520},
  {fx: 'hologram', dark: true, off: 2, size: 540},
  {fx: 'pulse', dark: false, off: 0, size: 520},
];
export const SPEED = 1.5;
const GHOST_CY = 372; // tâm dọc của ghost trong montage — nửa trên khung

/* nhịp cuối: cùng chỗ, cùng cỡ với S1Wake frame 0 */
const EYE = {x: 960, y: 372};
const LW = 700;
const KK = LW / 100;
export const COLLAPSE: [number, number] = [176, 197];
export const CLOSE: [number, number] = [272, 279];

const Montage: React.FC<{f: number}> = ({f}) => {
  const i = Math.min(SHOTS.length - 1, Math.floor(f / BEAT));
  const s = SHOTS[i];
  const lf = f - i * BEAT;
  const Comp = FX[s.fx];
  const push = 1.06 - 0.06 * ev(lf, [0, 12], [0, 1], E.out);
  const h = (s.size * LOGO_H) / 100;
  return (
    <AbsoluteFill style={{background: s.dark ? C.ink : C.bg}}>
      <div style={{position: 'absolute', left: 960 - s.size / 2, top: GHOST_CY - h / 2, scale: String(push)}}>
        <Comp f={s.off + lf * SPEED} size={s.size} dark={s.dark} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790}}>
        <VoiceText
          id="n1"
          f={f}
          start={VO.n1.at}
          size={96}
          pick={[3, 4, 5, 6, 7, 8]}
          variant="rise"
          color={s.dark ? C.white : C.ink}
          out={ev(f, [150, 161], [0, 1], E.in)}
        />
      </div>
    </AbsoluteFill>
  );
};

const Calm: React.FC<{f: number}> = ({f}) => {
  const id = React.useId().replace(/:/g, '');
  const settle = ev(f, [CALM_AT, CALM_AT + 16], [0, 1], E.out);
  const scale = 1.045 - 0.045 * settle;
  // tăng tốc dần như bị hút về điểm giữa hai mắt — không lưu lại chấm đen nhỏ
  const collapse = ev(f, COLLAPSE, [0, 1], E.in);
  const r = 112 * (1 - collapse);
  // mắt liếc xuống chữ rồi trở về chính giữa trước khi nhắm
  const look = {x: 0, y: keys(f, [206, 216, 250, 262], [0, 1.3, 1.3, 0], E.inOut)};
  const blink = Math.max(blinkAt(f, [168, 232]), ev(f, CLOSE, [0, 1], E.snap));
  const k = 1 - 0.86 * blink;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: EYE.x, top: EYE.y, scale: String(scale)}}>
        {/* lớp dưới: hai nét mắt đen trên nền trắng — chính là EyePair của S1Wake */}
        <EyePair logoWidth={LW} blink={blink} look={look} style={{left: 0, top: 0}} />
        {/* lớp trên: thân đen + mắt trắng, cắt theo vòng tròn co dần về giữa hai mắt */}
        {r > 0.05 ? (
          <svg
            width={LW}
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
      {/* hàng chấm sóng âm đang nghỉ — S1Wake frame 0 có sẵn hàng này (top 530), hiện dần để cắt cảnh liền mạch */}
      {f >= 260 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 530, display: 'flex', justifyContent: 'center', opacity: ev(f, [262, 282], [0, 1], E.inOut)}}>
          <VoiceWave clip={VOICE.hey} f={-22} scene={0} width={720} height={110} bars={44} on={0} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 600}}>
        <VoiceText id="n2" f={f} start={VO.n2.at} size={104} pick={[2, 3, 4, 5, 6]} variant="blur" out={ev(f, [254, 270], [0, 1], E.in)} />
      </div>
    </AbsoluteFill>
  );
};

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  return f < CALM_AT ? <Montage f={f} /> : <Calm f={f} />;
};
