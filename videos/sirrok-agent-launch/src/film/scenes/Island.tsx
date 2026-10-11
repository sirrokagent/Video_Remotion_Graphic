import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {blinkAt, ev} from '../../anim';
import {IconCheck, PHONE, PhoneFrame} from '../../ui';
import {AppTile} from '../../brands';
import {Ghost, GhostMark} from '../../logo';
import {C, E, FONT} from '../../theme';
import {Kinetic, VoiceText} from '../text';
import {VO} from '../timeline';
import {Mascot, MascotState} from '../mascot';

/**
 * Cảnh Island — việc agent đang chạy hiện ngay trong "Dynamic Island" trên Mac,
 * iPhone, Android. Một nhiệm vụ duy nhất ("Gửi báo giá cho khách", 4 bước) chạy
 * đồng bộ trên cả ba máy. Nhịp tiến độ (theo yêu cầu khách): chạy đều tới giữa →
 * KHỰNG lại ở trạng thái "Đang chờ…" (vàng hổ phách, thanh lấp lánh, ghost liếc mắt)
 * → bứt tốc chạy nhanh tới 100% → cả ba cùng báo ✓ "Đã gửi báo giá".
 *
 * Mốc (frame cảnh): Mac nở đảo 24–44 · bước 2 ở 72 · "Mac" 100 · iPhone vào 106–122,
 * đảo thu gọn 108, nở 117–131 · Android vào 137–150, chip 146, thẻ thả xuống 152–166 ·
 * ghép bộ ba 168–206 · bước 3 ở 176 ·
 * KHỰNG (pending) 205–255 · BỨT TỐC 255–282 (bước 4 ở 268) · xong ✓ ở 282 ·
 * từ ~306 đứng yên cho vệt chuyển cảnh.
 */

export const N5 = VO.n5.at; // 15

/* ---------------- nhịp nhiệm vụ: dùng chung cho cả ba máy ---------------- */

const STEPS = ['Đọc email', 'Lập báo giá', 'Xuất PDF', 'Gửi'];
/** tiến độ bắt đầu chạy */
const RUN = 30;
/** bắt đầu khựng — tiến độ đứng yên ở giữa, trạng thái "Đang chờ…" */
export const STALL = 205;
/** hết chờ — bứt tốc */
export const BURST = 255;
/** xong ✓ */
export const DONE = 282;
// mốc bắt đầu từng bước; phần tử cuối = lúc xong
const STEP_AT = [0, 72, 176, 268, DONE];
const TICKS = STEP_AT.slice(1);
/** tiến độ lúc khựng */
const MID = 0.5;

// chạy đều tới giữa rồi KHỰNG: cuối đoạn vẫn còn vận tốc → dừng gắt ở STALL (có easing, không linear)
const RUN_EASE = Easing.bezier(0.3, 0.12, 0.65, 0.75);
// bứt tốc: lấy đà rồi tăng tốc mạnh, chạm 100% gọn gàng
const BURST_EASE = Easing.bezier(0.72, 0, 0.18, 1);

const progressAt = (f: number) =>
  f < BURST ? ev(f, [RUN, STALL], [0.04, MID], RUN_EASE) : ev(f, [BURST, DONE], [MID, 1], BURST_EASE);
/** 0 → 1: đang ở trạng thái chờ (vào nhanh, ra ngay trước lúc bứt tốc) */
const pendAt = (f: number) => ev(f, [STALL, STALL + 8], [0, 1], E.out) * (1 - ev(f, [BURST - 3, BURST + 3], [0, 1], E.out));
/** nhịp thở của trạng thái chờ 0 → 1 → 0, chu kỳ 20 frame (hình sin, mượt) */
const pulseAt = (f: number) => 0.5 - 0.5 * Math.cos(((f - STALL) / 20) * Math.PI * 2);
/** 0 → 1: đang bứt tốc (tắt khi xong) */
const burstAt = (f: number) => ev(f, [BURST, BURST + 4], [0, 1], E.out) * (1 - ev(f, [DONE - 2, DONE + 6], [0, 1], E.out));
const doneAt = (f: number) => ev(f, [DONE, DONE + 10], [0, 1], E.out);
/** nhịp "đập" 0 → 1 → 0 quanh mốc t */
const bump = (f: number, t: number, up = 6, down = 18) => ev(f, [t, t + up], [0, 1], E.out) * (1 - ev(f, [t + up, t + up + down], [0, 1], E.inOut));
/** nhịp "đập" lúc xong */
const bumpAt = (f: number) => bump(f, DONE);
/** mắt (ghost trên dock) chớp mỗi lần qua bước, thêm vài nhịp nghỉ cho sống động */
const blinkOf = (f: number) => blinkAt(f, [...TICKS, 50, 101, 140, 300]);

/** Trạng thái mascot trong đảo: làm → chờ (liếc mắt) → làm (bứt tốc) → xong. */
const mascotAt = (f: number): {state: MascotState; since: number} =>
  f >= DONE ? {state: 'done', since: DONE} : f >= BURST ? {state: 'work', since: BURST} : f >= STALL ? {state: 'pending', since: STALL} : {state: 'work', since: RUN};

const GRAY = '#B9BDC4'; // 10.6:1 trên đen
const TRACK = 'rgba(255,255,255,0.16)';
/** vàng hổ phách — trạng thái chờ. Trên đen 11.4:1 */
export const AMBER = '#FFB020';
/** vàng hổ phách đậm cho nền trắng — 5.0:1 */
const AMBER_INK = '#B45309';

/** Ghost trong đảo: mascot thân trắng mắt đen; nảy nhẹ mỗi lần qua bước. */
const Badge: React.FC<{f: number; size: number}> = ({f, size}) => {
  const m = mascotAt(f);
  const hop = Math.max(...TICKS.slice(0, 3).map((t) => bump(f, t, 4, 12)));
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center'}}>
      <div style={{translate: `0px ${-size * 0.1 * hop}px`, scale: String(1 + 0.06 * hop)}}>
        <Mascot size={size * 0.9} state={m.state} f={f} since={m.since} body={C.white} eyes={C.ink} />
      </div>
    </div>
  );
};

/** Ba chấm chạy lần lượt — "đang chờ". */
const Dots: React.FC<{f: number; color: string; size: number}> = ({f, color, size}) => (
  <span style={{display: 'inline-flex', gap: size * 0.12, marginLeft: size * 0.08}}>
    {[0, 1, 2].map((i) => {
      const ph = (((f - STALL - i * 4) % 18) + 18) % 18;
      const o = 0.3 + 0.7 * ev(ph, [0, 5], [0, 1], E.out) * (1 - ev(ph, [6, 14], [0, 1], E.inOut));
      return <span key={i} style={{color, opacity: o}}>.</span>;
    })}
  </span>
);

/** Chỉ báo chờ: chấm hổ phách thở + "Đang chờ" + ba chấm chạy. */
const PendingLabel: React.FC<{f: number; size: number; color?: string}> = ({f, size, color = AMBER}) => {
  const p = pulseAt(f);
  const d = size * 0.42;
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.32, color}}>
      <span style={{position: 'relative', width: d, height: d, flexShrink: 0}}>
        <span style={{position: 'absolute', inset: 0, borderRadius: d, background: color, opacity: 0.35 * (1 - p), scale: String(1 + 0.9 * p)}} />
        <span style={{position: 'absolute', inset: 0, borderRadius: d, background: color}} />
      </span>
      <span style={{fontWeight: 600}}>
        Đang chờ
        <Dots f={f} color={color} size={size} />
      </span>
    </span>
  );
};

/** Chữ cuộn dọc: chữ cũ trôi lên, chữ mới trồi từ dưới — mỗi mốc một dòng. */
const Roll: React.FC<{f: number; at: number[]; texts: React.ReactNode[]; size: number; weight: number; color: string; dur?: number}> = ({
  f,
  at,
  texts,
  size,
  weight,
  color,
  dur = 12,
}) => {
  const h = Math.round(size * 1.3);
  return (
    <div style={{position: 'relative', height: h, overflow: 'hidden', fontSize: size, fontWeight: weight, color, lineHeight: `${h}px`, whiteSpace: 'nowrap'}}>
      {texts.map((t, i) => {
        const inn = i === 0 ? 0 : ev(f, [at[i], at[i] + dur], [1, 0], E.out);
        const out = i < texts.length - 1 ? ev(f, [at[i + 1], at[i + 1] + dur], [0, 1], E.out) : 0;
        const before = i > 0 && f < at[i];
        if (before || (out >= 1 && i < texts.length - 1)) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: (1 - inn) * (1 - out), translate: `0px ${(inn - out) * h}px`}}>
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

/** Dòng bước: …3/4 Xuất PDF → Đang chờ… (khựng) → 3/4 → 4/4 Gửi → Hoàn tất (cuộn nhanh khi bứt tốc). */
const StepLine: React.FC<{f: number; size: number}> = ({f, size}) => (
  <Roll
    f={f}
    at={[0, STEP_AT[1], STEP_AT[2], STALL, BURST, STEP_AT[3], DONE]}
    texts={[
      `1/4 · ${STEPS[0]}`,
      `2/4 · ${STEPS[1]}`,
      `3/4 · ${STEPS[2]}`,
      <PendingLabel key="p" f={f} size={size} />,
      `3/4 · ${STEPS[2]}`,
      `4/4 · ${STEPS[3]}`,
      <span key="d" style={{color: '#4CD07D', fontWeight: 600}}>
        4/4 · Hoàn tất
      </span>,
    ]}
    size={size}
    weight={500}
    color={GRAY}
    dur={f >= BURST ? 8 : 12}
  />
);

/** Thanh tiến độ: xanh khi chạy · hổ phách + vệt sáng lướt khi chờ · đầu sáng có đuôi khi bứt tốc · xanh lá khi xong. */
const Bar: React.FC<{f: number; h: number}> = ({f, h}) => {
  const p = progressAt(f);
  const pend = pendAt(f);
  const pulse = pulseAt(f);
  const bst = burstAt(f);
  const d = doneAt(f);
  // vệt sáng lướt qua phần đã chạy, mỗi 26 frame một lượt (có easing)
  const ph = (((f - STALL) % 26) + 26) % 26;
  const sweep = ev(ph, [0, 22], [-0.35, 1.15], E.inOut);
  const pct = `${p * 100}%`;
  const knob = h * 1.9;
  return (
    <div style={{position: 'relative', height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: h / 2, background: TRACK, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: pct, borderRadius: h / 2, background: C.sparkle}} />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: pct, borderRadius: h / 2, background: AMBER, opacity: pend * (0.82 + 0.18 * pulse)}} />
        {pend > 0 && (
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: pct, borderRadius: h / 2, overflow: 'hidden', opacity: pend}}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sweep * 100}%`,
                width: '35%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))',
              }}
            />
          </div>
        )}
        {/* đuôi sáng khi bứt tốc */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(${pct} - 46%)`,
            width: '46%',
            background: 'linear-gradient(90deg, rgba(120,170,255,0), rgba(170,205,255,0.95))',
            opacity: bst,
          }}
        />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: pct, borderRadius: h / 2, background: '#1E9E4F', opacity: d}} />
      </div>
      {/* đầu thanh: chấm hổ phách thở khi chờ, đầu trắng phát sáng khi bứt tốc */}
      <div
        style={{
          position: 'absolute',
          left: pct,
          top: h / 2,
          width: knob,
          height: knob,
          translate: '-50% -50%',
          borderRadius: knob,
          background: bst > pend ? C.white : AMBER,
          opacity: Math.max(pend, bst),
          scale: String(0.75 + 0.25 * (pend * pulse + bst)),
          boxShadow:
            bst > pend
              ? `0 0 ${h * 1.6}px ${h * 0.5}px rgba(140,185,255,${0.9 * bst})`
              : `0 0 ${h * 1.4}px ${h * 0.3 * pulse}px rgba(255,176,32,${0.75 * pend})`,
        }}
      />
    </div>
  );
};

/** Phần trăm → hổ phách khi chờ → vòng xanh lá có dấu ✓ khi xong. */
const Percent: React.FC<{f: number; size: number}> = ({f, size}) => {
  const d = doneAt(f);
  const pop = ev(f, [DONE, DONE + 12], [0, 1], E.back);
  const pend = pendAt(f);
  const disc = size * 1.45;
  return (
    <div style={{position: 'relative', flexShrink: 0, display: 'grid', placeItems: 'center'}}>
      <div
        style={{
          fontSize: size,
          fontWeight: 700,
          color: pend > 0.5 ? AMBER : C.white,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          opacity: 1 - d,
          scale: String(1 - 0.5 * d + 0.08 * burstAt(f)),
        }}
      >
        {Math.round(progressAt(f) * 100)}%
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          translate: '-50% -50%',
          width: disc,
          height: disc,
          borderRadius: disc,
          background: '#1E9E4F',
          display: 'grid',
          placeItems: 'center',
          opacity: d,
          scale: String(0.4 + 0.6 * pop),
        }}
      >
        <IconCheck size={disc * 0.7} color={C.white} stroke={3.2} progress={ev(f, [DONE + 3, DONE + 14], [0, 1], E.out)} />
      </div>
    </div>
  );
};

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

/** Viền đảo: hổ phách thở nhẹ khi chờ, sáng xanh lá lan ra lúc xong. */
const glow = (f: number) => {
  const g = bumpAt(f);
  const a = pendAt(f) * (0.35 + 0.65 * pulseAt(f));
  return [
    `0 0 0 ${2 + 3 * a}px rgba(255,176,32,${0.85 * a})`,
    `0 0 ${34 * a}px rgba(255,176,32,${0.45 * a})`,
    `0 0 0 ${7 * g}px rgba(30,158,79,${0.6 * g})`,
    `0 0 ${60 * g}px rgba(30,158,79,${0.45 * g})`,
  ].join(', ');
};

/** Đảo "giật" nhẹ: khựng ở STALL, lấy đà rồi bật lúc bứt tốc, đập lúc xong. */
const kick = (f: number) => 1 - 0.02 * bump(f, STALL, 3, 9) - 0.03 * bump(f, BURST - 4, 4, 4) + 0.035 * bump(f, BURST, 5, 14) + 0.05 * bumpAt(f);

/** Thân Live Activity dạng mở rộng — điện thoại (chữ ≥ 32 px để thu nhỏ 0.76 vẫn ≥ 24 px). */
const PhoneActivity: React.FC<{f: number; app: string}> = ({f, app}) => (
  <div style={{padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 10}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Badge f={f} size={50} />
      <div style={{flex: 1, fontSize: 32, fontWeight: 600, color: GRAY, whiteSpace: 'nowrap'}}>{app}</div>
      <Percent f={f} size={34} />
    </div>
    <Title f={f} size={32} />
    <Bar f={f} h={12} />
    <StepLine f={f} size={32} />
  </div>
);

/* ---------------- macOS ---------------- */

export const MAC = {sw: 1000, sh: 640, bez: 18, baseW: 1220, baseH: 30};
export const LID_W = MAC.sw + MAC.bez * 2;
export const LID_H = MAC.sh + MAC.bez * 2;

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
        scale: String(kick(f)),
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

/** Cửa sổ Sirrok trên Mac: 4 bước, tích dần theo đúng nhịp của đảo (chỉ hiện ở bộ ba). */
const TaskWindow: React.FC<{f: number}> = ({f}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: 178,
      translate: '-50% 0',
      width: 540,
      borderRadius: 22,
      background: C.white,
      border: `1px solid ${C.hairline}`,
      boxShadow: '0 24px 60px rgba(16,24,40,0.14)',
      overflow: 'hidden',
    }}
  >
    <div style={{height: 40, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', background: '#F6F7F9', borderBottom: `1px solid ${C.hairline}`}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
      ))}
    </div>
    <div style={{padding: '18px 30px 22px', display: 'flex', flexDirection: 'column', gap: 10}}>
      <div style={{fontSize: 30, fontWeight: 800, color: C.ink, marginBottom: 4}}>Gửi báo giá cho khách</div>
      {STEPS.map((s, i) => {
        const end = STEP_AT[i + 1];
        const doneK = ev(f, [end, end + (f >= BURST ? 6 : 10)], [0, 1], E.out);
        const active = f >= STEP_AT[i] && f < end;
        // bước đang chạy lúc khựng → vòng hổ phách thở + nhãn "Đang chờ…"
        const pend = active ? pendAt(f) : 0;
        const pulse = pulseAt(f);
        return (
          <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 500, color: active || doneK > 0 ? C.text : C.muted}}>
            <div
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: 18,
                border: `2.5px solid ${doneK > 0 ? C.ok : pend > 0.5 ? AMBER_INK : active ? C.sparkle : C.field}`,
                background: doneK > 0 ? C.ok : 'transparent',
                display: 'grid',
                placeItems: 'center',
                scale: String(1 + 0.15 * bump(f, end, 5, 9)),
                boxShadow: pend > 0 ? `0 0 0 ${6 * pulse * pend}px rgba(224,138,0,${0.28 * (1 - pulse) * pend})` : 'none',
              }}
            >
              {pend > 0 && <div style={{position: 'absolute', width: 14, height: 14, borderRadius: 7, background: AMBER_INK, opacity: pend * (0.55 + 0.45 * pulse)}} />}
              <IconCheck size={24} color={C.white} stroke={3} progress={doneK} />
            </div>
            {s}
            {pend > 0 && (
              <div style={{marginLeft: 'auto', fontSize: 26, opacity: pend, translate: `${(1 - pend) * 16}px 0px`}}>
                <PendingLabel f={f} size={26} color={AMBER_INK} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export const Mac: React.FC<{f: number; win?: boolean}> = ({f, win = false}) => (
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
            padding: '0 64px',
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
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Battery w={38} />
            <span>9:41</span>
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
            <GhostMark size={44} body={C.white} eyes={C.ink} blink={blinkOf(f)} style={{position: 'absolute', translate: '-50% -50%', left: 32, top: 33}} />
          </div>
          {(['gmail', 'sheets', 'calendar', 'drive', 'zalo'] as const).map((b) => (
            <AppTile key={b} brand={b} size={64} />
          ))}
        </div>
        {win && <TaskWindow f={f} />}
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
  const compact = ev(f, [108, 116], [0, 1], E.out);
  const open = ev(f, [117, 131], [0, 1], E.back);
  const w = 160 + 140 * compact + (440 - 300) * open;
  const h = 46 + (232 - 46) * open;
  const r = 23 + (54 - 23) * Math.min(1, open);
  const showCompact = compact * (1 - ev(f, [117, 122], [0, 1], E.out));
  const showOpen = ev(f, [123, 133], [0, 1], E.out);
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
        scale: String(kick(f)),
        transformOrigin: 'top center',
        boxShadow: glow(f),
      }}
    >
      {/* dạng thu gọn: mắt bên trái, vòng tiến độ bên phải */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 46, opacity: showCompact}}>
        <div style={{position: 'absolute', left: 38, top: 23, translate: '-50% -50%'}}>
          <Mascot size={32} state={mascotAt(f).state} f={f} since={mascotAt(f).since} body={C.white} eyes={C.ink} />
        </div>
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

export const IPhone: React.FC<{f: number}> = ({f}) => (
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

export const AND = {w: 480, h: 1000, r: 62, bezel: 12};

/** Màu chip trạng thái Android: xanh khi chạy → hổ phách khi chờ → xanh lá khi xong. */
const chipBg = (f: number) => {
  const a = Math.round(pendAt(f) * 100);
  const g = Math.round(doneAt(f) * 100);
  return `color-mix(in srgb, #1E9E4F ${g}%, color-mix(in srgb, #E08A00 ${a}%, ${C.beta}))`;
};

const AndroidLive: React.FC<{f: number}> = ({f}) => {
  const chip = ev(f, [146, 156], [0, 1], E.back);
  const open = ev(f, [152, 166], [0, 1], E.back);
  const show = ev(f, [158, 168], [0, 1], E.out);
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
          background: chipBg(f),
          overflow: 'hidden',
          opacity: Math.min(1, chip * 2),
        }}
      >
        <div style={{position: 'absolute', left: 46, top: 19, translate: '-50% -50%'}}>
          <Mascot size={28} state={mascotAt(f).state} f={f} since={mascotAt(f).since} body={C.white} eyes={C.ink} />
        </div>
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
          scale: String(kick(f)),
          transformOrigin: 'top center',
          boxShadow: glow(f),
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: 432, opacity: show}}>
          <PhoneActivity f={f} app="Sirrok" />
        </div>
      </div>
    </>
  );
};

export const Android: React.FC<{f: number}> = ({f}) => (
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
export const Place: React.FC<{cx: number; top: number; s: number; w: number; dx?: number; o?: number; children: React.ReactNode}> = ({cx, top, s, w, dx = 0, o = 1, children}) => (
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
  const push2 = ev(f, [137, 150], [0, 1], E.inOut); // iPhone → Android
  const asm = ev(f, [168, 198], [0, 1], E.inOut); // Android về vị trí bộ ba
  const macIn = ev(f, [172, 204], [0, 1], E.out);
  const iosIn = ev(f, [176, 206], [0, 1], E.out);
  const drift = ev(f, [196, 306], [0, 1], E.inOut); // máy quay tiến rất nhẹ

  // pha 1: cận cảnh mép trên MacBook
  const macZoom = 1.6 + 0.1 * (1 - ev(f, [0, 44], [0, 1], E.out));

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
      {f >= 168 && (
        <AbsoluteFill style={{scale: String(1 + 0.035 * drift)}}>
          <Place cx={TRI.mac.cx} top={TRI.mac.top + (1 - macIn) * 120} s={TRI.mac.s + 0.08 * (1 - macIn)} w={LID_W} o={macIn}>
            <Mac f={f} win />
          </Place>
          <Place cx={TRI.ios.cx - (1 - iosIn) * 640} top={TRI.ios.top} s={TRI.ios.s} w={PHONE.w} o={iosIn}>
            <IPhone f={f} />
          </Place>
          <Place cx={andCx} top={andTop} s={andS} w={AND.w}>
            <Android f={f} />
          </Place>
          {/* nhãn dưới từng máy */}
          {[
            {t: 'iPhone', cx: TRI.ios.cx, at: 202},
            {t: 'Mac', cx: TRI.mac.cx, at: 206},
            {t: 'Android', cx: TRI.and.cx, at: 210},
          ].map((l) => (
            <div key={l.t} style={{position: 'absolute', top: TRI.labelTop, left: l.cx - 300, width: 600}}>
              <Kinetic text={l.t} f={f} start={l.at} size={64} variant="rise" by="char" stagger={1.6} />
            </div>
          ))}
        </AbsoluteFill>
      )}

      {/* ---- pha 2: iPhone đơn ---- */}
      {f >= 100 && f < 152 && (
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
      {f >= 128 && f < 168 && (
        <AbsoluteFill style={{translate: `${(1 - push2) * 1920}px 0px`}}>
          <Place cx={andCx} top={andTop} s={andS} w={AND.w}>
            <Android f={f} />
          </Place>
        </AbsoluteFill>
      )}
      {f >= 128 && f < 200 && (
        <div style={{position: 'absolute', left: 1000, width: 800, top: 440, translate: `${(1 - push2) * 1920}px 0px`}}>
          <VoiceText id="n5" f={f} start={N5} size={180} pick={[12]} replace={{12: 'Android'}} variant="scale" out={ev(f, [162, 174], [0, 1], E.in)} />
        </div>
      )}
    </AbsoluteFill>
  );
};
