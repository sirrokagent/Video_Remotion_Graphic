# Dây chuyền tự động — A Hít Official

Có **hai** dây chuyền, dùng chung `lib/` và chung thư mục `runs/`:

| Lệnh | Làm gì | Dừng ở đâu |
|---|---|---|
| `node automation/reel.mjs` | Tìm video AI view cao → **lấy phụ đề thật của chúng** → viết lại thành reel 1–2 phút → **gửi vào Telegram** | kịch bản |
| `node automation/run.mjs` | Dây chuyền video đầy đủ 7 bước | video đã đăng |

Phần dưới mô tả dây chuyền video đầy đủ. Dây chuyền reel nằm ở [cuối file](#dây-chuyền-reel--gửi-telegram).

---

## Dây chuyền video đầy đủ

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

---

# Dây chuyền reel → gửi Telegram

```bash
node automation/reel.mjs --topic "AI Agent kiếm tiền"
node automation/reel.mjs                    # dùng reel.defaultTopic trong config
node automation/reel.mjs --dry-run          # chạy hết, nhưng KHÔNG gửi Telegram
node automation/reel.mjs --list             # xem các lần đã chạy
```

## Bốn bước

| # | Bước | Làm gì | Cần gì |
|---|---|---|---|
| 1 | `research` | YouTube Data API, lọc ≥10k view trong 60 ngày, quét **nhiều thị trường** (VN + US) | `YOUTUBE_API_KEY` |
| 2 | `transcript` | Tải **phụ đề thật** của các video đó bằng `yt-dlp`, gỡ mốc thời gian, khử dòng lặp | `yt-dlp` |
| 3 | `reel` | `claude -p` đọc phụ đề, rút thủ pháp, **viết kịch bản mới** 60–120 giây theo giọng brand | — |
| 4 | `telegram` | Gửi kịch bản + link các nguồn vào chat Telegram của bạn | `TELEGRAM_BOT_TOKEN` |

Kết quả nằm ở `automation/runs/<slug>/`: `research.json` → `transcripts.json` → `reel.md` → `reel-check.json`.

## Vì sao phải dùng yt-dlp

YouTube Data API **không** tải được phụ đề video của người khác — endpoint `captions.download`
đòi OAuth của chính chủ kênh. Không có cách chính thức nào khác, nên bước 2 dùng `yt-dlp`:

```bash
pip install -U yt-dlp          # hoặc: winget install yt-dlp.yt-dlp
```

Video nào không bật phụ đề thì bị bỏ qua và pipeline lấy tiếp video sau, cho đủ
`reel.transcriptCount` (mặc định 6).

## Máy dò chép nguyên văn

Bước 3 nhét **nguyên** phụ đề của người khác vào prompt. Đó là cách duy nhất để
phân tích được thủ pháp thật, nhưng nó cũng làm khả năng model buông nguyên một
câu của họ vào bản mới cao hơn hẳn so với khi chỉ đưa tiêu đề. Nên bước 3 **đo**,
chứ không tin:

Mọi cụm từ **8 từ trở lên** trùng nguyên văn với bất kỳ phụ đề nguồn nào → dừng hẳn,
ghi cụm vi phạm vào `reel-check.json`, **không gửi Telegram**. Sửa `reel.md` rồi chạy tiếp:

```bash
node automation/reel.mjs --resume <slug> --from 4
```

Hạ `reel.verbatimWindow` xuống (ví dụ 6) nếu muốn nghiêm hơn.

## Nối Telegram

1. Nhắn `@BotFather` → `/newbot` → đặt tên → nhận token.
2. Nhắn `/start` cho bot vừa tạo (**bắt buộc** — chưa `/start` thì bot không nhắn cho bạn được).
3. Mở `https://api.telegram.org/bot<TOKEN>/getUpdates`, đọc `message.chat.id`.
4. Điền `telegram.chatId` trong `automation/config.json` (chat nhóm là số âm, giữ cả dấu trừ).

```bash
setx TELEGRAM_BOT_TOKEN "<token>"
```

Chạy `--dry-run` trước để xem đúng nội dung sẽ gửi — nó chạy được cả khi chưa có token.

## Chạy định kỳ

Sáng thứ Hai có sẵn kịch bản reel trong Telegram:

```bash
schtasks /create /tn "AHit reel tuan" /sc weekly /d MON /st 07:30 ^
  /tr "node D:\Video_Remotion_Graphic\automation\reel.mjs"
```

## Tự kiểm tra

```bash
node automation/test.mjs
```

Kiểm phần logic thuần, không cần API key và không gọi mạng: đọc phụ đề WebVTT,
cắt tin nhắn Telegram, máy dò chép nguyên văn, tách phần lời đọc để đếm chữ.
