/**
 * Phim dài 90 giây (2700 frame @30fps). Mọi mốc nằm ở đây: thời lượng cảnh,
 * và lúc mỗi câu thoại bắt đầu — tính theo frame CỦA CẢNH chứa nó.
 * Mốc từng chữ bên trong câu nằm ở src/voice.json (đo trên file giọng).
 */
export const F = {
  intro: 290, // ghost nhiều hiệu ứng + "Mỗi ngày…" / "Giờ thì…"
  wake: 270, // "Hey Sirrok." + câu lệnh bằng giọng nói (S1Wake)
  work: 360, // agent tự làm trên desktop (S2Work)
  call: 580, // agent gọi điện cho khách
  island: 340, // Dynamic Island: macOS → iOS → Android
  social: 330, // tự viết & đăng bài mạng xã hội
  connect: 200, // logo bên thứ ba quanh ghost
  everywhere: 210, // ở mọi nơi, mọi lúc (S4Everywhere)
  reveal: 240, // hé lộ logo (S5Reveal)
  meet: 250, // màn kết "Gặp Sirrok Agent" — trang ra mắt + đội agent ghost
  wipe: 20,
} as const;

/**
 * Thời lượng THẬT trong phim — cắt bớt đuôi tĩnh của vài cảnh để cả phim đúng 90 giây.
 * (F giữ độ dài thiết kế của từng cảnh khi xem riêng.)
 */
export const CUT = {...F, wake: 240, work: 340, call: 560, island: 310, social: 300, connect: 180, everywhere: 210, reveal: 180, meet: 230} as const;

/** Cảnh nào nối bằng vệt mắt (wipe), cảnh nào cắt liền (mắt nối mắt). */
export const ORDER = [
  {key: 'intro', wipeAfter: false},
  {key: 'wake', wipeAfter: true},
  {key: 'work', wipeAfter: true},
  {key: 'call', wipeAfter: true},
  {key: 'island', wipeAfter: true},
  {key: 'social', wipeAfter: true},
  {key: 'connect', wipeAfter: true},
  {key: 'everywhere', wipeAfter: false},
  {key: 'reveal', wipeAfter: true},
  {key: 'meet', wipeAfter: false},
] as const;

type SceneKey = (typeof ORDER)[number]['key'];

export const START = (() => {
  const s = {} as Record<SceneKey, number>;
  let t = 0;
  for (const o of ORDER) {
    s[o.key] = t;
    t += CUT[o.key] - (o.wipeAfter ? F.wipe : 0);
  }
  return s;
})();

export const TOTAL = START.meet + CUT.meet; // = 2700

/** Câu thoại: id trong voice.json → (cảnh, frame bắt đầu trong cảnh). */
export const VO = {
  n1: {scene: 'intro', at: 40},
  n2: {scene: 'intro', at: 170},
  // hey/command do S1Wake tự đặt (HEY_AT, CMD_AT)
  n3: {scene: 'work', at: 22},
  n4: {scene: 'call', at: 10},
  a1: {scene: 'call', at: 108},
  c1: {scene: 'call', at: 262},
  a2: {scene: 'call', at: 368},
  c2: {scene: 'call', at: 478},
  n5: {scene: 'island', at: 15},
  n6: {scene: 'social', at: 15},
  n7: {scene: 'connect', at: 15},
  n8: {scene: 'everywhere', at: 30},
  n9: {scene: 'meet', at: 24},
} as const satisfies Record<string, {scene: SceneKey; at: number}>;

export type VoId = keyof typeof VO;
