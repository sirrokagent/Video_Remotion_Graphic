import React from 'react';
import {Connect} from '../scenes/Connect';
import {Fit} from './Fit';

// TODO: dựng lại bố cục dọc 9:16 — tạm thời đặt cảnh ngang vừa khung
export const VConnect: React.FC = () => (
  <Fit>
    <Connect />
  </Fit>
);
