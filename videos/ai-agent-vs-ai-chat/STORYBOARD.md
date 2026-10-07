---
format: 1080x1920
duration: 145s
message: "AI Agent không phải AI Chat — nó làm được việc, không chỉ nói"
arc: Lật định kiến → Chỉ ra nhầm lẫn → Mở đường → 2 bài tập → Khác biệt → Đòn chốt hiệu suất
audience: "Chủ doanh nghiệp siêu nhỏ và người xây One-Person Business, đã dùng ChatGPT/Gemini nhưng chưa từng giao việc thật cho Agent"
mode: collaborative
music: dark minimal electronic pulse, restrained, no vocals, confident
---

> **Căn chỉnh thời gian.** Mốc giờ lấy từ phân tích khoảng lặng của 3 file VO +
> chia theo số từ, rồi hiệu chỉnh lại bằng transcript thật. Xem `## Notes` cuối file.

## Video direction

Một ngôn ngữ hình duy nhất: **mặt phẳng phẳng, hairline, một màu nhấn**. Không
đổ bóng, không gradient trang trí, không 3D trừ chỗ đã nêu. `power3.out` là
easing mặc định; không chỗ nào dùng `linear`.

**Màu mang nghĩa, không phải trang trí.** `#1877F2` chỉ xuất hiện ở thứ thuộc về
Agent hoặc thứ đang được khẳng định. Tiếng ồn, định kiến, phía AI Chat luôn là
`#888880`. Người xem học quy ước này ở cảnh 05 và dùng nó tới hết video.

**Phân bổ nhịp** — không để video busy đều một mạch:
- *Động mạnh*: 02 (chữ vỡ), 07 (khe hẹp lại), 12 (file bay), 14 (count-up)
- *Giữ tĩnh có chủ đích*: 05 (nửa phải trống), 10 (nhịp thở), và 4 giây cuối cảnh
  14 — khẩu hiệu đứng yên hoàn toàn trên nền đen
- *Trung tính*: còn lại

**Chống front-load.** Mỗi cảnh chỉ hiện thứ VO đang nói tại giây đó. Các cảnh dài
(08, 09, 12, 13, 14) đều có ít nhất một reveal lớn nằm ở **nửa sau** thời lượng.

**Seam.** 11 cut, 3 crossfade (03, 07, 13). Cut nội bộ trong cảnh dùng
velocity-matched cut-the-curve để không gãy nhịp.

**Chữ.** Tối đa 6 chữ một màn hình. Không phụ đề. Trường `voiceover` là lời đọc,
không phải chữ hiện lên.

---

## Frame 1 — Chào và ra đòn

- status: animated
- src: compositions/frames/01-chao-va-ra-don.html
- scene: Nền đen tuyệt đối, một dòng chữ trắng khổ lớn trồi lên từ dưới
- duration: 5.00s
- transition_in: cut
- poster: 4s
- blueprint: kinetic-type-beats (Adapt)
- focal: cụm chữ "một lời khuyên"
- roles: cụm chữ = foreground subject · hairline xanh = supporting · nền đen = background
- sfx: subtle pop blip
- voiceover: "Chào các sếp, để thực sự bước vào thế giới của AI Agent, tôi có một lời khuyên chân thành thế này:"

Adapt: giữ signature beat-slam nhưng hạ biên độ — đây là câu chào, chưa phải cú đập.

Scene 1 (0.0–1.6s): khung đen hoàn toàn, không gì cả. Im lặng thị giác trong lúc VO chào.
Scene 2 (1.6–3.4s): khi VO tới "thế giới của AI Agent", cụm **"một lời khuyên"** vào bằng per-word staggered reveal từ dưới lên qua mask, canh trái theo lề `pad-x`, chiếm ~45% chiều ngang. Centered template, 1 lớp.
Scene 3 (3.4–5.0s): khi VO tới "chân thành thế này", hairline `#1877F2` svg-path-draw từ trái sang dưới chân chữ, dài bằng đúng cụm chữ.
Scene 4 (5.0–6.17s): giữ tĩnh. Chữ và hairline đứng yên, subtle jitter biên độ rất thấp trên cụm chữ. Không push, không drift.

## Frame 2 — Quên hết đi

- status: animated
- src: compositions/frames/02-quen-het-di.html
- scene: Chữ "QUÊN HẾT" chiếm gần trọn khung rồi vỡ vụn
- duration: 6.30s
- transition_in: cut
- poster: 3s
- blueprint: kinetic-type-beats (Reproduce)
- focal: chữ "quên hết" cỡ display
- roles: "quên hết" = foreground subject · "phế bỏ võ công" = foreground subject (kế nhiệm) · nền đen = background
- sfx: deep impact hit, subtle pop blip
- voiceover: "Hãy quên toàn bộ những gì các sếp đã biết về AI đi! Đúng nghĩa là phải 'phế bỏ võ công' đấy."

Scene 1 (0.0–1.4s): **"quên hết"** kinetic beat-slam vào dead-center, cỡ `display` (13cqw, weight 900, lowercase), chiếm ~80% chiều ngang. Impact hit đánh đúng frame chữ chạm vị trí. Centered, 1 lớp.
Scene 2 (1.4–3.2s): giữ nguyên, đứng im. Để cú đập ngấm — đây là chỗ giữ người xem qua mốc rời bỏ.
Scene 3 (3.2–4.6s): khi VO tới "phế bỏ võ công", chữ tách thành từng ký tự rơi khỏi khung đáy — depth-scatter-assemble chạy ngược, stagger theo index ký tự (cố định, không random), motion-blur streak dọc theo hướng rơi.
Scene 4 (4.6–6.17s): **"phế bỏ võ công"** spring-pop entrance vào chỗ vừa trống, màu `#1877F2`, cỡ h2. Giữ tĩnh tới hết.

## Frame 3 — Nửa năm hô hào

- status: animated
- src: compositions/frames/03-nua-nam-ho-hao.html
- scene: Dòng thời gian mảnh chạy ngang, các mốc nhỏ sáng lên lần lượt
- duration: 5.15s
- transition_in: crossfade
- poster: 4s
- blueprint: spatial-pan-stations (Adapt)
- focal: trục thời gian hairline với 4 mốc
- roles: trục + mốc = foreground subject · nhãn "hơn nửa năm" = supporting · nền = background
- sfx: subtle pop blip
- voiceover: "Hơn nửa năm qua, tôi đã hô hào rất nhiều về việc phải học cách ứng dụng và làm việc với Agent."

Adapt: giữ signature pan ngang qua các station, nhưng station là mốc thời gian trừu tượng chứ không phải cột mốc sản phẩm.

Scene 1 (0.0–1.2s): trục hairline `border-dark` svg-path-draw từ trái sang, nằm ở 62% chiều cao. Asymmetric 60/40.
Scene 2 (1.2–2.6s): nhãn **"hơn nửa năm"** per-word reveal phía trên trục, canh trái.
Scene 3 (2.6–5.4s): camera pan ngang chậm sang phải; 4 mốc vuông `#1877F2` sáng lên lần lượt theo index cố định, mỗi mốc một tick. Stagger đều, không random.
Scene 4 (5.4–7.58s): pan dừng, giữ tĩnh. Mốc cuối giữ glow nhẹ. Không drift tiếp.

## Frame 4 — Những lời than phiền

- status: animated
- src: compositions/frames/04-nhung-loi-than-phien.html
- scene: Các bong bóng chữ than phiền dồn vào từ bốn phía, bóp nghẹt khung hình
- duration: 8.85s
- transition_in: cut
- poster: 5s
- blueprint: overwhelm-surround (Reproduce)
- focal: cụm 4 thẻ chữ than phiền
- roles: 4 thẻ = foreground subject · nền đen = background
- sfx: subtle pop blip
- voiceover: "Thế nhưng hàng ngày, tôi vẫn nghe không ít người xung quanh than phiền kiểu: 'Cái này Agent làm được, cái kia Agent chịu. Agent còn nhiều hạn chế lắm!'"

Scene 1 (0.0–2.2s): khung trống. VO đang ở phần dẫn "tôi vẫn nghe...", chưa có gì để hiện.
Scene 2 (2.2–3.6s): thẻ **"cái này được"** trôi vào từ cạnh trái, viền hairline, chữ `#888880`.
Scene 3 (3.6–4.8s): thẻ **"cái kia chịu"** vào từ cạnh phải, chồng lệch lên thẻ trước.
Scene 4 (4.8–6.2s): thẻ **"hạn chế lắm"** vào từ cạnh trên.
Scene 5 (6.2–7.4s): thẻ **"chưa tới đâu"** vào từ cạnh dưới. Bốn thẻ giờ chen chúc giữa khung, mật độ cao có chủ đích.
Scene 6 (7.4–8.42s): cả cụm đứng im, subtle jitter rất nhẹ trên từng thẻ lệch pha nhau — đọc ra "tiếng ồn" mà không cần thêm chuyển động lớn.

## Frame 5 — Đó chỉ là AI Chat

- status: animated
- src: compositions/frames/05-do-chi-la-ai-chat.html
- scene: Màn hình tách đôi; nửa trái dán nhãn Chat, nửa phải còn trống đen
- duration: 5.65s
- transition_in: cut
- poster: 3s
- blueprint: comparison-split (Adapt)
- focal: hairline dọc chia đôi khung
- roles: cụm thẻ + nhãn AI CHAT + logo = foreground subject (nửa trái) · hairline dọc = supporting · nửa phải trống = background
- sfx: deep impact hit, subtle pop blip
- voiceover: "Thực ra, những gì mọi người đang phán xét chỉ là AI Chat thông thường — như ChatGPT hay Gemini."

Adapt: giữ signature split nhưng **cố tình bỏ trống một vế** — đó chính là nội dung.

Scene 1 (0.0–1.3s): 4 thẻ từ cảnh 04 vẫn còn, bị hút dồn về nửa trái bằng anchored-layout-expand chạy ngược, co nhỏ lại. Impact hit khi chúng chạm vị trí.
Scene 2 (1.3–2.4s): hairline dọc `#1877F2` svg-path-draw từ trên xuống, chia khung 50/50.
Scene 3 (2.4–3.8s): nhãn `label` **"AI CHAT"** hiện phía trên cụm thẻ, kèm logo OpenAI và Gemini (trắng đơn sắc) đứng trước nhãn.
Scene 4 (3.8–5.61s): **giữ tĩnh hoàn toàn.** Nửa phải vẫn đen trống. Beat giữ tĩnh có chủ đích — khoảng trống phải được nhìn đủ lâu để thành câu hỏi.

## Frame 6 — Đừng mang định kiến sang

- status: animated
- src: compositions/frames/06-dung-mang-dinh-kien.html
- scene: Một mũi tên cố vượt từ nửa trái sang phải và bị chặn lại
- duration: 7.65s
- transition_in: cut
- poster: 5s
- blueprint: comparison-split (Adapt)
- focal: khối "AI CHAT" bị bật ngược ở hairline
- roles: khối AI CHAT = foreground subject · hairline = supporting · dòng "thứ hoàn toàn mới" = foreground subject (vế phải)
- sfx: subtle pop blip
- voiceover: "Đừng lấy trải nghiệm hay định kiến từ việc dùng AI chat cũ kỹ đó để đánh giá về Agent. Hãy coi Agent là một thứ hoàn toàn mới!"

Adapt: giữ bố cục split của cảnh 05, thêm một cú va chạm vật lý vào hairline.

Scene 1 (0.0–2.0s): nguyên trạng cảnh 05, khối trái gom thành một thẻ duy nhất **"định kiến cũ"**.
Scene 2 (2.0–3.6s): khối trượt sang phải, tới hairline thì khựng — physics-press-reaction: nén lại rồi bật ngược về chỗ cũ, overshoot nhẹ. Impact hit đúng frame va chạm.
Scene 3 (3.6–5.0s): hairline nháy sáng một nhịp rồi về `#1877F2` thường.
Scene 4 (5.0–7.0s): khi VO tới "thứ hoàn toàn mới", dòng chữ đó spring-pop entrance ở nửa phải, cỡ h2, màu xanh. Reveal lớn nằm ở nửa sau thời lượng.
Scene 5 (7.0–8.88s): giữ tĩnh cả hai vế.

## Frame 7 — Mỏng như một tờ giấy

- status: animated
- src: compositions/frames/07-mong-nhu-to-giay.html
- scene: Hai khối áp sát nhau, khe hở giữa chúng mỏng dần tới một đường chỉ
- duration: 6.70s
- transition_in: crossfade
- poster: 5s
- blueprint: kinetic-type-beats (Adapt)
- focal: khe sáng giữa hai mặt phẳng
- roles: hai mặt phẳng = foreground subject · khe sáng = focal thật sự · chữ = supporting
- sfx: subtle pop blip
- voiceover: "Để thấy Agent thực sự làm được gì, khoảng cách chỉ mỏng đúng như một tờ giấy thôi: Hãy tải về và giao việc thực tế cho nó!"

Adapt: signature beat-slam chuyển từ chữ sang hình — cú "slam" là hai mặt phẳng ép vào nhau.

Scene 1 (0.0–1.8s): hai khối chữ nhật viền hairline, cách nhau một khe rộng ~18% chiều ngang, khe sáng `#1877F2`. Centered, đối xứng.
Scene 2 (1.8–4.2s): hai khối trượt vào nhau, khe co dần. Chuyển động chậm dần theo `power3.out` — càng gần càng chậm, đọc ra "mỏng dần".
Scene 3 (4.2–5.4s): khe dừng ở đúng 1px. Chữ **"mỏng như tờ giấy"** per-word reveal bên dưới.
Scene 4 (5.4–7.2s): khi VO tới "tải về và giao việc", chữ scale-swap sang **"tải về. giao việc."**, cụm cũ co và mờ đi khi cụm mới tới.
Scene 5 (7.2–8.70s): giữ tĩnh. Khe 1px glow nhẹ, không nhấp nháy.

## Frame 8 — ChatGPT, vào Codex

- status: animated
- src: compositions/frames/08-chatgpt-codex.html
- scene: Khung cửa sổ chat tối giản; con trỏ đi lên góc trái và mở Codex
- duration: 7.90s
- transition_in: cut
- poster: 6s
- blueprint: cursor-ui-demo (Reproduce)
- focal: nút Codex ở góc trên trái cửa sổ
- roles: cửa sổ = foreground subject · con trỏ = supporting (component `oversized-cursor`) · logo OpenAI = supporting · nền = background
- sfx: UI click tick, subtle pop blip
- voiceover: "Nếu dùng ChatGPT: Mở ứng dụng lên, bấm vào góc trên bên trái cửa sổ chat, chọn tính năng Codex. Đó chính là Agent! Giao diện nhìn có vẻ giống chat, nhưng năng lực bên trong thì khác hoàn toàn."

Scene 1 (0.0–2.0s): khung cửa sổ dựng bằng hình khối hairline mở ra từ tâm, chiếm ~72% khung. Thanh tiêu đề có logo OpenAI trắng + nhãn `chatgpt`. Ruột cửa sổ còn trống.
Scene 2 (2.0–3.6s): hai dòng khối xám hiện trong ruột — gợi hình cuộc chat thường. Asymmetric, 2 lớp.
Scene 3 (3.6–5.6s): con trỏ (`oversized-cursor`) bay vào từ dưới phải, di chuyển lên góc trên trái theo nudge-curve, dừng lại.
Scene 4 (5.6–7.0s): cursor-click-ripple tại điểm bấm, tick đánh đúng frame. Nút **"Codex"** sáng lên `#1877F2`.
Scene 5 (7.0–9.0s): khi VO tới "năng lực bên trong thì khác hoàn toàn", **vỏ cửa sổ giữ nguyên tuyệt đối**, chỉ phần ruột theme-crossfade-morph sang nền xanh đậm. Reveal chính, nằm ở nửa sau.
Scene 6 (9.0–10.30s): giữ tĩnh, con trỏ mờ dần khỏi khung.

## Frame 9 — Claude, bấm nút Code

- status: animated
- src: compositions/frames/09-claude-nut-code.html
- scene: Cùng ngôn ngữ hình khối; nhãn chuyển từ Chat sang Code
- duration: 14.25s
- transition_in: cut
- poster: 7s
- blueprint: cursor-ui-demo (Reproduce)
- focal: nút Code ở góc trên trái
- roles: cửa sổ = foreground subject · con trỏ = supporting · logo Claude = supporting · nền = background
- sfx: UI click tick, subtle pop blip
- voiceover: "Nếu dùng Claude: Tải ứng dụng Claude về máy tính, cài đặt như một phần mềm bình thường. Thay vì dùng Claude Chat, hãy bấm vào nút Code ở góc trên bên trái để giao việc cho Claude Code."

Scene 1 (0.0–2.4s): **cùng khung, cùng vị trí, cùng cỡ với cảnh 08** — chỉ logo đổi thành Claude và nhãn thành `claude`. Sự lặp lại là chủ đích.
Scene 2 (2.4–4.6s): khi VO nói "tải ứng dụng về máy", một khối nhỏ trượt từ trên xuống đậu vào cửa sổ — gợi hình cài đặt. Waterfall-entry.
Scene 3 (4.6–7.0s): hai nút **"chat"** và **"code"** hiện cạnh nhau trên thanh tiêu đề, cùng cỡ, cùng xám.
Scene 4 (7.0–9.4s): con trỏ vào, nudge-curve tới nút "code", click-ripple + tick.
Scene 5 (9.4–11.8s): nút **"code"** sáng `#1877F2`, nút "chat" mờ xuống 40%. Reveal chính ở nửa sau.
Scene 6 (11.8–13.69s): giữ tĩnh, con trỏ rời khung.

## Frame 10 — Hai bài tập

- status: animated
- src: compositions/frames/10-hai-bai-tap.html
- scene: Hai ô số lớn 01 và 02 trượt vào, nằm cạnh nhau
- duration: 3.75s
- transition_in: cut
- poster: 2.5s
- blueprint: grid-card-assemble (Adapt)
- focal: cặp số 01 / 02
- roles: hai số = foreground subject · nhãn "2 bài tập" = supporting
- sfx: subtle pop blip
- voiceover: "Ngay sau khi tải về, các sếp hãy thử làm 2 bài tập nhỏ này để 'giật mình':"

Adapt: grid rút gọn còn đúng 2 ô — đủ để báo hiệu cấu trúc sắp tới.

Scene 1 (0.0–1.2s): **"01"** trượt vào từ trái, cỡ `stat-value`, màu `#888880`.
Scene 2 (1.2–2.3s): **"02"** trượt vào từ phải, màu `#1877F2`. Impact hit khi hai số dừng.
Scene 3 (2.3–4.30s): nhãn **"2 bài tập"** hiện dưới, rồi cả khung giữ tĩnh. Beat thở có chủ đích trước hai cảnh demo dài.

## Frame 11 — Bài tập 1: cờ caro

- status: animated
- src: compositions/frames/11-bai-tap-1-co-caro.html
- scene: Một câu lệnh gõ ra, rồi bàn cờ caro tự dựng lên
- duration: 11.90s
- transition_in: cut
- poster: 6s
- blueprint: prompt-type-submit-generate (Reproduce)
- focal: câu lệnh được gõ, rồi bàn cờ
- roles: ô nhập + câu lệnh = foreground subject (component `typewriter`) · lưới cờ = foreground subject (kế nhiệm) · nền = background
- sfx: UI click tick, subtle pop blip
- voiceover: "Bài tập 1: Gõ đúng một câu duy nhất: 'Hãy tạo cho tôi một phần mềm chơi cờ caro trên máy tính, bật sẵn lên để tôi chơi.' Nói xong rồi chỉ cần ngồi xem nó tự thao tác."

Scene 1 (0.0–1.4s): nhãn **"một câu duy nhất"** hiện trên, ô nhập hairline rỗng ở giữa khung.
Scene 2 (1.4–4.4s): type-on with caret — câu lệnh gõ ra từng ký tự trong ô nhập (component `typewriter`, caret deterministic), tick nhỏ theo nhịp gõ chứ không mỗi ký tự.
Scene 3 (4.4–5.2s): ô nhập press-release-spring khi submit, impact hit.
Scene 4 (5.2–7.6s): ô nhập co và mờ đi; lưới cờ caro 3×3 svg-path-draw từng đường một ở giữa khung.
Scene 5 (7.6–9.0s): quân X và O hiện lần lượt theo thứ tự cố định viết sẵn, spring-pop từng quân, stagger đều.
Scene 6 (9.0–9.71s): nhãn đổi thành **"ngồi xem"**, giữ tĩnh.

## Frame 12 — Bài tập 2: dọn thư mục

- status: animated
- src: compositions/frames/12-bai-tap-2-don-thu-muc.html
- scene: Hàng trăm ô file lộn xộn tự bay về đúng các thư mục con
- duration: 15.45s
- transition_in: cut
- poster: 9s
- blueprint: agent-progress-theater (Adapt)
- focal: đám ô file bay về 4 cụm
- roles: ~120 ô file = foreground subject · 4 nhãn đuôi file = supporting · thanh tiến trình = supporting
- sfx: soft whoosh transition, subtle pop blip
- voiceover: "Bài tập 2: Tạo một thư mục ngoài Desktop, thả vào đó vài trăm tệp tin (nhớ dùng tệp tin không quan trọng nhé). Sau đó bảo Agent: 'Vào thư mục này, phân loại và sắp xếp toàn bộ file vào các thư mục con tương ứng theo từng định dạng.' Rồi ngồi quan sát nó giải quyết!"

Adapt: giữ signature "loader + status theater resolving into a checklist", nhưng checklist là 4 cụm file thay vì danh sách tác vụ. Không block registry nào khớp — phần rải và bay là tự dựng, toạ độ viết cứng.

Scene 1 (0.0–2.6s): nhãn **"vài trăm file"** hiện trên; khung dưới còn trống.
Scene 2 (2.6–6.0s): ~120 ô vuông nhỏ hairline xuất hiện rải khắp khung theo **mảng toạ độ cố định** (viết sẵn trong file, không `Math.random()`), waterfall-entry stagger theo index. Mật độ cao, cố ý lộn xộn.
Scene 3 (6.0–7.4s): 4 nhãn `.jpg` `.pdf` `.mp4` `.docx` hiện ở 4 vị trí đáy khung — đích đến.
Scene 4 (7.4–12.8s): các ô bay về cụm của mình theo 4 đợt, mỗi đợt một whoosh. Ô đã về đúng chỗ đổi sang `#1877F2` nhạt. Thanh tiến trình chạy dưới đáy đồng bộ với số ô đã về. Reveal dài nhất, nằm trọn ở nửa sau.
Scene 5 (12.8–14.6s): ô cuối cùng về chỗ, tick, thanh tiến trình đầy.
Scene 6 (14.6–16.27s): nhãn đổi thành **"tự phân loại"**, toàn khung giữ tĩnh.

## Frame 13 — Khác biệt nằm ở đâu

- status: animated
- src: compositions/frames/13-khac-biet-nam-o-dau.html
- scene: Hai cột đối chiếu; cột Chat dừng lại, cột Agent chạy tiếp
- duration: 16.30s
- transition_in: crossfade
- poster: 10s
- blueprint: comparison-split (Reproduce)
- focal: ô thứ tư "làm xong" ở cột phải
- roles: hai cột = foreground subject · đường gạch chặn cột trái = supporting · hairline giữa = supporting
- sfx: subtle pop blip
- voiceover: "Qua 2 bài tập này, các sếp sẽ nhận ra ngay điểm khác biệt lớn nhất: AI Agent có năng lực hành động thực sự, chứ không chỉ dừng lại ở việc viết bài, làm ảnh hay lập kế hoạch sơ sài như AI Chat. Agent có thể xử lý triệt để các tác vụ đó, miễn là chúng ta biết cách giao việc đúng cách."

Scene 1 (0.0–2.0s): hairline dọc chia đôi, hai nhãn `AI CHAT` (trái, xám) và `AI AGENT` (phải, xanh) hiện.
Scene 2 (2.0–4.4s): khi VO nói "viết bài", ô **"viết bài"** hiện **đồng thời ở cả hai cột** — giống nhau hoàn toàn.
Scene 3 (4.4–6.6s): "làm ảnh" hiện ở cả hai cột.
Scene 4 (6.6–8.8s): "lập kế hoạch" hiện ở cả hai cột. Tới đây hai bên vẫn y hệt nhau — đó là điều cần người xem thấy rõ.
Scene 5 (8.8–11.4s): khi VO tới "như AI Chat", một đường gạch ngang `#888880` svg-path-draw chặn đáy cột trái. Cột trái dừng ở đây.
Scene 6 (11.4–14.4s): ô thứ tư **"làm xong"** spring-pop vào cột phải, `#1877F2`, impact hit. Reveal quyết định, nằm ở nửa sau.
Scene 7 (14.4–17.69s): cả hai cột giữ tĩnh, chênh lệch một ô đọc rõ không cần giải thích thêm.

## Frame 14 — 2026 và con số

- status: animated
- src: compositions/frames/14-2026-va-con-so.html
- scene: Số 10 đếm vọt lên 30–50, rồi tắt về khẩu hiệu trên nền đen
- duration: 21.95s
- transition_in: cut
- poster: 14s
- blueprint: dataviz-countup (Adapt)
- focal: con số đếm lên (component `count-up`)
- roles: con số = foreground subject · khối người = supporting · khẩu hiệu = foreground subject (kế nhiệm)
- sfx: subtle pop blip, deep impact hit
- voiceover: "Năm 2026 rồi, hãy ngưng tư duy theo kiểu AI cũ! Đối với các doanh nghiệp — đặc biệt là các doanh nghiệp siêu nhỏ — AI Agent chính là thứ tạo ra hiệu suất cực kỳ khủng khiếp. Nó giúp giải quyết triệt để 'điểm yếu chí mạng' về quy mô nhân sự: Một đội ngũ chỉ 10 người nhờ có Agent hoàn toàn có thể gánh khối lượng công việc của 30 đến 50 người, tạo đà tăng trưởng đột phá."

Adapt: giữ signature count-up burst nhưng bỏ phần icon văng ra — thay bằng khối người, hợp nghĩa "quy mô nhân sự".

Scene 1 (0.0–2.4s): **"2026"** kinetic beat-slam vào giữa, cỡ display, impact hit. Giữ 1 nhịp rồi co nhỏ lên góc trên trái thành nhãn.
Scene 2 (2.4–6.0s): khung trống trở lại trong lúc VO nói về doanh nghiệp siêu nhỏ. Không vẽ gì — tránh front-load.
Scene 3 (6.0–9.0s): khi VO tới "điểm yếu chí mạng về quy mô nhân sự", 10 khối người xám waterfall-entry vào nửa trái, kèm nhãn nhỏ **"10 người"**.
Scene 4 (9.0–13.0s): con số `count-up` đếm từ 10 lên 30 rồi 50 (counting-dynamic-scale — cỡ chữ lớn dần theo giá trị); khối người nhân lên tương ứng, các khối thêm vào màu `#1877F2`. Reveal chính, nằm ở nửa sau.
Scene 5 (13.0–15.4s): nhãn **"gánh việc của 30–50"** hiện dưới con số. Impact hit ở mốc 50.
Scene 6 (15.4–17.2s): toàn bộ scale-swap tắt dần, khung về đen hoàn toàn, whoosh.
Scene 7 (17.2–19.2s): **"Đừng chỉ đứng nhìn."** hiện giữa khung, trắng, cỡ h1.
Scene 8 (19.2–21.26s): **"Hãy tham gia cuộc chơi."** thế chỗ, màu `#1877F2`. Đứng yên tuyệt đối tới hết — không jitter, không gì cả.

## Frame 15 — Để lại bình luận

- status: animated
- src: compositions/frames/15-de-lai-binh-luan.html
- scene: Bong bóng bình luận hiện ra, rồi đóng bằng khẩu hiệu thương hiệu
- duration: 7.95s
- transition_in: cut
- poster: 6s
- blueprint: kinetic-type-beats (Adapt)
- focal: bong bóng bình luận
- roles: dòng chữ = foreground subject · bong bóng + ba chấm = supporting
- sfx: bubble pop ui
- voiceover: "Sáng nay, các sếp cứ thử trải nghiệm luôn đi. Có gì thú vị, hãy quay lại đây để lại bình luận cho tôi biết nhé."

Cảnh này **không có trong script người dùng gửi** — phát hiện qua transcript thật của
vo-03. Audio kết bằng lời kêu gọi để lại bình luận, nên khẩu hiệu thương hiệu dời
từ cảnh 14 xuống đây làm câu đóng.

Scene 1 (0.14–2.0s): **"thử luôn sáng nay"** vào từ dưới.
Scene 2 (2.0–3.2s): chữ tắt, bong bóng bình luận spring-pop vào giữa, đuôi bong bóng hiện sau.
Scene 3 (3.2–3.4s): ba chấm gõ dần theo nhịp cố định.
Scene 4 (3.4–5.4s): **"để lại bình luận"** hiện dưới bong bóng, màu xanh.
Scene 5 (5.4–5.9s): dọn sạch khung.
Scene 6 (5.9–7.95s): **"hãy tham gia cuộc chơi."** đóng lại, hairline xanh vẽ dưới chân. Đây là cảnh cuối nên được phép settle.

## Notes

- **Tổng 144.744s**, khớp đúng tổng 3 file VO. Không có cảnh nào không có tiếng.
- **Thẻ chữ tối đa 6 chữ**, theo brand brief. Không có phụ đề nguyên câu ở bất kỳ
  frame nào. Trường `voiceover` là *nội dung giọng đọc*, không phải chữ hiện lên.
- **Hai font**: Be Vietnam Pro (display + body) và IBM Plex Mono (chỉ cho `label`
  viết hoa). Đúng giới hạn "không quá 2 font".
- **Không `Math.random()`, không `Date.now()`** ở bất kỳ frame nào — các vị trí
  "lộn xộn" ở Frame 12 là mảng toạ độ cố định viết sẵn.
- **Component registry đã cài**: `typewriter` (Frame 11), `count-up` (Frame 14),
  `oversized-cursor` (Frame 8, 9). Tra catalog trước, không tự dựng lại.
- **SFX đã lấy về** `.media/audio/sfx/`: `sfx_001` deep impact hit, `sfx_002` soft
  whoosh transition, `sfx_003` UI click tick.
- **Logo app lấy bản chính thức, không vẽ lại** — qua
  `media-use resolve --type logo`. Đã có: OpenAI `logo_002.svg`, Claude
  `logo_005.svg`, Gemini `logo_001.svg`, Anthropic `logo_004.svg` (dự phòng).
- **Logo đổ về trắng đơn sắc** thay vì màu gốc (Gemini tím, Claude cam), để xanh
  `#1877F2` giữ riêng nghĩa "Agent".
- **BGM chưa lấy được**: cần CLI `heygen` riêng (`developers.heygen.com/cli`),
  `hyperframes auth` không đủ. SFX thì chạy offline từ thư viện bundled nên đã có.
