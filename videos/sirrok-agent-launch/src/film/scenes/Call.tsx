import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {AppTile} from '../../brands';
import {EyePair} from '../../logo';
import {C, E, FONT} from '../../theme';
import {IconCheck, IconMic, PHONE, PhoneFrame} from '../../ui';
import {VOICE, VoiceWave, loudness} from '../../voice';
import {VoiceText} from '../text';
import {VO} from '../timeline';

/**
 * Cảnh "Gọi điện" — agent tự gọi cho khách (anh Minh) và chốt lịch hẹn.
 *  0–105   đổ chuông: iPhone trượt vào bên phải, tiêu đề theo giọng n4 bên trái
 *  105     bắt máy: điện thoại lùi về giữa, đồng hồ cuộc gọi chạy
 *  108–533 hội thoại: bên trái là Sirrok (bong bóng đen), bên phải là khách (bong bóng sáng)
 *  536     cúp máy → 544 thẻ lịch "Ký hợp đồng · 9:00 sáng mai" bật lên, tick xanh
 * Mọi mốc tính bằng frame cảnh, mọi chuyển động có easing, không ngẫu nhiên.
 */

/* ---------------- mốc thời gian (frame cảnh) ---------------- */
const RING = [34, 70]; // hai hồi chuông
const CONNECT = 105; // khách bắt máy
const HANGUP = 533; // cúp máy (khách vừa dứt câu c2)
const CARD = 545; // thẻ kết quả bật lên
const CHECK = 551; // tick xanh bắt đầu vẽ

/** Mốc một chữ của câu thoại tính theo frame cảnh. */
const wordAt = (id: keyof typeof VO, i: number) => VO[id].at + VOICE[id].words[i].at;

/* ---------------- bố cục ---------------- */
const PY = (1080 - PHONE.h) / 2;
const PX_DIAL = 1230; // điện thoại khi đang đổ chuông (tiêu đề bên trái)
const PX_CALL = (1920 - PHONE.w) / 2; // điện thoại ở giữa khi đang nói chuyện
const SIDE_W = 580;
const SIDE_L = 86; // cột Sirrok
const SIDE_R = 1920 - 86 - SIDE_W; // cột khách hàng
const HEAD_TOP = 216; // đầu cột: avatar + tên + sóng âm
const BUBBLE_BASE = 846; // đáy bong bóng mới nhất
const BUBBLE_SHIFT = 160; // bong bóng cũ bị đẩy lên bao nhiêu

/* ---------------- lời thoại thành bong bóng ---------------- */
type Phrase = {side: 'a' | 'c'; id: 'a1' | 'a2' | 'c1' | 'c2'; pick: number[]; hi?: boolean; replace?: Record<number, string>};
const PHRASES: Phrase[] = [
  {side: 'a', id: 'a1', pick: [0, 1, 2, 3, 4, 5], replace: {5: 'Sirrok.'}},
  {side: 'a', id: 'a1', pick: [11, 12, 13, 14, 15, 16]},
  {side: 'c', id: 'c1', pick: [0, 1, 2, 3, 4]},
  {side: 'c', id: 'c1', pick: [5, 6, 7, 8, 9, 10]},
  {side: 'a', id: 'a2', pick: [2, 3, 4, 5, 6, 7]},
  {side: 'a', id: 'a2', pick: [9, 10, 11, 12], hi: true},
  {side: 'c', id: 'c2', pick: [0, 1, 2, 3]},
];
/** Bong bóng hiện ra ngay trước chữ đầu tiên được đọc. */
const appearAt = (p: Phrase) => wordAt(p.id, p.pick[0]) - 6;

/** Mắt agent chớp theo nhịp nói. */
const AGENT_BLINKS = [20, 96, 150, 236, 300, 392, 452, 506, 556];

/* ---------------- icon nhỏ cho màn hình gọi ---------------- */
const IconKeypad: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={6 + c * 6} cy={5 + r * 6} r={1.8} fill={color} />))}
    <circle cx={12} cy={23} r={1.8} fill={color} />
  </svg>
);
const IconSpeaker: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
const IconHandset: React.FC<{size: number; color: string; rotate?: number}> = ({size, color, rotate = 0}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{rotate: `${rotate}deg`}}>
    <path
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
      fill={color}
    />
  </svg>
);

/* ---------------- Dynamic Island: live activity cuộc gọi ---------------- */
const CallIsland: React.FC<{f: number}> = ({f}) => {
  const grow = Math.min(ev(f, [20, 36], [0, 1], E.back), 1 - ev(f, [HANGUP + 2, HANGUP + 14], [0, 1], E.inOut));
  const w = 160 + (250 - 160) * grow;
  const h = 46 + (54 - 46) * grow;
  const show = ev(f, [28, 38], [0, 1], E.out) * (1 - ev(f, [HANGUP, HANGUP + 8], [0, 1], E.in));
  const live = ev(f, [CONNECT, CONNECT + 10], [0, 1], E.out);
  const secs = Math.max(0, Math.floor((Math.min(f, HANGUP) - CONNECT) / 30));
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
        justifyContent: 'space-between',
        padding: '0 18px 0 16px',
        overflow: 'hidden',
      }}
    >
      {/* trái: mắt Sirrok — người gọi */}
      <div style={{position: 'relative', width: 44, height: 30, opacity: show}}>
        <EyePair logoWidth={62} color={C.white} blink={blinkAt(f, AGENT_BLINKS)} style={{left: 22, top: 15}} />
      </div>
      {/* phải: đang đổ chuông → chấm xanh + đồng hồ */}
      <div style={{position: 'relative', height: 30, width: 96, opacity: show}}>
        <div style={{position: 'absolute', right: 0, top: 9, display: 'flex', gap: 7, opacity: 1 - live}}>
          {[0, 1, 2].map((i) => {
            const t = ((f + 30 - i * 6) % 30) / 30;
            return <div key={i} style={{width: 11, height: 11, borderRadius: 6, background: '#30D158', opacity: 0.35 + 0.65 * E.inOut(Math.abs(1 - 2 * t))}} />;
          })}
        </div>
        <div style={{position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: 9, opacity: live, fontSize: 24, fontWeight: 700, color: '#30D158', fontVariantNumeric: 'tabular-nums'}}>
          <div style={{width: 11, height: 11, borderRadius: 6, background: '#30D158'}} />
          {`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}
        </div>
      </div>
    </div>
  );
};

/* ---------------- màn hình cuộc gọi kiểu iOS ---------------- */
const CallScreen: React.FC<{f: number}> = ({f}) => {
  const live = ev(f, [CONNECT, CONNECT + 10], [0, 1], E.out);
  const ended = ev(f, [HANGUP, HANGUP + 8], [0, 1], E.out);
  const secs = Math.max(0, Math.floor((Math.min(f, HANGUP) - CONNECT) / 30));
  const timer = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  // vòng avatar đập theo giọng khách khi khách nói
  const cust = Math.max(loudness(VOICE.c1, f - VO.c1.at), loudness(VOICE.c2, f - VO.c2.at));
  const press = ev(f, [HANGUP - 6, HANGUP], [0, 1], E.snap) * (1 - ev(f, [HANGUP, HANGUP + 10], [0, 1], E.out));
  const ringBump = RING.reduce((s, r) => s + Math.sin(Math.PI * ev(f, [r, r + 12], [0, 1], E.out)) * 0.05, 0);

  return (
    <>
      {/* quầng xanh rất nhạt sau avatar */}
      <div style={{position: 'absolute', left: -100, right: -100, top: 170, height: 500, background: 'radial-gradient(closest-side, rgba(11,87,208,0.10), rgba(11,87,208,0))'}} />

      {/* trạng thái → đồng hồ → kết thúc */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 128, height: 44, textAlign: 'center', fontSize: 26, fontWeight: 500}}>
        <div style={{position: 'absolute', inset: 0, color: C.muted, opacity: 1 - live}}>Sirrok đang gọi…</div>
        <div style={{position: 'absolute', inset: 0, color: C.label, fontSize: 30, fontWeight: 600, fontVariantNumeric: 'tabular-nums', opacity: live * (1 - ended)}}>{timer}</div>
        <div style={{position: 'absolute', left: -20, right: -20, top: -4, color: '#C5221F', fontSize: 36, fontWeight: 700, opacity: ended, whiteSpace: 'nowrap'}}>
          Kết thúc cuộc gọi
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 180, textAlign: 'center', fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink}}>Anh Minh</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 256, textAlign: 'center', fontSize: 26, fontWeight: 500, color: C.muted, letterSpacing: '0.02em'}}>
        0903 ••• 268
      </div>

      {/* avatar + vòng chuông */}
      <div style={{position: 'absolute', left: '50%', top: 420, width: 0, height: 0}}>
        {RING.flatMap((r) =>
          [0, 9].map((d) => {
            const t = ev(f, [r + d, r + d + 46], [0, 1], E.out);
            const vis = f >= r + d && t < 1 ? 1 : 0;
            return (
              <div
                key={`${r}-${d}`}
                style={{position: 'absolute', left: -90, top: -90, width: 180, height: 180, borderRadius: 90, border: `3px solid ${C.send}`, opacity: vis * 0.55 * (1 - t), scale: String(1 + 0.9 * t)}}
              />
            );
          }),
        )}
        {/* vòng sáng theo giọng khách */}
        <div style={{position: 'absolute', left: -90, top: -90, width: 180, height: 180, borderRadius: 90, background: 'rgba(11,87,208,0.12)', scale: String(1 + Math.min(0.35, cust * 0.6) * live)}} />
        <div
          style={{
            position: 'absolute',
            left: -90,
            top: -90,
            width: 180,
            height: 180,
            borderRadius: 90,
            background: 'linear-gradient(160deg, #9AA0A6, #5F6368)',
            color: C.white,
            display: 'grid',
            placeItems: 'center',
            fontSize: 88,
            fontWeight: 700,
            scale: String(1 + ringBump),
            boxShadow: '0 18px 40px rgba(16,24,40,0.16)',
          }}
        >
          M
        </div>
      </div>

      {/* danh tính người gọi: cặp mắt Sirrok */}
      <div style={{position: 'absolute', left: '50%', top: 556, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px 12px 16px', borderRadius: 999, background: '#F1F3F4', whiteSpace: 'nowrap'}}>
        <div style={{position: 'relative', width: 44, height: 44, borderRadius: 22, background: C.ink}}>
          <EyePair logoWidth={56} color={C.white} blink={blinkAt(f, AGENT_BLINKS)} style={{left: 22, top: 22}} />
        </div>
        <div style={{fontSize: 24, fontWeight: 600, color: C.text}}>Sirrok Agent gọi</div>
      </div>

      {/* nút điều khiển */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 648, display: 'flex', justifyContent: 'space-between'}}>
        {[
          {ic: <IconMic size={38} color={C.text} />, l: 'Tắt tiếng'},
          {ic: <IconKeypad size={38} color={C.text} />, l: 'Phím số'},
          {ic: <IconSpeaker size={38} color={C.text} />, l: 'Loa'},
        ].map((b) => (
          <div key={b.l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 116}}>
            <div style={{width: 96, height: 96, borderRadius: 48, background: '#E8EAED', display: 'grid', placeItems: 'center'}}>{b.ic}</div>
            <div style={{fontSize: 24, fontWeight: 500, color: C.label, whiteSpace: 'nowrap'}}>{b.l}</div>
          </div>
        ))}
      </div>

      {/* nút cúp máy */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 44,
          translate: '-50% 0',
          width: 104,
          height: 104,
          borderRadius: 52,
          background: '#E5352B',
          display: 'grid',
          placeItems: 'center',
          scale: String(1 - 0.12 * press),
          boxShadow: '0 12px 28px rgba(229,53,43,0.32)',
        }}
      >
        <IconHandset size={50} color={C.white} rotate={135} />
      </div>
    </>
  );
};

/* ---------------- cột người nói (trái: Sirrok, phải: khách) ---------------- */
const SpeakerHead: React.FC<{f: number; side: 'a' | 'c'}> = ({f, side}) => {
  const isA = side === 'a';
  const clip = isA ? (f < VO.a2.at - 4 ? 'a1' : 'a2') : f < VO.c2.at - 4 ? 'c1' : 'c2';
  const lf = f - VO[clip].at;
  const speaking = lf > -4 && lf < VOICE[clip].durFrames + 4;
  const on = ev(f, [VO[clip].at - 6, VO[clip].at + 4], [0.32, 1], E.out) * (1 - 0.68 * ev(f, [VO[clip].at + VOICE[clip].durFrames, VO[clip].at + VOICE[clip].durFrames + 12], [0, 1], E.inOut));
  const pulse = speaking ? Math.min(0.08, loudness(VOICE[clip], lf) * 0.14) : 0;
  const avatar = (
    <div style={{position: 'relative', width: 96, height: 96, flexShrink: 0}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 48, background: isA ? C.send : C.label, opacity: 0.16 * on, scale: String(1.18 + pulse * 3)}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 48,
          background: isA ? C.ink : 'linear-gradient(160deg, #9AA0A6, #5F6368)',
          display: 'grid',
          placeItems: 'center',
          color: C.white,
          fontSize: 46,
          fontWeight: 700,
          scale: String(1 + pulse),
        }}
      >
        {isA ? <EyePair logoWidth={118} color={C.white} blink={blinkAt(f, AGENT_BLINKS)} style={{left: 48, top: 48}} /> : 'M'}
      </div>
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: isA ? 'flex-start' : 'flex-end', gap: 26}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, flexDirection: isA ? 'row' : 'row-reverse'}}>
        {avatar}
        <div style={{textAlign: isA ? 'left' : 'right'}}>
          <div style={{fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, lineHeight: 1.1}}>{isA ? 'Sirrok' : 'Anh Minh'}</div>
          <div style={{fontSize: 36, fontWeight: 500, color: C.muted, lineHeight: 1.2}}>{isA ? 'Trợ lý AI' : 'Khách hàng'}</div>
        </div>
      </div>
      <VoiceWave clip={VOICE[clip]} f={lf} scene={f} width={440} height={86} bars={40} color={isA ? C.send : C.label} on={on} />
    </div>
  );
};

const Bubble: React.FC<{f: number; p: Phrase; level: number; retire: number}> = ({f, p, level, retire}) => {
  const isA = p.side === 'a';
  const at = appearAt(p);
  const pop = ev(f, [at, at + 14], [0, 1], E.back);
  const fade = level <= 1 ? 1 - 0.45 * level : 0.55 * Math.max(0, 2 - level);
  const bg = p.hi ? C.send : isA ? C.ink : '#ECEEF1';
  const fg = isA ? C.white : C.text;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 1080 - BUBBLE_BASE,
        [isA ? 'left' : 'right']: 0,
        maxWidth: SIDE_W,
        padding: '24px 34px 26px',
        borderRadius: 40,
        [isA ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 12,
        background: bg,
        opacity: ev(f, [at, at + 8], [0, 1], E.out) * fade * (1 - retire),
        translate: `0px ${-level * BUBBLE_SHIFT + (1 - pop) * 40 - retire * 40}px`,
        scale: String((0.9 + 0.1 * pop) * (1 - 0.06 * Math.min(1, level))),
        transformOrigin: isA ? 'bottom left' : 'bottom right',
        boxShadow: p.hi ? '0 18px 40px rgba(11,87,208,0.28)' : isA ? '0 16px 36px rgba(0,0,0,0.16)' : 'none',
      }}
    >
      <VoiceText
        id={p.id}
        f={f}
        start={VO[p.id].at}
        pick={p.pick}
        replace={p.replace}
        size={p.hi ? 52 : 38}
        weight={p.hi ? 800 : 500}
        color={fg}
        align="left"
        style={{letterSpacing: p.hi ? '-0.03em' : '-0.01em', lineHeight: 1.18}}
      />
    </div>
  );
};

const Column: React.FC<{f: number; side: 'a' | 'c'; enter: number; out: number}> = ({f, side, enter, out}) => {
  const isA = side === 'a';
  const mine = PHRASES.filter((p) => p.side === side);
  return (
    <div
      style={{
        position: 'absolute',
        left: isA ? SIDE_L : SIDE_R,
        top: 0,
        width: SIDE_W,
        height: 1080,
        opacity: enter * (1 - out),
        translate: `${(1 - enter) * (isA ? -60 : 60)}px ${-out * 30}px`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      <div style={{position: 'absolute', top: HEAD_TOP, [isA ? 'left' : 'right']: 0}}>
        <SpeakerHead f={f} side={side} />
      </div>
      {mine.map((p, i) => {
        // mỗi câu mới cùng phía đẩy câu cũ lên một bậc
        const level = mine.slice(i + 1).reduce((s, q) => s + ev(f, [appearAt(q) - 4, appearAt(q) + 12], [0, 1], E.inOut), 0);
        // câu cũ chỉ ở lại một lúc rồi tan, để mỗi phía gọn một bong bóng
        const next = mine[i + 1];
        const retire = next ? ev(f, [appearAt(next) + 34, appearAt(next) + 52], [0, 1], E.inOut) : 0;
        if (f < appearAt(p) || level >= 2 || retire >= 1) return null;
        return <Bubble key={i} f={f} p={p} level={level} retire={retire} />;
      })}
    </div>
  );
};

/* ---------------- thẻ kết quả ---------------- */
const ResultCard: React.FC<{f: number}> = ({f}) => {
  const pop = ev(f, [CARD, CARD + 14], [0, 1], E.back);
  const op = ev(f, [CARD, CARD + 8], [0, 1], E.out);
  const chk = ev(f, [CHECK, CHECK + 10], [0, 1], E.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 540,
        translate: `-50% ${-50 + (1 - pop) * 14}%`,
        scale: String(0.82 + 0.18 * pop),
        opacity: op,
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        padding: '40px 48px',
        borderRadius: 44,
        background: C.white,
        boxShadow: '0 40px 100px rgba(16,24,40,0.20), 0 0 0 1px rgba(16,24,40,0.06)',
        whiteSpace: 'nowrap',
      }}
    >
      <AppTile brand="calendar" size={132} />
      <div>
        <div style={{fontSize: 64, fontWeight: 800, letterSpacing: '-0.035em', color: C.ink, lineHeight: 1.1}}>Ký hợp đồng</div>
        <div style={{fontSize: 40, fontWeight: 500, color: C.label, marginTop: 6}}>9:00 sáng mai</div>
      </div>
      <div style={{width: 104, height: 104, borderRadius: 52, background: '#1E8E3E', display: 'grid', placeItems: 'center', marginLeft: 16, scale: String(0.6 + 0.4 * ev(f, [CHECK - 4, CHECK + 8], [0, 1], E.back))}}>
        <IconCheck size={64} color={C.white} stroke={3} progress={chk} />
      </div>
    </div>
  );
};

/* ---------------- cảnh ---------------- */
export const Call: React.FC = () => {
  const f = useCurrentFrame();

  // điện thoại: trượt vào bên phải → lùi về giữa khi bắt máy → chìm xuống khi thẻ kết quả bật lên
  const enter = ev(f, [0, 30], [0, 1], E.out);
  const px = keys(f, [CONNECT - 6, CONNECT + 22], [PX_DIAL, PX_CALL], E.inOut);
  const sink = ev(f, [HANGUP + 4, CARD + 12], [0, 1], E.inOut);
  const drift = Math.sin(f / 40) * 6 * ev(f, [30, 60], [0, 1], E.inOut);

  // tiêu đề n4: "tự gọi cho khách hàng…" rồi đổi sang "chốt luôn lịch hẹn."
  const outA = ev(f, [wordAt('n4', 6) - 6, wordAt('n4', 7) - 2], [0, 1], E.in);
  const outB = ev(f, [CONNECT - 8, CONNECT + 6], [0, 1], E.in);

  const cols = ev(f, [CONNECT + 2, CONNECT + 22], [0, 1], E.out);
  const colsOut = ev(f, [HANGUP - 2, HANGUP + 12], [0, 1], E.in);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* lưới chấm rất nhạt cho chiều sâu */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(16,24,40,0.07) 1.6px, transparent 1.6px)', backgroundSize: '44px 44px', opacity: 0.8}} />

      {/* tiêu đề lúc đổ chuông — ngắt dòng cố định, mỗi lượt ≤ 5 chữ */}
      {(
        [
          {lines: [[1, 2, 3], [4, 5]], out: outA, show: f < wordAt('n4', 7) + 2},
          {lines: [[7, 8], [9, 10]], out: outB, show: f >= wordAt('n4', 7) - 4},
        ] as const
      ).map((h, k) =>
        h.show ? (
          <div key={k} style={{position: 'absolute', left: 150, top: 0, width: 980, height: 1080, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            {h.lines.map((pk, j) => (
              <VoiceText key={j} id="n4" f={f} start={VO.n4.at} pick={[...pk]} size={124} variant="rise" align="left" out={h.out} style={{lineHeight: 1.08}} />
            ))}
          </div>
        ) : null,
      )}

      {/* hai cột hội thoại */}
      {cols > 0 ? (
        <>
          <Column f={f} side="a" enter={cols} out={colsOut} />
          <Column f={f} side="c" enter={ev(f, [CONNECT + 8, CONNECT + 28], [0, 1], E.out)} out={colsOut} />
        </>
      ) : null}

      {/* iPhone */}
      <div
        style={{
          position: 'absolute',
          left: px,
          top: PY,
          translate: `${(1 - enter) * 520}px ${drift * (1 - sink)}px`,
          rotate: `${(1 - enter) * 8}deg`,
          opacity: enter * (1 - 0.72 * sink),
          scale: String(1 - 0.06 * sink),
          filter: `blur(${sink * 6}px)`,
        }}
      >
        <PhoneFrame island={<CallIsland f={f} />}>
          <CallScreen f={f} />
        </PhoneFrame>
      </div>

      {f >= CARD ? <ResultCard f={f} /> : null}
    </AbsoluteFill>
  );
};
