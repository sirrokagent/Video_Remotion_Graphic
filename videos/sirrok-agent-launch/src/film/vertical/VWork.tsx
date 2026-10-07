import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blinkAt, countVnd, ev, typed} from '../../anim';
import {AgentCursor, ClickRipple, Key} from '../../cursor';
import {Ghost} from '../../logo';
import {CLICK, ROWS, STEPS, TOTAL, card, pop} from '../../scenes/S2Work';
import {C, E, FONT} from '../../theme';
import {IconCheck} from '../../ui';
import {SAFE, VW} from './frame';

/**
 * Cảnh 2 (bản dọc 9:16) — Agent tự làm.
 * Cùng câu chuyện và MỌI mốc thời gian với S2Work (click 70 · 196 · 318, tick 104 · 184 · 262 · 330),
 * nhưng dựng lại cho khung dọc: mỗi lúc chỉ MỘT cửa sổ ứng dụng to, rộng hết khung;
 * cửa sổ mới trượt lên chồng lên cửa sổ cũ như một xấp bài (cũ lùi ra sau, mờ đi).
 * Bảng việc của Sirrok thu gọn thành một thẻ 2×2 ở trên cùng.
 */

// ---------- khung bố cục ----------
const X0 = SAFE.side; // 60
const WW = VW - SAFE.side * 2; // 960 — cửa sổ rộng hết khung
const WY = 640; // đỉnh cửa sổ
const WH = 840; // cao cửa sổ → đáy 1480, còn trong vùng an toàn 1540
const CH = WH; // cửa sổ soạn thư cao bằng xấp — báo giá phía sau không lộ đáy
const BAR = 88; // thanh tiêu đề

// mốc cửa sổ xuất hiện — trùng với pop() của bản ngang
const AT = {mail: 4, sheet: 108, pdf: 198, compose: 266};

// ---------- toạ độ các điểm agent bấm / đọc (tính từ bố cục bên dưới) ----------
const SEARCH_H = 74;
const ROW_H = 134;
const MAIL_TOP = WY + BAR + 18 + SEARCH_H + 16; // đỉnh hàng thư đầu tiên
const MAIL_HIT = {x: 760, y: MAIL_TOP + ROW_H + 52}; // thư "Anh Minh"

const META_H = 76;
const HEAD_Y = WY + BAR + 26 + META_H + 22; // dòng tiêu đề cột
const SROW_H = 104;
const SROW0 = HEAD_Y + 56; // đỉnh dòng dữ liệu đầu
const PDF_BTN = {x: X0 + WW - 30 - 44, y: WY + BAR / 2 + 6}; // mắt đậu mép phải nút, chữ nút vẫn đọc được

const PDF = {x: 130, y: WY - 10, w: 820, h: 860};
const SEND = {x: X0 + 40 + 150, y: WY + CH - 40 - 36}; // mép phải nút Gửi

const KEYS: Key[] = [
  {f: 0, x: 540, y: 2080},
  {f: 28, x: 540, y: 2080},
  {f: 62, x: MAIL_HIT.x, y: MAIL_HIT.y},
  {f: 104, x: MAIL_HIT.x, y: MAIL_HIT.y},
  {f: 132, x: 620, y: SROW0 + SROW_H * 0.5},
  {f: 146, x: 620, y: SROW0 + SROW_H * 1.5},
  {f: 160, x: 620, y: SROW0 + SROW_H * 2.5},
  {f: 176, x: 760, y: SROW0 + SROW_H * 3 + 70},
  {f: 192, x: PDF_BTN.x, y: PDF_BTN.y},
  {f: 204, x: PDF_BTN.x, y: PDF_BTN.y},
  {f: 228, x: 700, y: PDF.y + 330},
  {f: 252, x: 760, y: PDF.y + PDF.h - 120},
  {f: 296, x: SEND.x, y: SEND.y},
  {f: 326, x: SEND.x, y: SEND.y},
  {f: 352, x: 880, y: 340},
];

/** Thanh tiêu đề cửa sổ — cỡ lớn hơn bản ngang cho khung dọc. */
const TitleBar: React.FC<{title: string; right?: React.ReactNode}> = ({title, right}) => (
  <div style={{height: BAR, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 24, borderBottom: `1.5px solid ${C.hairline}`}}>
    <div style={{display: 'flex', gap: 11}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 17, height: 17, borderRadius: 9, background: c}} />
      ))}
    </div>
    <div style={{fontSize: 34, fontWeight: 700, color: C.text}}>{title}</div>
    <div style={{flex: 1}} />
    {right}
  </div>
);

/** Độ "lún" của một cửa sổ trong xấp: 0 = trên cùng, 1 = bị một cửa sổ đè, 2 = hai cửa sổ… */
const depthOf = (f: number, at: number, back: number) => {
  let d = 0;
  for (const a of Object.values(AT)) if (a > at) d += ev(f, [a, a + 18], [0, 1], E.inOut);
  return Math.max(0, d - back);
};

/** Cửa sổ lùi ra sau: thu nhỏ, nhích lên (để lộ mép trên), mờ dần. */
const deck = (d: number): React.CSSProperties => ({
  scale: String(1 - 0.055 * Math.min(d, 2)),
  translate: `0px ${-34 * Math.min(d, 2)}px`,
  filter: `brightness(${1 - 0.05 * Math.min(d, 2)})`,
  opacity: d > 1.6 ? Math.max(0, 1 - (d - 1.6) * 2.5) : 1,
});

export const VWork: React.FC = () => {
  const f = useCurrentFrame();
  const blink = blinkAt(f, [CLICK.mail, 150, CLICK.pdfBtn, 240, CLICK.send]);
  // camera đẩy chậm vào xấp cửa sổ
  const push = ev(f, [0, 360], [1, 1.04], E.inOut);

  const mailOpen = ev(f, [CLICK.mail + 2, CLICK.mail + 18], [0, 1], E.out);
  const composeOut = ev(f, [CLICK.send + 6, CLICK.send + 22], [0, 1], E.in);
  const sent = ev(f, [CLICK.send + 14, CLICK.send + 28], [0, 1], E.back);
  // khi thư bay đi, báo giá trở lại mặt trước
  const back = ev(f, [CLICK.send + 8, CLICK.send + 26], [0, 1], E.inOut);

  const win = (at: number): React.CSSProperties => ({...card, left: X0, top: WY, width: WW, height: WH, transformOrigin: '50% 0%', ...pop(f, at)});
  const withDeck = (base: React.CSSProperties, d: number): React.CSSProperties => {
    const k = deck(d);
    return {
      ...base,
      scale: String(Number(base.scale ?? 1) * Number(k.scale)),
      translate: d > 0 ? k.translate : base.translate,
      filter: k.filter,
      opacity: Number(base.opacity ?? 1) * Number(k.opacity),
    };
  };

  return (
    <AbsoluteFill style={{background: C.phoneBackdrop, fontFamily: FONT}}>
      <AbsoluteFill style={{scale: String(push), transformOrigin: '50% 62%'}}>
        {/* ---------- hộp thư ---------- */}
        <div style={withDeck(win(AT.mail), depthOf(f, AT.mail, back))}>
          <TitleBar title="Hộp thư" right={<div style={{fontSize: 26, fontWeight: 600, color: C.muted}}>4 thư mới</div>} />
          {/* ô tìm kiếm — agent tự gõ */}
          <div style={{margin: '18px 22px 16px', height: SEARCH_H, borderRadius: 18, background: '#F1F3F4', display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px', fontSize: 30, color: C.text}}>
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2.4} strokeLinecap="round">
              <circle cx={11} cy={11} r={7} />
              <path d="M16.5 16.5L21 21" />
            </svg>
            <span style={{fontWeight: 500}}>{f < 32 ? <span style={{color: C.muted}}>Tìm trong thư</span> : typed('báo giá', f, 32, 2.6)}</span>
          </div>
          {[
            {from: 'Lan · Kế toán', sub: 'Đối soát tháng 9', t: '08:12'},
            {from: 'Anh Minh', sub: 'Xin báo giá gói Agent', t: '08:40', target: true},
            {from: 'Đội vận hành', sub: 'Lịch trực cuối tuần', t: '07:55'},
            {from: 'Hùng · Đối tác', sub: 'Gửi lại hợp đồng', t: 'Hôm qua'},
          ].map((r) => {
            const hl = r.target ? mailOpen : 0;
            return (
              <div
                key={r.from}
                style={{
                  margin: '0 22px 4px',
                  padding: '22px 26px',
                  minHeight: ROW_H - 4,
                  boxSizing: 'border-box',
                  borderRadius: 20,
                  background: `rgba(232,240,254,${hl})`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 34, fontWeight: r.target ? 700 : 600, color: C.text}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
                    {r.target ? <span style={{width: 12, height: 12, borderRadius: 6, background: C.send}} /> : null}
                    {r.from}
                  </span>
                  <span style={{fontSize: 26, fontWeight: 500, color: C.muted}}>{r.t}</span>
                </div>
                <div style={{fontSize: 30, fontWeight: 500, color: C.label}}>{r.sub}</div>
                {r.target ? (
                  <div style={{height: 92 * mailOpen, overflow: 'hidden', fontSize: 29, lineHeight: 1.4, color: C.muted, opacity: mailOpen}}>
                    “Bên mình cần 5 tài khoản, gửi giúp báo giá nhé.”
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* ---------- bảng tính ---------- */}
        <div style={withDeck(win(AT.sheet), depthOf(f, AT.sheet, back))}>
          <TitleBar
            title="Bảng giá"
            right={
              <div
                style={{
                  padding: '14px 30px',
                  borderRadius: 999,
                  background: C.send,
                  color: C.white,
                  fontSize: 28,
                  fontWeight: 700,
                  scale: String(1 - 0.1 * Math.sin(Math.PI * ev(f, [CLICK.pdfBtn, CLICK.pdfBtn + 8], [0, 1], E.snap))),
                }}
              >
                Xuất PDF
              </div>
            }
          />
          <div style={{padding: '26px 30px 0'}}>
            {/* thông tin khách */}
            <div style={{height: META_H, display: 'flex', gap: 16, marginBottom: 22}}>
              {[
                ['Khách', 'Anh Minh'],
                ['Số TK', '5'],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    flex: i === 0 ? 1.6 : 1,
                    borderRadius: 16,
                    background: '#F1F3F4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '0 24px',
                    fontSize: 28,
                    opacity: ev(f, [AT.sheet + 8, AT.sheet + 18], [0, 1], E.out),
                  }}
                >
                  <span style={{color: C.muted, fontWeight: 500}}>{k}</span>
                  <span style={{color: C.text, fontWeight: 700}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1.7fr 0.45fr 1fr 1.15fr', height: 56, alignItems: 'center', fontSize: 26, fontWeight: 600, color: C.muted, padding: '0 6px'}}>
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
                  gridTemplateColumns: '1.7fr 0.45fr 1fr 1.15fr',
                  alignItems: 'center',
                  height: SROW_H,
                  boxSizing: 'border-box',
                  fontSize: 31,
                  fontWeight: 500,
                  color: C.text,
                  padding: '0 6px',
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
                alignItems: 'center',
                height: 120,
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: C.text,
                padding: '0 6px',
                borderTop: `3px solid ${C.text}`,
                marginTop: 6,
                opacity: ev(f, [172, 180], [0, 1], E.out),
              }}
            >
              <div>Tổng</div>
              <div>{countVnd(f, [172, 188], TOTAL)} đ</div>
            </div>
          </div>
        </div>

        {/* ---------- PDF báo giá — trang giấy dọc, hợp khung dọc ---------- */}
        <div style={withDeck({...card, left: PDF.x, top: PDF.y, width: PDF.w, height: PDF.h, borderRadius: 18, transformOrigin: '50% 0%', ...pop(f, AT.pdf)}, depthOf(f, AT.pdf, back))}>
          <div style={{padding: '64px 64px', display: 'flex', flexDirection: 'column', gap: 30}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em', color: C.text, opacity: ev(f, [204, 212], [0, 1], E.out)}}>BÁO GIÁ</div>
              <div style={{position: 'relative', width: 78, height: 68, opacity: ev(f, [206, 214], [0, 1], E.out)}}>
                <Ghost width={78} />
              </div>
            </div>
            <div style={{fontSize: 32, fontWeight: 500, color: C.label, opacity: ev(f, [210, 218], [0, 1], E.out)}}>Kính gửi: Anh Minh</div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{height: 18, borderRadius: 9, background: '#ECEEF1', width: `${[100, 92, 96, 70, 84][i]}%`, scale: `${ev(f, [214 + i * 4, 226 + i * 4], [0, 1], E.out)} 1`, transformOrigin: 'left'}}
              />
            ))}
            <div style={{height: 2, background: C.hairline, margin: '10px 0'}} />
            {ROWS.map((r, i) => (
              <div key={r.item} style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 500, color: C.text, opacity: ev(f, [232 + i * 4, 240 + i * 4], [0, 1], E.out)}}>
                <span>{r.item}</span>
                <span>{r.sum ? r.sum.toLocaleString('de-DE') : '0'}</span>
              </div>
            ))}
            <div style={{height: 3, background: C.text, marginTop: 8, opacity: ev(f, [246, 254], [0, 1], E.out)}} />
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 44, fontWeight: 800, color: C.text, opacity: ev(f, [246, 254], [0, 1], E.out)}}>
              <span>Tổng</span>
              <span>{TOTAL.toLocaleString('de-DE')} đ</span>
            </div>
          </div>
        </div>

        {/* ---------- soạn thư ---------- */}
        <div
          style={{
            ...win(AT.compose),
            height: CH,
            // thư bay vụt lên, chui vào thẻ Sirrok — không mờ chồng lên báo giá
            ...(composeOut > 0 ? {opacity: 1 - ev(composeOut, [0.55, 1], [0, 1], E.in), scale: String(1 - 0.3 * composeOut), translate: `0px ${-composeOut * 760}px`} : {}),
          }}
        >
          <TitleBar title="Thư mới" />
          <div style={{padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 24, fontSize: 32, color: C.text}}>
            <div style={{color: C.label, fontWeight: 500}}>
              Đến: <b style={{color: C.text, fontWeight: 700}}>{typed('anh.minh@khachhang.vn', f, 274, 0.7)}</b>
            </div>
            <div style={{color: C.label, fontWeight: 500}}>
              Chủ đề: <b style={{color: C.text, fontWeight: 700}}>{typed('Báo giá gói Agent', f, 286, 0.7)}</b>
            </div>
            <div style={{height: 1.5, background: C.hairline}} />
            <div style={{lineHeight: 1.5, fontWeight: 500, minHeight: 96}}>{typed('Chào anh Minh, em gửi báo giá như anh cần ạ.', f, 292, 0.55)}</div>
            <div
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: 16,
                padding: '16px 26px',
                borderRadius: 16,
                border: `1.5px solid ${C.hairline}`,
                fontSize: 28,
                fontWeight: 600,
                opacity: ev(f, [304, 312], [0, 1], E.out),
                translate: `0px ${ev(f, [304, 314], [16, 0], E.out)}px`,
              }}
            >
              <div style={{width: 38, height: 46, borderRadius: 5, background: '#D93025', color: C.white, fontSize: 13, fontWeight: 800, display: 'grid', placeItems: 'center'}}>PDF</div>
              Bao-gia.pdf
            </div>
            {/* chữ ký — lấp khoảng trống, nói rõ ai đang gửi */}
            <div style={{marginTop: 18, fontSize: 28, fontWeight: 500, lineHeight: 1.45, color: C.muted, opacity: ev(f, [308, 316], [0, 1], E.out)}}>
              Sirrok
              <br />
              Trợ lý của anh Tuấn
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 40,
              bottom: 40,
              width: 192,
              height: 84,
              borderRadius: 999,
              background: C.send,
              color: C.white,
              fontSize: 36,
              fontWeight: 700,
              display: 'grid',
              placeItems: 'center',
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
            left: VW / 2,
            top: PDF.y + 290, // đè lên vùng dòng kẻ trống của báo giá, không che số liệu
            translate: '-50% 0',
            padding: '24px 42px',
            borderRadius: 999,
            background: C.ink,
            color: C.white,
            fontSize: 38,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            whiteSpace: 'nowrap',
            boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
            opacity: sent,
            scale: String(0.8 + 0.2 * sent),
          }}
        >
          <IconCheck size={42} color="#7FE0A4" progress={ev(f, [CLICK.send + 18, CLICK.send + 30], [0, 1], E.out)} />
          Đã gửi cho anh Minh
        </div>

        <ClickRipple f={f} at={CLICK.mail} x={MAIL_HIT.x} y={MAIL_HIT.y} />
        <ClickRipple f={f} at={CLICK.pdfBtn} x={PDF_BTN.x} y={PDF_BTN.y} />
        <ClickRipple f={f} at={CLICK.send} x={SEND.x} y={SEND.y} />
      </AbsoluteFill>

      {/* ---------- bảng việc của Sirrok — thẻ gọn 2×2 ở trên ---------- */}
      <div
        style={{
          ...card,
          left: X0,
          top: 250,
          width: WW,
          padding: '28px 32px 22px',
          boxSizing: 'border-box',
          opacity: ev(f, [10, 30], [0, 1], E.out),
          translate: `0px ${ev(f, [10, 34], [-50, 0], E.out)}px`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{position: 'relative', width: 64, height: 56}}>
            <Ghost width={64} blink={blinkAt(f, [104, 184, 262, 330])} />
          </div>
          <div style={{fontSize: 36, fontWeight: 800, color: C.text, letterSpacing: '-0.01em'}}>Sirrok Agent</div>
          <div style={{flex: 1}} />
          <div
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              background: f >= 334 ? '#E6F4EA' : '#F1F3F4',
              fontSize: 26,
              fontWeight: 600,
              color: f >= 334 ? C.ok : C.muted,
            }}
          >
            {f >= 334 ? 'Xong · 4/4 việc' : 'Đang làm việc…'}
          </div>
        </div>
        <div style={{height: 1.5, background: C.hairline, margin: '22px 0 8px'}} />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20}}>
          {STEPS.map((s) => {
            const active = f >= s.start && f < s.done;
            const done = f >= s.done;
            const spin = ((f - s.start) * 12) % 360;
            return (
              <div key={s.label} style={{display: 'flex', alignItems: 'center', gap: 16, height: 66, opacity: f >= s.start - 6 ? 1 : 0.45}}>
                <div style={{position: 'relative', width: 38, height: 38, flexShrink: 0}}>
                  {done ? (
                    <div style={{width: 38, height: 38, borderRadius: 19, background: '#E6F4EA', display: 'grid', placeItems: 'center', scale: String(ev(f, [s.done, s.done + 10], [0.6, 1], E.back))}}>
                      <IconCheck size={26} progress={ev(f, [s.done, s.done + 10], [0, 1], E.out)} />
                    </div>
                  ) : (
                    <svg width={38} height={38} viewBox="0 0 40 40" style={{rotate: active ? `${spin}deg` : '0deg'}}>
                      <circle cx={20} cy={20} r={16} fill="none" stroke={C.hairline} strokeWidth={4} />
                      {active ? <circle cx={20} cy={20} r={16} fill="none" stroke={C.send} strokeWidth={4} strokeLinecap="round" strokeDasharray="30 100" /> : null}
                    </svg>
                  )}
                </div>
                <div style={{fontSize: 28, fontWeight: active ? 700 : 500, color: done ? C.label : C.text, whiteSpace: 'nowrap'}}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* con trỏ mắt nằm trên cùng, cùng hệ toạ độ màn hình */}
      <AbsoluteFill style={{scale: String(push), transformOrigin: '50% 62%'}}>
        <AgentCursor keys={KEYS} f={f} logoWidth={210} blink={blink} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
