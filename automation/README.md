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

---

## Chạy tự động bằng GitHub Actions

Workflow: [`.github/workflows/reel.yml`](../.github/workflows/reel.yml) — chạy 07:23 sáng thứ Hai
(giờ Việt Nam), hoặc bấm tay ở tab **Actions → Run workflow**.

### Đặt 4 secret

`Settings → Secrets and variables → Actions → New repository secret`

| Secret | Lấy ở đâu |
|---|---|
| `YOUTUBE_API_KEY` | console.cloud.google.com → bật YouTube Data API v3 → Credentials |
| `TELEGRAM_BOT_TOKEN` | nhắn `@BotFather` → `/newbot` |
| `TELEGRAM_CHAT_ID` | `/start` cho bot → mở `api.telegram.org/bot<TOKEN>/getUpdates` |
| `CLAUDE_CODE_OAUTH_TOKEN` | chạy `claude setup-token` trên máy có trình duyệt (cần gói Pro/Max) |

Thay cho `CLAUDE_CODE_OAUTH_TOKEN` có thể dùng `ANTHROPIC_API_KEY` (trả theo lượt gọi).
Token OAuth hạn **1 năm** và **không tự gia hạn** — hết hạn thì workflow hỏng cho tới khi chạy lại `setup-token`.

**Hạn mức dùng chung — đây là chỗ đã vấp thật.** Token OAuth tiêu hạn mức của gói
Pro/Max, **chung với lúc bạn ngồi làm việc**. Dùng Claude nhiều trong tuần thì tới
lượt cron chạy có thể nhận:

```
You've hit your weekly limit · resets Oct 10, 11pm (UTC)
```

Pipeline nhận ra riêng lỗi này, gọi đúng tên nó và nói rõ là **không phải lỗi code** —
đợi reset là chạy lại được. Muốn cron không phụ thuộc hạn mức gói thuê bao thì đặt
thêm secret `ANTHROPIC_API_KEY`; có cả hai thì API key được dùng trước.

### Vấn đề thật: runner của GitHub bị YouTube chặn

Runner `ubuntu-latest` dùng IP trung tâm dữ liệu. YouTube chặn rất mạnh IP loại đó
("Sign in to confirm you're not a bot"), và PO token phần lớn **không còn** vượt được
nữa. Nên **bước lấy phụ đề gần như chắc chắn hỏng trên runner hosted.**

Workflow không giấu chuyện đó. Trên runner hosted nó bật **chế độ rút gọn**:

- Bước 1 vẫn chạy bình thường — YouTube Data API dùng API key, không dính bot check.
  Pipeline lấy luôn **mô tả đầy đủ** của từng video (cùng lời gọi, không tốn thêm quota).
- Không có phụ đề thì bước 3 viết từ **tiêu đề + mô tả**, và prompt cấm suy diễn nội dung
  bên trong video mà nó không thấy.
- Tin Telegram dán nhãn `⚠ CHE DO RUT GON` ngay dòng đầu, để đọc là biết kịch bản này
  mỏng tư liệu hơn bình thường.

Kịch bản rút gọn vẫn dùng được, nhưng **yếu hơn hẳn** kịch bản viết từ phụ đề thật.

### Muốn có phụ đề thật: chạy runner trên máy mình

IP nhà dân thì YouTube không chặn. Cài self-hosted runner
(`Settings → Actions → Runners → New self-hosted runner`), rồi đặt biến repo:

`Settings → Secrets and variables → Actions → Variables → New repository variable`

| Biến | Giá trị |
|---|---|
| `RUNNER` | `self-hosted` |

Workflow tự nhận: có `RUNNER` thì nó **tắt** chế độ rút gọn, tức là không lấy được phụ đề
sẽ báo hỏng chứ không im lặng gửi bản mỏng.

Biến `CLAUDE_ARGS` (tuỳ chọn) để thêm cờ cho lệnh `claude` mà không phải sửa code.

### Những thứ workflow cố ý làm

- **Kiểm secret trước khi làm gì** — chỉ in "đã có / thiếu", không bao giờ in giá trị.
  Log Actions ai đọc được repo cũng xem được.
- **Chạy `test.mjs` trước** — hỏng logic thì dừng sớm, không tốn lượt gọi Claude.
- **Artifact chỉ chứa `reel.md` và `reel-check.json`** — không đưa `config.json` (có chat id)
  và không đưa `transcripts.json` (phụ đề của người khác) lên.
- **Hỏng thì nhắn Telegram** — cron hỏng mà im lặng thì vài tuần sau mới phát hiện.
- **`concurrency: reel`** — hai lần chạy chồng nhau sẽ ghi đè cùng thư mục `runs/`.

---

## Gửi một kịch bản có sẵn vào Telegram

Khi kịch bản đã viết xong rồi, chỉ còn thiếu mỗi bước gửi — ví dụ nó được viết ở
máy khác, hoặc bước 4 của `reel.mjs` dừng giữa chừng:

```bash
node automation/send.mjs automation/runs/<slug>/reel.md
node automation/send.mjs <file.md> --dry-run      # xem trước, không gửi
```

Chỉ cần `TELEGRAM_BOT_TOKEN` và chat id (lấy từ `telegram.chatId` trong config,
hoặc biến `TELEGRAM_CHAT_ID`). Không cần `config.json` — thiếu nó vẫn chạy được
miễn là có đủ biến môi trường.
