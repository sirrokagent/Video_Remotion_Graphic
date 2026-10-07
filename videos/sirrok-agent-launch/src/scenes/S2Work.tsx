import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, countVnd, ev, typed} from '../anim';
import {AgentCursor, ClickRipple, Key} from '../cursor';
import {Ghost} from '../logo';
import {C, E, FONT} from '../theme';
import {IconCheck} from '../ui';

/**
 * Cảnh 2 — Agent tự làm. Một việc cụ thể đi xuyên bốn ứng dụng:
 * hộp thư → bảng tính → PDF → soạn thư & gửi. Cặp mắt là con trỏ.
 * Bảng bên phải là danh sách việc của Sirrok, tick xanh theo từng bước.
 */

const CLICK = {mail: 70, pdfBtn: 196, send: 318};

const KEYS: Key[] = [
  {f: 0, x: 900, y: 1160},
  {f: 28, x: 900, y: 1160},
  {f: 62, x: 470, y: 352},
  {f: 104, x: 470, y: 352},
  {f: 132, x: 905, y: 446},
  {f: 146, x: 905, y: 512},
  {f: 160, x: 905, y: 578},
  {f: 176, x: 1180, y: 700},
  {f: 192, x: 1300, y: 352},
  {f: 204, x: 1300, y: 352},
  {f: 228, x: 1060, y: 560},
  {f: 252, x: 1150, y: 760},
  {f: 296, x: 258, y: 822},
  {f: 326, x: 258, y: 822},
  {f: 352, x: 1530, y: 770},
];

const card: React.CSSProperties = {
  position: 'absolute',
  background: C.white,
  borderRadius: 26,
  boxShadow: '0 24px 60px rgba(16,24,40,0.10), 0 0 0 1px rgba(16,24,40,0.06)',
  overflow: 'hidden',
};

const TitleBar: React.FC<{title: string; right?: React.ReactNode}> = ({title, right}) => (
  <div style={{height: 76, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 22, borderBottom: `1.5px solid ${C.hairline}`}}>
    <div style={{display: 'flex', gap: 10}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 15, height: 15, borderRadius: 8, background: c}} />
      ))}
    </div>
    <div style={{fontSize: 30, fontWeight: 600, color: C.text}}>{title}</div>
    <div style={{flex: 1}} />
    {right}
  </div>
);

const pop = (f: number, at: number) => ({
  opacity: ev(f, [at, at + 12], [0, 1], E.out),
  scale: String(0.94 + 0.06 * ev(f, [at, at + 16], [0, 1], E.back)),
  translate: `0px ${ev(f, [at, at + 16], [40, 0], E.out)}px`,
});

const STEPS = [
  {label: 'Tìm email của khách', start: 30, done: 104},
  {label: 'Lập bảng giá', start: 110, done: 184},
  {label: 'Xuất báo giá PDF', start: 190, done: 262},
  {label: 'Gửi email', start: 266, done: 330},
];

const ROWS = [
  {item: 'Gói Agent Pro', qty: '5', unit: 2_400_000, sum: 12_000_000, at: 128},
  {item: 'Thiết lập ban đầu', qty: '1', unit: 3_000_000, sum: 3_000_000, at: 142},
  {item: 'Hỗ trợ 3 tháng', qty: '1', unit: 0, sum: 0, at: 156},
];
const TOTAL = 15_000_000;

export const S2Work: React.FC = () => {
  const f = useCurrentFrame();
  const blink = blinkAt(f, [CLICK.mail, 150, CLICK.pdfBtn, 240, CLICK.send]);
  const push = ev(f, [0, 360], [1, 1.035], E.inOut);

  const mailOpen = ev(f, [CLICK.mail + 2, CLICK.mail + 18], [0, 1], E.out);
  const composeOut = ev(f, [CLICK.send + 6, CLICK.send + 22], [0, 1], E.in);
  const sent = ev(f, [CLICK.send + 14, CLICK.send + 28], [0, 1], E.back);

  return (
    <AbsoluteFill style={{background: C.phoneBackdrop, fontFamily: FONT}}>
      <AbsoluteFill style={{scale: String(push), transformOrigin: '40% 55%'}}>
        {/* ---------- hộp thư ---------- */}
        <div style={{...card, left: 70, top: 90, width: 820, height: 640, ...pop(f, 4)}}>
          <TitleBar title="Hộp thư" />
          {[
            {from: 'Lan · Kế toán', sub: 'Đối soát tháng 9', t: '08:12'},
            {from: 'Anh Minh', sub: 'Xin báo giá gói Agent', t: '08:40', target: true},
            {from: 'Đội vận hành', sub: 'Lịch trực cuối tuần', t: '07:55'},
            {from: 'Hùng · Đối tác', sub: 'Gửi lại hợp đồng', t: 'Hôm qua'},
          ].map((r, i) => {
            const hl = r.target ? mailOpen : 0;
            return (
              <div
                key={r.from}
                style={{
                  margin: '0 16px',
                  padding: '20px 22px',
                  borderRadius: 18,
                  marginTop: i === 0 ? 14 : 4,
                  background: `rgba(232,240,254,${hl})`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: r.target ? 700 : 600, color: C.text}}>
                  {r.from}
                  <span style={{fontSize: 24, fontWeight: 500, color: C.muted}}>{r.t}</span>
                </div>
                <div style={{fontSize: 26, fontWeight: 500, color: C.label}}>{r.sub}</div>
                {r.target ? (
                  <div style={{height: 70 * mailOpen, overflow: 'hidden', fontSize: 26, color: C.muted, opacity: mailOpen}}>
                    “Bên mình cần 5 tài khoản, gửi giúp báo giá nhé.”
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* ---------- bảng tính ---------- */}
        <div style={{...card, left: 560, top: 280, width: 860, height: 560, ...pop(f, 108)}}>
          <TitleBar
            title="Bảng giá"
            right={
              <div
                style={{
                  padding: '12px 24px',
                  borderRadius: 999,
                  background: C.send,
                  color: C.white,
                  fontSize: 24,
                  fontWeight: 600,
                  scale: String(1 - 0.1 * Math.sin(Math.PI * ev(f, [CLICK.pdfBtn, CLICK.pdfBtn + 8], [0, 1], E.snap))),
                }}
              >
                Xuất PDF
              </div>
            }
          />
          <div style={{padding: '18px 28px'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1.6fr 0.5fr 1fr 1.1fr', fontSize: 24, fontWeight: 600, color: C.muted, padding: '0 6px 12px'}}>
              <div>Hạng mục</div>
              <div>SL</div>
              <div style={{textAlign: 'right'}}>Đơn giá</div>
              <div style={{textAlign: 'right'}}>Thành tiền</div>
            </div>
            {ROWS.map((r) => (
              <div
                key={r.item}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 0.5fr 1fr 1.1fr',
                  fontSize: 28,
                  fontWeight: 500,
                  color: C.text,
                  padding: '16px 6px',
                  borderTop: `1.5px solid ${C.hairline}`,
                  opacity: ev(f, [r.at, r.at + 8], [0, 1], E.out),
                }}
              >
                <div>{typed(r.item, f, r.at, 0.8)}</div>
                <div>{f >= r.at + 6 ? r.qty : ''}</div>
                <div style={{textAlign: 'right'}}>{r.unit ? countVnd(f, [r.at + 4, r.at + 16], r.unit) : 'Miễn phí'}</div>
                <div style={{textAlign: 'right'}}>{r.sum ? countVnd(f, [r.at + 6, r.at + 18], r.sum) : '0'}</div>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 34,
                fontWeight: 700,
                color: C.text,
                padding: '20px 6px 0',
                borderTop: `2.5px solid ${C.text}`,
                marginTop: 6,
                opacity: ev(f, [172, 180], [0, 1], E.out),
              }}
            >
              <div>Tổng</div>
              <div>{countVnd(f, [172, 188], TOTAL)} đ</div>
            </div>
          </div>
        </div>

        {/* ---------- PDF báo giá ---------- */}
        <div style={{...card, left: 890, top: 120, width: 560, height: 800, borderRadius: 18, ...pop(f, 198)}}>
          <div style={{padding: 52, display: 'flex', flexDirection: 'column', gap: 26}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em', color: C.text, opacity: ev(f, [204, 212], [0, 1], E.out)}}>BÁO GIÁ</div>
              <div style={{position: 'relative', width: 60, height: 52, opacity: ev(f, [206, 214], [0, 1], E.out)}}>
                <Ghost width={60} />
              </div>
            </div>
            <div style={{fontSize: 26, color: C.label, opacity: ev(f, [210, 218], [0, 1], E.out)}}>Kính gửi: Anh Minh</div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{height: 16, borderRadius: 8, background: '#ECEEF1', width: `${[100, 92, 96, 70, 84][i]}%`, scale: `${ev(f, [214 + i * 4, 226 + i * 4], [0, 1], E.out)} 1`, transformOrigin: 'left'}}
              />
            ))}
            <div style={{height: 2, background: C.hairline, margin: '8px 0'}} />
            {ROWS.map((r, i) => (
              <div key={r.item} style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, color: C.text, opacity: ev(f, [232 + i * 4, 240 + i * 4], [0, 1], E.out)}}>
                <span>{r.item}</span>
                <span>{r.sum ? r.sum.toLocaleString('de-DE') : '0'}</span>
              </div>
            ))}
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, fontWeight: 800, color: C.text, marginTop: 10, opacity: ev(f, [246, 254], [0, 1], E.out)}}>
              <span>Tổng</span>
              <span>{TOTAL.toLocaleString('de-DE')} đ</span>
            </div>
          </div>
        </div>

        {/* ---------- soạn thư ---------- */}
        <div
          style={{
            ...card,
            left: 150,
            top: 330,
            width: 840,
            height: 560,
            ...pop(f, 266),
            ...(composeOut > 0 ? {opacity: 1 - composeOut, scale: String(1 - 0.12 * composeOut), translate: `${composeOut * 220}px ${-composeOut * 160}px`} : {}),
          }}
        >
          <TitleBar title="Thư mới" />
          <div style={{padding: '20px 34px', display: 'flex', flexDirection: 'column', gap: 16, fontSize: 28, color: C.text}}>
            <div style={{color: C.label}}>
              Đến: <b style={{color: C.text, fontWeight: 600}}>{typed('anh.minh@khachhang.vn', f, 274, 0.7)}</b>
            </div>
            <div style={{color: C.label}}>
              Chủ đề: <b style={{color: C.text, fontWeight: 600}}>{typed('Báo giá gói Agent', f, 286, 0.7)}</b>
            </div>
            <div style={{height: 1.5, background: C.hairline}} />
            <div style={{lineHeight: 1.45}}>{typed('Chào anh Minh, em gửi báo giá như anh cần ạ.', f, 292, 0.55)}</div>
            <div
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: 14,
                padding: '12px 20px',
                borderRadius: 14,
                border: `1.5px solid ${C.hairline}`,
                fontSize: 24,
                fontWeight: 600,
                opacity: ev(f, [304, 312], [0, 1], E.out),
              }}
            >
              <div style={{width: 30, height: 36, borderRadius: 4, background: '#D93025', color: C.white, fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center'}}>PDF</div>
              Bao-gia.pdf
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 34,
              bottom: 30,
              padding: '16px 44px',
              borderRadius: 999,
              background: C.send,
              color: C.white,
              fontSize: 30,
              fontWeight: 600,
              scale: String(1 - 0.1 * Math.sin(Math.PI * ev(f, [CLICK.send, CLICK.send + 8], [0, 1], E.snap))),
            }}
          >
            Gửi
          </div>
        </div>

        {/* thông báo đã gửi */}
        <div
          style={{
            position: 'absolute',
            left: 520,
            top: 940,
            translate: '-50% 0',
            padding: '20px 36px',
            borderRadius: 999,
            background: C.ink,
            color: C.white,
            fontSize: 32,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: sent,
            scale: String(0.8 + 0.2 * sent),
          }}
        >
          <IconCheck size={36} color="#7FE0A4" progress={ev(f, [CLICK.send + 18, CLICK.send + 30], [0, 1], E.out)} />
          Đã gửi cho anh Minh
        </div>

        <ClickRipple f={f} at={CLICK.mail} x={470} y={352} />
        <ClickRipple f={f} at={CLICK.pdfBtn} x={1300} y={352} />
        <ClickRipple f={f} at={CLICK.send} x={258} y={822} />
        <AgentCursor keys={KEYS} f={f} logoWidth={230} blink={blink} />
      </AbsoluteFill>

      {/* ---------- bảng việc của Sirrok ---------- */}
      <div style={{...card, left: 1462, top: 90, width: 410, height: 900, padding: 34, opacity: ev(f, [10, 30], [0, 1], E.out), translate: `${ev(f, [10, 34], [60, 0], E.out)}px 0px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{position: 'relative', width: 58, height: 50}}>
            <Ghost width={58} blink={blinkAt(f, [104, 184, 262, 330])} />
          </div>
          <div>
            <div style={{fontSize: 32, fontWeight: 700, color: C.text}}>Sirrok Agent</div>
            <div style={{fontSize: 24, fontWeight: 500, color: f >= 334 ? C.ok : C.muted}}>{f >= 334 ? 'Xong · 4/4 việc' : 'Đang làm việc…'}</div>
          </div>
        </div>
        <div style={{height: 1.5, background: C.hairline, margin: '30px 0 14px'}} />
        {STEPS.map((s) => {
          const active = f >= s.start && f < s.done;
          const done = f >= s.done;
          const spin = ((f - s.start) * 12) % 360;
          return (
            <div key={s.label} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 0', opacity: f >= s.start - 6 ? 1 : 0.45}}>
              <div style={{position: 'relative', width: 40, height: 40, flexShrink: 0}}>
                {done ? (
                  <div style={{width: 40, height: 40, borderRadius: 20, background: '#E6F4EA', display: 'grid', placeItems: 'center', scale: String(ev(f, [s.done, s.done + 10], [0.6, 1], E.back))}}>
                    <IconCheck size={28} progress={ev(f, [s.done, s.done + 10], [0, 1], E.out)} />
                  </div>
                ) : (
                  <svg width={40} height={40} viewBox="0 0 40 40" style={{rotate: active ? `${spin}deg` : '0deg'}}>
                    <circle cx={20} cy={20} r={16} fill="none" stroke={C.hairline} strokeWidth={4} />
                    {active ? <circle cx={20} cy={20} r={16} fill="none" stroke={C.send} strokeWidth={4} strokeLinecap="round" strokeDasharray="30 100" /> : null}
                  </svg>
                )}
              </div>
              <div style={{fontSize: 28, fontWeight: active ? 700 : 500, color: done ? C.label : C.text}}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
