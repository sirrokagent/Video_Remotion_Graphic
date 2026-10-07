import {VOICE} from '../voice';
import {CMD_AT} from '../scenes/S1Wake';
import {START} from './timeline';

/** Hiệu ứng âm thanh của phim 90 giây — frame tuyệt đối. */
export const SFX: {at: number; file: string; vol: number}[] = [
  // chuyển cảnh: tiếng vệt quét ngay trước mỗi wipe
  ...(['work', 'call', 'island', 'social', 'connect', 'everywhere', 'meet'] as const).map((k) => ({at: START[k] - 4, file: 'layered-paper-whoosh', vol: 0.4})),

  // "Hey Sirrok" + câu lệnh
  {at: START.wake + 84, file: 'layered-paper-whoosh', vol: 0.3},
  {at: START.wake + 114, file: 'mic-open-blip', vol: 0.45},
  {at: START.wake + CMD_AT + Math.round(VOICE.command.durFrames) + 8, file: 'subtle-haptic-pop', vol: 0.6},

  // desktop — như bản 41 giây
  {at: START.work + 70, file: 'soft-digital-tick', vol: 0.5},
  {at: START.work + 104, file: 'four-soft-task-complete-ticks', vol: 0.22},
  {at: START.work + 120, file: 'progress-whirr', vol: 0.15},
  {at: START.work + 184, file: 'four-soft-task-complete-ticks', vol: 0.22},
  {at: START.work + 196, file: 'soft-digital-tick', vol: 0.5},
  {at: START.work + 262, file: 'four-soft-task-complete-ticks', vol: 0.22},
  {at: START.work + 318, file: 'soft-digital-tick', vol: 0.5},
  {at: START.work + 330, file: 'subtle-haptic-pop', vol: 0.5},

  // mọi nơi, mọi lúc
  {at: START.everywhere + 40, file: 'soft-digital-tick', vol: 0.45},
  {at: START.everywhere + 80, file: 'soft-digital-tick', vol: 0.45},
  {at: START.everywhere + 120, file: 'soft-digital-tick', vol: 0.45},
  {at: START.everywhere + 160, file: 'soft-digital-tick', vol: 0.45},
  {at: START.everywhere + 60, file: 'rising-density', vol: 0.28},

  // hé lộ logo
  {at: START.reveal + 26, file: 'soft-digital-tick', vol: 0.5},
  {at: START.reveal + 40, file: 'low-impact-hit', vol: 0.7},
  {at: START.reveal + 112, file: 'layered-paper-whoosh', vol: 0.3},
  {at: START.reveal + 134, file: 'final-brand-chime', vol: 0.45},

  // gọi điện
  {at: START.call + 34, file: 'ringback', vol: 0.35},
  {at: START.call + 70, file: 'ringback', vol: 0.35},
  {at: START.call + 105, file: 'call-connect', vol: 0.45},
  ...[175, 321, 416].map((t) => ({at: START.call + t, file: 'soft-digital-tick', vol: 0.25})),
  {at: START.call + 533, file: 'call-end', vol: 0.45},
  {at: START.call + 545, file: 'subtle-haptic-pop', vol: 0.55},

  // Dynamic Island
  {at: START.island + 24, file: 'subtle-haptic-pop', vol: 0.5},
  {at: START.island + 72, file: 'soft-digital-tick', vol: 0.45},
  {at: START.island + 106, file: 'layered-paper-whoosh', vol: 0.25},
  {at: START.island + 117, file: 'subtle-haptic-pop', vol: 0.4},
  {at: START.island + 137, file: 'layered-paper-whoosh', vol: 0.25},
  {at: START.island + 146, file: 'subtle-haptic-pop', vol: 0.4},
  {at: START.island + 168, file: 'layered-paper-whoosh', vol: 0.3},
  {at: START.island + 212, file: 'soft-digital-tick', vol: 0.5},
  {at: START.island + 246, file: 'soft-digital-tick', vol: 0.5},
  {at: START.island + 282, file: 'four-soft-task-complete-ticks', vol: 0.3},

  // mạng xã hội
  {at: START.social + 22, file: 'staggered-soft-snaps-x4', vol: 0.2},
  {at: START.social + 71, file: 'soft-digital-tick', vol: 0.55},
  {at: START.social + 79, file: 'layered-paper-whoosh', vol: 0.35},
  ...[122, 140, 158, 176, 194, 212].map((t) => ({at: START.social + t, file: 'subtle-haptic-pop', vol: 0.4})),

  // kết nối
  ...[36, 45, 53, 62, 70, 79, 88].map((t) => ({at: START.connect + t, file: 'soft-digital-tick', vol: 0.3})),

  // gặp Sirrok Agent
  {at: START.meet + 26, file: 'low-impact-hit', vol: 0.45},
  {at: START.meet + 122, file: 'layered-paper-whoosh', vol: 0.3},
  ...[150, 174, 198].map((t) => ({at: START.meet + t, file: 'soft-digital-tick', vol: 0.35})),
];
