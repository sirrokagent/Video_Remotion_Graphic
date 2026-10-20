import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ev, keys} from '../../anim';
import {C, E, FONT} from '../../theme';
import {Mascot} from '../mascot';
import {Kinetic} from '../text';

/**
 * Cảnh Team — "10 agent làm việc của 30–50 người". Không thoại: số liệu + chữ chuyển động.
 * Phong cách riêng của cảnh: đồ hoạ dữ liệu — lưới người, bộ đếm cuộn số, gộp nhóm, đường nối.
 * MỘT file cho cả khung ngang 1920×1080 và khung dọc 1080×1920 (đọc useVideoConfig).
 *
 * Mốc chính (frame của cảnh — dùng đặt SFX):
 *   10–84   50 người hiện dần, bộ đếm cuộn 0 → 50 "người", nhãn vai trò nháy trên đám đông
 *   86      bộ đếm chạm 50 (nảy nhẹ)
 *   104–165 từng nhóm 5 người gộp lại thành 1 ghost agent (nhóm g gộp ở 104 + 5g, agent bật ra ở +12)
 *           bộ đếm cuộn ngược 50 → 10
 *   158     nhãn "người" → "agent"  → "10 agent"
 *   168     bộ đếm "việc đã xong" bắt đầu chạy, dấu ✓ bật lên trên đầu agent
 *   222–248 tiêu đề nở ra "10 agent = 30–50 người", agent dời chỗ
 *   232–280 mỗi agent toả ra 5 người tí hon + đường nối (1 agent = 5 người)
 *   280–340 giữ khung; 340–360 vệt mắt chuyển cảnh che đuôi
 */

// ── Mốc thời gian ──────────────────────────────────────────────
export const TEAM_T = {
  countIn: 10,
  countEnd: 84,
  full: 86,
  merge: 104, // nhóm đầu tiên bắt đầu gộp
  mergeStep: 5,
  swap: 158, // "người" → "agent"
  ticker: 168,
  head: 222, // tiêu đề nở ra
  tiny: 232, // người tí hon toả ra từ agent
} as const;

const N = 50; // số người
const G = 10; // số agent

// Hàm băm tất định thay cho Math.random
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const GREY = '#A3A9B1'; // người trong đám đông
const LINE = '#C9CDD3'; // đường nối
// Bảng màu đội: sắc xanh thương hiệu + đen + vài màu ấm
export const TEAM_BODY = ['#1877F2', '#000000', '#D97757', '#0B57D0', '#1DB954', '#005EFB', '#F5A623', '#236EEE', '#000000', '#0B57D0'];
export const TEAM_ROLES = ['Sales', 'Kế toán', 'CSKH', 'Marketing', 'Nội dung', 'Đơn hàng', 'Kho', 'Nhân sự', 'Báo cáo', 'Lịch hẹn'];

type Pt = {x: number; y: number};
type Person = Pt & {g: number; j: number; key: number};

type Layout = {
  people: Person[];
  glyph: number;
  groupC: Pt[];
  agent: number;
  roleDy: number;
  agentD: Pt[];
  agentDSize: number;
  tiny: Pt[]; // chỗ của người tí hon (theo chỉ số người)
  tinySize: number;
  counter: {y: number; num: number; label: number};
  counterD: {y: number; num: number; label: number};
  /** khung dọc: vế phải của phương trình xuống dòng riêng */
  line2?: {y: number; size: number};
  ticker: number;
  tagSize: number;
};

const landscape = (): Layout => {
  const xs = (c: number) => 960 + (c - 4.5) * 170;
  const people: Person[] = [];
  for (let c = 0; c < 10; c++)
    for (let r = 0; r < 5; r++) {
      const i = people.length;
      people.push({x: xs(c), y: 470 + r * 98, g: c, j: r, key: rnd(i) * 0.5 + (c / 10) * 0.42 + (r / 5) * 0.08});
    }
  return {
    people,
    glyph: 74,
    groupC: [...Array(G)].map((_, g) => ({x: xs(g), y: 666})),
    agent: 118,
    roleDy: 74,
    agentD: [...Array(G)].map((_, g) => ({x: xs(g), y: 712})),
    agentDSize: 104,
    tiny: people.map((p) => ({x: xs(p.g) + (p.j - 2) * 30, y: 500})),
    tinySize: 26,
    counter: {y: 214, num: 210, label: 104},
    counterD: {y: 236, num: 124, label: 124},
    ticker: 912,
    tagSize: 26,
  };
};

const portrait = (): Layout => {
  const xs = (c: number) => 540 + (c - 2) * 190;
  const people: Person[] = [];
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 5; c++) {
      const i = people.length;
      const band = r >= 5 ? 1 : 0;
      people.push({x: xs(c), y: 650 + r * 86, g: c + 5 * band, j: r % 5, key: rnd(i) * 0.5 + (r / 10) * 0.42 + (c / 5) * 0.08});
    }
  const bandY = [822, 1252];
  const bandD = [880, 1276];
  return {
    people,
    glyph: 66,
    groupC: [...Array(G)].map((_, g) => ({x: xs(g % 5), y: bandY[g >= 5 ? 1 : 0]})),
    agent: 136,
    roleDy: 86,
    agentD: [...Array(G)].map((_, g) => ({x: xs(g % 5), y: bandD[g >= 5 ? 1 : 0]})),
    agentDSize: 120,
    tiny: people.map((p) => ({x: xs(p.g % 5) + (p.j - 2) * 32, y: bandD[p.g >= 5 ? 1 : 0] - 172})),
    tinySize: 28,
    counter: {y: 430, num: 250, label: 120},
    counterD: {y: 330, num: 176, label: 150},
    line2: {y: 500, size: 112},
    ticker: 1470,
    tagSize: 26,
  };
};

// ── Bộ đếm ────────────────────────────────────────────────────
const vCount = (f: number) => ev(f, [TEAM_T.countIn, TEAM_T.countEnd], [0, N], E.inOut);
const mergeAt = (g: number) => TEAM_T.merge + g * TEAM_T.mergeStep;
const vValue = (f: number) => {
  if (f < TEAM_T.merge) return vCount(f);
  let v = N;
  for (let g = 0; g < G; g++) v -= 4 * ev(f, [mergeAt(g) + 6, mergeAt(g) + 16], [0, 1], E.out);
  return v;
};

/** Frame mỗi người (theo thứ hạng xuất hiện) hiện ra — khớp đúng con số trên bộ đếm. */
const APPEAR = (() => {
  const out: number[] = [];
  let f = 0;
  for (let k = 0; k < N; k++) {
    while (vCount(f) < k + 0.6) f += 0.25;
    out.push(f);
  }
  return out;
})();

/** Đồng hồ cuộn số kiểu công-tơ-mét: hàng chục lăn theo khi hàng đơn vị qua 9. */
const Odometer: React.FC<{v: number; size: number; color: string}> = ({v, size, color}) => {
  const ones = ((v % 10) + 10) % 10;
  const tensPos = Math.floor(v / 10) + Math.max(0, Math.min(1, (v % 10) - 9));
  const dw = size * 0.68;
  const col = (pos: number, digits: string[], w: number) => (
    <div style={{position: 'relative', width: w, height: size, overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: 0, top: -pos * size, width: dw}}>
        {digits.map((d, i) => (
          <div key={i} style={{height: size, lineHeight: `${size}px`, textAlign: 'center'}}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{display: 'flex', fontSize: size, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: 0}}>
      {col(tensPos, ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'], dw * Math.min(1, tensPos))}
      {col(ones, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], dw)}
    </div>
  );
};

/** Hình người tối giản: đầu tròn + vai. */
const PersonGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible'}}>
    <circle cx={50} cy={30} r={21} fill={color} />
    <path d="M12 98 C12 68 30 58 50 58 C70 58 88 68 88 98 Z" fill={color} />
  </svg>
);

const Check: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: '50%', background: '#1DB954', display: 'grid', placeItems: 'center', boxShadow: '0 6px 14px rgba(29,185,84,0.35)'}}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  </div>
);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Team: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const isPortrait = height > width;
  const L = React.useMemo(() => (isPortrait ? portrait() : landscape()), [isPortrait]);

  // thứ hạng xuất hiện của từng người (quét theo hướng đọc, có xáo nhẹ tất định)
  const rank = React.useMemo(() => {
    const order = L.people.map((p, i) => ({i, k: p.key})).sort((a, b) => a.k - b.k);
    const r: number[] = [];
    order.forEach((o, k) => (r[o.i] = k));
    return r;
  }, [L]);

  // ── bộ đếm → tiêu đề ──
  const v = vValue(f);
  const d = ev(f, [TEAM_T.head, TEAM_T.head + 26], [0, 1], E.inOut);
  const numSize = lerp(L.counter.num, L.counterD.num, d);
  const labSize = lerp(L.counter.label, L.counterD.label, d);
  const cy = lerp(L.counter.y, L.counterD.y, d);
  const counterIn = ev(f, [4, 18], [0, 1], E.out);
  const bump = keys(f, [TEAM_T.full - 2, TEAM_T.full + 3, TEAM_T.full + 14], [1, 1.08, 1], E.out);
  const swap = ev(f, [TEAM_T.swap, TEAM_T.swap + 12], [0, 1], E.inOut);
  const grow = ev(f, [TEAM_T.head + 4, TEAM_T.head + 28], [0, 1], E.inOut);

  const labelSpan = (text: string, op: number, blur: number, color: string) => (
    <span style={{gridArea: '1 / 1', opacity: op, filter: `blur(${blur}px)`, color}}>{text}</span>
  );

  const counter = (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: cy,
        translate: '0 -50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        fontFamily: FONT,
        opacity: counterIn,
        scale: String(bump),
      }}
    >
      <Odometer v={v} size={numSize} color={C.ink} />
      <div
        style={{
          display: 'grid',
          marginLeft: labSize * 0.28,
          marginBottom: (numSize - labSize) * 0.16,
          fontSize: labSize,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: '-0.035em',
        }}
      >
        {labelSpan('người', 1 - swap, swap * 14, C.ink)}
        {labelSpan('agent', swap, (1 - swap) * 14, C.send)}
      </div>
      {/* khung ngang: vế phải của phương trình mọc ra ngay trên cùng dòng */}
      {!L.line2 ? (
        <div style={{maxWidth: grow * 1100, clipPath: 'inset(-60% 0 -60% 0)', marginLeft: grow * labSize * 0.12, marginBottom: (numSize - labSize) * 0.16}}>
          <Kinetic text="= 30–50 người" f={f} start={TEAM_T.head + 8} size={labSize} variant="rise" by="char" stagger={1.2} style={{flexWrap: 'nowrap', width: 'max-content', lineHeight: 1}} />
        </div>
      ) : null}
    </div>
  );

  // ── người ──
  const people = L.people.map((p, i) => {
    const a = APPEAR[rank[i]];
    if (f < a) return null;
    const ms = mergeAt(p.g) + Math.abs(p.j - 2) * 1.2;
    const m = ev(f, [ms, ms + 16], [0, 1], E.inOut);
    if (m >= 1) return null;
    const gc = L.groupC[p.g];
    const x = lerp(p.x, gc.x, m);
    const y = lerp(p.y, gc.y, m) + Math.sin(f * 0.09 + i) * 1.6 * (1 - m);
    const s = ev(f, [a, a + 10], [0, 1], E.back) * (1 - 0.65 * m);
    const op = ev(f, [a, a + 6], [0, 1], E.out) * ev(m, [0.5, 1], [1, 0], E.in);
    const tagged = rank[i] % 3 === 0 && f < a + 16;
    const tagOp = tagged ? ev(f, [a, a + 4], [0, 1], E.out) * (1 - ev(f, [a + 11, a + 16], [0, 1], E.out)) : 0;
    return (
      <React.Fragment key={i}>
        <div style={{position: 'absolute', left: x - L.glyph / 2, top: y - L.glyph / 2, scale: String(s), opacity: op}}>
          <PersonGlyph size={L.glyph} color={tagOp > 0.3 ? C.sparkle : GREY} />
        </div>
        {tagOp > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: x,
              top: y - L.glyph / 2 - 12,
              translate: '-50% -100%',
              padding: '6px 14px',
              borderRadius: 999,
              background: C.send,
              color: C.white,
              fontFamily: FONT,
              fontSize: L.tagSize,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              opacity: tagOp,
              scale: String(ev(f, [a, a + 7], [0.6, 1], E.back)),
              zIndex: 3,
            }}
          >
            {TEAM_ROLES[(i * 7) % G]}
          </div>
        ) : null}
      </React.Fragment>
    );
  });

  // ── agent ──
  const agents = [...Array(G)].map((_, g) => {
    const born = mergeAt(g) + 12;
    if (f < born - 2) return null;
    const dg = ev(f, [TEAM_T.head + g * 1.2, TEAM_T.head + 26 + g * 1.2], [0, 1], E.inOut);
    const size = lerp(L.agent, L.agentDSize, dg);
    const x = lerp(L.groupC[g].x, L.agentD[g].x, dg);
    const y = lerp(L.groupC[g].y, L.agentD[g].y, dg);
    const pop = ev(f, [born, born + 14], [0, 1], E.back);
    const ring = ev(f, [born - 2, born + 20], [0, 1], E.out);
    const roleOp = ev(f, [born + 8, born + 20], [0, 1], E.out) * (1 - ev(f, [TEAM_T.head - 6, TEAM_T.head + 6], [0, 1], E.inOut));
    const h = size * 0.863;
    // dấu ✓ bật lên mỗi khi agent làm xong một việc
    const checks = [0, 1, 2, 3, 4, 5].map((k) => {
      const e = TEAM_T.ticker + 4 + rnd(g + 3) * 26 + k * 30;
      const t = ev(f, [e, e + 22], [0, 1], E.out);
      if (f < e || t >= 1) return null;
      return (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: x + size * 0.32,
            top: y - h / 2 - 8 - 44 * t,
            translate: '-50% -50%',
            opacity: ev(f, [e, e + 4], [0, 1], E.out) * (1 - ev(f, [e + 12, e + 22], [0, 1], E.in)),
            scale: String(ev(f, [e, e + 8], [0.4, 1], E.back)),
          }}
        >
          <Check size={30} />
        </div>
      );
    });
    return (
      <React.Fragment key={g}>
        {ring > 0 && ring < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size * (0.5 + 1.3 * ring),
              height: size * (0.5 + 1.3 * ring),
              translate: '-50% -50%',
              borderRadius: '50%',
              border: `${5 * (1 - ring)}px solid ${TEAM_BODY[g]}`,
              opacity: 0.45 * (1 - ring),
            }}
          />
        ) : null}
        <div style={{position: 'absolute', left: x - size / 2, top: y - h / 2, scale: String(pop), zIndex: 2}}>
          <Mascot size={size} state="work" f={f} since={born} body={TEAM_BODY[g]} eyes={C.white} />
        </div>
        {roleOp > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: x,
              top: y + L.roleDy,
              translate: '-50% 0',
              fontFamily: FONT,
              fontSize: 30,
              fontWeight: 600,
              color: C.label,
              whiteSpace: 'nowrap',
              opacity: roleOp,
            }}
          >
            {TEAM_ROLES[g]}
          </div>
        ) : null}
        {checks}
      </React.Fragment>
    );
  });

  // ── 1 agent = 5 người: người tí hon toả ra + đường nối ──
  const tinyT = (p: Person) => TEAM_T.tiny + p.g * 2.5 + p.j * 1.5;
  const lines = L.people.map((p, i) => {
    const ts = tinyT(p);
    const lt = ev(f, [ts + 8, ts + 28], [0, 1], E.inOut);
    if (lt <= 0) return null;
    const t = L.tiny[i];
    const a = L.agentD[p.g];
    const y0 = t.y + L.tinySize * 0.62;
    const y1 = a.y - L.agentDSize * 0.863 * 0.5 - 6;
    const my = (y1 - y0) * 0.55;
    return (
      <path
        key={i}
        d={`M${t.x} ${y0} C${t.x} ${y0 + my} ${a.x} ${y1 - my} ${a.x} ${y1}`}
        fill="none"
        stroke={LINE}
        strokeWidth={2.4}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - lt}
      />
    );
  });
  const tiny = L.people.map((p, i) => {
    const ts = tinyT(p);
    const t = ev(f, [ts, ts + 20], [0, 1], E.out);
    if (t <= 0) return null;
    const a = L.agentD[p.g];
    const to = L.tiny[i];
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: lerp(a.x, to.x, t) - L.tinySize / 2,
          top: lerp(a.y, to.y, t) - L.tinySize / 2,
          opacity: ev(f, [ts, ts + 8], [0, 1], E.out),
          scale: String(0.5 + 0.5 * t),
        }}
      >
        <PersonGlyph size={L.tinySize} color={GREY} />
      </div>
    );
  });

  // ── bộ đếm việc đã xong ──
  const tickerIn = ev(f, [TEAM_T.ticker, TEAM_T.ticker + 16], [0, 1], E.out);
  const done = Math.round(ev(f, [TEAM_T.ticker, 345], [0, 1248], E.inOut));

  // nền: lưới chấm dữ liệu + quầng xanh khi agent xuất hiện
  const glow = ev(f, [110, 170], [0, 1], E.inOut);

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, #E4E6EA 1.7px, transparent 2px)',
          backgroundSize: '40px 40px',
          backgroundPosition: `${(width % 40) / 2}px ${(height % 40) / 2}px`,
          opacity: ev(f, [0, 20], [0, 1], E.out),
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${isPortrait ? '70% 40%' : '55% 45%'} at 50% ${isPortrait ? 58 : 64}%, rgba(35,110,238,${0.1 * glow}), transparent 70%)`,
        }}
      />

      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        {lines}
      </svg>
      {people}
      {tiny}
      {agents}
      {counter}

      {/* khung dọc: vế phải xuống dòng */}
      {L.line2 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: L.line2.y, translate: '0 -50%'}}>
          <Kinetic text="= 30–50 người" f={f} start={TEAM_T.head + 10} size={L.line2.size} variant="rise" by="char" stagger={1.2} />
        </div>
      ) : null}

      {/* việc đã xong */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: L.ticker,
          translate: `0 ${(1 - tickerIn) * 30 - 50}%`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: 18,
          opacity: tickerIn,
        }}
      >
        <Check size={44} />
        <span style={{fontSize: 72, fontWeight: 800, color: C.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>
          {done.toLocaleString('de-DE')}
        </span>
        <span style={{fontSize: 40, fontWeight: 500, color: C.label}}>việc đã xong</span>
      </div>
    </AbsoluteFill>
  );
};
