import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ev} from '../../anim';
import {C, E, FONT} from '../../theme';
import {PHONE} from '../../ui';
import {Kinetic, VoiceText} from '../text';
import {AND, Android, IPhone, LID_W, Mac, N5, Place} from '../scenes/Island';
import {SAFE, VW} from './frame';

/**
 * Cảnh Island — bản dọc 9:16. Cùng mốc thời gian với Island.tsx:
 *  0–106   cận cảnh mép trên Mac (rộng gần hết khung), đảo nở 24–44, chữ n5 trên hình nền,
 *          "Mac" bật ra đúng lúc giọng đọc (100)
 *  106–137 iPhone trượt vào từ phải, đảo thu gọn 108 → nở 117–131, chữ "iPhone" bên dưới
 *  137–168 Android trượt vào, chip 146, thẻ thả xuống 152–166, chữ "Android"
 *  168–206 ghép bộ ba: Mac ở trên, iPhone + Android cạnh nhau bên dưới, thẻ tên 202/206/210
 *  212 / 246 bước 3, 4 · 282 cả ba báo ✓ "Đã gửi báo giá" · từ ~300 đứng yên cho vệt chuyển cảnh
 * Mọi chuyển động có easing, không ngẫu nhiên.
 */

/* ---------------- bố cục dọc ---------------- */
const SOLO_TOP = 236; // mép trên điện thoại khi đứng một mình
const SOLO_LABEL = 1290; // chữ lớn dưới điện thoại
const TRI = {
  mac: {cx: VW / 2, top: 226, s: 0.86},
  ios: {cx: 300, top: 860, s: 0.76},
  and: {cx: 780, top: 860, s: 0.76},
  macTag: 806, // tâm dọc thẻ tên Mac (đè lên chân máy)
  phoneTag: 1488, // tâm dọc thẻ tên điện thoại (đè lên mép dưới máy)
};

/** Thẻ tên đen chữ trắng — bật lên rồi chữ trồi theo ký tự. */
const Tag: React.FC<{f: number; text: string; at: number; cx: number; cy: number}> = ({f, text, at, cx, cy}) => {
  const pop = ev(f, [at - 4, at + 10], [0, 1], E.back);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        translate: '-50% -50%',
        padding: '6px 38px 10px',
        borderRadius: 999,
        background: C.ink,
        opacity: ev(f, [at - 4, at + 4], [0, 1], E.out),
        scale: String(0.7 + 0.3 * pop),
        boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
        whiteSpace: 'nowrap',
      }}
    >
      <Kinetic text={text} f={f} start={at} size={64} color={C.white} variant="rise" by="char" stagger={1.6} style={{flexWrap: 'nowrap', whiteSpace: 'nowrap'}} />
    </div>
  );
};

export const VIsland: React.FC = () => {
  const f = useCurrentFrame();

  const push1 = ev(f, [106, 122], [0, 1], E.inOut); // Mac → iPhone
  const push2 = ev(f, [137, 150], [0, 1], E.inOut); // iPhone → Android
  const asm = ev(f, [168, 198], [0, 1], E.inOut); // Android về vị trí bộ ba
  const macIn = ev(f, [172, 204], [0, 1], E.out);
  const iosIn = ev(f, [176, 206], [0, 1], E.out);
  const drift = ev(f, [196, 306], [0, 1], E.inOut); // máy quay tiến rất nhẹ

  // pha 1: cận cảnh mép trên MacBook — đảo chiếm gần hết bề ngang
  const macZoom = 1.5 + 0.1 * (1 - ev(f, [0, 44], [0, 1], E.out));

  // Android: từ vị trí đơn → vị trí bộ ba
  const andCx = VW / 2 + (TRI.and.cx - VW / 2) * asm;
  const andTop = SOLO_TOP + (TRI.and.top - SOLO_TOP) * asm;
  const andS = 1 + (TRI.and.s - 1) * asm;

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      {/* ---- pha 1: macOS ---- */}
      {f < 126 && (
        <AbsoluteFill style={{translate: `${-push1 * VW}px 0px`}}>
          <Place cx={VW / 2} top={300} s={macZoom} w={LID_W}>
            <Mac f={f} />
          </Place>
          <div style={{position: 'absolute', left: SAFE.side, right: SAFE.side, top: 700}}>
            <VoiceText id="n5" f={f} start={N5} size={116} pick={[0, 1, 2]} out={ev(f, [86, 96], [0, 1], E.in)} />
            <VoiceText id="n5" f={f} start={N5} size={116} pick={[3, 4]} replace={{4: 'ngay.'}} out={ev(f, [86, 96], [0, 1], E.in)} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 750}}>
            <VoiceText id="n5" f={f} start={N5} size={200} pick={[10]} replace={{10: 'Mac'}} variant="scale" />
          </div>
        </AbsoluteFill>
      )}

      {/* ---- bộ ba: Mac ở trên, hai điện thoại bên dưới ---- */}
      {f >= 168 && (
        <AbsoluteFill style={{scale: String(1 + 0.03 * drift)}}>
          <Place cx={TRI.mac.cx} top={TRI.mac.top - (1 - macIn) * 160} s={TRI.mac.s + 0.06 * (1 - macIn)} w={LID_W} o={macIn}>
            <Mac f={f} win />
          </Place>
          <Place cx={TRI.ios.cx - (1 - iosIn) * 700} top={TRI.ios.top} s={TRI.ios.s} w={PHONE.w} o={iosIn}>
            <IPhone f={f} />
          </Place>
          <Place cx={andCx} top={andTop} s={andS} w={AND.w}>
            <Android f={f} />
          </Place>
          {f >= 196 && (
            <>
              <Tag f={f} text="iPhone" at={202} cx={TRI.ios.cx} cy={TRI.phoneTag} />
              <Tag f={f} text="Mac" at={206} cx={TRI.mac.cx} cy={TRI.macTag} />
              <Tag f={f} text="Android" at={210} cx={TRI.and.cx} cy={TRI.phoneTag} />
            </>
          )}
        </AbsoluteFill>
      )}

      {/* ---- pha 2: iPhone đơn ---- */}
      {f >= 100 && f < 152 && (
        <AbsoluteFill style={{translate: `${(1 - push1) * VW - push2 * VW}px 0px`}}>
          <Place cx={VW / 2} top={SOLO_TOP} s={1} w={PHONE.w}>
            <IPhone f={f} />
          </Place>
          <div style={{position: 'absolute', left: 0, right: 0, top: SOLO_LABEL}}>
            <VoiceText id="n5" f={f} start={N5} size={170} pick={[11]} replace={{11: 'iPhone'}} variant="scale" />
          </div>
        </AbsoluteFill>
      )}

      {/* ---- pha 3: Android đơn, rồi lùi về vị trí bộ ba ---- */}
      {f >= 128 && f < 168 && (
        <AbsoluteFill style={{translate: `${(1 - push2) * VW}px 0px`}}>
          <Place cx={andCx} top={andTop} s={andS} w={AND.w}>
            <Android f={f} />
          </Place>
        </AbsoluteFill>
      )}
      {f >= 128 && f < 180 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: SOLO_LABEL, translate: `${(1 - push2) * VW}px 0px`}}>
          <VoiceText id="n5" f={f} start={N5} size={170} pick={[12]} replace={{12: 'Android'}} variant="scale" out={ev(f, [162, 174], [0, 1], E.in)} />
        </div>
      )}
    </AbsoluteFill>
  );
};
