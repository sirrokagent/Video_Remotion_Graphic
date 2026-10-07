import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, ev} from '../../anim';
import {AppTile} from '../../brands';
import {ClickRipple} from '../../cursor';
import {EyePair} from '../../logo';
import {C, E, FONT} from '../../theme';
import {CARD, Composer, ORDER_B, Platform, SOCIAL_MARKS, Stamp, TILE} from '../scenes/Social';
import {VoiceText} from '../text';
import {VO} from '../timeline';
import {SAFE, VW} from './frame';

/**
 * Cảnh Social — bản DỌC 1080×1920. Giữ nguyên mọi mốc thời gian của bản ngang
 * (SOCIAL_MARKS: gõ chữ 22, dựng ảnh 46–82, bấm Đăng 71, toả thẻ 80, đóng dấu 122…212).
 *   - Nhịp 1–2: tiêu đề ở mép trên vùng an toàn, khung soạn bài phóng to chiếm giữa khung.
 *   - Nhịp 3: khung soạn bài thu về tâm lưới, 6 thẻ nền tảng toả ra thành lưới 2×3
 *     (xếp hình chữ "S" để hai nét mắt nhảy đóng dấu theo đường ngắn nhất).
 * Dùng lại Composer / Platform / Stamp của bản ngang — chỉ đổi vị trí & tỉ lệ.
 */

const S = VO.n6.at;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ———————————————————————————— khung soạn bài ————————————————————————————
/** Tỉ lệ phóng khung soạn bài (860 → ~946 px, vừa lề 60 px hai bên). */
const CK = 1.1;
const COMP = {x: (VW - CARD.w * CK) / 2, y: 540};
/** Đổi toạ độ trong khung soạn bài gốc (bản ngang) sang toạ độ khung dọc. */
const cardPt = (x: number, y: number) => ({x: COMP.x + (x - CARD.x) * CK, y: COMP.y + (y - CARD.y) * CK});

// ———————————————————————————— lưới 6 thẻ ————————————————————————————
/** Thẻ giữ nguyên cỡ gốc 280×560 để chữ mockup ≥ 24 px. */
const TK = 1;
const COL_GAP = 300; // khoảng cách tâm hai cột
const ROW_Y = [650, 1240]; // tâm hai hàng — lưới nằm gọn trong vùng an toàn
const GRID_C = {x: VW / 2, y: (ROW_Y[0] + ROW_Y[1]) / 2};

/**
 * Vị trí thẻ thứ i (theo thứ tự đóng dấu). Hàng trên trái → phải, hàng dưới phải → trái
 * để nét mắt đi từ TikTok (trên phải) xuống LinkedIn (dưới phải) một bước ngắn.
 * Cột hai bên hơi xoay & thấp hơn chút — giữ dáng "xoè quạt" của bản ngang.
 */
const gridPos = (i: number) => {
  const row = i < 3 ? 0 : 1;
  const col = row === 0 ? i : 5 - i; // 0..2
  const d = col - 1;
  return {x: GRID_C.x + d * COL_GAP, y: ROW_Y[row], rot: d * 2};
};

/**
 * Chỗ hai nét mắt dừng để đóng dấu: ngay TRÊN chỗ con dấu (cạnh dưới thẻ) — khung dọc
 * không còn chỗ trống dưới thẻ, nên mắt "ấn" xuống rồi nhảy đi, con dấu nở ra dưới đó.
 */
const stampPos = (i: number) => {
  const p = gridPos(i);
  const r = (p.rot * Math.PI) / 180;
  const d = (TILE.h / 2 - 6) * TK;
  return {x: p.x - Math.sin(r) * d, y: p.y + Math.cos(r) * d};
};

/** Tâm khung soạn bài (nơi thẻ bay ra) — trùng tâm ô ảnh. */
const COMPOSER_C = cardPt(CARD.x + CARD.w / 2, CARD.y + 380);

const Grid: React.FC<{f: number}> = ({f}) => {
  const {stamps, fanOut} = SOCIAL_MARKS;
  return (
    <>
      {ORDER_B.map((b, i) => {
        // cùng công thức nhịp bay ra như bản ngang
        const s0 = fanOut + [2, 1, 0, 0, 1, 2][i] * 3 + (i >= 3 ? 1 : 0);
        if (f < s0) return null;
        const p = ev(f, [s0, s0 + 28], [0, 1], E.out);
        const tp = gridPos(i);
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
              scale: String(lerp(0.4, 1, p) * TK),
              opacity: ev(f, [s0, s0 + 8], [0, 1], E.out),
              zIndex: 10 - i,
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

/** Hai nét mắt nhảy từ thẻ này sang thẻ khác, chớp một cái là đóng dấu (y như bản ngang). */
const Hopper: React.FC<{f: number}> = ({f}) => {
  const {stamps} = SOCIAL_MARKS;
  if (f < 104 || f > 232) return null;
  let pos = stampPos(0);
  for (let i = 1; i < stamps.length; i++) {
    if (f > stamps[i - 1] + 2) {
      const a = stampPos(i - 1);
      const b = stampPos(i);
      const t = ev(f, [stamps[i - 1] + 3, stamps[i] - 3], [0, 1], E.inOut);
      pos = {x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - Math.sin(t * Math.PI) * 60};
    }
  }
  const last = stamps[stamps.length - 1];
  const opacity = ev(f, [104, 114], [0, 1], E.out) * (1 - ev(f, [last + 4, last + 16], [0, 1], E.in));
  const lift = ev(f, [last + 4, last + 16], [0, 60], E.in) + (1 - ev(f, [104, 116], [0, 1], E.out)) * -50;
  return (
    <EyePair
      logoWidth={140}
      blink={blinkAt(f, stamps.map((s) => s - 3))}
      color={C.ink}
      style={{left: pos.x, top: pos.y - 2 - lift, opacity, zIndex: 20}}
    />
  );
};

const HEAD = 118; // cỡ tiêu đề khung dọc
const HEAD_TOP = SAFE.top + 16;

export const VSocial: React.FC = () => {
  const f = useCurrentFrame();
  const composerIn = ev(f, [0, 18], [0, 1], E.out);
  const exit = ev(f, [78, 100], [0, 1], E.inOut);
  const drift = ev(f, [100, 330], [1, 1.012], E.inOut);
  const click = cardPt(CARD.x + CARD.w - CARD.pad - 80, CARD.y + 672);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {/* tiêu đề — cùng một vùng trên cùng cho cả ba nhịp */}
      <div style={{position: 'absolute', left: 0, right: 0, top: HEAD_TOP}}>
        {f < 46 ? <VoiceText id="n6" f={f} start={S} size={HEAD} pick={[1, 2]} replace={{2: 'bài'}} out={ev(f, [34, 43], [0, 1], E.in)} /> : null}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: HEAD_TOP}}>
        {f >= 40 && f < 74 ? <VoiceText id="n6" f={f} start={S} size={HEAD} pick={[3, 4]} replace={{4: 'hình'}} out={ev(f, [62, 71], [0, 1], E.in)} /> : null}
      </div>
      {/* nhịp 3: một dòng để lưới 6 thẻ cỡ thật vừa vùng an toàn */}
      <div style={{position: 'absolute', left: 0, right: 0, top: HEAD_TOP - 6}}>
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
          {/* khung soạn bài gốc đặt ở (CARD.x, CARD.y) — dời & phóng sang khung dọc */}
          <div style={{position: 'absolute', left: COMP.x, top: COMP.y, scale: String(CK), transformOrigin: '0 0'}}>
            <div style={{position: 'absolute', left: -CARD.x, top: -CARD.y}}>
              <Composer f={f} />
            </div>
          </div>
        </div>
      ) : null}
      <ClickRipple f={f} at={SOCIAL_MARKS.postClick} x={click.x} y={click.y} />

      <div style={{position: 'absolute', inset: 0, scale: String(drift), transformOrigin: `${GRID_C.x}px ${GRID_C.y}px`}}>
        <Grid f={f} />
        <Hopper f={f} />
      </div>
    </AbsoluteFill>
  );
};
