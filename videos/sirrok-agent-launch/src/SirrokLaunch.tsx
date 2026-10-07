import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {S1Wake} from './scenes/S1Wake';
import {S2Work} from './scenes/S2Work';
import {S3Phone} from './scenes/S3Phone';
import {S4Everywhere} from './scenes/S4Everywhere';
import {S5Reveal} from './scenes/S5Reveal';
import {strokeWipe} from './StrokeWipe';
import {C, E, START, T} from './theme';

/**
 * Sirrok Agent — phim ra mắt, 41 giây.
 * Ý tưởng: hai nét mắt của logo là ngôn ngữ chuyển động của cả phim —
 * dấu nháy, con trỏ, chỉ báo đang gõ, vệt chuyển cảnh — rồi cuối cùng
 * thân ghost nở ra quanh chúng thành logo.
 */

const wipe = linearTiming({durationInFrames: T.wipe, easing: E.inOut});

/** Hiệu ứng âm thanh — mốc tính theo frame tuyệt đối của cả phim. */
const SFX: {at: number; file: string; vol: number}[] = [
  // cảnh 1
  {at: START.wake + 14, file: 'soft-digital-tick', vol: 0.5},
  {at: START.wake + 34, file: 'mic-open-blip', vol: 0.45},
  {at: START.wake + 48, file: 'soft-digital-tick', vol: 0.3},
  {at: START.wake + 102, file: 'layered-paper-whoosh', vol: 0.3},
  {at: START.wake + 150, file: 'staggered-soft-snaps-x4', vol: 0.35},
  {at: START.wake + 172, file: 'staggered-soft-snaps-x4', vol: 0.35},
  {at: START.wake + 194, file: 'staggered-soft-snaps-x4', vol: 0.3},
  {at: START.wake + 230, file: 'subtle-haptic-pop', vol: 0.6},
  {at: START.work - 4, file: 'layered-paper-whoosh', vol: 0.45},
  // cảnh 2
  {at: START.work + 70, file: 'soft-digital-tick', vol: 0.6},
  {at: START.work + 104, file: 'four-soft-task-complete-ticks', vol: 0.25},
  {at: START.work + 120, file: 'progress-whirr', vol: 0.18},
  {at: START.work + 184, file: 'four-soft-task-complete-ticks', vol: 0.25},
  {at: START.work + 196, file: 'soft-digital-tick', vol: 0.6},
  {at: START.work + 262, file: 'four-soft-task-complete-ticks', vol: 0.25},
  {at: START.work + 318, file: 'soft-digital-tick', vol: 0.6},
  {at: START.work + 330, file: 'subtle-haptic-pop', vol: 0.55},
  {at: START.phone - 4, file: 'layered-paper-whoosh', vol: 0.45},
  // cảnh 3
  {at: START.phone + 22, file: 'subtle-haptic-pop', vol: 0.6},
  {at: START.phone + 98, file: 'soft-digital-tick', vol: 0.45},
  {at: START.phone + 152, file: 'soft-digital-tick', vol: 0.45},
  {at: START.phone + 176, file: 'four-soft-task-complete-ticks', vol: 0.25},
  {at: START.everywhere - 4, file: 'layered-paper-whoosh', vol: 0.45},
  // cảnh 4
  {at: START.everywhere + 40, file: 'soft-digital-tick', vol: 0.5},
  {at: START.everywhere + 80, file: 'soft-digital-tick', vol: 0.5},
  {at: START.everywhere + 120, file: 'soft-digital-tick', vol: 0.5},
  {at: START.everywhere + 160, file: 'soft-digital-tick', vol: 0.5},
  {at: START.everywhere + 60, file: 'rising-density', vol: 0.32},
  // cảnh 5
  {at: START.reveal + 26, file: 'soft-digital-tick', vol: 0.5},
  {at: START.reveal + 40, file: 'low-impact-hit', vol: 0.7},
  {at: START.reveal + 112, file: 'layered-paper-whoosh', vol: 0.3},
  {at: START.reveal + 134, file: 'final-brand-chime', vol: 0.5},
];

export const SirrokLaunch: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="1 · Thức dậy & giao việc" durationInFrames={T.wake} premountFor={fps}>
          <S1Wake />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={strokeWipe()} timing={wipe} />
        <TransitionSeries.Sequence name="2 · Agent tự làm" durationInFrames={T.work} premountFor={fps}>
          <S2Work />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={strokeWipe()} timing={wipe} />
        <TransitionSeries.Sequence name="3 · Kết quả về tận tay" durationInFrames={T.phone} premountFor={fps}>
          <S3Phone />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={strokeWipe()} timing={wipe} />
        <TransitionSeries.Sequence name="4 · Ở mọi nơi. Mọi lúc." durationInFrames={T.everywhere} premountFor={fps}>
          <S4Everywhere />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5 · Hé lộ logo" durationInFrames={T.reveal} premountFor={fps}>
          <S5Reveal />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio src={staticFile('music/bed.mp3')} volume={0.55} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} premountFor={fps} name={`sfx ${s.file}`}>
          <Audio src={staticFile(`sfx/${s.file}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
