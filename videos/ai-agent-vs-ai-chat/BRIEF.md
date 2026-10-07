---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "AI Agent không phải AI Chat — nó làm được việc, không chỉ nói"
destination: youtube
aspect: 1920x1080
language: vi
audience: "Chủ doanh nghiệp siêu nhỏ và người xây One-Person Business, đã dùng ChatGPT/Gemini nhưng chưa từng giao việc thật cho Agent"
length: 145s
angle: concept
---

## Intent

Video đầu tiên của kênh **A Hít Official**. Lật lại một định kiến phổ biến: người
ta chê "Agent còn hạn chế lắm" trong khi thứ họ thực sự đang dùng chỉ là AI Chat.
Video chứng minh khoảng cách giữa hai thứ đó "mỏng đúng như một tờ giấy" — chỉ
cần tải về và giao một việc thật.

Tông giọng theo brand brief: thực chiến, kỷ luật, thẳng thắn — tư duy Monk Mode,
nhập vai phong cách Iman Gadzhi. Không hoa mỹ, không giải thích lý thuyết dài
dòng; nói thẳng và đưa bài tập làm được ngay.

Cấu trúc tự nhiên của script: **lật định kiến** (Agent ≠ AI Chat) → **chỉ đường
cụ thể** (Codex trong ChatGPT, nút Code trong Claude) → **2 bài tập để tự giật
mình** → **đòn chốt về hiệu suất doanh nghiệp** (10 người gánh việc của 30–50).

## Assets

- public/audio/vo-01.mp3 — voiceover phần 1, 50.928s, ElevenLabs, dùng NGUYÊN VĂN
- public/audio/vo-02.mp3 — voiceover phần 2, 47.616s, ElevenLabs, dùng NGUYÊN VĂN
- public/audio/vo-03.mp3 — voiceover phần 3, 46.200s, ElevenLabs, dùng NGUYÊN VĂN

Tổng 144.744s. Ba file ghép nối tiếp tại 0s / 50.928s / 98.544s.

- .media/images/logo_002.svg — logo OpenAI (ChatGPT), dùng ở Frame 5 và 8
- .media/images/logo_005.svg — logo Claude, dùng ở Frame 9
- .media/images/logo_001.svg — logo Google Gemini, dùng ở Frame 5
- .media/images/logo_004.svg — logo Anthropic, dự phòng

Tất cả là bản chính thức lấy qua `media-use resolve --type logo`, không vẽ lại.

## Customizations

- **VO_MODE: verbatim.** Giọng đã thu sẵn, không tạo lại, không đổi câu chữ.
- **Nhạc nền** — người dùng yêu cầu rõ. Nguồn chưa chốt (xem Notes).
- **Sound effect** — người dùng yêu cầu rõ, đánh vào các điểm nhấn và chuyển cảnh.
- **Element đồ hoạ** — người dùng yêu cầu rõ; faceless nên mọi hình đều tự dựng:
  typography động, sơ đồ so sánh Chat vs Agent, mô phỏng thao tác UI, số liệu 10
  → 30–50 người.

## Notes

- **Chữ trên màn hình là thẻ từ khoá ngắn, KHÔNG phải phụ đề nguyên câu.** Brand
  brief cấm quá 6 chữ trên một màn hình.
- **Ranh giới câu lấy từ phân tích khoảng lặng**, không phải transcribe. Các mốc
  chuyển đoạn dài (>0.85s): vo-01 @22.80s · vo-02 @1.80s, @28.89s · vo-03 @20.65s.
  Tổng 25 khối câu. Dùng làm điểm cắt cảnh.
- **Script gốc có một đoạn bị lặp y hệt** ở cuối ("Năm 2026 rồi... tăng trưởng đột
  phá", xuất hiện 2 lần). Đã bỏ bản lặp — 516 từ còn lại khớp 144.744s ở mức
  ~3.6 từ/giây.
- **Chưa đăng nhập HeyGen** → không lấy được BGM/SFX từ catalog. MusicGen và
  Kokoro local đều thiếu deps. Giọng không ảnh hưởng (đã có VO), nhưng **nhạc và
  SFX đang là blocker chưa giải quyết** — chốt ở Step 3.1.
- Ràng buộc cứng từ CLAUDE.md: 1920×1080 @ 30fps · tiêu đề ≥64px, chữ phụ ≥36px,
  tương phản ≥4.5:1 · easing luôn có, cấm `linear` · cấm `Math.random()` và
  `Date.now()` · không đè chữ lên logo · tối đa 2 font.
- Màu brand: đen `#000000`, xanh `#1877F2`, trắng `#FFFFFF`. Font: Be Vietnam Pro
  (tiêu đề ExtraBold, thường Medium).
- Khẩu hiệu đóng video: "Đừng chỉ đứng nhìn. Hãy tham gia cuộc chơi."
