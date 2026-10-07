import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

// TODO: thư viện hiệu ứng ghost + trang trưng bày
export const GHOSTFX_DURATION = 600;
export const GhostFXShowcase: React.FC = () => <AbsoluteFill style={{background: C.bg}} />;
