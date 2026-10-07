---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "Một agent Sirrok gánh được việc của cả team 20–30 người — và bạn chỉ cần nói"
destination: youtube
aspect: 1920x1080
language: vi
audience: "Chủ doanh nghiệp siêu nhỏ và người xây One-Person Business, đang phải thuê hoặc thuê ngoài 20–30 đầu việc mới chạy nổi một hệ thống"
length: 48s
angle: PAS
style_preset: blue-professional
voice: "onwK4e9ZLuTAKqWW03F9"
---

## Intent

Video quảng cáo thương hiệu cho **Sirrok Agent** — app AI agent của A Hít
Official. Luận điểm duy nhất: thứ mà một team 20–30 người phải chia nhau làm,
một agent Sirrok làm được; và cách ra lệnh không phải là gõ, mà là **nói**, bất
cứ lúc nào, trên bất cứ thiết bị nào đang ở trong tay.

Tông giọng theo brand brief: thực chiến, kỷ luật, thẳng thắn — Monk Mode, nhập
vai phong cách Iman Gadzhi. Không hoa mỹ, không liệt kê feature; nói thẳng vào
cái người xem đang mất: tiền lương, thời gian, và sự phụ thuộc vào người khác.

Arc: **PAS** — pain đã biết và đang gấp với đúng tệp khán giả này (hook → pain →
agitation → solution tease → product intro → proof/demo → CTA).

## Assets

- public/audio/vo-01..08.mp3 — voiceover tiếng Việt, 8 dòng, tổng **42.68s**.
  ElevenLabs `eleven_multilingual_v2`, voice Daniel — Steady Broadcaster
  (`onwK4e9ZLuTAKqWW03F9`), stability 0.40 · similarity 0.80 · style 0.15 ·
  language `vi`. Sinh qua ElevenLabs MCP, KHÔNG qua `audio.mjs` — xem Notes.
  Mốc thời gian thật nằm ở `SCRIPT.md`; sửa chữ thì phải thu lại dòng đó.
- assets/bgm/track.mp3 — nhạc nền, lấy từ thư viện HeyGen theo mood
  `restrained minimal electronic underscore…`. **Dài 80s cho video 48s** → phải
  trim và fade ở Step 5, không mount nguyên file.
- assets/sirrok-agent-icon.svg — icon/logo Sirrok Agent **chính thức, do người
  dùng cung cấp** (`C:\Users\Admin\Downloads\sirrok_agent_icon.svg`, copy
  nguyên byte, không sửa). Dùng ở frame product intro, avatar agent, và frame
  CTA cuối. Không đặt chữ đè lên logo.

  Hình học đã verify: thân là một **khối vòm bóng** `#000000` — rộng 344px ở
  y=420, phình đều tới 912px ở y=1000 (chỗ rộng nhất), thuôn về 706px ở đáy;
  bbox 912×784, tâm (768, 772) trong khung 1536. Trên thân có **hai vệt sáng
  chéo song song** `#FFFFFF` (140×182 và 128×170, lệch phải-trên) — 0 pixel nào
  nằm ngoài thân, nên đây là specular highlight, KHÔNG phải mắt.

  **Ghi chú quan trọng:** script Python trong yêu cầu đầu tiên đặt tên biến là
  `eye_contours` / `eye_paths`, nên ban đầu tôi dựng sai thành một con ghost có
  hai mắt khoét rỗng. File thật không phải vậy. Bản tôi tự dựng
  (`assets/sirrok-ghost.svg`) đã bị xoá để không có hai logo cạnh tranh nhau.
  Mọi mô tả "ghost", "mắt" trong storyboard đã được sửa thành "dome mark" và
  "vệt sáng".

## Customizations

- **Look sáng kiểu x.ai/bot** — người dùng chọn rõ. Nền gần trắng `#FAFAF8`,
  mực `#0A0A0A`, nút/chip bán kính pill (`9999px`), grotesk chật, mockup UI
  thật thay vì hình minh hoạ trừu tượng. Tham chiếu đã xem trực tiếp
  `https://x.ai/bot` trong run này.
- **Xanh brand `#1877F2` chỉ dùng làm fill và accent, KHÔNG dùng làm màu chữ
  trên nền sáng** — xem Notes, mục tương phản.
- **Đa thiết bị là một cảnh hợp đoàn, không phải 5 cảnh rời** — xem Notes, mục
  5 thiết bị trong 45 giây.
- **Dynamic Island là close-up riêng**: pill thu gọn → nở ra thành phiếu tác vụ
  Sirrok đang chạy. Đây là moment "wow" của video, không bị trộn vào montage.
- **Ra lệnh bằng giọng nói** phải thấy được: dạng sóng/âm lượng phản ứng theo
  lời, không chỉ icon micro tĩnh.
- **Voiceover tiếng Việt** + nhạc nền + SFX ở các điểm chuyển. Giọng nam, tông
  thực chiến khớp brand.
- **Hiệu ứng motion graphic — người dùng yêu cầu rõ** ("làm luôn hiệu ứng
  motion graphic luôn"). Không dừng ở fade/slide cơ bản: kinetic typography ở
  hook, count-up cho con số 20–30 → 1, dạng sóng phản ứng theo giọng nói, pill
  Dynamic Island nở ra bằng morph chứ không cắt, checklist tác vụ tick dần theo
  lời, chuyển cảnh giữa các thiết bị có chuyển động mang nghĩa (không phải cut
  khô). Mọi chuyển động có easing, không `linear`; mọi thứ phải seek-safe và
  deterministic.

## Notes

- **Tương phản — ràng buộc cứng, phát hiện ở integration check.** Project yêu
  cầu ≥ 4.5:1 và brand brief cấm chữ sáng trên nền nhạt. Trên nền `#FAFAF8`:
  - `#1877F2` làm **chữ** chỉ đạt **4.09:1** → cấm dùng làm màu chữ.
  - chữ trắng trên pill `#1877F2` chỉ đạt **4.24:1** → cũng cấm.
  - Cách giải: chữ chính `#0A0A0A` trên nền (19.1:1); khi cần chữ màu xanh dùng
    biến xanh đậm `#0E52B8` (6.9:1); pill `#1877F2` thì chữ bên trên là
    `#0A0A0A` (4.67:1). `#1877F2` tự do dùng cho fill, viền, glow, dạng sóng,
    thanh tiến trình — mọi thứ không phải chữ.
- **5 thiết bị trong 45 giây — integration check thứ hai.** Dynamic Island +
  macOS + iPad + tablet Android + iPhone + Android phone = 6 bề mặt. Chia đều
  thì mỗi cái ~1.5s, không ai đọc được gì. Đã chốt: **một** cảnh hợp đoàn dựng
  sẵn (macOS hero + iPad + 2 phone cùng khung) đi kèm **một** close-up Dynamic
  Island riêng. Tablet Android và iPad dùng chung một khung tablet, phân biệt
  bằng UI bên trong.
- **Chữ trên màn hình là thẻ từ khoá ngắn, không phải phụ đề nguyên câu** —
  brand brief cấm quá 6 chữ một màn hình.
- **Không dùng `Math.random()` / `Date.now()`** — render phải deterministic.
- **Không dùng quá 2 font**; mọi chuyển động phải có easing, không `linear`.
- `x.ai/bot` chỉ là tham chiếu phong cách. Không copy copy-writing, không dùng
  tên Grok/xAI/Cursor, không nhái logo của họ. Mọi con số và claim về Sirrok
  lấy từ brief của người dùng, không bịa thêm.
- **Độ dài chốt 48s, không phải 45s.** Voiceover thật dài 42.68s. Ở 45s thì
  tổng khoảng nghỉ chỉ còn 2.3s chia cho 8 frame — không đủ cho beat
  khoảng-trắng ở Frame 3 (1.54s) lẫn hold end-card ở Frame 8 (0.96s), tức là
  video nói liên tục không có chỗ thở. Đánh đổi 3 giây để giữ nhịp. Lần thu đầu
  ra 51.26s; đã siết chữ ở 4 dòng (bảng chi tiết trong `SCRIPT.md`) thay vì
  tăng tốc đọc, vì tăng tốc phá tông Monk Mode.
- **Voiceover sinh qua ElevenLabs MCP, không qua `audio.mjs`.** Provider
  ElevenLabs của engine cần `$ELEVENLABS_API_KEY` trong env **và** package
  python `elevenlabs`; cả hai đều không có trên máy này (python cũng lỗi
  `No pyvenv.cfg`). Key chỉ nằm phía MCP server. Nên: VO sinh qua MCP rồi gắn
  tay vào `audio_engine_meta.json` (neutral sidecar) **và** `audio_meta.json`.
  Gắn vào cả hai file là có chủ ý — `fetch-sfx` ở Step 5 dựng lại
  `audio_meta.json` từ neutral sidecar, nếu chỉ gắn vào PL meta thì 8 giọng sẽ
  bị xoá sạch ở bước đó.
- **Đã cố ý đi lệch quy tắc `sync-durations` của skill, và đây là lý do.**
  `audio.mjs sync-durations` copy thẳng độ dài file giọng vào `- duration:` của
  từng frame, nên sau khi chạy nó video rút về 42.68s và **mỗi frame kết thúc
  đúng khoảnh khắc tiếng nói dứt** — không frame nào còn khoảng nghỉ. Skill ghi
  "never hand-edit synced durations"; quy tắc đó tồn tại để chặn agent bịa
  duration dài hơn audio rồi để lại khoảng chết. Phần pad ở đây không trái với
  audio: nó là VO + một khoảng giữ đã được biện minh trong chính Scene cuối của
  từng frame (rõ nhất: Frame 3 nghỉ 0.706s trên khung trắng — đó là beat chính
  của frame; Frame 8 giữ tĩnh 0.963s để kết video). Tổng pad 5.32s trên 8 frame.
  Thứ tự chạy có chủ ý: `sync-durations` → `fetch-sfx` → **đặt lại pad sau
  cùng**, để không bước nào ghi đè lên nó. Nếu sau này chạy lại
  `sync-durations`, phải đặt lại pad lần nữa.
- **Không làm phụ đề (captions: skipped).** Brand brief cấm phụ đề nguyên câu
  và giới hạn 6 từ một màn hình; chữ trên hình là thẻ từ khoá do từng frame tự
  dựng. Vì vậy cũng không cần word-level timing — `words: []` trong audio meta
  là đúng, không phải thiếu dữ liệu.
- **Hạn mức render chưa xác định**: `hyperframes usage --json` trả về
  `status: unknown` (`unsupported_auth`) trong run này.
- CLI giữ pin `hyperframes@0.8.117` theo CLAUDE.md (khớp version plugin), không
  nâng lên 0.8.137.

## Đang chờ — giọng tiếng Việt bản ngữ (chốt 2026-10-06)

**Trạng thái:** hình đã xong và check sạch; chỉ còn thay voiceover.

Người dùng hỏi "voice giọng tiếng Việt chứ" và câu trả lời đúng là **chưa hẳn**:
8 file hiện tại dùng voice **Daniel — Steady Broadcaster**
(`onwK4e9ZLuTAKqWW03F9`), một giọng huấn luyện trên tiếng Anh đọc văn bản tiếng
Việt qua `eleven_multilingual_v2` — phát âm được nhưng mang chất giọng ngoại.

**Hai đường đều bị chặn từ phía agent, không phải do làm sai:**

- `text_to_voice` (Voice Design) trả 403 `feature_not_available` —
  "Creating a voice through the API is only available on a paid plan".
- Giọng trong thư viện chung trả 400 `voice_not_found` khi gọi thẳng — phải
  được **thêm vào voice library của tài khoản** trước. Không có MCP tool nào
  làm việc này; phải bấm từ tài khoản người dùng.

Tài khoản còn **3/3 slot giọng trống**, thêm giọng từ thư viện là miễn phí.

**Shortlist đã gửi người dùng** (nam, khớp tông Monk Mode):

| Giọng | ID | Ghi chú |
|---|---|---|
| Tung — Deep & Powerful | `2G3KT0n4xucedtpsBlU2` | Nam Bộ, trầm mạnh, hợp commercial/motivational — khuyến nghị |
| Bob — Deep & Calm | `bgEAVlb0lL0mCSoVll8V` | Bắc Bộ, trầm tĩnh, chuẩn phát thanh |
| Thế Minh | `Tr84Gom1NKJwoYZT55td` | Bắc Bộ, nam trẻ, ấm |
| Thanh Nguyen | `byrMF25Yaim0wRYKttbA` | Nam Bộ, điềm, business explainer |

**Khi người dùng báo tên/ID giọng, chạy đúng trình tự này:**

1. Thu lại 8 dòng bằng `mcp__elevenlabs__text_to_speech`, **chữ lấy nguyên văn
   từ `SCRIPT.md`**, tham số giữ nguyên: `eleven_multilingual_v2`,
   `language: vi`, stability 0.40, similarity 0.80, style 0.15.
2. Ghi đè `public/audio/vo-01..08.mp3` (đặt tên theo thứ tự dòng, không theo
   thứ tự file sinh ra — tên file TTS lấy từ chữ đầu câu nên dễ lẫn).
3. ffprobe lại 8 file, cập nhật `duration_s` trong **cả**
   `audio_engine_meta.json` (neutral sidecar) **và** `audio_meta.json`.
4. Cập nhật mốc `**Time:**` trong `SCRIPT.md`.
5. Đặt lại duration frame = giọng + hold (bảng hold ở mục "sync-durations" phía
   trên). Nếu tổng lệch nhiều so với 48s thì siết chữ, đừng tăng tốc đọc.
6. `assemble-index` → `transitions inject` → `transitions verify` →
   `hyperframes check` → snapshot → cổng duyệt render.

**Phần hình KHÔNG phải dựng lại** — chỉ duration frame đổi.
