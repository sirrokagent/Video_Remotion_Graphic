import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {drawFigure} from './BeDifferent';

/**
 * Ảnh đại diện kênh cho dòng video "BE DIFFERENT" — 1080×1080, nội dung chính nằm trong
 * vòng tròn giữa (TikTok / Facebook / YouTube đều cắt tròn).
 *   hero   — người vest cà vạt đỏ đứng trước đám đông nhoè, quầng sáng sau đầu
 *   bust   — cận nửa người: đầu trắng + cà vạt đỏ, đọc rõ cả khi thu rất nhỏ
 *   fork   — nhìn từ trên: ngã rẽ chữ V, một chấm trắng một lối, đám đông một lối
 */

const S = 1080;
type Variant = 'hero' | 'bust' | 'fork';

const hash = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const bg = (ctx: CanvasRenderingContext2D, gx: number, gy: number, strength = 0.5) => {
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#1c1c1f');
  g.addColorStop(1, '#09090a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const r = ctx.createRadialGradient(gx, gy, 0, gx, gy, 520);
  r.addColorStop(0, `rgba(240,240,245,${strength})`);
  r.addColorStop(0.25, `rgba(200,200,210,${strength * 0.4})`);
  r.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, S, S);
};

const vignette = (ctx: CanvasRenderingContext2D) => {
  const v = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.72);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, S, S);
};

const drawHero = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, S / 2, 330, 0.55);
  // mặt đường phối cảnh
  const horizon = 610;
  ctx.fillStyle = '#26262a';
  ctx.beginPath();
  ctx.moveTo(470, horizon);
  ctx.lineTo(610, horizon);
  ctx.lineTo(1250, S);
  ctx.lineTo(-170, S);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b9b9bf';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(470, horizon);
  ctx.lineTo(-170, S);
  ctx.moveTo(610, horizon);
  ctx.lineTo(1250, S);
  ctx.stroke();
  // đám đông nhoè phía sau
  ctx.save();
  ctx.filter = 'blur(9px)';
  for (let i = 0; i < 46; i++) {
    const x = 90 + (i % 23) * 41 + (hash(i, 1) - 0.5) * 20;
    const row = Math.floor(i / 23);
    const y = horizon + 30 + row * 26;
    const h = 250 + row * 40 + hash(i, 2) * 30;
    const tone = 120 + Math.round(hash(i, 3) * 40);
    drawFigure(ctx, x, y, h, {body: `rgb(${tone},${tone},${tone + 3})`, head: `rgb(${tone + 60},${tone + 60},${tone + 63})`, phase: hash(i, 4) * 6, walk: 1, run: 1});
  }
  ctx.restore();
  // phản chiếu + người khác biệt
  const fx = S / 2;
  const fy = 930;
  const fh = 640;
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.translate(fx, fy);
  ctx.scale(1, -0.9);
  drawFigure(ctx, 0, 0, fh, {body: '#4b4b51', head: '#f2f2f4', phase: 0, walk: 0, hero: true, front: true});
  ctx.restore();
  drawFigure(ctx, fx, fy, fh, {body: '#4b4b51', head: '#f2f2f4', phase: 0, walk: 0, hero: true, front: true});
  vignette(ctx);
};

const drawBust = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, S / 2, 360, 0.6);
  // vẽ một người rất lớn, chỉ thấy đầu + vai + cà vạt
  drawFigure(ctx, S / 2, 2083, 1810, {body: '#45454b', head: '#f4f4f6', phase: 0, walk: 0, hero: true, front: true});
  vignette(ctx);
};

const drawFork = (ctx: CanvasRenderingContext2D) => {
  bg(ctx, 300, 170, 0.35);
  // hai nhánh đường chữ V nhìn từ trên
  const curve = (x0: number, y0: number, x1: number, y1: number, bend: number): [number, number][] => {
    const out: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const k = i / 40;
      out.push([x0 + (x1 - x0) * k + Math.sin(Math.PI * k) * bend, y0 + (y1 - y0) * k]);
    }
    return out;
  };
  const left = curve(560, 1200, 230, -40, -60);
  const right = curve(520, 1200, 880, -60, 70);
  const roads: [[number, number][], number][] = [
    [right, 190],
    [left, 110],
  ];
  const path = (pts: [number, number][]) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  };
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  // viền sáng trước, mặt đường sau → chỗ giao nhau liền mạch
  for (const [pts, w] of roads) {
    path(pts);
    ctx.strokeStyle = '#c7c7cc';
    ctx.lineWidth = w + 8;
    ctx.stroke();
  }
  for (const [pts, w] of roads) {
    path(pts);
    ctx.strokeStyle = '#2a2a2e';
    ctx.lineWidth = w;
    ctx.stroke();
  }
  // đám đông trên nhánh phải
  for (let i = 0; i < 260; i++) {
    const k = 0.04 + hash(i, 1) * 0.9;
    const idx = Math.min(40, Math.floor(k * 40));
    const [cx, cy] = right[idx];
    const x = cx + (hash(i, 2) - 0.5) * 140 * (1 - k * 0.35);
    const y = cy + (hash(i, 3) - 0.5) * 18;
    const r = 7.5 - k * 3.5;
    const tone = 150 + Math.round(hash(i, 4) * 50);
    ctx.fillStyle = `rgb(${tone},${tone},${tone + 3})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // một người trên nhánh trái: chấm trắng + vệt đỏ
  const [hx, hy] = left[17];
  const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 90);
  glow.addColorStop(0, 'rgba(255,255,255,0.45)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(hx - 90, hy - 90, 180, 180);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(hx, hy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d3192b';
  ctx.beginPath();
  ctx.moveTo(hx - 5, hy + 17);
  ctx.lineTo(hx + 5, hy + 17);
  ctx.lineTo(hx, hy + 36);
  ctx.closePath();
  ctx.fill();
  vignette(ctx);
};

export const BeDifferentAvatar: React.FC<{variant: Variant}> = ({variant}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.clearRect(0, 0, S, S);
    if (variant === 'hero') drawHero(ctx);
    else if (variant === 'bust') drawBust(ctx);
    else drawFork(ctx);
  }, [variant]);
  return (
    <AbsoluteFill style={{background: '#0b0b0c'}}>
      <canvas ref={ref} width={S} height={S} />
    </AbsoluteFill>
  );
};
