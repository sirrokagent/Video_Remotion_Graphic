import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {C, E, FONT} from '../../theme';
import {VO} from '../timeline';
import {Kinetic, VoiceText} from '../text';
import {AG, AgentTag, ArrowUpRight, bubbleIn, Download, GhostIcon, HeroGhost, Monitor, NAME, pop, SELECTED, SIDEBAR, T} from '../scenes/Meet';
import {SAFE, VH, VW} from './frame';

/**
 * Màn kết "Meet Sirrok Agent" — bản dọc 9:16. Giữ nguyên mọi mốc của Meet.tsx:
 *   8 mắt mở · 21 chớp · 26 thân ghost nở · 31 "Sirrok" · 44 "Agent" (giọng n9)
 *   71–106 "Bạn ra lệnh. Nó làm." · 106 hai nút · 118 khối chữ dời lên
 *   122 cửa sổ app trồi lên · 150 / 160 / 174 / 198 tin nhắn · 200–230 khung kết tĩnh.
 *
 * Bố cục dọc: pill → "Meet [ghost]" / "Sirrok Agent" (hai dòng, ngắt có chủ đích)
 * → câu phụ → hai nút cạnh nhau → cửa sổ app hẹp (thanh avatar mảnh + khung chat)
 * trồi từ đáy khung, tràn khỏi mép dưới như bản ngang.
 */

const n9 = VO.n9.at;

const SIDE = SAFE.side; // lề hai bên
const WIN_TOP = 930; // đỉnh cửa sổ app sau khi khối chữ dời lên
const RAIL = 128; // thanh avatar mảnh

export const VMeet: React.FC = () => {
  const f = useCurrentFrame();

  // ── Ghost tiêu đề (cùng nhịp với bản ngang) ──
  const eyeOpen = ev(f, [T.eyesIn, T.eyesIn + 12], [1, 0], E.out);
  const eyeScale = ev(f, [T.eyesIn, T.eyesIn + 10], [0, 1], E.back);
  const reveal = ev(f, [T.reveal, T.reveal + 16], [0, 1], E.out);
  const ghostScale = keys(f, [0, T.reveal, T.reveal + 8, T.reveal + 20], [1.5, 1.5, 0.94, 1], E.out);
  const heroBlink = Math.max(eyeOpen, blinkAt(f, [T.firstBlink, 58, 150, 214, 238]));
  // mắt liếc xuống dòng "Sirrok Agent" khi tên được đọc, rồi về giữa
  const look = {x: keys(f, [30, 40, 78, 92], [0, 1.4, 1.4, 0], E.inOut), y: keys(f, [30, 40, 78, 92], [0, 2.2, 2.2, 0], E.inOut)};

  // ── Khối chữ: lúc đầu cân giữa khung, rồi dời lên nhường chỗ cho cửa sổ app ──
  const lift = ev(f, [T.lift, T.lift + 40], [400, 0], E.inOut);
  const winY = ev(f, [T.win, T.win + 42], [VH - WIN_TOP + 40, 0], E.out);
  const winO = ev(f, [T.win, T.win + 14], [0, 1], E.out);

  const bob = (i: number) => (f > T.win ? Math.sin((f - T.win) * 0.07 + i * 1.3) * 3.5 * ev(f, [T.win + 30, T.win + 60], [0, 1], E.inOut) : 0);

  // lúc đầu chỉ có "Meet [ghost]" — cả khối hạ thêm để dòng này nằm giữa khung,
  // rồi nâng lên khi tên được đọc để hai dòng tiêu đề cùng cân giữa
  const rowDrop = keys(f, [0, n9 + 4, n9 + 26], [150, 150, 0], E.inOut);

  const typingO = ev(f, [T.typing, T.typing + 8], [0, 1], E.out) * ev(f, [T.msg1 - 8, T.msg1], [1, 0], E.in);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* ── Khối chữ hero ── */}
      <div
        style={{
          position: 'absolute',
          left: SIDE,
          right: SIDE,
          top: SAFE.top + 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          translate: `0px ${lift + rowDrop}px`,
        }}
      >
        {/* pill nhỏ phía trên */}
        <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 72, ...pop(f, T.pill, 24)}}>
          <span style={{fontSize: 38, fontWeight: 500, color: C.text, letterSpacing: '-0.01em'}}>Sirrok Agent đã có mặt</span>
          <span
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              background: '#EDEDED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={28} />
          </span>
        </div>

        {/* tiêu đề dòng 1: Meet [ghost] */}
        <div style={{display: 'flex', alignItems: 'center', marginTop: 20, height: 150}}>
          <Kinetic text="Meet" f={f} start={4} size={138} variant="rise" />
          <div style={{marginLeft: 34, translate: '0px -4px', scale: String(ghostScale)}}>
            <HeroGhost width={136} reveal={reveal} blink={heroBlink} look={look} eyeScale={eyeScale} />
          </div>
        </div>

        {/* tiêu đề dòng 2: Sirrok Agent — theo giọng n9 */}
        <VoiceText id="n9" f={f} start={n9} size={132} pick={[0, 1]} replace={{1: 'Agent'}} variant="blur" style={{height: 150, marginTop: 24}} />

        {/* câu phụ theo giọng */}
        <VoiceText
          id="n9"
          f={f}
          start={n9}
          size={54}
          weight={500}
          color={C.muted}
          pick={[2, 3, 4, 5, 6]}
          variant="blur"
          style={{marginTop: 22, letterSpacing: '-0.015em'}}
        />

        {/* hai nút cạnh nhau */}
        <div style={{display: 'flex', gap: 22, marginTop: 40}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              height: 92,
              padding: '0 42px 0 36px',
              borderRadius: 46,
              background: C.ink,
              color: C.white,
              fontSize: 38,
              fontWeight: 500,
              ...pop(f, T.btn, 30),
            }}
          >
            <Download size={38} />
            Tải ứng dụng
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 92,
              padding: '0 42px',
              borderRadius: 46,
              background: '#EDEDED',
              color: C.text,
              fontSize: 38,
              fontWeight: 500,
              ...pop(f, T.btn + 5, 30),
            }}
          >
            Dùng thử Beta
          </div>
        </div>
      </div>

      {/* ── Cửa sổ app trồi lên từ đáy — hẹp, tràn khỏi mép dưới ── */}
      <div
        style={{
          position: 'absolute',
          left: SIDE - 12,
          width: VW - 2 * (SIDE - 12),
          top: WIN_TOP,
          height: VH - WIN_TOP + 120,
          borderRadius: 44,
          background: C.white,
          border: `2px solid ${C.hairline}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          translate: `0px ${winY}px`,
          opacity: winO,
          display: 'flex',
        }}
      >
        {/* thanh avatar mảnh: đội agent */}
        <div style={{width: RAIL, background: '#FAFAFA', borderRight: `2px solid ${C.hairline}`, position: 'relative', flexShrink: 0}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', gap: 9}}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
              <span key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />
            ))}
          </div>
          {SIDEBAR.map((a, i) => {
            const at = T.win + 14 + i * 5;
            const t = ev(f, [at, at + 18], [0, 1], E.back);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: 80 + i * 104,
                  width: RAIL - 28,
                  height: 92,
                  borderRadius: 24,
                  background: i === SELECTED ? '#EDEDED' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: ev(f, [at, at + 8], [0, 1], E.out),
                }}
              >
                <GhostIcon width={62} color={a.color} blink={blinkAt(f, [...a.blink])} style={{scale: String(0.4 + 0.6 * t), translate: `0px ${bob(i)}px`}} />
              </div>
            );
          })}
        </div>

        {/* vùng chính: khung chat */}
        <div style={{flex: 1, position: 'relative', minWidth: 0}}>
          <div
            style={{
              height: 96,
              borderBottom: `2px solid ${C.hairline}`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '0 34px',
            }}
          >
            <GhostIcon width={50} color={AG.ink} blink={blinkAt(f, [190, 232])} />
            <span style={{fontSize: 32, fontWeight: 500, color: C.text}}>Bán hàng</span>
            <span style={{flex: 1}} />
            <Monitor size={36} />
          </div>

          <div style={{position: 'absolute', left: 30, right: 30, top: 126}}>
            {/* lệnh của người dùng */}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <div
                style={{
                  maxWidth: 780,
                  whiteSpace: 'nowrap',
                  padding: '18px 28px',
                  borderRadius: 30,
                  borderBottomRightRadius: 10,
                  background: C.ink,
                  color: C.white,
                  fontSize: 32,
                  lineHeight: 1.4,
                  fontWeight: 500,
                  ...bubbleIn(f, T.msg0, 'right bottom'),
                }}
              >
                Chốt hết đơn tuần này giúp mình nhé.
              </div>
            </div>

            {/* agent báo cáo — chỉ báo "đang gõ" là ghost chớp mắt */}
            <div style={{position: 'relative', marginTop: 24}}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 120,
                  height: 74,
                  borderRadius: 30,
                  background: '#F2F2F2',
                  opacity: typingO,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GhostIcon width={44} color={C.ink} blink={blinkAt(f, [T.typing + 4, T.typing + 12])} style={{translate: `0px ${Math.sin(f * 0.35) * 2}px`}} />
              </div>
              <div
                style={{
                  maxWidth: 700,
                  padding: '20px 28px',
                  borderRadius: 30,
                  borderTopLeftRadius: 10,
                  background: '#F2F2F2',
                  fontSize: 32,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: C.text,
                  ...bubbleIn(f, T.msg1, 'left top'),
                }}
              >
                <AgentTag width={32} color={AG.warm} name="Quản lý khách hàng" nameColor={NAME.warm} /> đã gửi báo giá cho 12 khách,{' '}
                <AgentTag width={32} color={AG.beta} name="Trưởng nhóm" nameColor={NAME.beta} /> đã đánh dấu 3 khách ưu tiên.
              </div>
            </div>

            <div style={{marginTop: 18, display: 'flex'}}>
              <div
                style={{
                  maxWidth: 700,
                  padding: '18px 28px',
                  borderRadius: 30,
                  borderTopLeftRadius: 10,
                  background: '#F2F2F2',
                  fontSize: 32,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: C.text,
                  ...bubbleIn(f, T.msg2, 'left top'),
                }}
              >
                <AgentTag width={32} color={AG.blue} name="Thư ký" nameColor={NAME.deep} /> đã chốt 5 lịch hẹn sáng mai.
                <span style={{color: C.ok, marginLeft: 12}}>✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
