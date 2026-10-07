import React from 'react';
import {Intro} from '../scenes/Intro';
import {Fit} from './Fit';

// TODO: dựng lại bố cục dọc 9:16 — tạm thời đặt cảnh ngang vừa khung
export const VIntro: React.FC = () => (
  <Fit>
    <Intro />
  </Fit>
);
