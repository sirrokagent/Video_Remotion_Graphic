import React from 'react';
import {ev} from '../anim';
import {GhostMark} from '../logo';
import {C, E} from '../theme';

/**
 * Mascot Sirrok — con ghost của logo có trạng thái cảm xúc (theo kiểu mascot động):
 *   idle     thở nhẹ, chớp mắt
 *   listen   lắng nghe: vòng hạt sóng âm toả ra, nhịp theo `level`
 *   work     đang làm: nền xanh dâng từ đáy, huy hiệu "•••"
 *   pending  đang chờ: mắt liếc qua lại, huy hiệu đồng hồ cát / chấm vàng
 *   done     xong: chấm xanh lá, mắt nhìn lên, nảy nhẹ
 *   sleep    ngủ: mắt nhắm thành nét ngang, "z"
 *   greet    chào: hai "tay" tròn nhỏ hai bên vẫy
 *
 * API cố định — mọi cảnh dùng chung:
 *   <Mascot size={160} state="work" f={f} since={startFrameOfState} level={0..1} body={C.ink} eyes={C.white} />
 * Hộp rộng `size`, cao theo tỉ lệ logo, đặt relative (bọc absolute bên ngoài nếu cần).
 * Tất định — không Math.random.
 */
export type MascotState = 'idle' | 'listen' | 'work' | 'pending' | 'done' | 'sleep' | 'greet';

type Props = {
  size: number;
  state: MascotState;
  /** frame hiện tại của cảnh */
  f: number;
  /** frame bắt đầu trạng thái hiện tại (cho chuyển trạng thái mượt) */
  since?: number;
  /** 0 → 1: độ lớn giọng (listen) */
  level?: number;
  body?: string;
  eyes?: string;
  style?: React.CSSProperties;
};

// BẢN TẠM — sẽ được thay bằng bản đầy đủ hiệu ứng, giữ nguyên API.
export const Mascot: React.FC<Props> = ({size, state, f, since = 0, body = C.ink, eyes = C.white, style}) => {
  const t = f - since;
  const bob = Math.sin(f * 0.12) * size * 0.015;
  const blink = state === 'sleep' ? 1 : ev(f % 90, [80, 83], [0, 1], E.snap) * ev(f % 90, [83, 88], [1, 0], E.out);
  return (
    <div style={{position: 'relative', width: size, height: size * 0.863, ...style}}>
      <GhostMark size={size} body={body} eyes={eyes} blink={blink} style={{position: 'absolute', left: 0, top: bob}} />
      {state === 'done' ? (
        <div style={{position: 'absolute', left: size * 0.06, top: size * 0.04, width: size * 0.14, height: size * 0.14, borderRadius: '50%', background: '#1DB954', scale: String(ev(t, [0, 10], [0, 1], E.back))}} />
      ) : null}
    </div>
  );
};

/** Trang trưng bày mọi trạng thái mascot (composition "Mascot"). */
export const MASCOT_SHOWCASE = 360;
export const MascotShowcase: React.FC = () => null;
