import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../../theme';
import {AGENT_COLORS, AgentAvatar, COLOR_KEYS, SHAPE_KEYS} from '../agents';

export const Pick: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg, display: 'flex', flexWrap: 'wrap', gap: 30, padding: 60}}>
      {SHAPE_KEYS.map((s, i) => (
        <AgentAvatar key={s} shape={s} color={AGENT_COLORS[COLOR_KEYS[i % 11]]} size={200} f={f} />
      ))}
      {SHAPE_KEYS.map((s, i) => (
        <AgentAvatar key={'m' + s} shape={s} from={SHAPE_KEYS[(i + 1) % 12]} mix={0.5} color={AGENT_COLORS.black} size={200} f={f} />
      ))}
    </AbsoluteFill>
  );
};
