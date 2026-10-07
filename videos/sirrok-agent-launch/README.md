# Sirrok Agent — phim ra mắt

41 giây · 1920×1080 · 30 fps · Remotion làm nền chính, một lớp dựng bằng HyperFrames.

```bash
npm i
REMOTION_CHROME=/duong/dan/toi/chrome npx remotion render SirrokLaunch out/sirrok-agent-launch.mp4 --codec=h264 --crf=17
npm run dev            # Remotion Studio, xem/chỉnh từng cảnh
```

`REMOTION_CHROME` chỉ cần khi máy không tải được Chrome Headless Shell của Remotion
(mạng chặn `remotion.media`). Bình thường bỏ qua.

## Ý tưởng

Logo ghost có **hai nét mắt song song nhìn lên phía trước**. Hai nét đó là ngôn ngữ
chuyển động của cả phim:

| Vai trò | Ở đâu |
|---|---|
| Thức dậy | Cảnh mở: chỉ có hai nét mắt trên nền trắng, mở ra, chớp, "Hey Sirrok." |
| Dấu nháy | Mắt bay vào ô nhập và **trở thành** dấu nháy khi người dùng gõ việc |
| Con trỏ | Agent đi qua hộp thư → bảng tính → PDF → soạn thư, để lại **hai vệt song song** |
| Chỉ báo đang gõ | Trên điện thoại, "…" thay bằng cặp mắt nhún nhảy |
| Chuyển cảnh | Hai nét mắt phóng to thành hai vệt quét ngang, nghiêng đúng góc mắt |
| Nhịp | Mỗi cú "bấm" của agent là một cái chớp mắt — nhắm 3 frame, mở 5 frame |
| Hội tụ | Mọi vệt thu về tâm → thân ghost **nở ra từ giữa hai mắt** → lockup |

Câu chuyện là một việc cụ thể: *"Gửi báo giá cho khách"* — giao trên desktop, agent tự
làm xuyên bốn ứng dụng, kết quả về điện thoại, rồi mở rộng ra mọi nơi, mọi lúc.

## Cảnh

| # | Cảnh | Frame | File |
|---|---|---|---|
| 1 | "Hey Sirrok" — ra lệnh bằng giọng nói | 0–270 | `src/scenes/S1Wake.tsx` |
| 2 | Agent tự làm | 250–610 | `src/scenes/S2Work.tsx` |
| 3 | Kết quả về tận tay | 590–810 | `src/scenes/S3Phone.tsx` |
| 4 | Ở mọi nơi. Mọi lúc. | 790–1000 | `src/scenes/S4Everywhere.tsx` |
| 5 | Hé lộ logo | 1000–1240 | `src/scenes/S5Reveal.tsx` |

Các cảnh chồng 20 frame ở chỗ chuyển. Mọi mốc nằm ở `src/theme.ts` (`T`, `START`) —
âm thanh và nhạc đều tính từ đó, đổi thời lượng cảnh thì sửa ở một chỗ.

## Logo

`src/logo.json` là logo **vẽ lại thành SVG từ ảnh gốc**, không phải ảnh nhúng:
thân lấy viền theo từng hàng pixel rồi nối bằng spline; hai mắt đo bằng PCA trên vùng
trắng bên trong thân. Khớp **99,35% (IoU)** với ảnh 1536×1536 gốc.

Hai mắt **không đối xứng** — mắt trái to hơn mắt phải (10.35 vs 8.83), đúng như bản gốc
vì logo có phối cảnh. Đừng "sửa" cho đều.

Lockup (ghost + "Sirrok" + sao ✦) đo tỉ lệ từ ảnh lockup: khoảng cách, chiều cao chữ,
cỡ sao và độ eo của sao đều lấy từ pixel.

File dùng riêng ngoài video: `brand/sirrok-ghost.svg`, `brand/sirrok-sparkle.svg`.

## Màu — đo từ ảnh, không ước lượng

| | | lấy từ |
|---|---|---|
| Nền | `#FDFDFD` | ảnh hero / lockup |
| Ghost | `#000000` | logo |
| Nút gửi | `#0B57D0` | ảnh desktop |
| Pill "Beta" | `#005EFB` | ảnh hero |
| Sao ✦ | `#236EEE` | ảnh lockup |
| Nền khung phone / bàn làm việc | `#F1F0F5` | ảnh mobile |

Mọi cặp chữ/nền ≥ 4.5:1 (đo bằng công thức WCAG, thấp nhất 5.26:1 — chữ trắng trên pill Beta).

## UI dựng lại bằng code

`src/ui.tsx` dựng lại giao diện desktop và mobile theo ảnh, **không dùng ảnh chụp
màn hình** — chữ luôn sắc và sửa được. Bố cục, màu, chữ giữ đúng ảnh; riêng **cỡ chữ
phóng lên** cho đọc được trên video (chữ sidebar trong ảnh gốc ~15 px).

Trên điện thoại bỏ icon mic và mũi tên ở ô nhập để placeholder "Hỏi Sirrok Agent" hiện
trọn — ở cỡ chữ video, giữ đủ thì placeholder bị cắt còn "Hỏi S…".

## HyperFrames

Lớp nền cảnh 4 — một trường đều các cặp mắt chớp theo sóng lan từ tâm — dựng bằng
HyperFrames ở `hyperframes-eye-field/`, render ra `public/hyperframes/eye-field.mp4`,
rồi Remotion đặt làm lớp dưới cùng.

```bash
cd hyperframes-eye-field
npx hyperframes@0.8.117 check          # 0 lỗi lint / runtime / layout / motion
npx hyperframes@0.8.117 render -o ../public/hyperframes/eye-field.mp4 -f 30 -q high
```

Hiệu ứng âm thanh (`public/sfx/`) lấy từ thư viện của dự án HyperFrames
`videos/sirrok-agent-promo`.

## Âm thanh

- **Giọng nói** `public/voice/hey.mp3`, `public/voice/command.mp3` — "Hey Sirrok." và
  "Gửi báo giá cho khách.", đọc bằng giọng clone *AhitOfficial VN* (vidIQ / ElevenLabs).
  `scripts/analyze_voice.py <file giọng>` tách hai câu, đo mốc bắt đầu từng âm tiết và
  năng lượng 28 dải tần mỗi frame → `src/voice.json`. Sóng âm (`VoiceWave`) và chữ hiện
  từng từ, mờ → nét (`BlurWords`) trong `src/voice.tsx` chạy theo đúng số đo đó.
  Nhạc nền tự hạ khi có giọng (ducking trong `src/SirrokLaunch.tsx`).
- **Nhạc nền** `public/music/bed.mp3` — tổng hợp bằng `scripts/make_music.py` (numpy,
  seed cố định, chạy lại ra y hệt). 100 BPM, cú hit trầm đúng frame thân ghost nở, chuông
  đúng frame sao bật.
- **SFX** đặt theo mốc tuyệt đối trong `src/SirrokLaunch.tsx`.
- Bản xuất được chuẩn hoá −16 LUFS, đỉnh −1.5 dBTP (ffmpeg loudnorm hai lượt).

## Kiểm tra

```bash
npx tsc --noEmit && npx eslint src
node scripts/stills.mjs SirrokLaunch out/check 45,300,700,900,1100,1180   # chụp khung để soát
```

## Lệch so với brief, có chủ đích

Brief nhắc *nền trắng ngà, headline serif, teal đậm, mint trên nền navy, wordmark chữ
thường "sirrok agent", lockup trên nền navy*. Ảnh đính kèm thì là: nền trắng, ghost đen,
xanh dương, chữ sans, wordmark "Sirrok" viết hoa chữ đầu, lockup trên nền trắng. Brief
cũng dặn **"giữ đúng UI và logo trong ảnh, lấy màu chính xác từ ảnh"** — nên phim theo
**ảnh**. Brief còn gọi sản phẩm là "nash" ở một chỗ; mọi ảnh đều là Sirrok Agent nên phim
dùng Sirrok Agent.
