import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {blinkAt, ev, keys, typed} from '../../anim';
import {AgentCursor, ClickRipple, cursorAt, Key} from '../../cursor';
import {EyePair, Ghost} from '../../logo';
import {C, E, FONT} from '../../theme';
import {BrandPlus, ClaudeMark, IconCheck, IconChevron, IconLink, IconNewChat, IconPanel, IconTask} from '../../ui';
import {AGENT_COLORS, AgentAvatar, AgentColor, AgentShape, COLOR_KEYS, mixHex, SHAPE_KEYS} from '../agents';
import {Kinetic} from '../text';

/**
 * Cảnh Pick (420 frame) — không lời đọc, chữ chuyển động + nhạc kể chuyện.
 * MỘT file cho cả khung ngang 1920×1080 (F-Pick) và dọc 1080×1920 (V-Pick):
 * mọi toạ độ lấy từ `geo(portrait)`, logic thời gian dùng chung.
 *
 *  1. 0–150   Tạo agent: dựng lại màn "New Agent" thật (ảnh out/ref-new-agent.png).
 *             Con trỏ cặp mắt bấm màu + hình → avatar xem trước biến hình, bóp dẹt nảy;
 *             gõ Tên + Mô tả.
 *  2. 150–270 Chọn model: bảng "Chọn model" tick nhiều dòng → "3 model"; bấm "Tạo Agent".
 *  3. 270–400 Giao việc: đội 6 agent, chọn 3 → chúng chào, bấm "Giao việc" → bay vào
 *             thẻ task "Gửi báo giá cho khách" (nối sang cảnh agent làm việc).
 *  400–420 để vệt mắt chuyển cảnh che.
 */

// ── Mốc thời gian (frame của cảnh) — composition tổng đặt SFX theo đây ──
export const PICK_T = {
  winIn: 0,
  clickColor1: 26, // màu xanh dương
  clickShape1: 40, // hình tròn
  clickShape2: 52, // tam giác
  clickColor2: 64, // màu cam
  clickShape3: 78, // hoa
  clickName: 90,
  nameType: 94, // gõ "Trợ lý bán hàng" (94 → ~117)
  clickDesc: 122,
  descType: 126, // gõ mô tả (126 → ~150)
  clickModel: 156, // mở bảng "Chọn model" (mở xong ~170)
  ticks: [180, 196, 212], // Opus 5.5 · GPT 6 Astra · Gemini
  clickDone: 228, // đóng bảng
  clickCreate: 246, // "Tạo Agent"
  heroLand: 278, // avatar mới đáp xuống thẻ đầu tiên trong đội
  rosterIn: 258, // 6 thẻ agent bật lên (cách nhau 4 frame)
  select: [300, 316, 332], // chọn 3 agent (mỗi agent chào ~+4)
  clickAssign: 350, // "Giao việc"
  launch: [356, 361, 366], // 3 agent cất cánh
  flight: 22, // → đáp vào thẻ task ở 378 / 383 / 388
  push: 384, // camera đẩy vào thẻ task
} as const;
const T = PICK_T;

// ── Dữ liệu ──
const SHAPE_EV: [number, AgentShape][] = [
  [-99, 'ghost'],
  [T.clickShape1, 'circle'],
  [T.clickShape2, 'triangle'],
  [T.clickShape3, 'flower'],
];
const COLOR_EV: [number, AgentColor][] = [
  [-99, 'black'],
  [T.clickColor1, 'blue'],
  [T.clickColor2, 'orange'],
];

type Model = {name: string; claude?: boolean; mono?: string; bg?: string; isNew?: boolean};
// Đúng tên model được duyệt — không tự thêm. Không vẽ lại logo hãng khác: chỉ huy hiệu chữ cái trung tính.
const MODELS: Model[] = [
  {name: 'Claude Opus 5.5', claude: true, isNew: true},
  {name: 'Claude Sonnet 5.5', claude: true},
  {name: 'Claude Fable 5.1', claude: true},
  {name: 'Claude Haiku 4.5', claude: true},
  {name: 'GPT 6 Astra', mono: 'GP', bg: '#2F3437'},
  {name: 'Gemini', mono: 'Ge', bg: '#4A5FD0'},
  {name: 'Grok', mono: 'Gr', bg: '#5F6368'},
  {name: 'DeepSeek', mono: 'DS', bg: '#0E7C86'},
  {name: 'Llama', mono: 'Ll', bg: '#7B4BC9'},
];
const TICKED = [0, 4, 5]; // dòng được tick, theo thứ tự T.ticks

type Agent = {name: string; shape: AgentShape; color: AgentColor; model: number; extra?: number; greet?: string};
const ROSTER: Agent[] = [
  {name: 'Trợ lý bán hàng', shape: 'flower', color: 'orange', model: 0, extra: 2, greet: 'Có em!'},
  {name: 'Kế toán', shape: 'squircle', color: 'green', model: 1},
  {name: 'Marketing', shape: 'blob', color: 'pink', model: 4, greet: 'Sẵn sàng!'},
  {name: 'CSKH', shape: 'ghost', color: 'blue', model: 3, greet: 'Em đây!'},
  {name: 'Thư ký', shape: 'capsule', color: 'purple', model: 5},
  {name: 'Nghiên cứu', shape: 'hexagon', color: 'teal', model: 2},
];
const SEL = [0, 2, 3]; // thứ tự chọn

const NAME = 'Trợ lý bán hàng';
const DESC = 'Chốt đơn, gửi báo giá.';
const NAME_PER = 1.5;
const DESC_PER = 1.1;

// ── Tiện ích chuyển động ──
type P = {x: number; y: number};
type Rect = {x: number; y: number; w: number; h: number};

/** Nảy lên rồi về: 0 → 1 → 0 có easing. */
const bump = (f: number, a: number, b: number) => (f < a || f > b ? 0 : Math.sin(Math.PI * ev(f, [a, b], [0, 1], E.out)));
/** Dao động tắt dần sau một cú chạm (bóp dẹt kiểu lò xo). */
const osc = (f: number, at: number, amp: number) => (f < at || f > at + 40 ? 0 : amp * Math.exp(-(f - at) / 6) * Math.sin((f - at) * 0.62));
/** Bước hiện tại của một chuỗi sự kiện. */
const stepAt = <V,>(list: [number, V][], f: number) => {
  let i = 0;
  while (i + 1 < list.length && list[i + 1][0] <= f) i++;
  return {cur: list[i][1], prev: list[Math.max(0, i - 1)][1], at: list[i][0], i};
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const center = (r: Rect): P => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

// ── Bố cục cho từng khung ──
const geo = (portrait: boolean) => {
  if (!portrait) {
    const panel: Rect = {x: 210, y: 172, w: 1500, h: 876};
    const side = 300;
    const cx = panel.x + side + (panel.w - side) / 2;
    const fw = 720;
    const fx = cx - fw / 2;
    const oy = panel.y + 26;
    const sw = 48;
    const cell = 80;
    const colX = (j: number) => fx + cell / 2 + (j * (fw - cell)) / 6;
    const rowY = oy + 722;
    const pill: Rect = {x: fx, y: rowY, w: 300, h: 60};
    const create: Rect = {x: fx + fw - 196, y: rowY, w: 196, h: 60};
    const popH = 72 + 9 * 52 + 84;
    const pop: Rect = {x: fx, y: rowY - 14 - popH, w: 540, h: popH};
    const task: Rect = {x: panel.x + side + 50, y: panel.y + 64, w: 1100, h: 140};
    const cards: Rect[] = Array.from({length: 6}, (_, i) => ({x: task.x + (i % 3) * 380, y: task.y + task.h + 40 + Math.floor(i / 3) * 238, w: 340, h: 210}));
    return {
      portrait,
      panel,
      side,
      cx,
      fw,
      fx,
      preview: {x: cx, y: oy + 92, size: 150},
      heroSide: {x: fx + fw + 120, y: oy + 400, size: 150},
      sw,
      swY: oy + 214,
      swX: (i: number) => fx + sw / 2 + (i * (fw - sw)) / 10,
      cell,
      shapeAt: (i: number): P => (i < 7 ? {x: colX(i), y: oy + 296} : {x: colX(i - 6), y: oy + 388}),
      nameLbl: oy + 448,
      name: {x: fx, y: oy + 484, w: fw, h: 60} as Rect,
      descLbl: oy + 564,
      desc: {x: fx, y: oy + 600, w: fw, h: 96} as Rect,
      pill,
      cancel: {x: create.x - 16 - 112, y: rowY, w: 112, h: 60} as Rect,
      create,
      pop,
      popHead: 72,
      rowH: 52,
      done: {x: pop.x + pop.w - 20 - 120, y: pop.y + pop.h - 18 - 52, w: 120, h: 52} as Rect,
      task,
      cards,
      cardAv: (i: number) => ({x: cards[i].x + cards[i].w / 2, y: cards[i].y + 68, size: 96}),
      slot: (i: number) => ({x: task.x + task.w - 64 - 42 - (2 - i) * 66, y: task.y + task.h / 2, size: 84}),
      assign: {x: task.x + task.w - 240, y: cards[5].y + cards[5].h + 34, w: 240, h: 62} as Rect,
      head: {top: 46, size: 76},
      cursorW: 70,
      start: {x: 1990, y: 1010},
      ui: {lbl: 24, field: 26, btn: 26, row: 26, card: 28, chip: 24, bubble: 24, title: 30},
    };
  }
  const panel: Rect = {x: 40, y: 500, w: 1000, h: 1040};
  const cx = 540;
  const fw = 880;
  const fx = cx - fw / 2;
  const oy = panel.y + 20;
  const sw = 60;
  const cell = 112;
  const colX = (j: number) => fx + cell / 2 + (j * (fw - cell)) / 5;
  const rowY = oy + 890;
  const pill: Rect = {x: fx, y: rowY, w: 310, h: 72};
  const create: Rect = {x: fx + fw - 236, y: rowY, w: 236, h: 72};
  const pop: Rect = {x: panel.x, y: oy + 214, w: panel.w, h: panel.y + panel.h - (oy + 214)};
  const task: Rect = {x: 80, y: oy + 34, w: 920, h: 150};
  const cards: Rect[] = Array.from({length: 6}, (_, i) => ({x: task.x + (i % 2) * 480, y: task.y + task.h + 34 + Math.floor(i / 2) * 236, w: 440, h: 214}));
  return {
    portrait,
    panel,
    side: 0,
    cx,
    fw,
    fx,
    preview: {x: cx, y: oy + 108, size: 170},
    heroSide: {x: cx, y: oy + 108, size: 170},
    sw,
    swY: oy + 258,
    swX: (i: number) => fx + sw / 2 + (i * (fw - sw)) / 10,
    cell,
    shapeAt: (i: number): P => ({x: colX(i % 6), y: i < 6 ? oy + 362 : oy + 490}),
    nameLbl: oy + 576,
    name: {x: fx, y: oy + 614, w: fw, h: 72} as Rect,
    descLbl: oy + 706,
    desc: {x: fx, y: oy + 744, w: fw, h: 116} as Rect,
    pill,
    cancel: {x: create.x - 18 - 132, y: rowY, w: 132, h: 72} as Rect,
    create,
    pop,
    popHead: 104,
    rowH: 66,
    done: {x: pop.x + 60, y: pop.y + pop.h - 30 - 76, w: pop.w - 120, h: 76} as Rect,
    task,
    cards,
    cardAv: (i: number) => ({x: cards[i].x + cards[i].w / 2, y: cards[i].y + 72, size: 104}),
    slot: (i: number) => ({x: task.x + task.w - 60 - 45 - (2 - i) * 70, y: task.y + task.h / 2, size: 90}),
    assign: {x: task.x + task.w - 280, y: cards[5].y + cards[5].h + 30, w: 280, h: 74} as Rect,
    head: {top: 236, size: 104},
    cursorW: 92,
    start: {x: 1160, y: 1780},
    ui: {lbl: 28, field: 30, btn: 30, row: 30, card: 32, chip: 26, bubble: 28, title: 34},
  };
};
type Geo = ReturnType<typeof geo>;

// ── Thành phần nhỏ ──
const Mono: React.FC<{m: Model; size: number}> = ({m, size}) =>
  m.claude ? (
    <div style={{width: size, height: size, borderRadius: '50%', background: '#FBEFEA', display: 'grid', placeItems: 'center', flexShrink: 0}}>
      <ClaudeMark size={size * 0.66} />
    </div>
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: m.bg,
        color: C.white,
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.42,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        flexShrink: 0,
      }}
    >
      {m.mono}
    </div>
  );

/** Tiêu đề chuyển động: mỗi dòng một Kinetic, chữ nối tiếp nhau. */
const Headline: React.FC<{lines: string[]; start: number; f: number; size: number; out: number; top: number}> = ({lines, start, f, size, out, top}) => {
  let idx = 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {lines.map((line) => {
        const s = start + idx * 4;
        idx += line.split(' ').length;
        return <Kinetic key={line} text={line} start={s} f={f} size={size} variant="rise" out={out} />;
      })}
    </div>
  );
};

const abs = (r: Rect, extra?: React.CSSProperties): React.CSSProperties => ({position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, ...extra});

// ── Cảnh ──
export const Pick: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const g: Geo = geo(portrait);
  const u = g.ui;

  // ── Con trỏ cặp mắt: danh sách cú bấm ──
  const rowCenter = (i: number) => ({x: g.pop.x + (g.portrait ? 120 : 34), y: g.pop.y + g.popHead + g.rowH / 2 + i * g.rowH});
  const clicks: {f: number; p: P}[] = [
    {f: T.clickColor1, p: {x: g.swX(7), y: g.swY}},
    {f: T.clickShape1, p: g.shapeAt(1)},
    {f: T.clickShape2, p: g.shapeAt(5)},
    {f: T.clickColor2, p: {x: g.swX(3), y: g.swY}},
    {f: T.clickShape3, p: g.shapeAt(11)},
    {f: T.clickName, p: {x: g.name.x + g.name.w * 0.3, y: g.name.y + g.name.h / 2}},
    {f: T.clickDesc, p: {x: g.desc.x + g.desc.w * 0.36, y: g.desc.y + g.desc.h * 0.4}},
    {f: T.clickModel, p: center(g.pill)},
    ...T.ticks.map((t, k) => ({f: t, p: rowCenter(TICKED[k])})),
    {f: T.clickDone, p: center(g.done)},
    {f: T.clickCreate, p: center(g.create)},
    ...T.select.map((t, k) => ({f: t, p: {x: g.cards[SEL[k]].x + g.cards[SEL[k]].w * 0.5, y: g.cards[SEL[k]].y + g.cards[SEL[k]].h * 0.72}})),
    {f: T.clickAssign, p: center(g.assign)},
  ];
  const ks: Key[] = [{f: 8, ...g.start}];
  clicks.forEach((c, i) => {
    ks.push({f: c.f - 5, ...c.p}, {f: c.f + 3, ...c.p});
    // lùi ra khỏi chữ đang gõ để không che
    if (i === 5) ks.push({f: T.clickName + 14, x: g.name.x + g.name.w - 50, y: g.name.y + g.name.h + 30});
    if (i === 6) ks.push({f: T.clickDesc + 14, x: g.desc.x + g.desc.w - 50, y: g.desc.y + g.desc.h + 26});
    if (i === 11) ks.push({f: 272, x: g.cards[1].x + g.cards[1].w * 0.5, y: g.cards[4].y + g.cards[4].h + 10});
  });
  ks.push({f: 374, x: g.assign.x + g.assign.w + 50, y: g.assign.y + g.assign.h + 50});
  const cur = cursorAt(ks, f);
  const cursorO = ev(f, [8, 16], [0, 1], E.out) * ev(f, [372, 386], [1, 0], E.in);
  const clickFrames = clicks.map((c) => c.f);

  /** mắt nhìn theo con trỏ — chi tiết nhỏ cho avatar có hồn */
  const lookAt = (p: P, amt = 4): P => {
    const dx = cur.x - p.x;
    const dy = cur.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 260) * amt * cursorO;
    return {x: (dx / d) * k, y: (dy / d) * k * 0.7};
  };

  // ── Khung (cửa sổ desktop / sheet điện thoại) ──
  const winT = ev(f, [0, 22], [0, 1], E.out);
  const cam = keys(f, [T.push, T.push + 22], [1, 1.06], E.inOut);
  const camO = center(g.task);

  // ── Phần 1: form ──
  const formO = 1 - ev(f, [T.clickCreate + 4, T.clickCreate + 16], [0, 1], E.in);
  const formS = 1 - 0.03 * ev(f, [T.clickCreate + 4, T.clickCreate + 16], [0, 1], E.in);
  const enter = (at: number, dist = 24): React.CSSProperties => {
    const t = ev(f, [at, at + 16], [0, 1], E.out);
    return {opacity: t, translate: `0px ${(1 - t) * dist}px`};
  };

  const shp = stepAt(SHAPE_EV, f);
  const shapeMix = ev(f, [shp.at + 1, shp.at + 12], [0, 1], E.out);
  const col = stepAt(COLOR_EV, f);
  const colorMix = ev(f, [col.at + 1, col.at + 10], [0, 1], E.out);
  const heroColor = mixHex(AGENT_COLORS[col.prev], AGENT_COLORS[col.cur], colorMix);

  // vòng chọn trượt giữa các ô
  const swIdx = (c: AgentColor) => COLOR_KEYS.indexOf(c);
  const swRingX = lerp(g.swX(swIdx(col.prev)), g.swX(swIdx(col.cur)), colorMix);
  const shA = g.shapeAt(SHAPE_KEYS.indexOf(shp.prev));
  const shB = g.shapeAt(SHAPE_KEYS.indexOf(shp.cur));
  const ringMove = ev(f, [shp.at, shp.at + 10], [0, 1], E.out);
  const shRing = {x: lerp(shA.x, shB.x, ringMove), y: lerp(shA.y, shB.y, ringMove)};

  // màu lan qua lưới hình như một con sóng sau mỗi lần đổi màu
  const gridColor = (i: number) => mixHex(AGENT_COLORS[col.prev], AGENT_COLORS[col.cur], ev(f, [col.at + 2 + i * 0.9, col.at + 10 + i * 0.9], [0, 1], E.out));

  const nameFocus = ev(f, [T.clickName, T.clickName + 6], [0, 1], E.out) * (1 - ev(f, [T.clickDesc, T.clickDesc + 6], [0, 1], E.out));
  const descFocus = ev(f, [T.clickDesc, T.clickDesc + 6], [0, 1], E.out) * (1 - ev(f, [T.clickModel, T.clickModel + 6], [0, 1], E.out));
  const nameText = typed(NAME, f, T.nameType, NAME_PER);
  const descText = typed(DESC, f, T.descType, DESC_PER);

  // ── Phần 2: bảng chọn model ──
  const popOpen = ev(f, [T.clickModel + 2, T.clickModel + 16], [0, 1], E.out) * (1 - ev(f, [T.clickDone + 2, T.clickDone + 12], [0, 1], E.in));
  const tickT = (k: number) => ev(f, [T.ticks[k], T.ticks[k] + 8], [0, 1], E.out);
  const count = T.ticks.filter((t) => f >= t).length;
  const countBump = T.ticks.reduce((a, t) => a + bump(f, t, t + 10), 0);

  // ── Avatar xem trước (hero) ──
  const P0 = g.preview;
  const S1 = g.heroSide;
  const K0 = g.cardAv(0);
  const flyT = ev(f, [T.clickCreate + 6, T.heroLand], [0, 1], E.inOut);
  const sideT = keys(f, [T.clickModel + 2, T.clickModel + 18, T.clickDone, T.clickDone + 14], [0, 1, 1, 0], E.inOut);
  const hero = {
    x: lerp(lerp(P0.x, S1.x, sideT), K0.x, flyT),
    y:
      lerp(lerp(P0.y, S1.y, sideT), K0.y, flyT) -
      (g.portrait ? 0 : 70 * Math.sin(Math.PI * ev(f, [T.clickModel + 2, T.clickModel + 18], [0, 1], E.inOut)) + 70 * Math.sin(Math.PI * ev(f, [T.clickDone, T.clickDone + 14], [0, 1], E.inOut))) -
      150 * Math.sin(Math.PI * flyT),
    size: lerp(P0.size, K0.size, flyT),
  };
  const heroSquash =
    [T.clickColor1, T.clickShape1, T.clickShape2, T.clickColor2, T.clickShape3].reduce((a, t) => a + osc(f, t + 1, 0.32), 0) +
    T.ticks.reduce((a, t) => a + osc(f, t + 2, 0.16), 0) +
    osc(f, T.clickModel + 18, 0.2) +
    osc(f, T.clickDone + 14, 0.2) +
    0.22 * bump(f, T.clickCreate, T.clickCreate + 8) +
    osc(f, T.heroLand, 0.36);
  const heroLook =
    f < T.clickModel
      ? lookAt(hero, 4.5)
      : {x: g.portrait ? 0 : -5 * popOpen, y: (g.portrait ? 5 : 2) * popOpen};
  const heroBlink = blinkAt(f, [T.clickShape3 + 14, ...T.ticks.map((t) => t + 1), T.clickCreate + 2]);
  // nảy nhỏ khi đổi hình
  const heroHop = [T.clickShape1, T.clickShape2, T.clickShape3].reduce((a, t) => a + 16 * bump(f, t, t + 12), 0) + T.ticks.reduce((a, t) => a + 12 * bump(f, t + 1, t + 11), 0);

  // ── Phần 3: đội agent ──
  const rosterIn = (i: number) => T.rosterIn + i * 4;
  const selAt = (i: number) => {
    const k = SEL.indexOf(i);
    return k < 0 ? 9999 : T.select[k];
  };
  const nSel = T.select.filter((t) => f >= t).length;
  const assignOn = ev(f, [T.select[0], T.select[0] + 8], [0, 1], E.out);
  const landed = ev(f, [T.launch[2] + T.flight, T.launch[2] + T.flight + 10], [0, 1], E.out);

  type AvState = {x: number; y: number; size: number; squash: number; blink: number; look: P; o: number; z: number};
  const avState = (i: number): AvState => {
    const base = g.cardAv(i);
    const k = SEL.indexOf(i);
    const sa = selAt(i);
    let {x, y, size} = base;
    let squash = 0;
    let z = 1;
    const appear = ev(f, [rosterIn(i) + 4, rosterIn(i) + 18], [0, 1], E.back);
    const o = i === 0 ? 1 : appear;
    if (i === 0 && f < T.heroLand) ({x, y, size} = hero);
    // chọn: nhảy lên chào
    y -= 30 * bump(f, sa, sa + 16);
    squash += osc(f, sa + 16, 0.3) - 0.18 * bump(f, sa - 3, sa + 2);
    let look = lookAt(base, 4);
    let blink = blinkAt(f, [sa + 1]);
    if (k >= 0) {
      const L = T.launch[k];
      const t = ev(f, [L, L + T.flight], [0, 1], E.inOut);
      const s = g.slot(k);
      x = lerp(x, s.x, t);
      y = lerp(y, s.y, t) - (g.portrait ? 220 : 170) * Math.sin(Math.PI * t);
      size = lerp(size, s.size, t);
      squash += 0.24 * bump(f, L - 6, L + 1) + osc(f, L + T.flight, 0.34);
      if (f > L) {
        z = 3;
        look = {x: -5 * landed, y: 1.5 * landed};
        blink = Math.max(blink, blinkAt(f, [L + T.flight + 2, 394 + k * 2]));
      }
    }
    return {x, y, size, squash: squash - (i === 0 ? 0 : 0.25 * (1 - appear)), blink, look, o, z};
  };

  const ink = C.text;

  // ── Vẽ ──
  const panelStyle: React.CSSProperties = {
    ...abs(g.panel),
    background: C.white,
    borderRadius: g.portrait ? 56 : 30,
    boxShadow: '0 40px 100px rgba(16,24,40,0.12), 0 0 0 1px rgba(16,24,40,0.06)',
  };

  const sideItems = [
    {ic: <IconNewChat size={30} />, l: 'New Agent'},
    {ic: <div style={{position: 'relative', width: 30, height: 26}}><Ghost width={30} /></div>, l: 'Agent'},
    {ic: <IconTask size={30} />, l: 'Task'},
    {ic: <IconLink size={30} />, l: 'Kết nối'},
  ];
  const sideY = (i: number) => g.panel.y + 150 + i * 62;
  const activeY = keys(f, [T.clickCreate + 6, T.clickCreate + 22], [sideY(0), sideY(1)], E.inOut);

  // hàng model trong bảng
  const popRows = MODELS.map((m, i) => {
    const k = TICKED.indexOf(i);
    const on = k >= 0 ? tickT(k) : 0;
    const ry = g.pop.y + g.popHead + i * g.rowH;
    const hover = popOpen > 0.5 && cur.y > ry && cur.y < ry + g.rowH && cur.x > g.pop.x && cur.x < g.pop.x + g.pop.w ? 1 : 0;
    const box = g.portrait ? 36 : 28;
    return (
      <div
        key={m.name}
        style={{
          position: 'absolute',
          left: g.portrait ? 50 : 12,
          right: g.portrait ? 50 : 12,
          top: g.popHead + i * g.rowH,
          height: g.rowH - 4,
          borderRadius: 14,
          background: on > 0 ? `rgba(24,119,242,${0.08 * on})` : hover ? '#F1F3F4' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: g.portrait ? 22 : 16,
          padding: g.portrait ? '0 22px' : '0 12px',
          fontSize: u.row,
          fontWeight: 500,
          color: ink,
          ...enter(T.clickModel + 4 + i * 1.5, 14),
          opacity: ev(f, [T.clickModel + 4 + i * 1.5, T.clickModel + 16 + i * 1.5], [0, 1], E.out),
        }}
      >
        <div
          style={{
            position: 'relative',
            width: box,
            height: box,
            borderRadius: 9,
            border: `2.5px solid ${on > 0.05 ? C.send : '#BDC1C6'}`,
            background: on > 0.05 ? C.send : C.white,
            display: 'grid',
            placeItems: 'center',
            scale: String(1 + 0.22 * bump(f, T.ticks[Math.max(0, k)], T.ticks[Math.max(0, k)] + 9) * (k >= 0 ? 1 : 0)),
            flexShrink: 0,
          }}
        >
          {on > 0.05 ? <IconCheck size={box * 0.8} color={C.white} stroke={3.2} progress={on} /> : null}
        </div>
        <Mono m={m} size={g.portrait ? 44 : 34} />
        <span style={{whiteSpace: 'nowrap', fontWeight: on > 0.5 ? 600 : 500}}>{m.name}</span>
        {m.isNew ? (
          <span style={{marginLeft: 'auto', fontSize: u.chip, fontWeight: 600, color: C.send, background: '#E8F0FE', borderRadius: 999, padding: '3px 14px'}}>Mới</span>
        ) : null}
      </div>
    );
  });

  const selectedModels = TICKED.filter((_, k) => f >= T.ticks[k]).map((i) => MODELS[i]);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* nền: quầng xanh rất nhạt sau khung */}
      <AbsoluteFill style={{background: `radial-gradient(${g.portrait ? '900px 1100px at 50% 62%' : '1300px 760px at 50% 62%'}, #EAF1FE 0%, rgba(253,253,253,0) 70%)`}} />

      {/* ── Tiêu đề chuyển động (ngoài camera) ── */}
      <Headline
        lines={g.portrait ? ['Tạo agent', 'của riêng bạn.'] : ['Tạo agent của riêng bạn.']}
        start={8}
        f={f}
        size={g.head.size}
        top={g.head.top}
        out={ev(f, [T.clickModel - 10, T.clickModel + 2], [0, 1], E.in)}
      />
      {f >= T.clickModel ? (
        <Headline
          lines={g.portrait ? ['Chọn nhiều', 'model.'] : ['Chọn nhiều model.']}
          start={T.clickModel + 4}
          f={f}
          size={g.head.size}
          top={g.head.top}
          out={ev(f, [T.clickCreate + 4, T.clickCreate + 16], [0, 1], E.in)}
        />
      ) : null}
      {f >= T.clickCreate + 16 ? (
        <Headline lines={g.portrait ? ['Chọn agent.', 'Giao việc.'] : ['Chọn agent. Giao việc.']} start={T.clickCreate + 20} f={f} size={g.head.size} top={g.head.top} out={0} />
      ) : null}

      {/* ── Sân khấu (camera) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: `${camO.x}px ${camO.y}px`,
          scale: String(cam),
          opacity: winT,
          translate: `0px ${(1 - winT) * 70}px`,
        }}
      >
        <div style={panelStyle}>
          {g.portrait ? (
            <div style={{position: 'absolute', top: 16, left: '50%', translate: '-50% 0', width: 90, height: 8, borderRadius: 4, background: '#D5D7DB'}} />
          ) : (
            <>
              {/* đèn cửa sổ */}
              <div style={{position: 'absolute', left: 26, top: 24, display: 'flex', gap: 11}}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                  <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />
                ))}
              </div>
              {/* sidebar */}
              <div style={{position: 'absolute', left: 30, top: 74, right: g.panel.w - g.side + 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <BrandPlus size={36} />
                <IconPanel size={30} />
              </div>
            </>
          )}
        </div>

        {!g.portrait ? (
          <>
            <div style={{position: 'absolute', left: g.panel.x + 16, top: activeY, width: g.side - 32, height: 54, borderRadius: 999, background: C.activePill}} />
            {sideItems.map((s, i) => {
              const on = i === 0 ? 1 - ev(f, [T.clickCreate + 6, T.clickCreate + 22], [0, 1], E.inOut) : i === 1 ? ev(f, [T.clickCreate + 6, T.clickCreate + 22], [0, 1], E.inOut) : 0;
              return (
                <div
                  key={s.l}
                  style={{
                    position: 'absolute',
                    left: g.panel.x + 36,
                    top: sideY(i),
                    height: 54,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    fontSize: 26,
                    fontWeight: on > 0.5 ? 600 : 500,
                    color: on > 0.5 ? C.text : C.label,
                  }}
                >
                  {s.ic}
                  {s.l}
                </div>
              );
            })}
            <div style={{position: 'absolute', left: g.panel.x + 30, top: g.panel.y + g.panel.h - 80, display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, fontWeight: 500, color: C.label}}>
              <div style={{width: 44, height: 44, borderRadius: 22, background: C.send, color: C.white, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 24}}>S</div>
              Sirrok Agent
            </div>
          </>
        ) : null}

        {/* ── PHẦN 1–2: form New Agent ── */}
        {formO > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: formO, scale: String(formS), transformOrigin: `${g.cx}px ${g.panel.y + g.panel.h / 2}px`}}>
            {/* bóng đổ dưới avatar xem trước */}
            <div
              style={{
                position: 'absolute',
                left: P0.x - P0.size * 0.32,
                top: P0.y + P0.size * 0.44,
                width: P0.size * 0.64,
                height: P0.size * 0.1,
                borderRadius: '50%',
                background: 'rgba(16,24,40,0.12)',
                filter: 'blur(6px)',
                scale: `${1 + heroSquash * 0.6 - (heroHop / 60) * (1 - sideT)} 1`,
                opacity: (1 - sideT) * ev(f, [8, 20], [0, 1], E.out),
              }}
            />

            {/* hàng màu */}
            {COLOR_KEYS.map((c, i) => {
              const at = 10 + i * 1.2;
              const t = ev(f, [at, at + 14], [0, 1], E.back);
              const clickAt = c === 'blue' ? T.clickColor1 : c === 'orange' ? T.clickColor2 : -99;
              const hex = AGENT_COLORS[c];
              return (
                <div
                  key={c}
                  style={{
                    position: 'absolute',
                    left: g.swX(i) - g.sw / 2,
                    top: g.swY - g.sw / 2,
                    width: g.sw,
                    height: g.sw,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 34% 28%, ${mixHex(hex, '#FFFFFF', 0.32)}, ${hex} 58%, ${mixHex(hex, '#000000', 0.18)})`,
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.12)',
                    scale: String(t * (1 - 0.18 * bump(f, clickAt, clickAt + 9))),
                  }}
                />
              );
            })}
            <div
              style={{
                position: 'absolute',
                left: swRingX - g.sw / 2 - 7,
                top: g.swY - g.sw / 2 - 7,
                width: g.sw + 14,
                height: g.sw + 14,
                borderRadius: '50%',
                border: `3px solid ${C.send}`,
                boxSizing: 'border-box',
                opacity: ev(f, [16, 26], [0, 1], E.out),
              }}
            />

            {/* lưới hình */}
            {SHAPE_KEYS.map((s, i) => {
              const p = g.shapeAt(i);
              const at = 14 + i * 1.1;
              const t = ev(f, [at, at + 14], [0, 1], E.back);
              const clickAt = i === 1 ? T.clickShape1 : i === 5 ? T.clickShape2 : i === 11 ? T.clickShape3 : -99;
              return (
                <div
                  key={s}
                  style={{
                    position: 'absolute',
                    left: p.x - g.cell / 2,
                    top: p.y - g.cell / 2,
                    width: g.cell,
                    height: g.cell,
                    borderRadius: '50%',
                    background: '#F1F3F4',
                    display: 'grid',
                    placeItems: 'center',
                    scale: String(t * (1 - 0.14 * bump(f, clickAt, clickAt + 9))),
                  }}
                >
                  <AgentAvatar shape={s} color={gridColor(i)} size={g.cell * 0.66} f={f} squash={osc(f, clickAt + 1, 0.3)} />
                </div>
              );
            })}
            <div
              style={{
                position: 'absolute',
                left: shRing.x - g.cell / 2 - 5,
                top: shRing.y - g.cell / 2 - 5,
                width: g.cell + 10,
                height: g.cell + 10,
                borderRadius: '50%',
                border: `3px solid ${C.send}`,
                boxSizing: 'border-box',
                opacity: ev(f, [20, 30], [0, 1], E.out),
              }}
            />

            {/* Tên */}
            <div style={{position: 'absolute', left: g.name.x, top: g.nameLbl, fontSize: u.lbl, fontWeight: 600, color: C.label, ...enter(20)}}>Tên</div>
            <div
              style={{
                ...abs(g.name),
                borderRadius: 14,
                border: `2px solid ${mixHex(C.field, C.send, nameFocus)}`,
                boxShadow: `0 0 0 ${5 * nameFocus}px rgba(11,87,208,0.12)`,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                padding: '0 22px',
                boxSizing: 'border-box',
                fontSize: u.field,
                fontWeight: 500,
                ...enter(22),
              }}
            >
              {nameText ? <span style={{color: ink}}>{nameText}</span> : f < T.nameType ? <span style={{color: C.muted}}>vd: Trợ lý viết content</span> : null}
              {nameFocus > 0.02 ? (
                <span style={{position: 'relative', display: 'inline-block', width: u.field * 0.9, height: u.field, opacity: nameFocus}}>
                  <EyePair logoWidth={u.field * 2} color={C.send} blink={blinkAt(f, [T.clickName + 2, 112])} style={{left: u.field * 0.5, top: u.field * 0.5}} />
                </span>
              ) : null}
            </div>

            {/* Mô tả */}
            <div style={{position: 'absolute', left: g.desc.x, top: g.descLbl, fontSize: u.lbl, fontWeight: 600, color: C.label, ...enter(24)}}>Mô tả</div>
            <div
              style={{
                ...abs(g.desc),
                borderRadius: 14,
                border: `2px solid ${mixHex(C.field, C.send, descFocus)}`,
                boxShadow: `0 0 0 ${5 * descFocus}px rgba(11,87,208,0.12)`,
                background: C.white,
                display: 'flex',
                alignItems: 'flex-start',
                padding: g.portrait ? '20px 22px' : '16px 22px',
                boxSizing: 'border-box',
                fontSize: u.field,
                fontWeight: 500,
                lineHeight: 1.3,
                ...enter(26),
              }}
            >
              {descText ? <span style={{color: ink}}>{descText}</span> : f < T.descType ? <span style={{color: C.muted}}>Mô tả agent này làm gì…</span> : null}
              {descFocus > 0.02 ? (
                <span style={{position: 'relative', display: 'inline-block', width: u.field * 0.9, height: u.field * 1.3, opacity: descFocus}}>
                  <EyePair logoWidth={u.field * 2} color={C.send} blink={blinkAt(f, [T.clickDesc + 2, 142])} style={{left: u.field * 0.5, top: u.field * 0.65}} />
                </span>
              ) : null}
            </div>

            {/* hàng nút: chọn model · Hủy · Tạo Agent */}
            <div
              style={{
                ...abs(g.pill),
                borderRadius: 999,
                border: `2px solid ${popOpen > 0.3 ? C.send : C.field}`,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 18px',
                boxSizing: 'border-box',
                fontSize: u.btn,
                fontWeight: 600,
                color: ink,
                whiteSpace: 'nowrap',
                scale: String(1 - 0.06 * bump(f, T.clickModel, T.clickModel + 8)),
                ...enter(28),
              }}
            >
              {selectedModels.length ? (
                <>
                  <div style={{display: 'flex'}}>
                    {selectedModels.map((m, i) => (
                      <div key={m.name} style={{marginLeft: i ? -12 : 0, borderRadius: '50%', boxShadow: '0 0 0 2.5px #fff', scale: String(ev(f, [T.ticks[i], T.ticks[i] + 10], [0, 1], E.back))}}>
                        <Mono m={m} size={g.portrait ? 40 : 34} />
                      </div>
                    ))}
                  </div>
                  <span style={{display: 'inline-block', scale: String(1 + 0.12 * countBump)}}>{count} model</span>
                </>
              ) : (
                <span style={{color: C.label}}>Chọn model</span>
              )}
              <div style={{marginLeft: 'auto', rotate: `${180 * popOpen}deg`, display: 'grid'}}>
                <IconChevron size={u.btn} />
              </div>
            </div>
            <div
              style={{
                ...abs(g.cancel),
                borderRadius: 999,
                border: `2px solid ${C.field}`,
                display: 'grid',
                placeItems: 'center',
                fontSize: u.btn,
                fontWeight: 500,
                color: ink,
                background: C.white,
                ...enter(30),
              }}
            >
              Hủy
            </div>
            <div
              style={{
                ...abs(g.create),
                borderRadius: 999,
                background: C.send,
                display: 'grid',
                placeItems: 'center',
                fontSize: u.btn,
                fontWeight: 600,
                color: C.white,
                boxShadow: `0 8px 22px rgba(11,87,208,${0.25 + 0.2 * bump(f, T.clickCreate, T.clickCreate + 12)})`,
                scale: String(1 - 0.08 * bump(f, T.clickCreate, T.clickCreate + 8)),
                ...enter(32),
              }}
            >
              Tạo Agent
            </div>

            {/* màn mờ sau bảng chọn model */}
            {popOpen > 0.001 ? (
              <div
                style={{
                  ...abs(g.portrait ? g.panel : {x: g.panel.x + g.side, y: g.panel.y, w: g.panel.w - g.side, h: g.panel.h}),
                  borderRadius: g.portrait ? 56 : '0 30px 30px 0',
                  background: g.portrait ? `rgba(16,24,40,${0.18 * popOpen})` : `rgba(255,255,255,${0.72 * popOpen})`,
                }}
              />
            ) : null}
            {/* bảng chọn model */}
            {popOpen > 0.001 ? (
              <div
                style={{
                  ...abs(g.pop),
                  background: C.white,
                  borderRadius: g.portrait ? '44px 44px 56px 56px' : 22,
                  boxShadow: '0 24px 70px rgba(16,24,40,0.20), 0 0 0 1px rgba(16,24,40,0.07)',
                  opacity: g.portrait ? 1 : popOpen,
                  translate: g.portrait ? `0px ${(1 - popOpen) * (g.pop.h + 40)}px` : `0px ${(1 - popOpen) * 18}px`,
                  scale: g.portrait ? '1' : String(0.94 + 0.06 * popOpen),
                  transformOrigin: 'left bottom',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: g.portrait ? 72 : 24,
                    right: g.portrait ? 72 : 24,
                    top: 0,
                    height: g.popHead,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: u.title,
                    fontWeight: 700,
                    color: ink,
                  }}
                >
                  Chọn model
                  <span
                    style={{
                      fontSize: u.chip,
                      fontWeight: 600,
                      color: count ? C.white : C.label,
                      background: count ? C.send : '#F1F3F4',
                      borderRadius: 999,
                      padding: '4px 16px',
                      scale: String(1 + 0.18 * countBump),
                    }}
                  >
                    {count} model
                  </span>
                </div>
                {popRows}
                <div
                  style={{
                    position: 'absolute',
                    left: g.done.x - g.pop.x,
                    top: g.done.y - g.pop.y,
                    width: g.done.w,
                    height: g.done.h,
                    borderRadius: 999,
                    background: C.send,
                    color: C.white,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: u.btn,
                    fontWeight: 600,
                    scale: String(1 - 0.08 * bump(f, T.clickDone, T.clickDone + 8)),
                  }}
                >
                  Xong
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ── PHẦN 3: đội agent + thẻ task ── */}
        {f >= T.rosterIn ? (
          <>
            {/* thẻ task */}
            <div
              style={{
                ...abs(g.task),
                borderRadius: 26,
                background: C.white,
                border: `2px solid ${mixHex('#E3E3E3', '#1877F2', landed)}`,
                boxShadow: `0 14px 40px rgba(16,24,40,0.08), 0 0 0 ${8 * landed * (1 - ev(f, [390, 404], [0, 1], E.out) * 0.5)}px rgba(24,119,242,0.12)`,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '0 28px',
                ...enter(T.rosterIn + 8, -24),
              }}
            >
              <div style={{width: g.portrait ? 74 : 66, height: g.portrait ? 74 : 66, borderRadius: 20, background: '#E8F0FE', display: 'grid', placeItems: 'center', flexShrink: 0}}>
                <IconTask size={g.portrait ? 40 : 36} color={C.send} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <div style={{fontSize: u.title, fontWeight: 700, color: ink, whiteSpace: 'nowrap'}}>Gửi báo giá cho khách</div>
                <div style={{position: 'relative', height: u.chip * 1.3, fontSize: u.chip, fontWeight: 500, whiteSpace: 'nowrap'}}>
                  <span style={{position: 'absolute', left: 0, top: 0, color: C.muted, opacity: 1 - landed}}>Task · chưa giao</span>
                  <span style={{position: 'absolute', left: 0, top: 0, color: C.ok, opacity: landed, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600}}>
                    <IconCheck size={u.chip * 1.1} progress={landed} />
                    Đã giao · 3 agent
                  </span>
                </div>
              </div>
            </div>
            {/* chỗ trống cho agent đáp xuống */}
            {[0, 1, 2].map((k) => {
              const s = g.slot(k);
              const L = T.launch[k] + T.flight;
              return (
                <div
                  key={k}
                  style={{
                    position: 'absolute',
                    left: s.x - s.size / 2,
                    top: s.y - s.size / 2,
                    width: s.size,
                    height: s.size,
                    borderRadius: '50%',
                    border: `2.5px dashed #BDC1C6`,
                    boxSizing: 'border-box',
                    opacity: ev(f, [T.rosterIn + 16 + k * 3, T.rosterIn + 28 + k * 3], [0, 1], E.out) * (1 - ev(f, [L - 2, L + 2], [0, 1], E.out)),
                    scale: String(1 + 0.08 * bump(f, T.select[k], T.select[k] + 12)),
                  }}
                />
              );
            })}

            {/* thẻ agent */}
            {ROSTER.map((a, i) => {
              const r = g.cards[i];
              const t = ev(f, [rosterIn(i), rosterIn(i) + 16], [0, 1], E.out);
              const sa = selAt(i);
              const on = ev(f, [sa, sa + 8], [0, 1], E.out);
              const m = MODELS[a.model];
              const k = SEL.indexOf(i);
              const gone = k >= 0 ? ev(f, [T.launch[k], T.launch[k] + 8], [0, 1], E.out) : 0;
              return (
                <div
                  key={a.name}
                  style={{
                    ...abs(r),
                    borderRadius: 26,
                    background: on > 0 ? mixHex('#FFFFFF', '#F3F7FE', on) : C.white,
                    boxShadow: `0 10px 30px rgba(16,24,40,0.07), 0 0 0 ${1.5 + 1.5 * on}px ${mixHex('#E3E3E3', '#1877F2', on)}`,
                    opacity: t * (1 - 0.35 * ev(f, [T.push, T.push + 16], [0, 1], E.inOut) * (k < 0 ? 1 : 0)),
                    translate: `0px ${(1 - t) * 40}px`,
                    scale: String((0.94 + 0.06 * t) * (1 - 0.04 * bump(f, sa - 2, sa + 8))),
                  }}
                >
                  {/* chỗ avatar để lại khi đã bay đi */}
                  <div
                    style={{
                      position: 'absolute',
                      left: r.w / 2 - g.cardAv(i).size * 0.42,
                      top: g.cardAv(i).y - r.y - g.cardAv(i).size * 0.42,
                      width: g.cardAv(i).size * 0.84,
                      height: g.cardAv(i).size * 0.84,
                      borderRadius: '50%',
                      border: '2.5px dashed #D5D7DB',
                      boxSizing: 'border-box',
                      opacity: gone,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: g.portrait ? 132 : 122,
                      textAlign: 'center',
                      fontSize: u.card,
                      fontWeight: 700,
                      color: ink,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.name}
                  </div>
                  <div style={{position: 'absolute', left: 0, right: 0, top: g.portrait ? 172 : 160, display: 'flex', justifyContent: 'center'}}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '3px 14px 3px 6px',
                        borderRadius: 999,
                        background: '#F1F3F4',
                        fontSize: u.chip,
                        fontWeight: 500,
                        color: C.label,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Mono m={m} size={u.chip * 1.15} />
                      {m.name}
                      {a.extra ? <span style={{fontWeight: 700, color: C.send}}>+{a.extra}</span> : null}
                    </div>
                  </div>
                  {/* dấu chọn */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      width: g.portrait ? 42 : 36,
                      height: g.portrait ? 42 : 36,
                      borderRadius: '50%',
                      background: C.send,
                      display: 'grid',
                      placeItems: 'center',
                      scale: String(ev(f, [sa, sa + 10], [0, 1], E.back)),
                    }}
                  >
                    <IconCheck size={g.portrait ? 30 : 26} color={C.white} stroke={3.2} progress={ev(f, [sa + 3, sa + 11], [0, 1], E.out)} />
                  </div>
                  {i === 0 ? (
                    <div
                      style={{
                        position: 'absolute',
                        left: 16,
                        top: 16,
                        fontSize: u.chip,
                        fontWeight: 700,
                        color: C.white,
                        background: AGENT_COLORS.orange,
                        borderRadius: 999,
                        padding: '2px 14px',
                        scale: String(ev(f, [T.heroLand, T.heroLand + 12], [0, 1], E.back)),
                        transformOrigin: 'left center',
                      }}
                    >
                      Mới
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* nút Giao việc */}
            <div
              style={{
                ...abs(g.assign),
                borderRadius: 999,
                background: mixHex('#E8EAED', C.send, assignOn),
                color: mixHex('#5F6368', '#FFFFFF', assignOn),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                fontSize: u.btn,
                fontWeight: 600,
                boxShadow: `0 8px 22px rgba(11,87,208,${0.25 * assignOn + 0.2 * bump(f, T.clickAssign, T.clickAssign + 12)})`,
                scale: String(1 - 0.08 * bump(f, T.clickAssign, T.clickAssign + 8)),
                ...enter(T.rosterIn + 26),
                opacity: ev(f, [T.rosterIn + 26, T.rosterIn + 40], [0, 1], E.out) * (1 - 0.35 * ev(f, [T.push, T.push + 16], [0, 1], E.inOut)),
              }}
            >
              Giao việc
              {nSel > 0 ? (
                <span
                  style={{
                    minWidth: u.btn * 1.3,
                    height: u.btn * 1.3,
                    borderRadius: 999,
                    background: C.white,
                    color: C.send,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    scale: String(1 + 0.25 * T.select.reduce((s, t) => s + bump(f, t, t + 10), 0)),
                  }}
                >
                  {nSel}
                </span>
              ) : null}
            </div>
          </>
        ) : null}

        {/* ── avatar (luôn nằm trên cùng để bay qua mọi thứ) ── */}
        {ROSTER.map((a, i) => {
          if (i > 0 && f < T.rosterIn) return null;
          const s = avState(i);
          const isHero = i === 0 && f < T.heroLand;
          return (
            <div key={a.name} style={{position: 'absolute', left: s.x - s.size / 2, top: s.y - s.size / 2 - (isHero ? heroHop : 0), zIndex: s.z, opacity: s.o}}>
              <AgentAvatar
                shape={isHero ? shp.cur : a.shape}
                from={isHero ? shp.prev : undefined}
                mix={isHero ? shapeMix : 1}
                color={isHero ? heroColor : AGENT_COLORS[a.color]}
                size={s.size}
                f={f}
                squash={isHero ? heroSquash : s.squash}
                blink={isHero ? heroBlink : s.blink}
                look={isHero ? heroLook : s.look}
                style={{opacity: isHero ? ev(f, [6, 20], [0, 1], E.out) : 1, scale: isHero ? String(ev(f, [6, 22], [0.6, 1], E.back)) : '1'}}
              />
            </div>
          );
        })}

        {/* lời chào của agent vừa được chọn */}
        {SEL.map((i, k) => {
          const sa = T.select[k];
          const av = g.cardAv(i);
          const t = ev(f, [sa + 4, sa + 14], [0, 1], E.back);
          const o = ev(f, [sa + 4, sa + 10], [0, 1], E.out) * (1 - ev(f, [sa + 30, sa + 38], [0, 1], E.in));
          if (o <= 0) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: av.x + av.size * 0.5,
                top: av.y - av.size * 0.36,
                zIndex: 4,
                padding: g.portrait ? '8px 18px' : '6px 16px',
                borderRadius: '20px 20px 20px 6px',
                background: C.ink,
                color: C.white,
                fontSize: u.bubble,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                opacity: o,
                scale: String(0.6 + 0.4 * t),
                transformOrigin: 'left bottom',
              }}
            >
              {ROSTER[i].greet}
            </div>
          );
        })}

        {/* con trỏ cặp mắt + gợn bấm */}
        {clicks.map((c) => (
          <ClickRipple key={c.f} f={f} at={c.f} x={c.p.x} y={c.p.y} />
        ))}
        <div style={{position: 'absolute', inset: 0, zIndex: 5}}>
          <AgentCursor keys={ks} f={f} logoWidth={g.cursorW} blink={blinkAt(f, clickFrames.map((c) => c - 1))} opacity={cursorO} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
