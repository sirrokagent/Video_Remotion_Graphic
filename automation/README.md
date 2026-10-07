# Dây chuyền sản xuất video — A Hít Official

Một lệnh chạy từ đầu đến cuối: tìm chủ đề → viết kịch bản → giọng đọc → dựng → render → đăng → đẩy GitHub.

```bash
node automation/run.mjs --topic "AI Agent kiếm tiền 2026"
```

Mỗi bước ghi kết quả vào `automation/runs/<slug>/`. Hỏng bước nào thì sửa rồi chạy tiếp từ đúng bước đó:

```bash
node automation/run.mjs --resume 2026-10-07-ai-agent-kiem-tien-2026 --from 4
```

---

## Bảy bước

| # | Bước | Làm gì | Cần gì |
|---|---|---|---|
| 1 | `research` | Gọi YouTube Data API, lọc video ≥10k view trong 90 ngày theo từ khóa trong config | `YOUTUBE_API_KEY` |
| 2 | `script` | Gọi `claude -p` phân tích thủ pháp rồi **viết kịch bản mới** theo giọng brand | — |
| 3 | `voice` | `manual`: chờ bạn bỏ mp3 vào `inbox/<slug>/` · `elevenlabs`: tự sinh | `ELEVENLABS_API_KEY` nếu dùng chế độ 2 |
| 4 | `build` | **Đo mốc nói thật** bằng `silencedetect`, rồi giao Claude dựng composition sao cho mỗi element bật đúng giây từ đó được đọc | — |
| 5 | `render` | `hyperframes check` (0 lỗi mới render) → MP4 → bản `faststart` vào `EXPORT/` | — |
| 6 | `publish` | Upload YouTube; nền tảng không có API thì ghi vào hàng đợi đăng tay | `YOUTUBE_OAUTH_TOKEN` |
| 7 | `push` | Commit + push GitHub | quyền push |

---

## Cài đặt

```bash
cp automation/config.example.json automation/config.json
```

Rồi mở `config.json` sửa từ khóa, độ dài video, chế độ giọng đọc, remote GitHub.

**Biến môi trường** (Windows, mở lại terminal sau khi đặt):

```bash
setx YOUTUBE_API_KEY "..."
setx ELEVENLABS_API_KEY "..."
setx YOUTUBE_OAUTH_TOKEN "..."
```

---

## Ba nguyên tắc đã cài cứng vào code

**1. Không bao giờ tự đăng.** Bước 6 không có cờ `--confirm-publish` thì chỉ chuẩn bị, không chạm vào tài khoản. Và YouTube mặc định đăng ở chế độ `private` để bạn tự duyệt rồi mới mở công khai.

```bash
node automation/run.mjs --resume <slug> --from 6 --confirm-publish
```

**2. Motion không được chạy trước giọng.** Bước 4 đo mốc nói bằng `silencedetect` **trước**, rồi mới đưa số liệu đó cho Claude dựng. Đây là lỗi đã mắc ở video đầu và đã sửa — giờ nó là ràng buộc của hệ thống chứ không phải việc phải nhớ.

**3. Thiếu khoá thì dừng hẳn, không làm bừa.** Mỗi bước thiếu điều kiện sẽ in ra đúng việc phải làm và đúng lệnh chạy tiếp, rồi thoát với mã lỗi 2.

---

## Trạng thái từng nền tảng

| Nền tảng | Được chưa | Vì sao |
|---|---|---|
| **YouTube** | được, cần OAuth | Kênh `UC63joHMT2xEyAOgNimPvuiA` đã nối với tài khoản `ahitofficial.com@gmail.com` |
| **Instagram** | chưa | Chưa có tài khoản IG nào kết nối |
| **TikTok** | không | Không có API đăng bài khả dụng ở đây |
| **Facebook** | không | Không có API đăng bài khả dụng ở đây |

TikTok và Facebook sẽ được ghi vào `EXPORT/HANG-DOI-DANG-TAY.md` kèm đường dẫn file và tiêu đề, để đăng tay hoặc nạp vào Buffer/Metricool/Publer.

---

## Chạy định kỳ

Đặt lịch Windows chạy hằng tuần:

```bash
schtasks /create /tn "AHit video tuan" /sc weekly /d MON /st 08:00 ^
  /tr "node D:\Video_Remotion_Graphic\automation\run.mjs --topic \"AI Agent\" --to 2"
```

`--to 2` nghĩa là chỉ chạy tới bước viết kịch bản rồi dừng — sáng thứ Hai có sẵn kịch bản để đọc, phần còn lại chạy khi bạn thu âm xong.
