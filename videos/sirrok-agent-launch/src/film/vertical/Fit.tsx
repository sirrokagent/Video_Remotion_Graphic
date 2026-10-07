import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, W} from '../../theme';
import {VH, VW} from './frame';

/** Tạm thời: đặt cảnh ngang 1920×1080 vừa khung dọc (dùng khi cảnh dọc chưa dựng). */
export const Fit: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <div style={{position: 'absolute', width: W, height: H, left: 0, top: (VH - H * (VW / W)) / 2, transformOrigin: '0 0', scale: String(VW / W)}}>{children}</div>
  </AbsoluteFill>
);
