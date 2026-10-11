import React from 'react';

/**
 * Biểu tượng ứng dụng bên thứ ba mà Sirrok kết nối — vẽ lại bằng SVG ở dạng
 * giản lược (không nhúng ảnh), đủ nhận ra trong video. Mỗi icon nằm trong ô
 * viewBox 0 0 100 100; `AppTile` đặt chúng lên nền ô bo góc như icon ứng dụng.
 * Lưu ý: đây là nhãn hiệu của bên thứ ba — trước khi phát công khai, chỉ giữ
 * những dịch vụ Sirrok thật sự kết nối và theo hướng dẫn thương hiệu của họ.
 */

type Glyph = {name: string; bg: string; ring?: boolean; draw: React.ReactNode};

const gmail: Glyph = {
  name: 'Gmail',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <path d="M18 32 v40 h12 V44 l20 15 20-15 v28 h12 V32 l-6-4 -26 19 -26-19z" fill="#EA4335" />
      <path d="M18 32 v40 h12 V44z" fill="#4285F4" />
      <path d="M70 44 v28 h12 V32z" fill="#34A853" />
      <path d="M70 44 l12-12 -6-4 -6 4.4z" fill="#FBBC04" />
      <path d="M18 32 l12 12 v-11.6 l-6-4.4z" fill="#C5221F" />
    </>
  ),
};

const sheets: Glyph = {
  name: 'Sheets',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <path d="M30 16 h28 l16 16 v52 a4 4 0 0 1 -4 4 H30 a4 4 0 0 1 -4 -4 V20 a4 4 0 0 1 4 -4z" fill="#0F9D58" />
      <path d="M58 16 l16 16 H62 a4 4 0 0 1 -4 -4z" fill="#87CEAC" />
      <rect x="36" y="46" width="28" height="26" rx="1.5" fill="#FFFFFF" />
      <path d="M36 55 h28 M36 63 h28 M48 46 v26" stroke="#0F9D58" strokeWidth="3" />
    </>
  ),
};

const calendar: Glyph = {
  name: 'Calendar',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <rect x="20" y="20" width="60" height="60" rx="8" fill="#FFFFFF" stroke="#4285F4" strokeWidth="6" />
      <rect x="20" y="20" width="60" height="16" rx="6" fill="#4285F4" />
      <text x="50" y="72" textAnchor="middle" fontFamily="Be Vietnam Pro" fontWeight="800" fontSize="32" fill="#1A73E8">
        31
      </text>
    </>
  ),
};

const drive: Glyph = {
  name: 'Drive',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <path d="M38 20 h24 l26 44 -12 20z" fill="#FBBC04" />
      <path d="M38 20 L12 64 l12 20 26-44z" fill="#34A853" />
      <path d="M24 84 h52 l12-20 H36z" fill="#4285F4" />
    </>
  ),
};

const zalo: Glyph = {
  name: 'Zalo',
  bg: '#0068FF',
  draw: (
    <>
      <path d="M50 20 c-20 0 -34 12 -34 28 0 9 4 16 11 21 l-4 11 13-6 c4 1.4 9 2 14 2 20 0 34-12 34-28 S70 20 50 20z" fill="#FFFFFF" />
      <text x="50" y="56" textAnchor="middle" fontFamily="Be Vietnam Pro" fontWeight="800" fontSize="19" fill="#0068FF">
        Zalo
      </text>
    </>
  ),
};

const facebook: Glyph = {
  name: 'Facebook',
  bg: '#1877F2',
  draw: <path d="M56 86 V56 h10 l1.6-12 H56 v-7 c0-3.5 1-6 6-6 h6 V20.4 c-1-.2-5-.4-9-.4 -9 0-15 5.5-15 15.6 V44 H34 v12 h10 v30z" fill="#FFFFFF" />,
};

const instagram: Glyph = {
  name: 'Instagram',
  bg: 'linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 55%,#962FBF 80%,#4F5BD5 100%)',
  draw: (
    <>
      <rect x="22" y="22" width="56" height="56" rx="16" fill="none" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="50" cy="50" r="13" fill="none" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="67" cy="33" r="3.6" fill="#FFFFFF" />
    </>
  ),
};

const tiktokNote = 'M56 18 h11 c1 8 6 13 14 14 v11 c-5 0-10-1.6-14-4 v22 c0 12-9 21-21 21 s-21-9-21-21 9-21 21-21 c1.2 0 2.3.1 3.4.3 v11.4 c-1-.4-2.2-.6-3.4-.6 -5.6 0-10 4.4-10 10 s4.4 10 10 10 10-4.4 10-10z';
const tiktok: Glyph = {
  name: 'TikTok',
  bg: '#000000',
  draw: (
    <>
      <path d={tiktokNote} fill="#25F4EE" transform="translate(-2.5 -2)" />
      <path d={tiktokNote} fill="#FE2C55" transform="translate(2.5 2)" />
      <path d={tiktokNote} fill="#FFFFFF" />
    </>
  ),
};

const youtube: Glyph = {
  name: 'YouTube',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <rect x="14" y="27" width="72" height="46" rx="13" fill="#FF0000" />
      <path d="M43 39 v22 l19-11z" fill="#FFFFFF" />
    </>
  ),
};

const linkedin: Glyph = {
  name: 'LinkedIn',
  bg: '#0A66C2',
  draw: (
    <>
      <rect x="24" y="42" width="11" height="34" fill="#FFFFFF" />
      <circle cx="29.5" cy="29" r="6.5" fill="#FFFFFF" />
      <path d="M43 42 h10.5 v5 c2-3.4 6-6 12-6 9 0 12 6 12 15 v20 H66.5 V58 c0-4.6-1-7.6-5.4-7.6 -4.6 0-7.1 3-7.1 7.6 v18 H43z" fill="#FFFFFF" />
    </>
  ),
};

const x: Glyph = {
  name: 'X',
  bg: '#000000',
  draw: <path d="M24 24 h15 l13 18 15-18 h8 L55.5 47 77 76 H62 L48 57 31 76 h-8 L44.5 52z" fill="#FFFFFF" />,
};

const slack: Glyph = {
  name: 'Slack',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <rect x="42" y="18" width="11" height="30" rx="5.5" fill="#36C5F0" />
      <rect x="18" y="47" width="30" height="11" rx="5.5" fill="#E01E5A" transform="translate(0 -5)" />
      <rect x="47" y="52" width="11" height="30" rx="5.5" fill="#ECB22E" />
      <rect x="52" y="42" width="30" height="11" rx="5.5" fill="#2EB67D" />
    </>
  ),
};

const notion: Glyph = {
  name: 'Notion',
  bg: '#FFFFFF',
  ring: true,
  draw: (
    <>
      <path d="M24 20 l44-3 10 7 v56 l-46 3 -10-9z" fill="#FFFFFF" stroke="#000000" strokeWidth="5" strokeLinejoin="round" />
      <path d="M38 34 v38 M38 34 l24 38 M62 30 v42" stroke="#000000" strokeWidth="6" strokeLinecap="square" fill="none" />
    </>
  ),
};

const telegram: Glyph = {
  name: 'Telegram',
  bg: '#27A7E7',
  draw: <path d="M20 48 l56-22 c3-1 5 1 4 5 l-10 46 c-1 3-4 4-6 2 l-15-11 -7 7 c-1 1-3 1-3-1 l1-12 26-24 -32 20 -13-4 c-4-1-4-4-1-6z" fill="#FFFFFF" />,
};

export const BRANDS = {gmail, sheets, calendar, drive, zalo, facebook, instagram, tiktok, youtube, linkedin, x, slack, notion, telegram};
export type BrandKey = keyof typeof BRANDS;

/** Icon ứng dụng bo góc (squircle ~22.5%), có bóng mềm. */
export const AppTile: React.FC<{brand: BrandKey; size: number; style?: React.CSSProperties; shadow?: boolean}> = ({brand, size, style, shadow = true}) => {
  const g = BRANDS[brand];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        background: g.bg,
        boxShadow: [g.ring ? 'inset 0 0 0 1.5px #E3E3E3' : '', shadow ? `0 ${size * 0.08}px ${size * 0.22}px rgba(0,0,0,0.14)` : ''].filter(Boolean).join(', ') || undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 100 100">
        {g.draw}
      </svg>
    </div>
  );
};
