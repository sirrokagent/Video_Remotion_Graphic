import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Video} from '@remotion/media';
import {blinkAt, ev} from '../../anim';
import {AgentCursor, Key} from '../../cursor';
import {ARRIVE, Device, SPOTS} from '../../scenes/S4Everywhere';
import {C, E, FONT} from '../../theme';
import {IconCheck} from '../../ui';
import {VH, VW} from './frame';

/**
 * Cảnh 4 (bản dọc 9:16) — Ở mọi nơi. Mọi lúc.
 * Giữ nguyên mọi mốc của S4Everywhere (mắt tới thiết bị 40 · 80 · 120 · 160, chữ 10 / 96,
 * thu về tâm 172 → 206). Bố cục dọc: tiêu đề hai dòng ở giữa khung, bốn thiết bị
 * xếp so le hai trên – hai dưới, cặp mắt đi zíc-zắc từ sáng tới khuya.
 * Kết cảnh: mọi thứ gom về CHÍNH GIỮA khung (540, 960), mắt cỡ 360 — đúng điểm
 * VReveal bắt đầu (cắt liền, không wipe).
 */

/** Điểm bàn giao cho VReveal: tâm khung, cỡ mắt 360. */
export const V_EVERY_END = {x: VW / 2, y: VH / 2, logoWidth: 360} as const;

const SCALE = 1.18; // thiết bị & nhãn to hơn bản ngang cho khung dọc

// vị trí dọc: so le trái/phải, tránh vùng an toàn trên 220 & dưới 380
const POS = [
  {x: 300, y: 410}, // 07:00 laptop — trên trái
  {x: 790, y: 530}, // 13:30 điện thoại — trên phải
  {x: 300, y: 1350}, // 18:15 máy bàn — dưới trái
  {x: 790, y: 1400}, // 23:45 đồng hồ — dưới phải
];
// mắt đậu cạnh thiết bị, phía trong khung
const LAND = [
  {x: POS[0].x + 230, y: POS[0].y - 90},
  {x: POS[1].x - 190, y: POS[1].y - 120},
  {x: POS[2].x + 240, y: POS[2].y - 90},
  {x: POS[3].x - 200, y: POS[3].y - 90},
];

const KEYS: Key[] = [
  {f: 0, x: VW / 2, y: VH + 160},
  {f: 4, x: VW / 2, y: VH + 160},
  {f: 40, ...LAND[0]},
  {f: 56, ...LAND[0]},
  {f: 80, ...LAND[1]},
  {f: 96, ...LAND[1]},
  {f: 120, ...LAND[2]},
  {f: 136, ...LAND[2]},
  {f: 160, ...LAND[3]},
  {f: 172, ...LAND[3]},
  {f: 204, x: V_EVERY_END.x, y: V_EVERY_END.y},
];

export const VEverywhere: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gather = ev(f, [172, 206], [0, 1], E.in);
  const blink = blinkAt(f, ARRIVE.map((a) => a + 2));

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {/* lớp nền dựng bằng HyperFrames — cắt phủ kín khung dọc */}
      <Video src={staticFile('hyperframes/eye-field.mp4')} premountFor={fps} muted objectFit="cover" style={{width: VW, height: VH, opacity: 0.9 * (1 - gather)}} />

      {/* bốn thiết bị theo giờ trong ngày — cuối cảnh thu về tâm */}
      <AbsoluteFill style={{scale: String(1 - 0.55 * gather), opacity: 1 - gather}}>
        {SPOTS.map((s, i) => {
          const on = ev(f, [ARRIVE[i] - 4, ARRIVE[i] + 12], [0, 1], E.back);
          return (
            <div
              key={s.time}
              style={{
                position: 'absolute',
                left: POS[i].x,
                top: POS[i].y,
                translate: '-50% -50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 26,
                opacity: Math.min(1, on * 1.4),
                scale: String(SCALE * (0.7 + 0.3 * on)),
              }}
            >
              <Device kind={s.kind} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: s.kind === 'desktop' ? 18 : s.kind === 'laptop' ? 8 : 0,
                  padding: '12px 22px',
                  borderRadius: 999,
                  background: C.white,
                  boxShadow: '0 8px 24px rgba(16,24,40,0.08), 0 0 0 1px rgba(16,24,40,0.06)',
                  fontSize: 31,
                  fontWeight: 600,
                  color: C.text,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{fontWeight: 800}}>{s.time}</span>
                <span style={{color: C.label, fontWeight: 500}}>{s.title}</span>
                <IconCheck size={30} progress={ev(f, [ARRIVE[i] + 10, ARRIVE[i] + 22], [0, 1], E.out)} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* tiêu đề — hai dòng, ngắt có chủ đích */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: VH / 2 - 210, // tâm khối chữ ~900, chừa chỗ cho hai thiết bị dưới
          textAlign: 'center',
          fontSize: 150,
          fontWeight: 800,
          letterSpacing: '-0.045em',
          lineHeight: 1,
          color: C.ink,
          opacity: 1 - gather,
          scale: String(1 - 0.2 * gather),
        }}
      >
        <div style={{opacity: ev(f, [10, 28], [0, 1], E.out), translate: `0px ${ev(f, [10, 28], [50, 0], E.out)}px`}}>Ở mọi nơi.</div>
        <div style={{opacity: ev(f, [96, 114], [0, 1], E.out), translate: `0px ${ev(f, [96, 114], [50, 0], E.out)}px`, marginTop: 14}}>Mọi lúc.</div>
      </div>

      <AgentCursor keys={KEYS} f={f} logoWidth={240 + 120 * gather} blink={blink} trailFrames={22} />
    </AbsoluteFill>
  );
};
