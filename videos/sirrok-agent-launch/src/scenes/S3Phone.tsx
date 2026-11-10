import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, typed} from '../anim';
import {EyePair, Ghost} from '../logo';
import {C, E, FONT} from '../theme';
import {ClaudeMark, IconCheck, IconPlus, IconWave, PHONE, PhoneFrame, PhoneHeader, PhoneTabBar} from '../ui';

/**
 * Cảnh 3 — Kết quả về tận tay. Dynamic Island báo "đã gửi", rồi hỏi tiếp ngay
 * trên điện thoại. Chỉ báo "đang gõ" chính là cặp mắt nhún nhảy.
 */

const PX = 1120;
const PY = (1080 - PHONE.h) / 2;

const Island: React.FC<{f: number}> = ({f}) => {
  const grow = Math.min(ev(f, [22, 38], [0, 1], E.back), ev(f, [76, 90], [1, 0], E.inOut));
  const w = 160 + (420 - 160) * grow;
  const h = 46 + (92 - 46) * grow;
  const show = ev(f, [32, 42], [0, 1], E.out) * (1 - ev(f, [72, 80], [0, 1], E.in));
  return (
    <div
      style={{
        position: 'absolute',
        top: PHONE.bezel + 18,
        left: '50%',
        translate: '-50% 0',
        width: w,
        height: h,
        borderRadius: h / 2,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        padding: '0 26px',
        gap: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'relative', width: 48, height: 42, opacity: show, flexShrink: 0}}>
        <Ghost width={48} bodyColor={C.white} eyeColor={C.ink} blink={blinkAt(f, [52])} />
      </div>
      <div style={{flex: 1, opacity: show, whiteSpace: 'nowrap'}}>
        <div style={{fontSize: 24, fontWeight: 700, color: C.white}}>Đã gửi báo giá</div>
        <div style={{fontSize: 20, fontWeight: 500, color: '#B9BDC4'}}>cho anh Minh · vừa xong</div>
      </div>
      <div style={{opacity: show, width: 40, height: 40, borderRadius: 20, background: '#1E8E3E', display: 'grid', placeItems: 'center', flexShrink: 0}}>
        <IconCheck size={26} color={C.white} progress={ev(f, [40, 52], [0, 1], E.out)} />
      </div>
    </div>
  );
};

const bubbleIn = (f: number, at: number) => ({
  opacity: ev(f, [at, at + 10], [0, 1], E.out),
  translate: `0px ${ev(f, [at, at + 14], [24, 0], E.out)}px`,
  scale: String(0.94 + 0.06 * ev(f, [at, at + 14], [0, 1], E.back)),
});

export const S3Phone: React.FC = () => {
  const f = useCurrentFrame();
  const home = 1 - ev(f, [88, 100], [0, 1], E.inOut);
  const chat = ev(f, [92, 104], [0, 1], E.out);
  const typingOn = f >= 116 && f < 152;
  const bob = Math.sin(((f - 116) / 9) * Math.PI) * 5;

  return (
    <AbsoluteFill style={{background: C.phoneBackdrop, fontFamily: FONT}}>
      {/* tiêu đề bên trái */}
      <div style={{position: 'absolute', left: 170, top: 330, fontSize: 112, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, color: C.ink}}>
        {['Kết quả', 'về tận tay.'].map((l, i) => (
          <div key={l} style={{opacity: ev(f, [16 + i * 8, 34 + i * 8], [0, 1], E.out), translate: `0px ${ev(f, [16 + i * 8, 34 + i * 8], [50, 0], E.out)}px`}}>
            {l}
          </div>
        ))}
        <div style={{fontSize: 44, fontWeight: 500, letterSpacing: '-0.01em', color: C.label, marginTop: 28, opacity: ev(f, [40, 56], [0, 1], E.out)}}>
          Ngay trên điện thoại.
        </div>
      </div>

      <div style={{position: 'absolute', left: PX, top: PY, translate: `0px ${ev(f, [0, 30], [60, 0], E.out)}px`}}>
        <PhoneFrame island={<Island f={f} />}>
          <PhoneHeader />

          {/* màn hình mới — giống ảnh mobile */}
          <div style={{position: 'absolute', left: 40, right: 40, top: 312, textAlign: 'center', fontSize: 32, lineHeight: 1.3, fontWeight: 500, color: C.text, opacity: home}}>
            Chào Sirrok, tiếp theo mình làm gì?
          </div>

          {/* hội thoại */}
          <div style={{position: 'absolute', left: 26, right: 26, top: 210, display: 'flex', flexDirection: 'column', gap: 20, opacity: chat}}>
            <div style={{alignSelf: 'flex-end', padding: '20px 28px', borderRadius: 30, background: C.ink, color: C.white, fontSize: 30, fontWeight: 500, ...bubbleIn(f, 98)}}>
              Khách trả lời chưa?
            </div>
            <div style={{display: 'flex', gap: 14, alignItems: 'flex-start', ...bubbleIn(f, 114)}}>
              <div style={{position: 'relative', width: 46, height: 40, marginTop: 8, flexShrink: 0}}>
                <Ghost width={46} blink={blinkAt(f, [150])} />
              </div>
              <div style={{padding: '20px 26px', borderRadius: 30, background: '#F1F3F4', fontSize: 28, whiteSpace: 'nowrap', fontWeight: 500, color: C.text, minWidth: 110, minHeight: 82, position: 'relative'}}>
                {typingOn ? (
                  <EyePair logoWidth={120} blink={blinkAt(f, [126, 140])} style={{left: '50%', top: `calc(50% + ${bob}px)`}} />
                ) : (
                  typed('Rồi. Anh Minh đã chốt.', f, 152, 1.1)
                )}
              </div>
            </div>
            <div
              style={{
                marginLeft: 60,
                padding: '22px 24px',
                borderRadius: 26,
                border: `1.5px solid ${C.hairline}`,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                ...bubbleIn(f, 176),
              }}
            >
              <div style={{width: 58, height: 62, borderRadius: 14, border: `2px solid ${C.send}`, overflow: 'hidden', flexShrink: 0, textAlign: 'center'}}>
                <div style={{background: C.send, color: C.white, fontSize: 15, fontWeight: 700, height: 20}}>THG 10</div>
                <div style={{fontSize: 26, fontWeight: 800, color: C.text}}>09</div>
              </div>
              <div>
                <div style={{fontSize: 26, fontWeight: 700, color: C.text}}>Ký hợp đồng</div>
                <div style={{fontSize: 22, fontWeight: 500, color: C.muted}}>9:00 · đã vào lịch</div>
              </div>
            </div>
          </div>

          {/* ô nhập */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 156,
              height: 80,
              borderRadius: 40,
              border: `2px solid ${C.field}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 10px 0 18px',
              translate: `0px ${(1 - chat) * -300}px`,
            }}
          >
            <IconPlus size={28} />
            <div style={{flex: 1, minWidth: 0, overflow: 'hidden', fontSize: 22, color: C.muted, whiteSpace: 'nowrap'}}>Hỏi Sirrok Agent</div>
            {/* trên điện thoại bỏ icon mic và mũi tên cho ô nhập đủ chỗ hiện trọn placeholder */}
            <div style={{display: 'flex', alignItems: 'center', gap: 5, fontSize: 17, color: C.label, whiteSpace: 'nowrap', flexShrink: 0}}>
              <ClaudeMark size={16} />
              Sonnet 5.5
            </div>
            <div style={{width: 56, height: 56, borderRadius: 28, background: C.send, display: 'grid', placeItems: 'center', flexShrink: 0}}>
              <IconWave size={28} />
            </div>
          </div>

          <PhoneTabBar />
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
