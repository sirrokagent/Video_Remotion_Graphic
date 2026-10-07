# Nhạc nền — `track.mp3` (KHÔNG nằm trong repo)

`index.html` tham chiếu `assets/bgm/track.mp3`, nhưng file mp3 bị `.gitignore`
loại ra (xem `.gitignore` → `videos/*/assets/bgm/*`). Chỉ có file README này
được theo dõi, để một bản clone sạch biết mình đang thiếu gì.

**Hệ quả:** clone mới mà chạy `hyperframes check` sẽ dừng ngay ở lint với lỗi
`audio_src_not_found`, và vì lint fail nên toàn bộ vòng kiểm tra bằng trình
duyệt (layout / motion / contrast) **không chạy**. Phải đặt file nhạc vào đây
trước rồi mới check hoặc render được.

## Thông số bản nhạc đang dùng

Lấy từ `audio_meta.json` / `audio_engine_meta.json`:

| | |
|---|---|
| Đường dẫn | `assets/bgm/track.mp3` |
| Nguồn | thư viện nhạc HeyGen, qua audio engine của HyperFrames (`bgm_provider: heygen`, `bgm_mode: retrieve`) |
| Câu truy vấn | `restrained minimal electronic underscore, low tension build, modern tech, no vocals, steady pulse` |
| Độ dài gốc | 80 s (composition dùng 48 s đầu) |
| Âm lượng | `0.9` (đặt ở `data-volume` của `#el-bgm` trong `index.html`) |

## Khôi phục

1. **Có sẵn bản cũ** (máy dựng, ổ backup, dự án nguồn) → chép vào đúng
   `assets/bgm/track.mp3`. Đây là cách giữ bản render giống hệt lần trước.
2. **Không còn bản cũ** → lấy lại từ thư viện HeyGen bằng đúng câu truy vấn ở
   bảng trên, rồi lưu vào `assets/bgm/track.mp3`. Nhạc mới sẽ khác bản cũ, nghe
   lại toàn bài trước khi render chính thức.

Sau khi đặt file xong:

```bash
npx hyperframes@0.8.117 check
```

Phải ra `Check passed` rồi mới render.

## Nếu muốn nhạc nằm luôn trong repo

Bỏ dòng `videos/*/assets/bgm/*` trong `.gitignore` ở thư mục gốc rồi commit file
mp3. Lúc đó repo tự chứa đủ mọi thứ để render, đổi lại kho nặng thêm và phải tự
chịu trách nhiệm về bản quyền bản nhạc. Đây là quyết định của chủ dự án, không
phải mặc định.
