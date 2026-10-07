import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev, keys, typed} from '../../anim';
import {AppTile, BrandKey} from '../../brands';
import {ClickRipple} from '../../cursor';
import {EyePair, Ghost, LOGO_H, Sparkle} from '../../logo';
import {C, E, FONT} from '../../theme';
import {IconCheck} from '../../ui';
import {VoiceText} from '../text';
import {VO} from '../timeline';

/**
 * Cảnh Social (330 frame) — "Nó viết bài, dựng hình, và đăng lên mọi nền tảng."
 *   ~20–60   khung soạn bài, chữ tự gõ, con trỏ là hai nét mắt
 *   ~45–92   ảnh tự dựng trong bài: thẻ xanh có ghost, hiện dần kiểu khuếch tán/điểm ảnh
 *   ~70      bấm "Đăng" → bài toả ra 6 nền tảng, mỗi nơi đóng dấu "Đã đăng ✓" theo nhịp chớp mắt
 *   310–330  tĩnh để vệt mắt chuyển cảnh.
 * Mọi chuyển động có easing, không ngẫu nhiên thật.
 */

const S = VO.n6.at; // câu n6 bắt đầu ở frame 15

/** "Ngẫu nhiên" tất định. */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const COPY = 'Ra mắt Sirrok Agent — trợ lý AI làm mọi việc thay bạn.';
const TYPE_START = 22;
const TYPE_PER = 0.62; // ~34 frame cho cả câu → gõ xong ≈ 56

// ———————————————————————————— mốc thời gian (để đặt SFX) ————————————————————————————
export const SOCIAL_MARKS = {
  composerIn: 2,
  typeStart: TYPE_START,
  imageGen: [46, 82] as const,
  postClick: 71,
  fanOut: 80, // 6 thẻ bay ra, cách nhau 3 frame
  stamps: [122, 140, 158, 176, 194, 212],
};

// ———————————————————————————— khung soạn bài ————————————————————————————
const CARD = {w: 860, x: 530, y: 236, pad: 36};
const IMG = {w: CARD.w - CARD.pad * 2, h: 360};

/** Ảnh thương hiệu do agent "dựng": nền xanh, ghost trắng, sao ✦. `gen` 0 → 1 = mức đã hiện. */
const BrandImage: React.FC<{w: number; h: number; gen?: number; label?: number; radius?: number; vertical?: boolean}> = ({
  w,
  h,
  gen = 1,
  label,
  radius = 18,
  vertical = false,
}) => {
  const gw = vertical ? w * 0.46 : Math.min(h * 0.62, w * 0.3);
  const cols = 22;
  const rows = Math.round((cols * h) / w);
  const cw = w / cols;
  const ch = h / rows;
  const cells: React.ReactNode[] = [];
  if (gen < 1) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        // hiện từ giữa ra ngoài, xen chút nhiễu
        const dx = (c + 0.5) / cols - 0.5;
        const dy = (r + 0.5) / rows - 0.5;
        const d = Math.min(1, Math.hypot(dx * 1.2, dy) * 1.5);
        const t0 = 0.12 + 0.5 * d + 0.3 * rnd(i);
        const o = 1 - ev(gen, [t0, t0 + 0.12], [0, 1], E.out);
        if (o <= 0.001) continue;
        const l = 18 + 38 * rnd(i + 911);
        cells.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c * cw,
              top: r * ch,
              width: cw + 0.6,
              height: ch + 0.6,
              opacity: o,
              background: `hsl(${212 + 14 * rnd(i + 37)}, ${55 + 30 * rnd(i + 5)}%, ${l}%)`,
            }}
          />,
        );
      }
    }
  }
  const blur = (1 - ev(gen, [0.25, 1], [0, 1], E.out)) * 22;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', flexShrink: 0}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #003FB8 0%, #0B57D0 45%, #1E63E6 100%)',
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
          scale: String(1 + blur * 0.004),
        }}
      >
        {/* vầng sáng nhẹ sau ghost */}
        <div
          style={{
            position: 'absolute',
            left: vertical ? w * 0.4 : label ? w * 0.27 : w / 2,
            top: vertical ? h * 0.36 : h / 2,
            width: gw * 2.2,
            height: gw * 2.2,
            translate: '-50% -50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 65%)',
          }}
        />
        <Ghost
          width={gw}
          bodyColor={C.white}
          eyeColor={C.send}
          style={{
            left: (vertical ? w * 0.4 : label ? w * 0.27 : w / 2) - gw / 2,
            top: (vertical ? h * 0.36 : h / 2) - (gw * LOGO_H) / 200,
          }}
        />
        <Sparkle
          size={gw * 0.32}
          color={C.white}
          style={{left: (vertical ? w * 0.4 : label ? w * 0.27 : w / 2) + gw * 0.42, top: (vertical ? h * 0.36 : h / 2) - gw * 0.62}}
        />
        {label ? (
          <div
            style={{
              position: 'absolute',
              left: w * 0.5,
              top: h / 2,
              translate: '0 -50%',
              fontFamily: FONT,
              color: C.white,
              lineHeight: 1.05,
            }}
          >
            <div style={{fontSize: label, fontWeight: 800, letterSpacing: '-0.035em'}}>Sirrok</div>
            <div style={{fontSize: label * 0.62, fontWeight: 500, marginTop: label * 0.12}}>Agent · Beta</div>
          </div>
        ) : null}
      </div>
      {cells}
    </div>
  );
};

/** Ảnh đại diện: tròn đen, hai nét mắt trắng. */
const Avatar: React.FC<{size: number; blink?: number}> = ({size, blink = 0}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: '50%', background: C.ink, flexShrink: 0}}>
    <EyePair logoWidth={size * 1.25} color={C.white} blink={blink} style={{left: size / 2, top: size / 2}} />
  </div>
);

const Composer: React.FC<{f: number}> = ({f}) => {
  const shown = typed(COPY, f, TYPE_START, TYPE_PER);
  const typing = f >= TYPE_START && shown.length < COPY.length;
  const caretBlink = blinkAt(f, [60, 84]);
  const gen = ev(f, [46, 82], [0, 1], E.inOut);
  const imgIn = ev(f, [40, 50], [0, 1], E.out);
  const press = keys(f, [68, 71, 77], [1, 0.9, 1], E.out);
  const btnReady = ev(f, [58, 66], [0, 1], E.out);
  const targets: BrandKey[] = ['facebook', 'instagram', 'tiktok', 'linkedin', 'x', 'youtube'];
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        padding: CARD.pad,
        boxSizing: 'border-box',
        background: C.white,
        borderRadius: 36,
        boxShadow: '0 30px 80px rgba(0,0,0,0.12), 0 0 0 1.5px #E3E3E3',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* đầu thẻ */}
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Avatar size={64} blink={caretBlink} />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.02em'}}>Sirrok Agent</div>
          <div style={{fontSize: 24, fontWeight: 500, color: C.muted}}>{f < 70 ? 'Đang soạn bài…' : 'Sẵn sàng đăng'}</div>
        </div>
      </div>
      {/* chữ bài viết + con trỏ hai nét mắt */}
      <div style={{fontSize: 38, fontWeight: 500, color: C.text, lineHeight: 1.36, minHeight: 38 * 1.36 * 2, letterSpacing: '-0.01em'}}>
        {shown}
        <span style={{position: 'relative', display: 'inline-block', width: 34, height: 38, verticalAlign: '-6px'}}>
          <EyePair
            logoWidth={64}
            blink={typing ? 0 : caretBlink}
            color={C.send}
            style={{left: 18, top: 20, opacity: f < 76 ? 1 : 1 - ev(f, [76, 82], [0, 1])}}
          />
        </span>
      </div>
      {/* ô ảnh: chỗ trống → ảnh tự dựng */}
      <div style={{position: 'relative', width: IMG.w, height: IMG.h, borderRadius: 18, background: C.phoneBackdrop, overflow: 'hidden'}}>
        <Sparkle size={56} color={C.sparkle} style={{left: IMG.w / 2 - 28, top: IMG.h / 2 - 28, opacity: 0.55 * (1 - imgIn)}} />
        <div style={{position: 'absolute', inset: 0, opacity: imgIn}}>
          <BrandImage w={IMG.w} h={IMG.h} gen={gen} label={84} />
        </div>
        {/* vệt quét sáng khi đang dựng */}
        {gen > 0 && gen < 1 ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 160,
              left: lerp(-160, IMG.w, ev(f, [46, 82], [0, 1], E.inOut)),
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
        ) : null}
      </div>
      {/* chân thẻ: các nền tảng đích + nút Đăng */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {targets.map((b, i) => (
            <AppTile key={b} brand={b} size={52} shadow={false} style={{marginLeft: i ? -10 : 0, boxShadow: '0 0 0 3px #FFFFFF'}} />
          ))}
          <div style={{fontSize: 26, fontWeight: 500, color: C.label, marginLeft: 18}}>6 nền tảng</div>
        </div>
        <div
          style={{
            background: btnReady > 0.5 ? C.send : C.activePill,
            color: btnReady > 0.5 ? C.white : C.muted,
            fontSize: 30,
            fontWeight: 800,
            padding: '14px 40px',
            borderRadius: 999,
            scale: String(press),
            boxShadow: btnReady > 0.5 ? `0 10px 26px rgba(11,87,208,${0.35 * btnReady})` : undefined,
          }}
        >
          Đăng
        </div>
      </div>
    </div>
  );
};

// ———————————————————————————— 6 thẻ nền tảng ————————————————————————————
const TILE = {w: 280, h: 560};
const SHORT = 'Ra mắt Sirrok Agent — trợ lý AI làm mọi việc.';

/** Định dạng số kiểu Việt: 1.248 · 18,6K */
const fmt = (n: number) => (n >= 10000 ? `${(Math.round(n / 100) / 10).toLocaleString('de-DE')}K` : Math.round(n).toLocaleString('de-DE'));
const tick = (f: number, s: number, to: number) => ev(f, [s + 2, s + 92], [0, to], E.out);

const Heart: React.FC<{size: number; color: string; fill?: string}> = ({size, color, fill = 'none'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2.2} strokeLinejoin="round">
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />
  </svg>
);
const Bubble: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round">
    <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
  </svg>
);
const Share: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
    <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />
  </svg>
);
const Eye: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Head: React.FC<{name: string; sub: string; dark?: boolean}> = ({name, sub, dark}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Avatar size={44} />
    <div style={{display: 'flex', flexDirection: 'column', lineHeight: 1.15}}>
      <div style={{fontSize: 24, fontWeight: 800, color: dark ? C.white : C.text, letterSpacing: '-0.02em'}}>{name}</div>
      <div style={{fontSize: 24, fontWeight: 500, color: dark ? '#E8EAED' : C.muted}}>{sub}</div>
    </div>
  </div>
);

const Txt: React.FC<{children: React.ReactNode; lines?: number}> = ({children, lines = 3}) => (
  <div
    style={{
      fontSize: 24,
      fontWeight: 500,
      lineHeight: 1.3,
      color: C.text,
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const Stat: React.FC<{icon: React.ReactNode; value: string; color?: string}> = ({icon, value, color = C.label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums'}}>
    {icon}
    {value}
  </div>
);

const IW = TILE.w - 32; // bề rộng nội dung trong thẻ

/** Mỗi nền tảng một bố cục gợi đúng "chất" của nó — không sao chép giao diện thật. */
const Platform: React.FC<{brand: BrandKey; f: number; s: number}> = ({brand, f, s}) => {
  const pad: React.CSSProperties = {padding: '18px 16px 52px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1};
  switch (brand) {
    case 'facebook':
      return (
        <div style={pad}>
          <Head name="Sirrok" sub="Vừa xong" />
          <Txt>{SHORT}</Txt>
          <BrandImage w={IW} h={200} radius={10} label={0} />
          <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between'}}>
            <Stat icon={<div style={{width: 28, height: 28, borderRadius: '50%', background: '#1877F2', display: 'grid', placeItems: 'center'}}><Heart size={18} color="#fff" fill="#fff" /></div>} value={fmt(tick(f, s, 1248))} />
            <Stat icon={<Bubble size={26} color={C.label} />} value={fmt(tick(f, s, 96))} />
          </div>
        </div>
      );
    case 'instagram':
      return (
        <div style={{...pad, padding: 0, gap: 12}}>
          <div style={{padding: '18px 16px 0'}}>
            <Head name="sirrok.ai" sub="Tài trợ" />
          </div>
          <BrandImage w={TILE.w} h={TILE.w} radius={0} />
          <div style={{padding: '0 16px', display: 'flex', gap: 16}}>
            <Heart size={32} color="#E1306C" fill="#E1306C" />
            <Bubble size={32} color={C.text} />
            <Share size={32} color={C.text} />
          </div>
          <div style={{padding: '0 16px 52px', marginTop: 'auto', fontSize: 24, fontWeight: 800, color: C.text, fontVariantNumeric: 'tabular-nums'}}>
            {fmt(tick(f, s, 2304))} lượt thích
          </div>
        </div>
      );
    case 'tiktok':
      return (
        <div style={{position: 'absolute', inset: 0}}>
          <BrandImage w={TILE.w} h={TILE.h} radius={0} vertical />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
          <div style={{position: 'absolute', right: 12, bottom: 170, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
            {[
              {i: <Heart size={34} color="#fff" fill="#fff" />, v: fmt(tick(f, s, 18600))},
              {i: <Bubble size={34} color="#fff" />, v: fmt(tick(f, s, 412))},
              {i: <Share size={34} color="#fff" />, v: fmt(tick(f, s, 1730))},
            ].map((r, k) => (
              <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 24, fontWeight: 800, color: C.white, fontVariantNumeric: 'tabular-nums'}}>
                {r.i}
                {r.v}
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 16, bottom: 56, right: 70, color: C.white}}>
            <div style={{fontSize: 24, fontWeight: 800}}>@sirrok</div>
            <div style={{fontSize: 24, fontWeight: 500}}>Trợ lý AI làm mọi việc</div>
          </div>
        </div>
      );
    case 'linkedin':
      return (
        <div style={pad}>
          <Head name="Sirrok" sub="Công ty · 1 ngày" />
          <Txt lines={2}>{SHORT}</Txt>
          <BrandImage w={IW} h={170} radius={6} label={0} />
          <div style={{fontSize: 24, fontWeight: 500, color: C.muted}}>#AI #Agent #Sirrok</div>
          <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between'}}>
            <Stat icon={<div style={{width: 28, height: 28, borderRadius: '50%', background: '#0A66C2', display: 'grid', placeItems: 'center'}}><IconCheck size={18} color="#fff" stroke={3} /></div>} value={fmt(tick(f, s, 842))} />
            <Stat icon={<Share size={26} color={C.label} />} value={fmt(tick(f, s, 57))} />
          </div>
        </div>
      );
    case 'x':
      return (
        <div style={pad}>
          <Head name="Sirrok" sub="@sirrok" />
          <Txt lines={3}>{SHORT}</Txt>
          <BrandImage w={IW} h={190} radius={16} label={0} />
          <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between'}}>
            <Stat icon={<Heart size={26} color={C.label} />} value={fmt(tick(f, s, 3120))} />
            <Stat icon={<Eye size={26} color={C.label} />} value={fmt(tick(f, s, 48200))} />
          </div>
        </div>
      );
    default:
      // youtube
      return (
        <div style={{...pad, padding: 0}}>
          <div style={{position: 'relative'}}>
            <BrandImage w={TILE.w} h={158} radius={0} />
            <div style={{position: 'absolute', left: TILE.w / 2 - 34, top: 79 - 24, width: 68, height: 48, borderRadius: 14, background: '#FF0000', display: 'grid', placeItems: 'center'}}>
              <svg width={22} height={22} viewBox="0 0 24 24"><path d="M6 3.5v17L21 12z" fill="#fff" /></svg>
            </div>
            <div style={{position: 'absolute', right: 10, bottom: 10, background: 'rgba(0,0,0,0.8)', color: C.white, fontSize: 24, fontWeight: 800, padding: '0 8px', borderRadius: 6}}>
              0:90
            </div>
          </div>
          <div style={{padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12}}>
            <div style={{fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1.25, letterSpacing: '-0.02em'}}>Sirrok Agent — làm mọi việc thay bạn</div>
            <Head name="Sirrok" sub="Kênh chính thức" />
            <div style={{alignSelf: 'flex-start', background: C.ink, color: C.white, fontSize: 24, fontWeight: 800, padding: '8px 22px', borderRadius: 999}}>Đăng ký</div>
          </div>
          <div style={{padding: '0 16px 52px', marginTop: 'auto'}}>
            <Stat icon={<Eye size={28} color={C.label} />} value={`${fmt(tick(f, s, 12400))} lượt xem`} />
          </div>
        </div>
      );
  }
};

const ORDER_B: BrandKey[] = ['facebook', 'instagram', 'tiktok', 'linkedin', 'x', 'youtube'];
const FAN_C = {x: 960, y: 618};
const fanPos = (i: number) => {
  const d = i - 2.5;
  return {x: FAN_C.x + d * 292, y: FAN_C.y + 5.6 * d * d, rot: d * 2.4};
};
/** Chỗ hai nét mắt dừng để đóng dấu (ngay dưới giữa cạnh dưới thẻ), toạ độ màn hình. */
const stampPos = (i: number) => {
  const p = fanPos(i);
  const r = (p.rot * Math.PI) / 180;
  const d = TILE.h / 2 + 64; // ngay dưới con dấu, ngoài thẻ
  return {x: p.x - Math.sin(r) * d, y: p.y + Math.cos(r) * d};
};
const COMPOSER_C = {x: CARD.x + CARD.w / 2, y: CARD.y + 380};

const Stamp: React.FC<{f: number; s: number}> = ({f, s}) => {
  if (f < s) return null;
  const t = ev(f, [s, s + 12], [0, 1], E.back);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: TILE.h,
        translate: '-50% -50%',
        scale: String(0.4 + 0.6 * t),
        opacity: ev(f, [s, s + 5], [0, 1], E.out),
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        background: C.white,
        color: C.ok,
        fontFamily: FONT,
        fontSize: 26,
        fontWeight: 800,
        padding: '10px 22px 10px 18px',
        borderRadius: 999,
        boxShadow: `0 0 0 3px ${C.ok}, 0 10px 24px rgba(19,115,51,0.22)`,
      }}
    >
      <IconCheck size={30} color={C.ok} stroke={3} progress={ev(f, [s + 3, s + 12], [0, 1], E.out)} />
      Đã đăng
    </div>
  );
};

const Fan: React.FC<{f: number}> = ({f}) => {
  const {stamps, fanOut} = SOCIAL_MARKS;
  return (
    <>
      {ORDER_B.map((b, i) => {
        const s0 = fanOut + [2, 1, 0, 0, 1, 2][i] * 3 + (i >= 3 ? 1 : 0);
        if (f < s0) return null;
        const p = ev(f, [s0, s0 + 28], [0, 1], E.out);
        const tp = fanPos(i);
        const x = lerp(COMPOSER_C.x, tp.x, p);
        const y = lerp(COMPOSER_C.y, tp.y, p);
        const lit = ev(f, [stamps[i], stamps[i] + 10], [0, 1], E.out);
        return (
          <div
            key={b}
            style={{
              position: 'absolute',
              left: x - TILE.w / 2,
              top: y - TILE.h / 2,
              width: TILE.w,
              height: TILE.h,
              rotate: `${tp.rot * p}deg`,
              scale: String(lerp(0.4, 1, p)),
              opacity: ev(f, [s0, s0 + 8], [0, 1], E.out),
              // thẻ giữa nằm trên, thẻ ngoài trượt ra từ phía sau
              zIndex: 10 - Math.round(Math.abs(i - 2.5) * 2),
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 28,
                overflow: 'hidden',
                background: C.white,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: `0 24px 60px rgba(0,0,0,0.13), 0 0 0 ${1.5 + 1.5 * lit}px ${lit > 0.01 ? `rgba(19,115,51,${0.25 + 0.5 * lit})` : '#E3E3E3'}`,
              }}
            >
              <Platform brand={b} f={f} s={stamps[i]} />
            </div>
            <AppTile brand={b} size={68} style={{position: 'absolute', right: -20, top: -24}} />
            <Stamp f={f} s={stamps[i]} />
          </div>
        );
      })}
    </>
  );
};

/** Hai nét mắt nhảy từ thẻ này sang thẻ khác, chớp một cái là đóng dấu. */
const Hopper: React.FC<{f: number}> = ({f}) => {
  const {stamps} = SOCIAL_MARKS;
  if (f < 104 || f > 232) return null;
  let pos = stampPos(0);
  for (let i = 1; i < stamps.length; i++) {
    if (f > stamps[i - 1] + 2) {
      const a = stampPos(i - 1);
      const b = stampPos(i);
      const t = ev(f, [stamps[i - 1] + 3, stamps[i] - 3], [0, 1], E.inOut);
      // cung nhảy nhỏ lên trên
      pos = {x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - Math.sin(t * Math.PI) * 70};
    }
  }
  const last = stamps[stamps.length - 1];
  const opacity = ev(f, [104, 114], [0, 1], E.out) * (1 - ev(f, [last + 4, last + 16], [0, 1], E.in));
  const lift = ev(f, [last + 4, last + 16], [0, 60], E.in) + (1 - ev(f, [104, 116], [0, 1], E.out)) * -50;
  return (
    <EyePair
      logoWidth={150}
      blink={blinkAt(f, stamps.map((s) => s - 3))}
      color={C.ink}
      style={{left: pos.x, top: pos.y - 2 - lift, opacity, zIndex: 5}}
    />
  );
};

export const Social: React.FC = () => {
  const f = useCurrentFrame();
  const composerIn = ev(f, [0, 18], [0, 1], E.out);
  const exit = ev(f, [78, 100], [0, 1], E.inOut);
  // cả cụm thẻ trôi rất chậm về phía người xem sau khi toả ra
  const drift = ev(f, [100, 330], [1, 1.02], E.inOut);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {/* tiêu đề — cùng một vùng phía trên cho cả ba nhịp */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 70}}>
        {f < 46 ? <VoiceText id="n6" f={f} start={S} size={84} pick={[1, 2]} replace={{2: 'bài'}} out={ev(f, [34, 43], [0, 1], E.in)} /> : null}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70}}>
        {f >= 40 && f < 74 ? <VoiceText id="n6" f={f} start={S} size={84} pick={[3, 4]} replace={{4: 'hình'}} out={ev(f, [62, 71], [0, 1], E.in)} /> : null}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70}}>
        {f >= 68 ? <VoiceText id="n6" f={f} start={S} size={84} pick={[6, 7, 8, 9, 10]} /> : null}
      </div>

      {f < 102 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: composerIn * (1 - ev(f, [86, 100], [0, 1], E.out)),
            translate: `0 ${(1 - composerIn) * 60}px`,
            scale: String((0.94 + 0.06 * composerIn) * lerp(1, 0.36, exit)),
            transformOrigin: `${COMPOSER_C.x}px ${COMPOSER_C.y}px`,
          }}
        >
          <Composer f={f} />
        </div>
      ) : null}
      {/* bấm nút Đăng */}
      <ClickRipple f={f} at={SOCIAL_MARKS.postClick} x={CARD.x + CARD.w - CARD.pad - 80} y={CARD.y + 672} />

      <div style={{position: 'absolute', inset: 0, scale: String(drift), transformOrigin: `${FAN_C.x}px ${FAN_C.y}px`}}>
        <Fan f={f} />
        <Hopper f={f} />
      </div>
    </AbsoluteFill>
  );
};
