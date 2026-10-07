# Studio video-motion-lab — A Hít Official

Project dựng video motion graphic cho thương hiệu **A Hít Official**.

## Trước khi làm bất kỳ video nào

1. Đọc [brand/brand-brief.md](brand/brand-brief.md) — brand brief, tông giọng, màu, font, điều cấm.
2. Xem [repos/](repos/) để học cách dựng cảnh trước khi viết code.

## Quy tắc bắt buộc

- Dùng skill **HyperFrames** để dựng composition.
- Mọi chuyển động phải có easing. **Không dùng `linear`.**
- Thông số khung hình: **1920×1080, 30 fps**.
- Chữ: tiêu đề **≥ 64 px**, chữ phụ **≥ 36 px**, tương phản **≥ 4.5:1**.
- Render xong: chạy `hyperframes check`, chụp khung hình, tự sửa lỗi trước khi báo xong.

## Tuyệt đối không

- **Không dùng `Math.random()` hoặc `Date.now()`** — render phải cho kết quả giống hệt nhau mỗi lần (deterministic).
- Không đặt chữ đè lên logo.
- Không dùng quá 2 font.
- Không để chữ sáng trên nền quá nhạt.
- Không quá 6 chữ trên một màn hình.
- Không dùng ảnh stock không liên quan.

## Nhận dạng thương hiệu (tóm tắt)

| | |
|---|---|
| Màu | Đen `#000000` · Xanh thương hiệu `#1877F2` · Trắng `#FFFFFF` |
| Font | Be Vietnam Pro — tiêu đề ExtraBold, chữ thường Medium |
| Tông giọng | Thực chiến, kỷ luật, tự tin, thẳng thắn (Monk Mode) |
| Khẩu hiệu | "Đừng chỉ đứng nhìn. Hãy tham gia cuộc chơi." |

Chi tiết đầy đủ nằm ở [brand/brand-brief.md](brand/brand-brief.md) — khi có mâu thuẫn, file đó là nguồn đúng.

## Môi trường

- `hyperframes` CLI **0.8.117** đã cài global tại `D:\npm-global` (khớp version plugin `hyperframes@hyperframes`).
- ffmpeg/ffprobe **9.0.2** tại `C:\Users\Admin\AppData\Local\Programs\ffmpeg\bin`.
- Node **v24.18.0**, npm prefix `D:\npm-global`, cache `D:\npm-cache`.
- Thư mục tạm và frames cache nằm ở `D:\Temp`.
- Project **chưa có `package.json`** — không dùng lệnh `npm run ...`, hãy gọi thẳng `hyperframes <lệnh>`.
- Máy chỉ có ~8 GB RAM và 4 core; render nặng dễ thất bại. Ưu tiên composition gọn, kiểm tra bằng `hyperframes check` trước khi render full.

## Tham khảo trong `repos/`

| Repo | Dùng để tham khảo |
|---|---|
| `hyperframes` | Source đầy đủ của framework đang dùng |
| `claude-animation-skill` | Animation vẽ tay bằng node canvas + ffmpeg |
| `ClaudeAnimationBase` | Starter kit animate nhân vật bằng p5.js |
| `PDoomVideo` | Music video hoàn chỉnh dựng bằng code |
| `Battle-of-Austerlitz-Film` | Phim 5 phút render bằng WebGL |
| `awesome-ai-motion`, `awesome-opus-5-5-videos` | Thư viện ý tưởng và prompt |
