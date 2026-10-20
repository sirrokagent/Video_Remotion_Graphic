import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ev, keys} from '../../anim';
import {AppTile} from '../../brands';
import {C, E, FONT} from '../../theme';
import {IconCheck, PHONE, PhoneFrame} from '../../ui';
import {VoiceText} from '../text';
import {VO} from '../timeline';
import {
  CARD,
  CHECK,
  CONNECT,
  CallIsland,
  CallScreen,
  HANGUP,
  PHRASES,
  Phrase,
  SpeakerHead,
  appearAt,
  wordAt,
} from '../scenes/Call';
import {SAFE, VW} from './frame';

/**
 * Cảnh "Gọi điện" — bản dọc 9:16. Cùng mốc thời gian với Call.tsx:
 *  0–105   đổ chuông: tiêu đề n4 ở trên, iPhone lớn ở dưới (chuông 34 / 70)
 *  105     bắt máy: iPhone hạ xuống "ló" từ đáy khung, hai người nói hiện ở trên
 *  108–533 hội thoại: bong bóng xếp thành một dòng chat dọc — Sirrok bên trái
 *          (đen), khách bên phải (xám); câu mới đẩy câu cũ lên, tối đa 3 bong bóng
 *  533     cúp máy → 545 thẻ lịch "Ký hợp đồng · 9:00 sáng mai" bật lên, 551 tick xanh
 * Mọi chuyển động có easing, không ngẫu nhiên.
 */

/* ---------------- bố cục dọc ---------------- */
const PS = 1.1; // tỉ lệ iPhone
const PW = PHONE.w * PS;
const PX = (VW - PW) / 2;
const PY_DIAL = 600; // điện thoại lúc đổ chuông (tiêu đề phía trên)
const PY_CALL = 1010; // điện thoại hạ xuống, chỉ ló nửa trên (tên + avatar + đồng hồ)
const HEAD_TOP = SAFE.top + 16; // hàng hai người nói
const THREAD_BASE = 975; // đáy bong bóng mới nhất
const SLOT = 128; // mỗi bậc đẩy lên
const BUBBLE_MAX = VW - SAFE.side * 2 - 120;

/* ---------------- bong bóng: dòng chat dọc ---------------- */
const VBubble: React.FC<{f: number; p: Phrase; level: number}> = ({f, p, level}) => {
  const isA = p.side === 'a';
  const at = appearAt(p);
  const pop = ev(f, [at, at + 14], [0, 1], E.back);
  // câu mới nhất rõ nhất, câu cũ nhạt dần, bậc thứ ba tan hẳn
  const fade = level <= 1 ? 1 - 0.1 * level : level <= 2 ? 0.9 - 0.2 * (level - 1) : Math.max(0, 0.7 * (1 - (level - 2) / 0.6));
  const bg = p.hi ? C.send : isA ? C.ink : '#ECEEF1';
  const fg = isA ? C.white : C.text;
  return (
    <div
      style={{
        position: 'absolute',
        top: THREAD_BASE,
        [isA ? 'left' : 'right']: SAFE.side,
        translate: `0px -100%`,
        maxWidth: BUBBLE_MAX,
        padding: '24px 36px 26px',
        borderRadius: 42,
        [isA ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 12,
        background: bg,
        opacity: ev(f, [at, at + 8], [0, 1], E.out) * fade,
        marginTop: -level * SLOT + (1 - pop) * 30,
        scale: String((0.9 + 0.1 * pop) * (1 - 0.05 * Math.min(1, level))),
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
        size={p.hi ? 56 : 42}
        weight={p.hi ? 800 : 500}
        color={fg}
        align="left"
        style={{letterSpacing: p.hi ? '-0.03em' : '-0.01em', lineHeight: 1.18, whiteSpace: 'nowrap', flexWrap: 'nowrap'}}
      />
    </div>
  );
};

const Thread: React.FC<{f: number; out: number}> = ({f, out}) => (
  <div style={{position: 'absolute', inset: 0, opacity: 1 - out, translate: `0px ${-out * 30}px`, filter: `blur(${out * 10}px)`}}>
    {PHRASES.map((p, i) => {
      // mỗi câu mới (bất kể ai nói) đẩy các câu cũ lên một bậc — đẩy trước khi câu mới hiện để không chồng nhau
      const level = PHRASES.slice(i + 1).reduce((s, q) => s + ev(f, [appearAt(q) - 10, appearAt(q) + 4], [0, 1], E.inOut), 0);
      if (f < appearAt(p) || level >= 2.6) return null;
      return <VBubble key={i} f={f} p={p} level={level} />;
    })}
  </div>
);

/* ---------------- thẻ kết quả dọc ---------------- */
const VResultCard: React.FC<{f: number}> = ({f}) => {
  const pop = ev(f, [CARD, CARD + 14], [0, 1], E.back);
  const op = ev(f, [CARD, CARD + 8], [0, 1], E.out);
  const chk = ev(f, [CHECK, CHECK + 10], [0, 1], E.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 860,
        translate: `-50% ${-50 + (1 - pop) * 10}%`,
        scale: String(0.82 + 0.18 * pop),
        opacity: op,
        width: 760,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '64px 56px 60px',
        borderRadius: 56,
        background: C.white,
        boxShadow: '0 40px 100px rgba(16,24,40,0.20), 0 0 0 1px rgba(16,24,40,0.06)',
      }}
    >
      <div style={{position: 'relative'}}>
        <AppTile brand="calendar" size={210} />
        <div
          style={{
            position: 'absolute',
            right: -40,
            bottom: -30,
            width: 116,
            height: 116,
            borderRadius: 58,
            background: '#1E8E3E',
            border: `8px solid ${C.white}`,
            display: 'grid',
            placeItems: 'center',
            scale: String(0.6 + 0.4 * ev(f, [CHECK - 4, CHECK + 8], [0, 1], E.back)),
          }}
        >
          <IconCheck size={64} color={C.white} stroke={3} progress={chk} />
        </div>
      </div>
      <div style={{marginTop: 54, fontSize: 104, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1.05, whiteSpace: 'nowrap'}}>Ký hợp đồng</div>
      <div style={{marginTop: 18, fontSize: 56, fontWeight: 500, color: C.label, whiteSpace: 'nowrap'}}>9:00 sáng mai</div>
    </div>
  );
};

/* ---------------- cảnh ---------------- */
export const VCall: React.FC = () => {
  const f = useCurrentFrame();

  // điện thoại: trồi lên từ dưới → hạ xuống ló nửa trên khi bắt máy → chìm hẳn khi thẻ bật lên
  const enter = ev(f, [0, 30], [0, 1], E.out);
  const py = keys(f, [CONNECT - 6, CONNECT + 24], [PY_DIAL, PY_CALL], E.inOut);
  const sink = ev(f, [HANGUP + 4, CARD + 12], [0, 1], E.inOut);
  const drift = Math.sin(f / 40) * 6 * ev(f, [30, 60], [0, 1], E.inOut);

  // tiêu đề n4: "tự gọi cho khách hàng…" rồi đổi sang "chốt luôn lịch hẹn."
  const outA = ev(f, [wordAt('n4', 6) - 6, wordAt('n4', 7) - 2], [0, 1], E.in);
  const outB = ev(f, [CONNECT - 8, CONNECT + 6], [0, 1], E.in);

  const headA = ev(f, [CONNECT + 2, CONNECT + 22], [0, 1], E.out);
  const headC = ev(f, [CONNECT + 8, CONNECT + 28], [0, 1], E.out);
  const colsOut = ev(f, [HANGUP - 2, HANGUP + 12], [0, 1], E.in);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* lưới chấm rất nhạt cho chiều sâu */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(16,24,40,0.07) 1.6px, transparent 1.6px)', backgroundSize: '44px 44px', opacity: 0.8}} />

      {/* tiêu đề lúc đổ chuông — hai dòng, mỗi lượt ≤ 5 chữ */}
      {(
        [
          {lines: [[1, 2, 3], [4, 5]], out: outA, show: f < wordAt('n4', 7) + 2},
          {lines: [[7, 8], [9, 10]], out: outB, show: f >= wordAt('n4', 7) - 4 && f < CONNECT + 8},
        ] as const
      ).map((h, k) =>
        h.show ? (
          <div key={k} style={{position: 'absolute', left: SAFE.side, right: SAFE.side, top: SAFE.top + 10, height: PY_DIAL - SAFE.top - 40, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            {h.lines.map((pk, j) => (
              <VoiceText key={j} id="n4" f={f} start={VO.n4.at} pick={[...pk]} size={128} variant="rise" out={h.out} style={{lineHeight: 1.04}} />
            ))}
          </div>
        ) : null,
      )}

      {/* hàng người nói: Sirrok trái, anh Minh phải */}
      {headA > 0 && colsOut < 1 ? (
        <>
          <div style={{position: 'absolute', left: SAFE.side, top: HEAD_TOP, opacity: headA * (1 - colsOut), translate: `${(1 - headA) * -60}px ${-colsOut * 30}px`, filter: `blur(${colsOut * 10}px)`}}>
            <SpeakerHead f={f} side="a" />
          </div>
          <div style={{position: 'absolute', right: SAFE.side, top: HEAD_TOP, opacity: headC * (1 - colsOut), translate: `${(1 - headC) * 60}px ${-colsOut * 30}px`, filter: `blur(${colsOut * 10}px)`}}>
            <SpeakerHead f={f} side="c" />
          </div>
          <Thread f={f} out={colsOut} />
        </>
      ) : null}

      {/* iPhone */}
      <div
        style={{
          position: 'absolute',
          left: PX,
          top: py,
          width: PHONE.w,
          transformOrigin: 'top left',
          translate: `0px ${(1 - enter) * 700 + drift * (1 - sink) + sink * 260}px`,
          rotate: `${(1 - enter) * 6}deg`,
          opacity: enter * (1 - 0.9 * sink),
          scale: String(PS * (1 - 0.06 * sink)),
          filter: `blur(${sink * 6}px)`,
        }}
      >
        <PhoneFrame island={<CallIsland f={f} />}>
          <CallScreen f={f} />
        </PhoneFrame>
      </div>

      {/* làn mờ ở đáy để điện thoại tan vào vùng giao diện nền tảng */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 260, background: `linear-gradient(180deg, rgba(253,253,253,0), ${C.bg})`, opacity: ev(f, [CONNECT, CONNECT + 24], [0, 1], E.inOut)}} />

      {f >= CARD ? <VResultCard f={f} /> : null}
    </AbsoluteFill>
  );
};
