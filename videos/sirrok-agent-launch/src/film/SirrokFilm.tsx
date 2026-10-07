import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {ev} from '../anim';
import {CMD_AT, HEY_AT, S1Wake} from '../scenes/S1Wake';
import {S2Work} from '../scenes/S2Work';
import {S4Everywhere} from '../scenes/S4Everywhere';
import {S5Reveal} from '../scenes/S5Reveal';
import {strokeWipe} from '../StrokeWipe';
import {C, E} from '../theme';
import {VOICE} from '../voice';
import {Call} from './scenes/Call';
import {Connect} from './scenes/Connect';
import {Intro} from './scenes/Intro';
import {Island} from './scenes/Island';
import {Meet} from './scenes/Meet';
import {Social} from './scenes/Social';
import {CUT, F, ORDER, START, VO} from './timeline';
import {SFX} from './sfx';

/**
 * Sirrok Agent — phim ra mắt 90 giây.
 * Ghost nhiều hiệu ứng → "Hey Sirrok" → agent tự làm trên desktop → tự gọi khách →
 * tiến độ trên Dynamic Island (Mac / iPhone / Android) → tự đăng mạng xã hội →
 * kết nối mọi công cụ → mọi nơi, mọi lúc → hé lộ logo → "Gặp Sirrok Agent".
 */

const SCENES: Record<(typeof ORDER)[number]['key'], React.FC> = {
  intro: Intro,
  wake: S1Wake,
  work: S2Work,
  call: Call,
  island: Island,
  social: Social,
  connect: Connect,
  everywhere: S4Everywhere,
  reveal: S5Reveal,
  meet: Meet,
};

const wipe = linearTiming({durationInFrames: F.wipe, easing: E.inOut});

/** Mọi câu thoại theo frame tuyệt đối. */
const LINES: {id: string; at: number}[] = [
  {id: 'hey', at: START.wake + HEY_AT},
  {id: 'command', at: START.wake + CMD_AT},
  ...Object.entries(VO).map(([id, v]) => ({id, at: START[v.scene] + v.at})),
];

/** 0 → 1 khi có giọng nói: hạ nhạc trước 6 frame, trả lại sau 12 frame. */
const duck = (f: number) => {
  let d = 0;
  for (const l of LINES) {
    const len = VOICE[l.id].durFrames;
    d = Math.max(d, Math.min(ev(f, [l.at - 6, l.at], [0, 1]), 1 - ev(f, [l.at + len, l.at + len + 12], [0, 1])));
  }
  return d;
};

export const SirrokFilm: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <TransitionSeries>
        {ORDER.flatMap((o) => {
          const Scene = SCENES[o.key];
          const seq = (
            <TransitionSeries.Sequence key={o.key} name={o.key} durationInFrames={CUT[o.key]} premountFor={fps}>
              <Scene />
            </TransitionSeries.Sequence>
          );
          return o.wipeAfter ? [seq, <TransitionSeries.Transition key={`${o.key}-w`} presentation={strokeWipe()} timing={wipe} />] : [seq];
        })}
      </TransitionSeries>

      {/* nhạc nền, tự hạ khi có lời */}
      <Audio src={staticFile('music/film.mp3')} volume={(f) => 0.6 * (1 - 0.6 * duck(f))} />
      {LINES.map((l) => (
        <Sequence key={l.id} from={l.at} premountFor={fps} name={`giọng · ${l.id}`}>
          <Audio src={staticFile(`voice/${l.id}.mp3`)} volume={l.id.startsWith('a') || l.id.startsWith('c') ? 0.95 : 1} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} premountFor={fps} name={`sfx ${s.file}`}>
          <Audio src={staticFile(`sfx/${s.file}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
