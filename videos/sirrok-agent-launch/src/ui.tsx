import React from 'react';
import {Ghost} from './logo';
import {C, FONT} from './theme';

/**
 * UI của Sirrok dựng lại bằng code theo ảnh desktop / mobile anh gửi.
 * Bố cục, màu, chữ giữ đúng ảnh; riêng cỡ chữ phóng lên cho đọc được trên video
 * (ảnh gốc chữ sidebar ~15 px — xem trên điện thoại sẽ không đọc nổi).
 */

const sans: React.CSSProperties = {fontFamily: FONT};

/* ---------------- icon nét mảnh ---------------- */

type IconProps = {size: number; color?: string; stroke?: number};

export const IconNewChat: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a8 8 0 1 1-3-6.2" />
    <path d="M14.5 13.5 21 7l-2-2-6.5 6.5-.5 2.5z" />
  </svg>
);
export const IconTask: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <rect x="3.5" y="4" width="17" height="16" rx="4" />
    <path d="M8 10h8M8 14h5" />
  </svg>
);
export const IconLink: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M10 14a4 4 0 0 1 0-5.6l2.4-2.4a4 4 0 0 1 5.6 5.6L16.6 13" />
    <path d="M14 10a4 4 0 0 1 0 5.6l-2.4 2.4a4 4 0 0 1-5.6-5.6L7.4 11" />
  </svg>
);
export const IconPanel: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M10 4v16" />
  </svg>
);
export const IconPlus: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMic: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);
export const IconWave: React.FC<IconProps> = ({size, color = C.white, stroke = 2.2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M5 10v4M8.5 7v10M12 4.5v15M15.5 7v10M19 10v4" />
  </svg>
);
export const IconChevron: React.FC<IconProps> = ({size, color = C.muted, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconCheck: React.FC<IconProps & {progress?: number}> = ({size, color = C.ok, stroke = 2.6, progress = 1}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
  </svg>
);
export const IconUser: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);
export const IconMenu: React.FC<IconProps> = ({size, color = C.label, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M5 7h14M5 12h14M5 17h14" />
  </svg>
);
export const IconHome: React.FC<IconProps> = ({size, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 11.2 12 4l8 7.2V20H4z" fill={color} />
  </svg>
);

/** Dấu sao cam của Claude trong ô chọn model — giữ như UI gốc. */
export const ClaudeMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="-12 -12 24 24">
    {[0, 30, 60, 90, 120, 150].map((a) => (
      <line key={a} x1={0} y1={-10} x2={0} y2={10} stroke={C.claude} strokeWidth={2.4} strokeLinecap="round" transform={`rotate(${a})`} />
    ))}
  </svg>
);

/* ---------------- brand nhỏ trong UI ---------------- */

export const BrandPlus: React.FC<{size: number}> = ({size}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.32, ...sans}}>
    <div style={{position: 'relative', width: size * 1.05, height: size * 0.92}}>
      <Ghost width={size * 1.05} />
    </div>
    <div style={{fontSize: size, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1}}>
      Sirrok<span style={{color: C.send, fontWeight: 500}}>+</span>
    </div>
  </div>
);

/* ---------------- Desktop app ---------------- */

export const DESK = {
  w: 1720,
  h: 940,
  side: 360,
  // vị trí ô nhập (toạ độ trong cửa sổ) — cảnh 1 cần để đặt dấu nháy
  inputX: 360 + (1720 - 360 - 1060) / 2,
  inputY: 520,
  inputW: 1060,
  inputH: 108,
};

type DesktopProps = {
  typedText?: string;
  /** Dấu nháy — chính là cặp mắt. Đứng trước placeholder khi chưa gõ, sau chữ khi đang gõ. */
  caret?: React.ReactNode;
  inputOpacity?: number;
  /** Chế độ giọng nói: thay phần chữ trong ô nhập bằng nội dung này (mắt lắng nghe + sóng âm). */
  voiceContent?: React.ReactNode;
  /** 0 → 1: nút giọng nói đang thu — có vòng sóng lan ra. */
  recording?: number;
  /** frame của cảnh, để vòng sóng của nút thu chạy. */
  frame?: number;
  greetOpacity?: number;
  sendPulse?: number;
  activeItem?: 'new' | 'agent' | 'task' | 'link';
  children?: React.ReactNode;
};

const SideItem: React.FC<{icon: React.ReactNode; label: string; active?: boolean}> = ({icon, label, active}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '14px 22px',
      borderRadius: 999,
      background: active ? C.activePill : 'transparent',
      fontSize: 30,
      fontWeight: active ? 600 : 500,
      color: active ? C.text : C.label,
    }}
  >
    {icon}
    {label}
  </div>
);

export const DesktopApp: React.FC<DesktopProps> = ({
  typedText = '',
  caret,
  inputOpacity = 1,
  voiceContent,
  recording = 0,
  frame = 0,
  greetOpacity = 1,
  sendPulse = 0,
  activeItem = 'new',
  children,
}) => (
  <div
    style={{
      position: 'relative',
      width: DESK.w,
      height: DESK.h,
      background: C.white,
      borderRadius: 28,
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(16,24,40,0.10), 0 0 0 1px rgba(16,24,40,0.06)',
      ...sans,
    }}
  >
    {/* đèn cửa sổ */}
    <div style={{position: 'absolute', left: 28, top: 26, display: 'flex', gap: 12}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />
      ))}
    </div>

    {/* sidebar */}
    <div style={{position: 'absolute', left: 0, top: 0, width: DESK.side, height: '100%', padding: '84px 22px 0'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 30px'}}>
        <BrandPlus size={40} />
        <IconPanel size={34} />
      </div>
      <SideItem icon={<IconNewChat size={32} />} label="New Agent" active={activeItem === 'new'} />
      <SideItem
        icon={
          <div style={{position: 'relative', width: 32, height: 28}}>
            <Ghost width={32} />
          </div>
        }
        label="Agent"
        active={activeItem === 'agent'}
      />
      <SideItem icon={<IconTask size={32} />} label="Task" active={activeItem === 'task'} />
      <SideItem icon={<IconLink size={32} />} label="Kết nối" active={activeItem === 'link'} />

      <div style={{position: 'absolute', left: 34, bottom: 34, display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 500, color: C.label}}>
        <div style={{width: 50, height: 50, borderRadius: 25, background: C.send, color: C.white, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 26}}>S</div>
        Sirrok Agent
      </div>
    </div>

    {/* lời chào */}
    <div
      style={{
        position: 'absolute',
        left: DESK.side,
        right: 0,
        top: 360,
        textAlign: 'center',
        fontSize: 60,
        fontWeight: 500,
        color: C.text,
        letterSpacing: '-0.02em',
        opacity: greetOpacity,
      }}
    >
      Chào Sirrok, tiếp theo mình làm gì?
    </div>

    {/* ô nhập */}
    <div
      style={{
        position: 'absolute',
        left: DESK.inputX,
        top: DESK.inputY,
        width: DESK.inputW,
        height: DESK.inputH,
        borderRadius: 999,
        border: `2px solid ${C.field}`,
        background: C.white,
        boxShadow: '0 6px 20px rgba(16,24,40,0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px 0 34px',
        gap: 22,
      }}
    >
      <IconPlus size={36} />
      <div style={{flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', fontSize: 38, fontWeight: 500, whiteSpace: 'nowrap', opacity: inputOpacity}}>
        {voiceContent ?? (
          <>
            {typedText ? <span style={{color: C.text}}>{typedText}</span> : null}
            {caret}
            {typedText ? null : <span style={{color: C.muted}}>Hỏi Sirrok Agent</span>}
          </>
        )}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 500, color: C.label, flexShrink: 0, whiteSpace: 'nowrap'}}>
        <ClaudeMark size={26} />
        Claude Sonnet 5.5
        <IconChevron size={26} />
      </div>
      <IconMic size={34} />
      <div style={{position: 'relative', width: 74, height: 74, flexShrink: 0}}>
        {/* vòng sóng lan ra khi đang thu giọng */}
        {recording > 0
          ? [0, 1].map((k) => {
              const t = ((frame + k * 15) % 30) / 30;
              return (
                <div
                  key={k}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: C.send,
                    opacity: 0.28 * (1 - t) * recording,
                    scale: String(1 + 0.75 * (1 - (1 - t) * (1 - t))),
                  }}
                />
              );
            })
          : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 37,
            background: C.send,
            display: 'grid',
            placeItems: 'center',
            scale: String(1 - 0.12 * Math.sin(Math.PI * Math.min(1, sendPulse))),
          }}
        >
          <IconWave size={36} />
        </div>
      </div>
    </div>

    {children}
  </div>
);

/* ---------------- Phone ---------------- */

export const PHONE = {w: 480, h: 1000, r: 78, bezel: 16};

export const PhoneFrame: React.FC<{children: React.ReactNode; island?: React.ReactNode}> = ({children, island}) => (
  <div
    style={{
      position: 'relative',
      width: PHONE.w,
      height: PHONE.h,
      borderRadius: PHONE.r,
      background: '#1B1B1D',
      padding: PHONE.bezel,
      boxShadow: '0 40px 90px rgba(16,24,40,0.18), inset 0 0 0 3px #3A3A3D',
      ...sans,
    }}
  >
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: PHONE.r - PHONE.bezel, background: C.white, overflow: 'hidden'}}>
      {/* thanh trạng thái */}
      <div style={{position: 'absolute', top: 30, left: 50, fontSize: 26, fontWeight: 700, color: C.ink}}>9:41</div>
      <div style={{position: 'absolute', top: 34, right: 44, display: 'flex', gap: 8, alignItems: 'center'}}>
        <svg width="30" height="20" viewBox="0 0 30 20">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 8} y={14 - i * 4} width={5.5} height={6 + i * 4} rx={1.5} fill={C.ink} />
          ))}
        </svg>
        <div style={{width: 40, height: 20, borderRadius: 6, border: `2.5px solid ${C.ink}`, padding: 2}}>
          <div style={{width: '82%', height: '100%', borderRadius: 2, background: C.ink}} />
        </div>
      </div>
      {children}
    </div>
    {/* dynamic island */}
    {island ?? (
      <div style={{position: 'absolute', top: PHONE.bezel + 18, left: '50%', translate: '-50% 0', width: 160, height: 46, borderRadius: 23, background: '#000'}} />
    )}
  </div>
);

export const PhoneHeader: React.FC = () => (
  <div style={{position: 'absolute', top: 124, left: 34, right: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <BrandPlus size={40} />
    <div style={{display: 'flex', gap: 14}}>
      {[<IconUser key="u" size={30} />, <IconMenu key="m" size={30} />].map((ic, i) => (
        <div key={i} style={{width: 64, height: 64, borderRadius: 32, background: '#F1F3F4', display: 'grid', placeItems: 'center'}}>
          {ic}
        </div>
      ))}
    </div>
  </div>
);

export const PhoneTabBar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 132,
      borderTop: `1.5px solid ${C.hairline}`,
      display: 'flex',
      justifyContent: 'space-around',
      paddingTop: 18,
      background: C.white,
    }}
  >
    {[
      {ic: <IconHome size={36} />, l: 'Agent', on: true},
      {ic: <IconTask size={34} color={C.muted} />, l: 'Task'},
      {ic: <IconLink size={34} color={C.muted} />, l: 'Kết nối'},
      {ic: <IconUser size={34} color={C.muted} />, l: 'Cài đặt'},
    ].map((t) => (
      <div key={t.l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 21, fontWeight: 500, color: t.on ? C.ink : C.muted}}>
        {t.ic}
        {t.l}
      </div>
    ))}
    <div style={{position: 'absolute', bottom: 12, left: '50%', translate: '-50% 0', width: 150, height: 6, borderRadius: 3, background: C.ink}} />
  </div>
);
