import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys} from '../../anim';
import {IconCheck, PHONE, PhoneFrame} from '../../ui';
import {AppTile} from '../../brands';
import {EyePair, Ghost} from '../../logo';
import {C, E, FONT} from '../../theme';
import {Kinetic, VoiceText} from '../text';
import {VO} from '../timeline';

/**
 * Cảnh Island — việc agent đang chạy hiện ngay trong "Dynamic Island" trên Mac,
 * iPhone, Android. Một nhiệm vụ duy nhất ("Gửi báo giá cho khách", 4 bước) chạy
 * đồng bộ trên cả ba máy; mỗi lần qua bước, cặp mắt chớp một nhịp. Cuối cảnh cả
 * ba cùng báo ✓ "Đã gửi báo giá".
 *
 * Mốc (frame cảnh): Mac nở đảo 24–44 · bước 2 ở 72 · "Mac" 100 · iPhone vào 106–122,
 * đảo nở 127–141 · Android vào 134–148, thẻ thả xuống 150–164 · ghép bộ ba 164–200 ·
 * bước 3 ở 212 · bước 4 ở 246 · xong ✓ ở 282 · từ ~306 đứng yên cho vệt chuyển cảnh.
 */

const N5 = VO.n5.at; // 15

/* ---------------- nhịp nhiệm vụ: dùng chung cho cả ba máy ---------------- */

const STEPS = ['Đọc email', 'Lập báo giá', 'Xuất PDF', 'Gửi'];
// mốc bắt đầu từng bước; phần tử cuối = lúc xong
const STEP_AT = [0, 72, 212, 246, 282];
const DONE = STEP_AT[4];
const TICKS = STEP_AT.slice(1);

const progressAt = (f: number) => keys(f, [36, 72, 212, 246, DONE], [0.06, 0.25, 0.5, 0.75, 1], E.inOut);
const doneAt = (f: number) => ev(f, [DONE, DONE + 10], [0, 1], E.out);
/** nhịp "đập" lúc xong: 0 → 1 → 0 */
const bumpAt = (f: number) => ev(f, [DONE, DONE + 6], [0, 1], E.out) * (1 - ev(f, [DONE + 6, DONE + 24], [0, 1], E.inOut));
/** mắt chớp mỗi lần qua bước, thêm vài nhịp nghỉ cho sống động */
const blinkOf = (f: number) => blinkAt(f, [...TICKS, 50, 101, 160, 300]);

const GRAY = '#B9BDC4'; // 10.6:1 trên đen
const TRACK = 'rgba(255,255,255,0.16)';

/** Biểu tượng bên trái: cặp mắt trắng trên đen → vòng xanh lá có dấu ✓ khi xong. */
const Badge: React.FC<{f: number; size: number}> = ({f, size}) => {
  const d = doneAt(f);
  const pop = ev(f, [DONE, DONE + 12], [0, 1], E.back);
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      <div style={{position: 'absolute', left: size / 2, top: size / 2, opacity: 1 - d, scale: String(1 - 0.4 * d)}}>
        <EyePair logoWidth={size * 1.9} color={C.white} blink={blinkOf(f)} style={{left: 0, top: 0}} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size / 2,
          background: C.ok,
          display: 'grid',
          placeItems: 'center',
          opacity: d,
          scale: String(0.4 + 0.6 * pop),
        }}
      >
        <IconCheck size={size * 0.66} color={C.white} stroke={3} progress={ev(f, [DONE + 3, DONE + 14], [0, 1], E.out)} />
      </div>
    </div>
  );
};

/** Chữ cuộn dọc: chữ cũ trôi lên, chữ mới trồi từ dưới — mỗi mốc một dòng. */
const Roll: React.FC<{f: number; at: number[]; texts: string[]; size: number; weight: number; color: string}> = ({f, at, texts, size, weight, color}) => {
  const h = Math.round(size * 1.3);
  return (
    <div style={{position: 'relative', height: h, overflow: 'hidden', fontSize: size, fontWeight: weight, color, lineHeight: `${h}px`, whiteSpace: 'nowrap'}}>
      {texts.map((t, i) => {
        const inn = i === 0 ? 0 : ev(f, [at[i], at[i] + 12], [1, 0], E.out);
        const out = i < texts.length - 1 ? ev(f, [at[i + 1], at[i + 1] + 12], [0, 1], E.out) : 0;
        const before = i > 0 && f < at[i];
        return (
          <div key={t} style={{position: 'absolute', left: 0, top: 0, opacity: before ? 0 : (1 - inn) * (1 - out), translate: `0px ${(inn - out) * h}px`}}>
            {t}
          </div>
        );
      })}
    </div>
  );
};

const Title: React.FC<{f: number; size: number}> = ({f, size}) => (
  <Roll f={f} at={[0, DONE]} texts={['Gửi báo giá cho khách', 'Đã gửi báo giá']} size={size} weight={700} color={C.white} />
);

const StepLine: React.FC<{f: number; size: number}> = ({f, size}) => (
  <Roll
    f={f}
    at={STEP_AT}
    texts={[...STEPS.map((s, i) => `${i + 1}/4 · ${s}`), '4/4 · Hoàn tất']}
    size={size}
    weight={500}
    color={GRAY}
  />
);

const Bar: React.FC<{f: number; h: number}> = ({f, h}) => {
  const p = progressAt(f);
  const d = doneAt(f);
  return (
    <div style={{position: 'relative', height: h, borderRadius: h / 2, background: TRACK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: h / 2, background: C.sparkle}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: h / 2, background: C.ok, opacity: d}} />
    </div>
  );
};

const Percent: React.FC<{f: number; size: number}> = ({f, size}) => (
  <div style={{fontSize: size, fontWeight: 700, color: C.white, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0}}>
    {Math.round(progressAt(f) * 100)}%
  </div>
);

/** Vòng tiến độ nhỏ cho đảo dạng thu gọn. */
const Ring: React.FC<{f: number; size: number}> = ({f, size}) => {
  const r = size / 2 - 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{rotate: '-90deg', flexShrink: 0}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.sparkle} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progressAt(f)} />
    </svg>
  );
};

/** Viền sáng xanh lá lan ra lúc xong. */
const glow = (f: number) => {
  const g = bumpAt(f);
  return `0 0 0 ${7 * g}px rgba(19,115,51,${0.6 * g}), 0 0 ${60 * g}px rgba(19,115,51,${0.45 * g})`;
};

/** Thân Live Activity dạng mở rộng — điện thoại (chữ ≥ 32 px để thu nhỏ 0.76 vẫn ≥ 24 px). */
const PhoneActivity: React.FC<{f: number; app: string}> = ({f, app}) => (
  <div style={{padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 10}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Badge f={f} size={50} />
      <div style={{flex: 1, fontSize: 32, fontWeight: 600, color: GRAY, whiteSpace: 'nowrap'}}>{app}</div>
      <Percent f={f} size={34} />
    </div>
    <Title f={f} size={34} />
    <Bar f={f} h={12} />
    <StepLine f={f} size={32} />
  </div>
);

/* ---------------- macOS ---------------- */

const MAC = {sw: 1000, sh: 640, bez: 18, baseW: 1220, baseH: 30};
const LID_W = MAC.sw + MAC.bez * 2;
const LID_H = MAC.sh + MAC.bez * 2;

const MacIsland: React.FC<{f: number}> = ({f}) => {
  const open = ev(f, [24, 44], [0, 1], E.back); // vượt nhẹ quá 1 → cảm giác lò xo
  const w = 200 + 420 * open;
  const h = 34 + 112 * open;
  const r = 12 + 36 * open;
  const show = ev(f, [34, 46], [0, 1], E.out);
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        translate: '-50% 0',
        width: w,
        height: h,
        borderRadius: `0 0 ${r}px ${r}px`,
        background: '#000',
        overflow: 'hidden',
        scale: String(1 + 0.05 * bumpAt(f)),
        transformOrigin: 'top center',
        boxShadow: glow(f),
      }}
    >
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 146, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', opacity: show}}>
        <Badge f={f} size={66} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6}}>
          <Title f={f} size={30} />
          <StepLine f={f} size={26} />
          <Bar f={f} h={10} />
        </div>
        <Percent f={f} size={34} />
      </div>
    </div>
  );
};

const Wifi: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round">
    <path d="M3 9.5a13 13 0 0 1 18 0M6.2 13a8.5 8.5 0 0 1 11.6 0M9.4 16.4a4 4 0 0 1 5.2 0" />
    <circle cx="12" cy="19.6" r="1.3" fill={C.ink} stroke="none" />
  </svg>
);

const Battery: React.FC<{w: number}> = ({w}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
    <div style={{width: w, height: w * 0.5, borderRadius: 6, border: `2.5px solid ${C.ink}`, padding: 2}}>
      <div style={{width: '78%', height: '100%', borderRadius: 2, background: C.ink}} />
    </div>
    <div style={{width: 3, height: w * 0.2, borderRadius: 2, background: C.ink}} />
  </div>
);

const Mac: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'relative', width: LID_W, height: LID_H + MAC.baseH}}>
    <div
      style={{
        position: 'absolute',
        inset: `0 0 ${MAC.baseH}px 0`,
        borderRadius: '34px 34px 8px 8px',
        background: '#111113',
        boxShadow: 'inset 0 0 0 3px #3A3A3D, 0 40px 90px rgba(16,24,40,0.18)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: MAC.bez,
          top: MAC.bez,
          width: MAC.sw,
          height: MAC.sh,
          borderRadius: 14,
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 18% 85%, rgba(35,110,238,0.16), transparent 45%), radial-gradient(circle at 85% 30%, rgba(0,94,251,0.10), transparent 40%), linear-gradient(160deg, #F4F7FD 0%, #FDFDFD 60%, #EEF3FC 100%)',
        }}
      >
        {/* thanh menu */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 46,
            background: 'rgba(255,255,255,0.72)',
            borderBottom: `1px solid ${C.hairline}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            fontSize: 24,
            fontWeight: 500,
            color: C.ink,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{position: 'relative', width: 30, height: 27}}>
              <Ghost width={30} />
            </div>
            <span style={{fontWeight: 700}}>Sirrok</span>
            <span>Tệp</span>
            <span>Sửa</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Wifi size={26} />
            <Battery w={38} />
            <span>Th 4 · 9:41</span>
          </div>
        </div>
        {/* dock */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            translate: '-50% 0',
            display: 'flex',
            gap: 14,
            padding: 12,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.6)',
            border: `1px solid ${C.hairline}`,
          }}
        >
          <div style={{width: 64, height: 64, borderRadius: 16, background: C.ink, position: 'relative'}}>
            <EyePair logoWidth={110} color={C.white} blink={blinkOf(f)} style={{left: 32, top: 32}} />
          </div>
          {(['gmail', 'sheets', 'calendar', 'drive', 'zalo'] as const).map((b) => (
            <AppTile key={b} brand={b} size={64} />
          ))}
        </div>
        <MacIsland f={f} />
      </div>
    </div>
    {/* chân máy */}
    <div
      style={{
        position: 'absolute',
        left: (LID_W - MAC.baseW) / 2,
        bottom: 0,
        width: MAC.baseW,
        height: MAC.baseH,
        borderRadius: '4px 4px 26px 26px',
        background: 'linear-gradient(180deg, #E6E8EC 0%, #C3C7CE 70%, #9EA3AB 100%)',
        boxShadow: '0 24px 40px rgba(16,24,40,0.16)',
      }}
    >
      <div style={{position: 'absolute', left: '50%', top: 0, translate: '-50% 0', width: 180, height: 10, borderRadius: '0 0 10px 10px', background: '#AEB2B9'}} />
    </div>
  </div>
);

/* ---------------- iPhone ---------------- */

const IosIsland: React.FC<{f: number}> = ({f}) => {
  const compact = ev(f, [116, 124], [0, 1], E.out);
  const open = ev(f, [127, 141], [0, 1], E.back);
  const w = 160 + 140 * compact + (440 - 300) * open;
  const h = 46 + (232 - 46) * open;
  const r = 23 + (54 - 23) * Math.min(1, open);
  const showCompact = compact * (1 - ev(f, [127, 133], [0, 1], E.out));
  const showOpen = ev(f, [134, 144], [0, 1], E.out);
  return (
    <div
      style={{
        position: 'absolute',
        top: PHONE.bezel + 18 - 8 * Math.min(1, open),
        left: '50%',
        translate: '-50% 0',
        width: w,
        height: h,
        borderRadius: r,
        background: '#000',
        overflow: 'hidden',
        scale: String(1 + 0.05 * bumpAt(f)),
        transformOrigin: 'top center',
        boxShadow: glow(f),
      }}
    >
      {/* dạng thu gọn: mắt bên trái, vòng tiến độ bên phải */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 46, opacity: showCompact}}>
        <EyePair logoWidth={62} color={C.white} blink={blinkOf(f)} style={{left: 38, top: 23}} />
        <div style={{position: 'absolute', right: 12, top: 8}}>
          <Ring f={f} size={30} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 440, opacity: showOpen}}>
        <PhoneActivity f={f} app="Sirrok Agent" />
      </div>
    </div>
  );
};

const IPhone: React.FC<{f: number}> = ({f}) => (
  <PhoneFrame island={<IosIsland f={f} />}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: 'radial-gradient(ellipse at 50% 100%, rgba(35,110,238,0.16), transparent 70%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', color: C.ink}}>
      <div style={{fontSize: 32, fontWeight: 600, color: C.label}}>Thứ Tư, 7 tháng 10</div>
      <div style={{fontSize: 170, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1}}>9:41</div>
    </div>
    {[0, 1].map((i) => (
      <div
        key={i}
        style={{position: 'absolute', bottom: 70, [i ? 'right' : 'left']: 52, width: 86, height: 86, borderRadius: 43, background: 'rgba(0,0,0,0.08)'}}
      />
    ))}
    <div style={{position: 'absolute', bottom: 18, left: '50%', translate: '-50% 0', width: 160, height: 7, borderRadius: 4, background: C.ink}} />
  </PhoneFrame>
);

/* ---------------- Android (tự vẽ: lỗ camera, thanh trạng thái kiểu Material) ---------------- */

const AND = {w: 480, h: 1000, r: 62, bezel: 12};

const AndroidLive: React.FC<{f: number}> = ({f}) => {
  const chip = ev(f, [144, 154], [0, 1], E.back);
  const open = ev(f, [150, 164], [0, 1], E.back);
  const show = ev(f, [156, 166], [0, 1], E.out);
  return (
    <>
      {/* chip "đang chạy" trên thanh trạng thái */}
      <div
        style={{
          position: 'absolute',
          left: 118,
          top: 22,
          width: 92 * chip,
          height: 38,
          borderRadius: 19,
          background: C.beta,
          overflow: 'hidden',
          opacity: Math.min(1, chip * 2),
        }}
      >
        <EyePair logoWidth={60} color={C.white} blink={blinkOf(f)} style={{left: 46, top: 19}} />
      </div>
      {/* thẻ thông báo trực tiếp thả xuống từ trên */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          top: 76,
          height: 232 * open,
          borderRadius: 36,
          background: '#000',
          overflow: 'hidden',
          opacity: Math.min(1, open * 3),
          scale: String(1 + 0.05 * bumpAt(f)),
          transformOrigin: 'top center',
          boxShadow: glow(f),
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: 432, opacity: show}}>
          <PhoneActivity f={f} app="Sirrok · đang chạy" />
        </div>
      </div>
    </>
  );
};

const Android: React.FC<{f: number}> = ({f}) => (
  <div
    style={{
      position: 'relative',
      width: AND.w,
      height: AND.h,
      borderRadius: AND.r,
      background: '#202124',
      padding: AND.bezel,
      boxShadow: '0 40px 90px rgba(16,24,40,0.18), inset 0 0 0 3px #45474B',
      fontFamily: FONT,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: AND.r - AND.bezel,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #F3F6FB 0%, #FDFDFD 45%, #E9EFF9 100%)',
      }}
    >
      {/* thanh trạng thái */}
      <div style={{position: 'absolute', top: 24, left: 36, fontSize: 26, fontWeight: 600, color: C.ink}}>9:41</div>
      <div style={{position: 'absolute', top: 28, right: 32, display: 'flex', gap: 10, alignItems: 'center'}}>
        <Wifi size={24} />
        <svg width="22" height="22" viewBox="0 0 22 22">
          <path d="M21 1v20H1z" fill={C.ink} />
        </svg>
        <div style={{width: 13, height: 24, borderRadius: 3, border: `2.5px solid ${C.ink}`, padding: 1.5, display: 'flex', alignItems: 'flex-end'}}>
          <div style={{width: '100%', height: '75%', borderRadius: 1, background: C.ink}} />
        </div>
      </div>
      {/* lỗ camera */}
      <div style={{position: 'absolute', top: 24, left: '50%', translate: '-50% 0', width: 30, height: 30, borderRadius: 15, background: '#000'}} />
      {/* màn hình chính */}
      <div style={{position: 'absolute', left: 40, top: 360, color: C.ink}}>
        <div style={{fontSize: 140, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1}}>9:41</div>
        <div style={{fontSize: 32, fontWeight: 600, color: C.label, marginTop: 10}}>Thứ 4, 7 thg 10</div>
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, bottom: 150, display: 'flex', justifyContent: 'space-between'}}>
        {(['gmail', 'calendar', 'drive', 'telegram'] as const).map((b) => (
          <AppTile key={b} brand={b} size={84} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, bottom: 56, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.9)', border: `1.5px solid ${C.hairline}`}} />
      <div style={{position: 'absolute', bottom: 18, left: '50%', translate: '-50% 0', width: 130, height: 6, borderRadius: 3, background: C.ink}} />
      <AndroidLive f={f} />
    </div>
  </div>
);

/* ---------------- dàn cảnh ---------------- */

/** Đặt một thiết bị theo tâm ngang + mép trên, phóng quanh mép trên-giữa. */
const Place: React.FC<{cx: number; top: number; s: number; w: number; dx?: number; o?: number; children: React.ReactNode}> = ({cx, top, s, w, dx = 0, o = 1, children}) => (
  <div style={{position: 'absolute', left: cx - w / 2, top, width: w, translate: `${dx}px 0px`, scale: String(s), transformOrigin: 'top center', opacity: o}}>{children}</div>
);

// bố cục bộ ba
const TRI = {
  ios: {cx: 360, top: 140, s: 0.76},
  mac: {cx: 960, top: 210, s: 0.9},
  and: {cx: 1560, top: 140, s: 0.76},
  labelTop: 930,
};

export const Island: React.FC = () => {
  const f = useCurrentFrame();

  const push1 = ev(f, [106, 122], [0, 1], E.inOut); // Mac → iPhone
  const push2 = ev(f, [134, 148], [0, 1], E.inOut); // iPhone → Android
  const asm = ev(f, [164, 196], [0, 1], E.inOut); // Android về vị trí bộ ba
  const macIn = ev(f, [170, 202], [0, 1], E.out);
  const iosIn = ev(f, [174, 204], [0, 1], E.out);
  const drift = ev(f, [196, 306], [0, 1], E.inOut); // máy quay tiến rất nhẹ

  // pha 1: cận cảnh mép trên MacBook
  const macZoom = 1.75 + 0.1 * (1 - ev(f, [0, 44], [0, 1], E.out));

  // Android: từ vị trí đơn → vị trí bộ ba
  const andCx = 600 + (TRI.and.cx - 600) * asm;
  const andTop = 40 + (TRI.and.top - 40) * asm;
  const andS = 1 + (TRI.and.s - 1) * asm;

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* ---- pha 1: macOS ---- */}
      {f < 126 && (
        <AbsoluteFill style={{translate: `${-push1 * 1920}px 0px`}}>
          <Place cx={960} top={40} s={macZoom} w={LID_W}>
            <Mac f={f} />
          </Place>
          <div style={{position: 'absolute', left: 0, right: 0, top: 560}}>
            <VoiceText id="n5" f={f} start={N5} size={112} pick={[0, 1, 2, 3, 4]} replace={{4: 'ngay.'}} out={ev(f, [86, 96], [0, 1], E.in)} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 530}}>
            <VoiceText id="n5" f={f} start={N5} size={180} pick={[10]} replace={{10: 'Mac'}} variant="scale" />
          </div>
        </AbsoluteFill>
      )}

      {/* ---- pha 3 + bộ ba: Mac ở giữa, phía sau ---- */}
      {f >= 166 && (
        <AbsoluteFill style={{scale: String(1 + 0.035 * drift)}}>
          <Place cx={TRI.mac.cx} top={TRI.mac.top + (1 - macIn) * 120} s={TRI.mac.s + 0.08 * (1 - macIn)} w={LID_W} o={macIn}>
            <Mac f={f} />
          </Place>
          <Place cx={TRI.ios.cx - (1 - iosIn) * 640} top={TRI.ios.top} s={TRI.ios.s} w={PHONE.w} o={iosIn}>
            <IPhone f={f} />
          </Place>
          <Place cx={andCx} top={andTop} s={andS} w={AND.w}>
            <Android f={f} />
          </Place>
          {/* nhãn dưới từng máy */}
          {[
            {t: 'iPhone', cx: TRI.ios.cx, at: 200},
            {t: 'Mac', cx: TRI.mac.cx, at: 204},
            {t: 'Android', cx: TRI.and.cx, at: 208},
          ].map((l) => (
            <div key={l.t} style={{position: 'absolute', top: TRI.labelTop, left: l.cx - 300, width: 600}}>
              <Kinetic text={l.t} f={f} start={l.at} size={64} variant="rise" by="char" stagger={1.6} />
            </div>
          ))}
        </AbsoluteFill>
      )}

      {/* ---- pha 2: iPhone đơn ---- */}
      {f >= 100 && f < 150 && (
        <AbsoluteFill style={{translate: `${(1 - push1) * 1920 - push2 * 1920}px 0px`}}>
          <Place cx={1320} top={40} s={1} w={PHONE.w}>
            <IPhone f={f} />
          </Place>
          <div style={{position: 'absolute', left: 160, width: 700, top: 440}}>
            <VoiceText id="n5" f={f} start={N5} size={180} pick={[11]} replace={{11: 'iPhone'}} variant="scale" />
          </div>
        </AbsoluteFill>
      )}

      {/* ---- pha 3: Android đơn, rồi lùi về vị trí bộ ba ---- */}
      {f >= 128 && f < 166 && (
        <AbsoluteFill style={{translate: `${(1 - push2) * 1920}px 0px`}}>
          <Place cx={andCx} top={andTop} s={andS} w={AND.w}>
            <Android f={f} />
          </Place>
        </AbsoluteFill>
      )}
      {f >= 128 && f < 200 && (
        <div style={{position: 'absolute', left: 1000, width: 800, top: 440, translate: `${(1 - push2) * 1920}px 0px`}}>
          <VoiceText id="n5" f={f} start={N5} size={180} pick={[12]} replace={{12: 'Android'}} variant="scale" out={ev(f, [164, 184], [0, 1], E.in)} />
        </div>
      )}
    </AbsoluteFill>
  );
};
