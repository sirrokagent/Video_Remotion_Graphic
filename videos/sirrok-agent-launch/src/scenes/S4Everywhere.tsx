import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Video} from '@remotion/media';
import {blinkAt, ev} from '../anim';
import {AgentCursor, Key} from '../cursor';
import {Ghost} from '../logo';
import {C, E, FONT} from '../theme';
import {IconCheck} from '../ui';

/**
 * Cảnh 4 — Ở mọi nơi. Mọi lúc.
 * Nền là trường "cặp mắt" nhấp nháy lan toả, dựng bằng HyperFrames rồi đưa vào
 * đây như một lớp video. Cặp mắt nhảy qua các thiết bị theo giờ trong ngày, để
 * lại đường đôi. Cuối cảnh mọi thứ thu về tâm — chuẩn bị cho logo.
 */

const SPOTS = [
  {x: 330, y: 230, time: '07:00', title: 'Báo cáo sáng', kind: 'laptop' as const},
  {x: 1590, y: 230, time: '13:30', title: 'Trả lời khách', kind: 'phone' as const},
  {x: 360, y: 860, time: '18:15', title: 'Đối soát đơn', kind: 'desktop' as const},
  {x: 1570, y: 860, time: '23:45', title: 'Lên lịch mai', kind: 'watch' as const},
];

const KEYS: Key[] = [
  {f: 0, x: 960, y: 1200},
  {f: 4, x: 960, y: 1200},
  {f: 40, x: SPOTS[0].x + 230, y: SPOTS[0].y - 40},
  {f: 56, x: SPOTS[0].x + 230, y: SPOTS[0].y - 40},
  {f: 80, x: SPOTS[1].x - 180, y: SPOTS[1].y - 40},
  {f: 96, x: SPOTS[1].x - 180, y: SPOTS[1].y - 40},
  {f: 120, x: SPOTS[2].x + 240, y: SPOTS[2].y - 50},
  {f: 136, x: SPOTS[2].x + 240, y: SPOTS[2].y - 50},
  {f: 160, x: SPOTS[3].x - 170, y: SPOTS[3].y - 50},
  {f: 172, x: SPOTS[3].x - 170, y: SPOTS[3].y - 50},
  {f: 204, x: 960, y: 520},
];
const ARRIVE = [40, 80, 120, 160];

const Device: React.FC<{kind: (typeof SPOTS)[number]['kind']}> = ({kind}) => {
  const frame: Record<string, React.CSSProperties> = {
    laptop: {width: 250, height: 160, borderRadius: 16},
    desktop: {width: 270, height: 170, borderRadius: 14},
    phone: {width: 104, height: 200, borderRadius: 26},
    watch: {width: 120, height: 140, borderRadius: 34},
  };
  return (
    <div style={{position: 'relative', background: C.white, border: `5px solid ${C.ink}`, display: 'grid', placeItems: 'center', ...frame[kind]}}>
      <div style={{position: 'relative', width: 54, height: 47}}>
        <Ghost width={54} />
      </div>
      {kind === 'laptop' ? <div style={{position: 'absolute', bottom: -22, left: -24, right: -24, height: 14, borderRadius: 7, background: C.ink}} /> : null}
      {kind === 'desktop' ? <div style={{position: 'absolute', bottom: -40, left: '50%', translate: '-50% 0', width: 70, height: 34, borderRadius: '0 0 10px 10px', background: C.ink}} /> : null}
    </div>
  );
};

export const S4Everywhere: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gather = ev(f, [172, 206], [0, 1], E.in);
  const blink = blinkAt(f, ARRIVE.map((a) => a + 2));

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {/* lớp nền dựng bằng HyperFrames */}
      <Video src={staticFile('hyperframes/eye-field.mp4')} premountFor={fps} muted style={{opacity: 0.9 * (1 - gather)}} />

      {/* đường đôi nối các điểm agent đã đi qua */}
      <AbsoluteFill style={{scale: String(1 - 0.55 * gather), opacity: 1 - gather}}>
        {SPOTS.map((s, i) => {
          const on = ev(f, [ARRIVE[i] - 4, ARRIVE[i] + 12], [0, 1], E.back);
          return (
            <div key={s.time} style={{position: 'absolute', left: s.x, top: s.y, translate: '-50% -50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, on * 1.4), scale: String(0.7 + 0.3 * on)}}>
              <Device kind={s.kind} />
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, background: C.white, boxShadow: '0 8px 24px rgba(16,24,40,0.08), 0 0 0 1px rgba(16,24,40,0.06)', fontSize: 30, fontWeight: 600, color: C.text, whiteSpace: 'nowrap'}}>
                <span style={{fontWeight: 800}}>{s.time}</span>
                <span style={{color: C.label, fontWeight: 500}}>{s.title}</span>
                <IconCheck size={30} progress={ev(f, [ARRIVE[i] + 10, ARRIVE[i] + 22], [0, 1], E.out)} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* tiêu đề */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 430,
          textAlign: 'center',
          fontSize: 132,
          fontWeight: 800,
          letterSpacing: '-0.045em',
          lineHeight: 1,
          color: C.ink,
          opacity: 1 - gather,
          scale: String(1 - 0.2 * gather),
        }}
      >
        <span style={{display: 'inline-block', opacity: ev(f, [10, 28], [0, 1], E.out), translate: `0px ${ev(f, [10, 28], [50, 0], E.out)}px`}}>Ở mọi nơi.</span>{' '}
        <span style={{display: 'inline-block', opacity: ev(f, [96, 114], [0, 1], E.out), translate: `0px ${ev(f, [96, 114], [50, 0], E.out)}px`}}>Mọi lúc.</span>
      </div>

      <AgentCursor keys={KEYS} f={f} logoWidth={240 + 120 * gather} blink={blink} trailFrames={22} />
    </AbsoluteFill>
  );
};
