---
format: 1920x1080
duration: 48s
message: "Một agent Sirrok gánh được việc của cả team 20–30 người — và bạn chỉ cần nói"
arc: "PAS — Hook → Pain → Agitation → Product intro → Voice demo → Dynamic Island → Everywhere → CTA"
audience: "Chủ doanh nghiệp siêu nhỏ và người xây One-Person Business, đang phải thuê hoặc thuê ngoài 20–30 đầu việc mới chạy nổi một hệ thống"
mode: collaborative
music: "restrained minimal electronic underscore, low tension build, modern tech, no vocals, steady pulse"
---

## Locked

Chốt ở sketch v1, người dùng duyệt nguyên sheet. Những thứ **không được vẽ lại**
ở bước build — chỉ mặc chuyển động lên:

- Layout, thứ bậc và câu chữ của cả 8 frame, đúng như `storyboard.html#frame-NN`.
- Độ dài 48.0s và 8 mốc frame, dẫn xuất từ voiceover thật (xem `SCRIPT.md`).
- Hai chỗ đọc lỏng luật "≤ 6 chữ": Frame 02 giữ **4 thẻ có chữ**, Frame 08 giữ
  khẩu hiệu **nguyên văn 9 chữ**. Người dùng chốt giữ như sketch.
- Logo `assets/sirrok-agent-icon.svg` dùng nguyên file. Hai hình trắng là **mắt**
  của mascot — đây là nhân vật thương hiệu tái xuất hiện ở mọi video, không phải
  logo tĩnh. Ở bản dựng này nó đứng yên; xem Build notes.

## Video direction

Viết một lần, mọi frame thừa hưởng. Scene line của từng frame chỉ ghi phần khác biệt.

**Palette — theo role, lấy từ `frame.md`, không tự nghĩ thêm.**
`bg` #FAFAF8 là nền của mọi frame (mỗi frame tự có một background clip
full-duration; **không** set background lên `#root`). `text` #0A0A0A cho mọi
tiêu đề và số lớn. `text-muted` #52525B cho chữ phụ. `primary` #0E52B8 là **màu
xanh duy nhất được làm chữ** — eyebrow, tag, numeral, fill nút CTA.
`accent-fill` #1877F2 **chưa bao giờ là chữ**: nó là dạng sóng, progress bar,
glow của island, accent viền thiết bị, panel tint. `positive` #047857 cho dấu ✓.

**Motion grammar + mô hình reveal.** `power3` là ease mặc định — mượt thắng nảy;
overshoot chỉ dùng ở spring-pop của nút CTA (Frame 08). **Tuyệt đối không
`linear`.** Mọi frame theo mô hình **reveal khớp lời đọc**: tại t=0 chỉ hiện
đúng thứ voiceover đang nói lúc đó, mỗi mảnh sau vào **khi lời thoại gọi tên
nó**, và reveal phải rải sang cả nửa sau của frame. Lúc đã resolve thì **giữ
yên** — không camera drift, không breathing cho card; tối đa là subtle jitter
biên độ thấp trên một element hero.

**Nhịp / phân bổ frame giữ tĩnh.** Frame giữ tĩnh là có chủ ý, không phải thiếu
ý tưởng: **Frame 03** (0.7s cuối, sau beat khoảng-trắng) và **Frame 08** (1.4s
cuối, tĩnh hoàn toàn) là hai breather. Cường độ chuyển động dâng theo video:
thấp ở 01–03, xây ở 04, cao nhất ở **05–07**, rồi rơi hẳn về tĩnh ở 08. Frame
06–07 là cặp đỉnh — một close-up morph rồi một pull-back; đặt cạnh nhau có chủ ý.

**Negative list — không bao giờ xuất hiện.**
`Math.random()` · `Date.now()` · ease `linear` · box-shadow trên content (preset
này zero-shadow; độ nổi đến từ fill 4% + viền 20%) · chữ #1877F2 · chữ trắng
trên #1877F2 · gradient tím-xanh kiểu AI · bokeh trôi · nav bar / footer /
scrollbar / cursor thật trừ khi đang dựng lại UI có chủ ý · hình trang trí chung
chung thay cho asset thật · chữ đè lên logo · font thứ hai.
Và hai lỗi chuyển động: **slideshow** (dồn hết vào 25% đầu rồi đứng im) và
**screensaver** (mọi thứ trôi lơ lửng độc lập không theo lời).

**Seam.** Chỉ hai cut khô — vào Frame 03 (chật sang trống) và vào Frame 06 (vào
thẳng close-up). Sáu seam còn lại crossfade vì **có element đi xuyên qua**; mọi
seam đó ghi toạ độ/scale/opacity ở hai đầu bằng `handoff_out` / `handoff_in` để
worker song song không dựng hai phiên bản khác nhau của cùng một chỗ nối.

**Captions: skipped** — brand brief cấm phụ đề nguyên câu và giới hạn 6 chữ một
màn hình; chữ trên hình là thẻ từ khoá do từng frame tự dựng.

## Frame 1 — 20–30 người, hoặc một agent

- type: hook
- duration: 4.6s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook-28-nguoi.html
- blueprint: dataviz-countup (Adapt)
- focal: headcount-stack + counter — TỰ DỰNG. `count-up` (đã cài) đếm cỡ chữ cố định, không làm value-scaled và không drive được lưới glyph từ timeline riêng. Lấy cơ chế, không mount.
- roles: headcount-stack = cutout · sirrok-agent-icon.svg = supporting (chỉ xuất hiện 1.5s cuối) · nền phẳng = background
- persuasion: Cold-open stat
- beat: nêu cái giá, mở ngay lối thoát
- scene: Lưới 28 glyph người đếm lên trên nền sáng, rồi cả lưới sụp lại thành một mascot Sirrok
- vo_file: public/audio/vo-01.mp3 (3.06s, ElevenLabs Daniel)
- voiceover: "Hai mươi, ba mươi người. Hoặc... một agent."
- sfx: soft digital tick, low impact hit
- asset_candidates: "assets/sirrok-agent-icon.svg"
- built_visuals: "headcount-stack (28 glyph người) + value-scaled counter"
- narrative_role: "Lands the value claim in beat 1 — nêu cái giá hiện tại rồi mở ra lối thoát trong cùng một hơi"
- handoff_out: "mascot — center (960, 540), scale 1.0, opacity 1, đứng yên; chỉ còn nó trên canvas khi cắt"

Adapt: giữ signature move **value-scaled counter** của dataviz-countup, nhưng
vòng ring đổi thành lưới glyph người, và một stat thay vì ba. Lưới là thứ biến
hình, không phải thứ trang trí.

Scene 1 (0.0–1.9s): nền `bg` phẳng; eyebrow "ĐỂ MỘT HỆ THỐNG CHẠY ĐƯỢC" (`primary`, uppercase) nằm trên, số "28" dead-center **value-scaled counter** đếm 0 lên 28 — cỡ chữ lớn dần theo giá trị nên chính cú leo là cú escalate; lưới 14×2 glyph người mọc **đồng bộ từng glyph với bộ đếm**, không mọc sẵn. Centered, hero chiếm ~55% khung, 3 lớp (nền · lưới · số).
Scene 2 (1.9–2.5s): bộ đếm dừng ở 28, chữ "NGƯỜI" settle cạnh số. **Giữ yên hoàn toàn** — đây là khoảng lặng trong lời thoại trước chữ "Hoặc", stillness làm việc thay motion.
Scene 3 (2.5–3.1s): trên chữ "một agent", cả lưới bắt đầu **cluster to inward collapse** (nghịch đảo center-outward-expansion) — 28 glyph lao về tâm trong lockstep, kéo `motion-blur-streak` hướng tâm.
Scene 4 (3.1–4.6s): collapse đóng lại thành mascot Sirrok bằng **scale-swap** (lưới co + mờ trong khi mark tới cùng một tâm), mark lock ở (960, 540) và **đứng tuyệt đối yên** tới lúc cắt. Centered, mark ~17% chiều rộng khung.

## Frame 2 — Mỗi đầu việc một người

- type: pain_point
- duration: 6.9s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-moi-dau-viec-mot-nguoi.html
- blueprint: overwhelm-surround (Reproduce)
- focal: 4 thẻ vai trò có pill lương — TỰ DỰNG. `overwhelm-surround` (đã cài) chỉ nhận count/centerLabel/intensity, không chở nổi 4 thẻ có tên + mức lương. Lấy signature move close-in-from-all-sides, không mount.
- roles: 4 thẻ có chữ = cutout · 8 thẻ mờ = supporting · glyph bạn ở tâm = cutout (chủ thể bị vây)
- persuasion: Pain agitation
- beat: bị vây bởi chính bảng lương của mình
- scene: Thẻ vai trò dồn vào từ bốn phía rồi vây kín giữa khung
- vo_file: public/audio/vo-02.mp3 (6.55s, ElevenLabs Daniel)
- voiceover: "Content. Quảng cáo. Báo cáo. Support. Mỗi đầu việc một người."
- sfx: layered paper whoosh, rising density
- asset_candidates: "none"
- built_visuals: "12 thẻ vai trò card-tinted + pill mức lương + glyph người ở tâm"
- narrative_role: "Agitate the cost — biến con số 20–30 thành cảm giác bị vây"
- handoff_in: "mascot — center (960, 540), scale 1.0, opacity 1 → thu về scale 0.35 và mờ dần về 0 trong 0.5s đầu khi thẻ đầu tiên vào"

Reproduce: lấy nguyên signature move **elements close in from all sides** — vây,
không zoom. Chủ thể ở tâm là glyph người (chính người xem), giữ tĩnh trong khi
mọi thứ quanh nó siết lại.

Scene 1 (0.0–0.5s): mascot của frame trước co về scale 0.35 và mờ về 0; glyph người `text` đậm xuất hiện dead-center kèm chip "bạn". Centered, khung còn trống hết.
Scene 2 (0.5–3.0s): bốn thẻ vai trò có chữ bay vào **từ bốn rìa khung**, một thẻ cho mỗi tên được đọc — Content (trái trên), Quảng cáo (phải trên), Báo cáo (trái dưới), Support (phải dưới); mỗi thẻ **spring-pop entrance** settle long-tail, pill mức lương pop sau thân thẻ 0.12s. Rule-of-thirds bốn góc, 3 lớp.
Scene 3 (3.0–4.6s): trên "Mỗi đầu việc một người", tám thẻ mờ (chỉ còn pill lương, không chữ) **cascade vào theo stagger** lấp các khe còn lại — mật độ dâng, không thẻ nào che glyph ở tâm. Density đạt ~70% khung.
Scene 4 (4.6–6.9s): **signature move** — cả cụm 12 thẻ siết vào tâm từ mọi phía cùng lúc, khoảng trống quanh glyph người thu hẹp dần; `depth-of-field-blur` làm mờ nhẹ lớp thẻ ngoài rìa để glyph ở tâm vẫn là focal. Dừng ở trạng thái **chật nhất** và đóng băng 0.4s cuối — không giải quyết gì, đó là mục đích.

## Frame 3 — Bạn không thiếu người

- type: pain_point
- duration: 4.7s
- transition_in: cut
- status: animated
- src: compositions/frames/03-ban-khong-thieu-nguoi.html
- blueprint: kinetic-type-beats (Reproduce)
- focal: none — chỉ typography, search registry không ra gì phù hợp (đúng, vì chữ LÀ cả frame)
- roles: không có asset ngoài — chữ là toàn bộ frame
- persuasion: Reframe the cause
- beat: lật nguyên nhân
- scene: Hai beat chữ lớn đáp xuống giữa khung trắng trống, từng câu một
- vo_file: public/audio/vo-03.mp3 (3.99s, ElevenLabs Daniel)
- voiceover: "Bạn không thiếu người. Bạn thiếu một thứ biết tự làm."
- sfx: hard cut stab x2
- asset_candidates: "none"
- built_visuals: "chỉ typography — hai beat chữ h1"
- narrative_role: "Agitation chốt — lật nguyên nhân từ thiếu nhân sự sang thiếu công cụ biết tự làm, mở đường cho sản phẩm"
- handoff_in: "clean cut — mọi thẻ vai trò biến mất tức thì, canvas về trống trơn"

Reproduce: **kinetic beat-slam** — mỗi câu một beat riêng, đáp xuống chứ không
trôi vào. Khoảng trắng giữa hai beat là phần nội dung thật của frame này.

Scene 1 (0.0–1.6s): cut khô sang khung `bg` trống trơn — độ tương phản với cảnh chật ngay trước là đòn. "Bạn không thiếu người." **slam xuống** dead-center trên một beat đơn, `power3`, không fade. Centered, chữ chiếm ~62% chiều rộng, 1 lớp duy nhất.
Scene 2 (1.6–2.0s): câu 1 **hard-cut biến mất**. 0.4s khung trống hoàn toàn, không một element nào. Đây là beat khoảng-trắng — nó phải thật trống mới ăn.
Scene 3 (2.0–3.99s): "Thiếu một thứ / biết tự làm." slam xuống nặng hơn câu 1 (cỡ lớn hơn, hai dòng), **per-word staggered reveal** để chữ "tự làm" đáp cuối cùng và nặng nhất. Centered, chữ ~70% chiều rộng.
Scene 4 (3.99–4.7s): **held read, tĩnh tuyệt đối** — breather thứ nhất của video. Không jitter, không gì. 0.7s để câu vừa nói kịp ngấm.

## Frame 4 — Sirrok Agent

- type: product_intro
- duration: 5.5s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-sirrok-agent.html
- blueprint: logo-assemble-lockup (Adapt)
- focal: assets/sirrok-agent-icon.svg — TỰ DỰNG lockup. `logo-outro` (đã cài) không có biến nào, nội dung cứng, lại có glow bloom trái preset zero-shadow. Lấy cơ chế piece-by-piece assembly.
- roles: sirrok-agent-icon.svg = cutout (hero) · 12 thẻ vai trò kế thừa từ Frame 02 = supporting (vật liệu dựng, tan hết ở 1.3s) · wordmark = supporting
- persuasion: Name the escape
- beat: đặt tên cho lối thoát
- scene: Các mảnh thẻ vai trò bay về tụ thành mascot Sirrok, wordmark hiện dưới
- vo_file: public/audio/vo-04.mp3 (4.64s, ElevenLabs Daniel)
- voiceover: "Sirrok Agent. Một agent, gánh việc của cả ba mươi người."
- sfx: assemble swoosh into soft brand chime
- asset_candidates: "assets/sirrok-agent-icon.svg"
- built_visuals: "wordmark Be Vietnam Pro 800 + accent-line"
- narrative_role: "Đặt tên cho lối thoát đã hứa ở beat 1; dùng chính các mảnh pain làm vật liệu dựng logo"
- handoff_out: "mascot — (960, 470), scale 1.0, opacity 1, đứng yên; wordmark Sirrok Agent ngay dưới tại (960, 640), opacity 1"

Adapt: giữ signature move **piece-by-piece assembly** của logo-outro, nhưng
mảnh là 12 thẻ vai trò thật từ Frame 02 chứ không phải shard trừu tượng — logo
được dựng từ chính vật liệu của pain. **Bỏ glow bloom và URL pill** của
blueprint: preset này zero-shadow, và CTA thuộc Frame 08.

Scene 1 (0.0–1.3s): 12 thẻ vai trò giữ nguyên vị trí cuối của Frame 02 rồi lao về tâm với `motion-blur-streak` hướng tâm, nén lại thành mascot bằng **card morph-anchor** (uniform `scale`, không tween width/height). Layered-depth, 3 lớp, thẻ ngoài tới sau thẻ trong.
Scene 2 (1.3–2.2s): mark lock ở (960, 470) và **đứng yên từ đây tới hết frame**; accent-line `accent-fill` **svg self-draw** vẽ ra phía trên mark. Centered.
Scene 3 (2.2–3.4s): wordmark "Sirrok Agent" **per-word staggered reveal** vào **bên dưới** mark tại (960, 640) — không bao giờ chồng lên mark. Hierarchy: mark thắng bằng kích thước (3:1), wordmark thắng bằng weight 800.
Scene 4 (3.4–5.5s): dòng phụ "Một agent, gánh việc của cả ba mươi người." reveal đúng lúc lời thoại tới nó, `text-muted`; rồi **held read** 0.9s cuối, tĩnh.

## Frame 5 — Bạn không gõ. Bạn nói.

- type: feature_showcase
- duration: 8.2s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-ban-noi-no-lam.html
- blueprint: agent-progress-theater (Adapt)
- focal: voice-wave (TỰ DỰNG) nửa đầu, chuyển sang checklist nửa sau. Chrome cửa sổ theo `browser-device-stage` chrome:"window"; 4 dòng + dấu tick lấy cơ chế từ `mk-specs-list` / `success-check` (cả hai không nhận nội dung qua biến).
- roles: mac-window = background (surface) · voice-wave = cutout (hero nửa đầu) · 4 task row = cutout (hero nửa sau) · sirrok-agent-icon.svg = supporting (avatar sidebar)
- persuasion: Proof — the mechanism
- beat: máy nghe rồi máy làm
- scene: Cửa sổ macOS; dạng sóng giọng nói chạy, rồi 4 dòng tác vụ tick dần
- vo_file: public/audio/vo-05.mp3 (7.89s, ElevenLabs Daniel)
- voiceover: "Bạn không gõ. Bạn nói. Nó nghe, nó chia việc, rồi nó làm xong — và trả lại kết quả."
- sfx: mic open blip, four soft task-complete ticks
- asset_candidates: "assets/sirrok-agent-icon.svg"
- built_visuals: "mac-window + voice-wave 24 thanh (envelope cố định) + 4 agent-row + 4 task-row có dấu tick"
- narrative_role: "Bằng chứng số 1 — chứng minh cách ra lệnh bằng giọng nói, đúng cơ chế người dùng nêu trong brief"
- handoff_in: "mascot — từ (960, 470) scale 1.0 bay về avatar sidebar tại (330, 300) scale 0.22, opacity 1, trong 0.6s đầu"

Adapt: giữ signature move **the receipt cascades in and rows CHECK OFF** của
agent-progress-theater. Nhưng trigger beat **không phải** click menu hay modal —
trigger là **giọng nói**, hiện thành dạng sóng. Đó là thứ phải bán được ở frame
này. Surface dùng `browser-device-stage`, 4 dòng dùng `mk-specs-list`, dấu tick
dùng `success-check`. Dạng sóng tự dựng: search audio waveform bars chỉ ra
oscilloscope CRT và bar-chart, không cái nào đúng.

Scene 1 (0.0–0.7s): mascot bay từ tâm Frame 04 về ô avatar sidebar (330, 300) scale 0.22 bằng **zoom-to-target** nghịch; khung cửa sổ macOS **svg self-draw** vẽ viền ra quanh nó. Asymmetric 70/30 (main · sidebar), 3 lớp.
Scene 2 (0.7–2.0s): trên "Bạn nói", **dạng sóng 24 thanh bật sáng** — chiều cao lấy từ **mảng envelope cố định** (không Math.random, render phải giống hệt mỗi lần), `asr-keyword-glow` chạy dọc dãy thanh theo nhịp từ. Hero của nửa đầu, chiếm ~40% pane chính.
Scene 3 (2.0–3.1s): "Nó nghe," — 4 agent row trong sidebar sáng lên lần lượt, row Sirrok đậm trước rồi tới Content · Ads · Support.
Scene 4 (3.1–4.2s): "nó chia việc," — 4 dòng tác vụ **cascade vào theo stagger** trong pane chính, tất cả còn chưa tick, mỗi dòng mang một chip trạng thái. Focal chuyển từ sóng sang checklist; sóng hạ biên độ nhưng không tắt.
Scene 5 (4.2–6.0s): "rồi nó làm xong" — dòng 1 và 2 **tick** bằng `svg-path-draw` trong vòng `positive`, chữ dòng đã xong chuyển `text-light`; dòng 3 hiện progress đang chạy.
Scene 6 (6.0–8.2s): "và trả lại kết quả." — dòng 3 tick, dòng 4 giữ trạng thái chờ ở opacity 0.42 (trung thực: agent đang chạy, chưa xong hết); sóng settle về idle biên độ thấp. **Held read** 0.3s cuối.

## Frame 6 — Ngay trên Dynamic Island

- type: feature_showcase
- duration: 5.8s
- transition_in: cut
- status: animated
- src: compositions/frames/06-dynamic-island.html
- blueprint: compose
- focal: island-pill — TỰ DỰNG. Registry không có item nào làm morph thu gọn sang nở ra.
- roles: island-pill = cutout (hero tuyệt đối) · phonetop/screen = background · progress track = supporting
- persuasion: Proof — it lives in the OS
- beat: moment wow
- scene: Close-up pill Dynamic Island thu gọn, morph nở ra thành phiếu tác vụ đang chạy
- vo_file: public/audio/vo-06.mp3 (5.48s, ElevenLabs Daniel)
- voiceover: "Ngay trên Dynamic Island. Một dòng, biết việc đang chạy tới đâu."
- sfx: subtle haptic pop, progress whirr
- asset_candidates: "assets/sirrok-agent-icon.svg"
- built_visuals: "island-pill (thu gọn sang nở) + đỉnh device-phone + progress track"
- narrative_role: "Bằng chứng số 2 — moment wow của video; cho thấy agent sống ngay trong hệ điều hành, không phải một app phải mở ra"
- handoff_in: "clean cut — vào thẳng close-up, không mang element nào từ Frame 5"
- handoff_out: "island-pill — expanded, (960, 300), scale 1.0, opacity 1; từ đây camera sẽ pull back nên pill phải nằm đúng vị trí đỉnh của chiếc iPhone ở Frame 7 (1575, 455)"

Compose: không blueprint nào khớp — đã search device/pill/mockup trong registry,
`device-frame-stage` và `browser-device-stage` chỉ cho khung máy tĩnh, không cái
nào làm được cú morph thu gọn sang nở ra. **Signature move tự đặt: one-element
pill morph** — một element duy nhất biến hình, không phải hai element cross-fade.
Đây là điều kiện để cảnh đọc ra hệ điều hành, chứ không đọc ra slide.

Scene 1 (0.0–0.9s): cut khô vào close-up đỉnh máy; pill **thu gọn** (126×37) nằm top-center trên nền máy tối, một dot `accent-fill` pulse biên độ thấp bên trái. Centered, hero chiếm ~46% chiều rộng khung, 3 lớp (nền sáng · thân máy · pill).
Scene 2 (0.9–2.2s): **signature move** — pill morph bằng `card-morph-anchor`: uniform `scale` + bán kính + apparent size tween cùng lúc trên `power3` ra kích thước nở (420×128). **Nội dung bên trong giữ ẩn cho tới khi hộp tới đích** — đó là điều làm nó đọc ra nở ra chứ không đọc ra hiện lên.
Scene 3 (2.2–3.2s): "Một dòng," — bên trong pill đã settle, đĩa `bg` tròn chứa mascot fade vào trước, rồi tiêu đề "Trả 14 ticket" và dòng phụ "Sirrok · 9 / 14 xong" (chữ màu `bg` trên pill tối = 19:1).
Scene 4 (3.2–5.0s): "biết việc đang chạy tới đâu." — track progress **fill tới 62%** bằng `stat-bars-and-fills`, bộ đếm 9 / 14 step đồng bộ với thanh. Reveal này nằm ở nửa sau frame, đúng mô hình.
Scene 5 (5.0–5.8s): **held** — chỉ còn dot `accent-fill` giữ pulse biên độ thấp (register subtle jitter). Pill đứng đúng (960, 300) để Frame 7 pull back ra từ chính nó.

## Frame 7 — Ở đâu bạn làm việc

- type: benefit_highlight
- duration: 6.6s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-o-dau-ban-lam-viec.html
- blueprint: device-surface-showcase (Adapt)
- focal: 4 device frame — TỰ DỰNG. `multi-device-splay` (đã cài) chỉ nhận `accent`; không nhận 4 nhãn nền tảng, không phân biệt iPad / tablet Android, không neo được pill island cho handoff từ Frame 06. Lấy signature move fan-from-stack.
- roles: 4 device frame = cutout · island-pill nhỏ trên iPhone = supporting (kế thừa từ Frame 06) · nhãn nền tảng = supporting
- persuasion: Remove the where-does-it-run objection
- beat: ở đâu cũng có
- scene: Camera pull back từ pill; MacBook, tablet và hai điện thoại tự xếp vào thành một khung hợp đoàn
- vo_file: public/audio/vo-07.mp3 (6.32s, ElevenLabs Daniel)
- voiceover: "MacBook. iPad. Android. iPhone. Bạn ở đâu, nó ở đó."
- sfx: staggered soft snaps x4
- asset_candidates: "none"
- built_visuals: "mac-window hero + device-tablet + device-phone x2 (iPhone có island, Android có punch-hole) + island-pill nhỏ"
- narrative_role: "Trả lời chạy ở đâu bằng MỘT cảnh hợp đoàn — 48 giây không chia nổi 6 bề mặt thành 6 cảnh"
- handoff_in: "island-pill — expanded (960, 300) scale 1.0 → camera pull back, pill co về scale 0.18 và neo vào đỉnh iPhone tại (1575, 455); opacity giữ 1 suốt quá trình"

Reproduce: giữ nguyên signature move **fan from a centered stack into a splay**.
Điều thêm vào là **cú pull-back liên tục từ Frame 06** — chiếc iPhone trong
splay chính là máy vừa close-up, nên không được cắt.

Scene 1 (0.0–1.0s): **camera pull-back liên tục** bằng `viewport-change` từ close-up pill; pill nở co về scale 0.18 và **neo vào đỉnh iPhone** tại (1395, 455), opacity giữ 1 suốt quá trình — seam phải không thấy pop. Layered-depth.
Scene 2 (1.0–3.4s): **signature splay** — bốn máy fan ra từ stack ở tâm, **một máy tới cho mỗi tên nền tảng được đọc**: MacBook (tâm, hero), iPad (trái), Android (phải trong), iPhone (phải ngoài, đã có pill); nhãn nền tảng `tag` pop dưới từng máy sau thân máy 0.15s. Full-width strip, 3 lớp, máy ở tâm lớn nhất (3:1 so với phone).
Scene 3 (3.4–5.2s): "Bạn ở đâu, nó ở đó." — cả bốn màn hình **sáng bề mặt Sirrok cùng lúc** (một beat duy nhất, không stagger — ý là đồng thời); `depth-of-field-blur` settle focal về MacBook ở tâm.
Scene 4 (5.2–6.6s): **held read** — splay đứng yên, chỉ dot trên pill iPhone giữ pulse biên độ thấp. Không camera drift sau khi pull-back đã kết thúc.

## Frame 8 — Hãy tham gia cuộc chơi

- type: cta
- duration: 5.7s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-tham-gia-cuoc-choi.html
- blueprint: titlecard-reveal (Reproduce)
- focal: assets/sirrok-agent-icon.svg — TỰ DỰNG. `cta-lockup` (đã cài) nhận được action_line + button_label nhưng không nhận mascot, vốn là hero của frame. Lấy cơ chế action-line reveal rồi capsule spring-pop.
- roles: sirrok-agent-icon.svg = cutout (hero) · wordmark + khẩu hiệu = supporting · cta-button pill = cutout (element solid duy nhất) · 4 thiết bị kế thừa = background (tan hết ở 0.6s)
- persuasion: One action, brand slogan
- beat: chốt
- scene: Thiết bị mờ đi, mascot + wordmark Sirrok Agent đứng giữa, khẩu hiệu bên dưới, nút pill tải về
- vo_file: public/audio/vo-08.mp3 (4.74s, ElevenLabs Daniel)
- voiceover: "Sirrok Agent. Đừng chỉ đứng nhìn. Hãy tham gia cuộc chơi."
- sfx: final brand chime
- asset_candidates: "assets/sirrok-agent-icon.svg"
- built_visuals: "wordmark + khẩu hiệu 2 dòng + cta-button pill"
- narrative_role: "Chốt bằng khẩu hiệu thương hiệu A Hít Official và một hành động duy nhất"
- handoff_in: "4 thiết bị — giữ nguyên vị trí Frame 7, cùng mờ về opacity 0 trong 0.6s; mascot fade in tại (960, 430) scale 1.0 không di chuyển"

Reproduce: giữ signature move **action line reveals, accent CTA capsule
spring-pops, lockup settles**. Đây là frame duy nhất có exit thật; mọi frame
khác exit bằng transition của harness.

Scene 1 (0.0–0.6s): bốn thiết bị của Frame 07 **cùng mờ về 0** trong một beat (không stagger — chúng rời đi như một khối); mascot fade vào (960, 430) và **không di chuyển nữa cho tới hết video**. Centered.
Scene 2 (0.6–1.5s): wordmark "Sirrok Agent" settle ngay dưới mark, không chồng lên.
Scene 3 (1.5–3.0s): "Đừng chỉ đứng nhìn." reveal dòng 1 của khẩu hiệu, `text` weight 800.
Scene 4 (3.0–4.3s): "Hãy tham gia cuộc chơi." reveal dòng 2; nút pill "Tải Sirrok Agent" **spring-pop entrance** — chỗ duy nhất trong cả video được overshoot, vì nó là hành động. Fill `primary` #0E52B8, chữ `bg` = 6.9:1.
Scene 5 (4.3–5.7s): **tĩnh tuyệt đối** — breather thứ hai và là kết video. 1.4s không một pixel nào động. Low motion chính là nội dung ở đây.

## Build notes — hai chỗ đi lệch contract của frame-worker, có chủ ý

**1. Chữ trên hình là câu nói, ở Frame 03 và Frame 08.** Core contract cấm
render câu narration thành chữ, lý do nêu rõ: *"the root caption track already
shows the spoken words — repeating them double-prints"*. Ở video này **caption
bị tắt có chủ ý** (brand brief cấm phụ đề nguyên câu), nên không có caption
track nào để double-print. Frame 03 chạy blueprint `kinetic-type-beats` — chữ
LÀ chuyển động của frame; Frame 08 dùng khẩu hiệu thương hiệu nguyên văn. Cả
hai đã được duyệt ở cổng sketch. Không phải sơ suất.

**2. Registry item là tham chiếu hình dạng, không phải drop-in.** Đã cài đủ 8
item và kiểm tra `data-composition-variables` của từng cái. Bề mặt biến của
chúng không chở nổi nội dung video này (chi tiết ở từng `focal:`). Mount vào sẽ
thay nội dung đã duyệt bằng placeholder generic và phá layout đã chốt ở Locked.
Nên: **tái tạo signature move của từng item bằng tay**, giữ đúng shape. Các file
đã cài vẫn nằm trong `compositions/` làm tham chiếu cơ chế.
