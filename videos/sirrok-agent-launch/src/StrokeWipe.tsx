import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {EYE_ANGLE_DEG, LOGO} from './logo';
import {C, H, W} from './theme';

/**
 * Chuyển cảnh = hai nét mắt của logo phóng to thành hai vệt quét ngang khung hình,
 * nghiêng đúng góc của mắt. Cảnh mới lộ ra phía sau vệt.
 * Tỉ lệ độ dày hai vệt = tỉ lệ hai mắt thật (10.35 : 8.83).
 */
type Props = Record<string, never>;

const rad = (EYE_ANGLE_DEG * Math.PI) / 180;
// hệ số lệch x theo y của đường quét nghiêng
const slope = Math.cos(rad) / Math.sin(rad);
const reach = (H / 2) * Math.abs(slope);

const BAR_A = 78;
const BAR_B = 78 * (LOGO.eyes[1].w / LOGO.eyes[0].w);
const BAR_GAP = 150;

const StrokeWipePresentation: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  // easing nằm ở timing của TransitionSeries, ở đây dùng thẳng tiến độ
  const p = presentationProgress;
  // mép quét đi từ ngoài trái sang ngoài phải, có tính cả độ nghiêng và hai vệt
  const fx = -reach - BAR_GAP - BAR_A + p * (W + 2 * reach + 2 * BAR_GAP + 2 * BAR_A);
  const xAt = (y: number, x: number) => x + (y - H / 2) * slope;

  if (presentationDirection === 'exiting') {
    return (
      <AbsoluteFill style={{scale: String(1 - 0.03 * p), filter: `brightness(${1 - 0.04 * p})`}}>{children}</AbsoluteFill>
    );
  }

  const clip = `polygon(-400px 0px, ${xAt(0, fx)}px 0px, ${xAt(H, fx)}px ${H}px, -400px ${H}px)`;
  const bar = (x: number, w: number) => (
    <line x1={xAt(-200, x)} y1={-200} x2={xAt(H + 200, x)} y2={H + 200} stroke={C.ink} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: clip}}>{children}</AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {bar(fx, BAR_A)}
        {bar(fx + BAR_GAP, BAR_B)}
      </svg>
    </AbsoluteFill>
  );
};

export const strokeWipe = (): TransitionPresentation<Props> => ({
  component: StrokeWipePresentation,
  props: {},
});
