import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {FONT} from '../theme';

/**
 * "Khởi đầu vuông" — người đạp chiếc xe bánh VUÔNG. Theo thời gian (Tuần 1 → Tuần 4 → Tháng 3 → Tháng 12)
 * bánh xe mòn tròn dần, người bớt gồng, xe chạy nhanh hơn; Tháng 12 bánh tròn phát sáng xanh, có "ĐÀ".
 * Kết: "KHỞI ĐẦU VUÔNG. / CỨ ĐẠP TIẾP." rồi xe lao ra khỏi khung.
 *
 * Bánh xe là siêu elip |x|^n + |y|^n = R^n (n lớn = vuông, n = 2 = tròn). Độ cao trục bánh khi lăn
 * = hàm tựa của hình theo hướng xuống → bánh vuông làm xe nảy đúng vật lý.
 * Tất định — không Math.random, không Date.now. Mốc thời gian dùng chung với scripts/make_music_square.py.
 */

export const SQ_FPS = 30;
export const SQ_DUR = 660; // 22 giây
const W = 1080;
const H = 1920;
const GROUND = 1330;
const R = 128; // bán kính bánh

// ---------- lịch trình (giây) — giữ khớp với scripts/make_music_square.py ----------
export const STAGES = [
  {at: 2.4, label: 'WEEK 1', n: 40, color: [229, 57, 47], omega: 1.5, strain: 1},
  {at: 7.2, label: 'WEEK 4', n: 6.5, color: [240, 122, 42], omega: 2.4, strain: 0.75},
  {at: 11.4, label: 'MONTH 3', n: 3.0, color: [236, 164, 128], omega: 3.4, strain: 0.4},
  {at: 15.0, label: 'MONTH 12', n: 2.0, color: [120, 182, 255], omega: 5.6, strain: 0},
];
const MORPH = 0.9; // giây biến hình bánh quanh mỗi mốc
const FINAL_TEXT = 19.2;
const RIDE_OFF = 20.2;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** giá trị theo giai đoạn, chuyển mượt quanh mỗi mốc */
const staged = (t: number, pick: (s: (typeof STAGES)[number]) => number, log = false) => {
  let v = pick(STAGES[0]);
  for (let i = 1; i < STAGES.length; i++) {
    const k = smooth(STAGES[i].at - MORPH * 0.6, STAGES[i].at + MORPH * 0.4, t);
    const b = pick(STAGES[i]);
    v = log ? Math.exp(lerp(Math.log(v), Math.log(b), k)) : lerp(v, b, k);
  }
  return v;
};
export const exponentAt = (t: number) => staged(t, (s) => s.n, true);
const colorAt = (t: number) => [0, 1, 2].map((c) => Math.round(staged(t, (s) => s.color[c]))) as [number, number, number];
const strainAt = (t: number) => staged(t, (s) => s.strain);
/** tốc độ quay bánh (rad/s): chậm lúc đầu, lao đi ở cuối */
export const omegaAt = (t: number) => staged(t, (s) => s.omega) * (0.35 + 0.65 * smooth(0, 1.6, t)) + 6 * easeIn(clamp((t - RIDE_OFF) / 1.4));

/** góc quay tích luỹ — tích phân từng bước 1/120 s (tất định) */
const PHI: number[] = [0];
const DT = 1 / 120;
for (let i = 1; i <= Math.ceil((SQ_DUR / SQ_FPS) / DT) + 2; i++) PHI.push(PHI[i - 1] + omegaAt(i * DT) * DT);
export const phiAt = (t: number) => {
  const x = t / DT;
  const i = Math.floor(x);
  return lerp(PHI[i], PHI[i + 1], x - i);
};

// ---------- hình bánh ----------
const SAMPLES = 160;
const shapePoints = (n: number): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = (i / SAMPLES) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // siêu elip, chuẩn hoá để diện tích nhìn tương đương: góc vuông nằm trong R*1.0
    const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push([x * R, y * R]);
  }
  return pts;
};
/** độ cao trục bánh so với mặt đất khi bánh quay góc rot */
export const supportHeight = (n: number, rot: number) => {
  let best = 0;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  for (const [x, y] of shapePoints(n)) {
    const yy = x * s + y * c; // toạ độ y sau khi quay (hướng xuống)
    if (yy > best) best = yy;
  }
  return best;
};

// ---------- vẽ ----------
type Pt = [number, number];
const ik = (hip: Pt, foot: Pt, l1: number, l2: number, forward: number): Pt => {
  const dx = foot[0] - hip[0];
  const dy = foot[1] - hip[1];
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const off = Math.acos(cosA) * forward;
  return [hip[0] + Math.cos(a + off) * l1, hip[1] + Math.sin(a + off) * l1];
};

const limb = (ctx: CanvasRenderingContext2D, a: Pt, b: Pt, w: number, col: string, hi: string) => {
  ctx.lineCap = 'round';
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
  // vệt sáng mặt trên cho cảm giác khối
  ctx.strokeStyle = hi;
  ctx.lineWidth = w * 0.32;
  ctx.beginPath();
  ctx.moveTo(a[0] - w * 0.18, a[1] - w * 0.2);
  ctx.lineTo(b[0] - w * 0.18, b[1] - w * 0.2);
  ctx.stroke();
};

const drawWheel = (ctx: CanvasRenderingContext2D, cx: number, cy: number, n: number, rot: number, rgb: number[], glow: number) => {
  const pts = shapePoints(n);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const col = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  // nan hoa
  ctx.strokeStyle = 'rgba(210,210,215,0.75)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    const p = pts[Math.round((i / 18) * SAMPLES) % SAMPLES];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(p[0] * 0.86, p[1] * 0.86);
    ctx.stroke();
  }
  const path = (k: number) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k)));
    ctx.closePath();
  };
  // vành trong
  path(0.87);
  ctx.strokeStyle = '#cfcfd4';
  ctx.lineWidth = 5;
  ctx.stroke();
  // lốp
  if (glow > 0) {
    ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.95 * glow})`;
    ctx.shadowBlur = 60 * glow;
  }
  path(0.97);
  ctx.strokeStyle = col;
  ctx.lineWidth = 24;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.shadowBlur = 0;
  path(0.97);
  ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.6 * glow})`;
  ctx.lineWidth = 5 + 4 * glow;
  ctx.stroke();
  // trục
  ctx.fillStyle = '#e6e6ea';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawBikeAndRider = (ctx: CanvasRenderingContext2D, t: number) => {
  const n = exponentAt(t);
  const rgb = colorAt(t);
  const glow = smooth(STAGES[3].at - 0.3, STAGES[3].at + 0.6, t);
  const strain = strainAt(t);
  const phi = phiAt(t);
  // bánh trước lệch pha với bánh sau → khung xe chòng chành khi bánh còn vuông
  const offset = 0.55 * (1 - glow);
  const rotR = phi;
  const rotF = phi + offset;
  const hR = supportHeight(n, rotR);
  const hF = supportHeight(n, rotF);
  const ride = 1100 * easeIn(clamp((t - RIDE_OFF) / 1.5));
  const baseX = W / 2 + ride;
  const rear: Pt = [baseX - 205, GROUND - hR];
  const front: Pt = [baseX + 205, GROUND - hF];

  drawWheel(ctx, rear[0], rear[1], n, rotR, rgb, glow);

  // khung xe trong hệ toạ độ của xe (gốc giữa hai trục, x tiến, y xuống)
  const ang = Math.atan2(front[1] - rear[1], front[0] - rear[0]);
  ctx.save();
  ctx.translate((rear[0] + front[0]) / 2, (rear[1] + front[1]) / 2);
  ctx.rotate(ang);

  const BB: Pt = [-25, 22];
  const seatTop: Pt = [-92, -192];
  const headTop: Pt = [150, -200];
  const headBot: Pt = [162, -150];
  const crank = phi * 0.85;
  const pedal = (k: number): Pt => [BB[0] + Math.cos(crank + k) * 58, BB[1] + Math.sin(crank + k) * 58];

  // dáng người: gồng gập lưng, cúi đầu khi bánh vuông → thẳng lưng, ngẩng đầu khi bánh tròn
  const hip: Pt = [-85, -228];
  const shoulder: Pt = [lerp(70, 55, 1 - strain), lerp(-300, -350, 1 - strain)];
  const headC: Pt = [shoulder[0] + lerp(58, 30, 1 - strain), shoulder[1] + lerp(10, -48, 1 - strain)];
  const hands: Pt = [192, -205];
  const bob = Math.sin(crank * 2) * 3 * (1 - strain * 0.3);

  const SKIN = '#dcdce0';
  const SKIN_HI = '#f6f6f8';
  const SKIN_FAR = '#8b8b92';
  const SKIN_FAR_HI = '#a8a8ae';

  // chân phía xa (sau khung)
  const pf = pedal(Math.PI);
  const kneeF = ik(hip, pf, 150, 150, -1);
  limb(ctx, hip, kneeF, 30, SKIN_FAR, SKIN_FAR_HI);
  limb(ctx, kneeF, pf, 26, SKIN_FAR, SKIN_FAR_HI);
  ctx.strokeStyle = '#7a7a80';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(BB[0], BB[1]);
  ctx.lineTo(pf[0], pf[1]);
  ctx.stroke();

  // khung
  const FRAME = '#e9e9ee';
  const FRAME_HI = '#ffffff';
  const tube = (a: Pt, b: Pt, w = 13) => limb(ctx, a, b, w, FRAME, FRAME_HI);
  tube([-205, 0], BB, 11); // chainstay
  tube([-205, 0], seatTop, 10); // seatstay
  tube(BB, seatTop, 14); // ống yên
  tube(seatTop, headTop, 13); // ống trên
  tube(BB, headBot, 15); // ống dưới
  tube(headTop, headBot, 16); // ống cổ
  tube(headBot, [205, 0], 11); // phuộc
  // yên
  ctx.fillStyle = '#2c2c30';
  ctx.beginPath();
  ctx.roundRect(-128, -212, 82, 16, 8);
  ctx.fill();
  limb(ctx, seatTop, [-92, -205], 9, FRAME, FRAME_HI);
  // ghi-đông kiểu đua
  ctx.strokeStyle = FRAME;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headTop[0], headTop[1]);
  ctx.lineTo(182, -212);
  ctx.quadraticCurveTo(222, -205, 210, -172);
  ctx.lineTo(196, -165);
  ctx.stroke();
  // đĩa xích
  ctx.strokeStyle = '#bdbdc2';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(BB[0], BB[1], 30, 0, Math.PI * 2);
  ctx.stroke();

  // thân người
  const hipB: Pt = [hip[0], hip[1] + bob];
  const shB: Pt = [shoulder[0], shoulder[1] + bob];
  limb(ctx, hipB, shB, 52, SKIN, SKIN_HI);
  // đầu
  const hd: Pt = [headC[0], headC[1] + bob];
  limb(ctx, shB, hd, 18, SKIN, SKIN_HI);
  const g = ctx.createRadialGradient(hd[0] - 10, hd[1] - 12, 4, hd[0], hd[1], 34);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#b8b8be');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(hd[0], hd[1], 32, 0, Math.PI * 2);
  ctx.fill();
  // tay
  const elbow = ik(shB, hands, 96, 96, 1);
  limb(ctx, shB, elbow, 24, SKIN, SKIN_HI);
  limb(ctx, elbow, hands, 21, SKIN, SKIN_HI);

  // chân phía gần
  const pn = pedal(0);
  const kneeN = ik(hipB, pn, 150, 150, -1);
  limb(ctx, hipB, kneeN, 34, SKIN, SKIN_HI);
  limb(ctx, kneeN, pn, 29, SKIN, SKIN_HI);
  ctx.strokeStyle = '#d0d0d5';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(BB[0], BB[1]);
  ctx.lineTo(pn[0], pn[1]);
  ctx.stroke();
  ctx.fillStyle = '#efeff2';
  ctx.beginPath();
  ctx.ellipse(pn[0] + 8, pn[1], 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  drawWheel(ctx, front[0], front[1], n, rotF, rgb, glow);
};

export const SquareWheels: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / SQ_FPS;
  const mainRef = useRef<HTMLCanvasElement>(null);
  const reflRef = useRef<HTMLCanvasElement>(null);

  const glow = smooth(STAGES[3].at - 0.3, STAGES[3].at + 0.6, t);
  // mở đầu: cận bánh trước rồi lùi ra
  const zoomK = easeInOut(smooth(0.9, 2.5, t));
  const zoom = lerp(2.7, 1.12, zoomK);
  const focus: Pt = [lerp(W / 2 + 205, W / 2, zoomK), lerp(GROUND - 140, H / 2 + 120, zoomK)];

  useLayoutEffect(() => {
    const ctx = mainRef.current!.getContext('2d')!;
    const rctx = reflRef.current!.getContext('2d')!;
    for (const c of [ctx, rctx]) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
    }
    const cam = (c: CanvasRenderingContext2D) => {
      c.translate(W / 2, H / 2 + 120);
      c.scale(zoom, zoom);
      c.translate(-focus[0], -focus[1]);
    };
    ctx.save();
    cam(ctx);
    drawBikeAndRider(ctx, t);
    ctx.restore();

    // phản chiếu trên sàn bóng
    rctx.save();
    cam(rctx);
    rctx.translate(0, GROUND * 2);
    rctx.scale(1, -1);
    drawBikeAndRider(rctx, t);
    rctx.restore();
    rctx.setTransform(1, 0, 0, 1, 0, 0);
    rctx.globalCompositeOperation = 'destination-in';
    const groundScreen = H / 2 + 120 + (GROUND - focus[1]) * zoom;
    const fade = rctx.createLinearGradient(0, groundScreen, 0, groundScreen + 420 * zoom);
    fade.addColorStop(0, 'rgba(0,0,0,0.42)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    rctx.fillStyle = fade;
    rctx.fillRect(0, 0, W, H);
    rctx.globalCompositeOperation = 'source-over';
  }, [t, zoom, focus[0], focus[1]]);

  // chữ giai đoạn
  const stageIdx = STAGES.reduce((acc, s, i) => (t >= s.at - 0.25 ? i : acc), -1);
  const labelOpacity = (i: number) => {
    const s = STAGES[i];
    const end = i < STAGES.length - 1 ? STAGES[i + 1].at - 0.25 : FINAL_TEXT;
    return smooth(s.at - 0.25, s.at + 0.25, t) * (1 - smooth(end - 0.3, end, t));
  };
  const groundScreen = H / 2 + 120 + (GROUND - focus[1]) * zoom;

  // vệt tốc độ (Tháng 12)
  const streaks = Array.from({length: 14}, (_, i) => i);
  const fin1 = smooth(FINAL_TEXT, FINAL_TEXT + 0.5, t);
  const fin2 = smooth(FINAL_TEXT + 0.7, FINAL_TEXT + 1.2, t);
  const fadeOut = smooth(21.3, 22, t);
  const blue = '#4D9BFF';

  return (
    <AbsoluteFill style={{background: '#050506'}}>
      <Audio src={staticFile('square/score.mp3')} />
      {/* nền: quầng sáng đổi màu theo bánh */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 40% at 50% 62%, rgba(${colorAt(t).join(',')},${0.07 + 0.16 * glow}) 0%, rgba(0,0,0,0) 70%), linear-gradient(180deg, #121214 0%, #070708 60%, #030304 100%)`,
        }}
      />
      {/* sàn */}
      <div style={{position: 'absolute', left: 0, right: 0, top: groundScreen, height: 2, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%)'}} />
      <canvas ref={reflRef} width={W} height={H} style={{position: 'absolute', inset: 0}} />
      {/* vệt tốc độ */}
      {glow > 0
        ? streaks.map((i) => {
            const speed = 2600;
            const y = groundScreen - 60 - ((i * 97) % 520);
            const len = 120 + ((i * 53) % 200);
            const x = W + 200 - ((t * speed + i * 331) % (W + 600));
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: len,
                  height: 3,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, rgba(120,182,255,0) 0%, rgba(160,205,255,${0.55 * glow}) 100%)`,
                  opacity: 1 - fin1 * 0.6,
                }}
              />
            );
          })
        : null}
      <canvas ref={mainRef} width={W} height={H} style={{position: 'absolute', inset: 0}} />

      {/* nhãn thời gian */}
      {STAGES.map((s, i) =>
        i <= stageIdx + 1 ? (
          <div
            key={s.label}
            style={{
              position: 'absolute',
              top: 560,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 46,
              letterSpacing: '0.32em',
              paddingLeft: '0.32em',
              color: i === 3 ? blue : '#f2f2f4',
              textShadow: i === 3 ? `0 0 24px rgba(77,155,255,0.8)` : 'none',
              opacity: labelOpacity(i),
              transform: `translateY(${(1 - smooth(s.at - 0.25, s.at + 0.35, t)) * 18}px)`,
            }}
          >
            {s.label}
          </div>
        ) : null,
      )}

      {/* "MOMENTUM" + mũi tên */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: 500,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: '0.2em',
          color: '#e9f2ff',
          opacity: smooth(STAGES[3].at + 0.6, STAGES[3].at + 1.1, t) * (1 - fin1),
        }}
      >
        MOMENTUM
        <svg width="220" height="60" style={{position: 'absolute', left: 318, top: 8, overflow: 'visible'}}>
          <path
            d="M 0 20 Q 100 -10 200 30"
            fill="none"
            stroke="#e9f2ff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="260"
            strokeDashoffset={260 * (1 - smooth(STAGES[3].at + 0.8, STAGES[3].at + 1.6, t))}
          />
          <path d="M 186 16 L 202 31 L 182 40" fill="none" stroke="#e9f2ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity={smooth(STAGES[3].at + 1.5, STAGES[3].at + 1.7, t)} />
        </svg>
      </div>

      {/* thanh tiến trình thời gian */}
      <div style={{position: 'absolute', left: 240, right: 240, top: 1650, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, opacity: 1 - fin1}}>
        <div style={{height: '100%', width: `${100 * smooth(STAGES[0].at, STAGES[3].at + 1, t)}%`, background: `rgb(${colorAt(t).join(',')})`, borderRadius: 2, boxShadow: glow > 0 ? `0 0 ${16 * glow}px rgba(77,155,255,0.9)` : 'none'}} />
        {STAGES.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -8,
              left: `${(100 * i) / 3}%`,
              width: 20,
              height: 20,
              marginLeft: -10,
              borderRadius: 10,
              background: t >= s.at - 0.25 ? `rgb(${colorAt(t).join(',')})` : '#2a2a2e',
            }}
          />
        ))}
      </div>

      {/* câu kết */}
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, color: '#f4f4f6'}}>
        <div style={{fontSize: 64, fontWeight: 800, letterSpacing: '0.06em', opacity: fin1, transform: `translateY(${(1 - fin1) * 24}px)`}}>EVERYONE STARTS SQUARE.</div>
        <div style={{fontSize: 88, fontWeight: 800, letterSpacing: '0.04em', marginTop: 18, opacity: fin2, transform: `translateY(${(1 - fin2) * 24}px)`}}>
          KEEP <span style={{color: blue, textShadow: '0 0 30px rgba(77,155,255,0.7)'}}>PEDALING.</span>
        </div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
