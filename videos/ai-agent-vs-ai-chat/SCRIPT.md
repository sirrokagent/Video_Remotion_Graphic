# SCRIPT — AI Agent không phải AI Chat

**VO_MODE: verbatim.** Giọng đọc đã thu sẵn bằng ElevenLabs và dùng nguyên văn.
Không chạy TTS, không tạo lại giọng.

> **Quan trọng:** nội dung dưới đây là **lời thoại THẬT**, lấy bằng
> `speech_to_text` trên chính 3 file audio — không phải script người dùng dán ban
> đầu. Hai bản khác nhau ở vài chỗ, và bản thật có thêm đoạn kết kêu gọi bình
> luận mà script không có. Bản gốc người dùng gửi vẫn giữ ở
> `capture/extracted/visible-text.txt`; transcript thật ở
> `capture/extracted/transcript-vo-0*.txt`.

## Nguồn âm thanh

| File | Bắt đầu | Kết thúc | Thời lượng |
|---|---|---|---|
| `public/audio/vo-01.mp3` | 0.000s | 50.928s | 50.928s |
| `public/audio/vo-02.mp3` | 50.928s | 98.544s | 47.616s |
| `public/audio/vo-03.mp3` | 98.544s | 144.744s | 46.200s |

## Căn chỉnh

42 đoạn nói được dò bằng `silencedetect` ở ngưỡng −34 dB / 0,16s, rồi phân bổ số
từ của transcript theo thời lượng từng đoạn. Đây là nguồn mốc thời gian cho 15
cảnh — thay cho cách ước lượng theo số từ ở bản đầu, vốn làm hình chạy chậm hơn
tiếng 6–8 giây ở nửa sau.

## Lời đã khoá, theo cảnh

| Cảnh | Thời gian | Lời thoại |
|---|---|---|
| 01 | 0.00–5.00 | Chào các sếp. Để thực sự bước vào thế giới của AI Agent, tôi có một lời khuyên chân thành thế này: |
| 02 | 5.00–11.30 | Hãy quên toàn bộ những gì các sếp đã biết về AI đi. Đúng nghĩa là phải phế bỏ võ công đấy. |
| 03 | 11.30–16.45 | Hơn nửa năm qua, tôi đã hô hào rất nhiều về việc phải học cách ứng dụng và làm việc với Agent. |
| 04 | 16.45–25.30 | Thế nhưng hàng ngày tôi vẫn nghe không ít người xung quanh than phiền kiểu cái này Agent làm được, cái kia Agent chịu. Agent còn nhiều hạn chế lắm. |
| 05 | 25.30–30.95 | Thực ra những gì mọi người đang phán xét chỉ là AI chat thông thường như ChatGPT hay Gemini. |
| 06 | 30.95–38.60 | Đừng lấy trải nghiệm hay định kiến từ việc dùng AI chat cũ kỹ đó để đánh giá về Agent. Hãy coi Agent là một thứ hoàn toàn mới |
| 07 | 38.60–45.30 | để thấy Agent thực sự làm được gì. Khoảng cách chỉ mỏng đúng như một tờ giấy thôi. Hãy tải về và giao việc thực tế cho nó. |
| 08 | 45.30–53.20 | Nếu dùng ChatGPT, mở ứng dụng lên, bấm vào góc trên bên trái cửa sổ chat, chọn tính năng Codex. Đó chính là Agent. |
| 09 | 53.20–67.45 | Giao diện nhìn có vẻ giống chat nhưng năng lực bên trong thì khác hoàn toàn. Nếu dùng Claude, tải ứng dụng Claude về máy tính, cài đặt như một phần mềm bình thường. Thay vì dùng Claude Chat, hãy bấm vào nút Code ở góc trên bên trái để giao việc cho Claude Code. Ngay sau khi tải về, |
| 10 | 67.45–71.20 | các sếp hãy thử làm hai bài tập nhỏ này để biết nó lợi hại và sẽ làm cho bạn phải giật mình. |
| 11 | 71.20–83.10 | Bài tập một: Gõ đúng một câu duy nhất: "Hãy tạo cho tôi một phần mềm chơi cờ caro trên máy tính, bật sẵn lên để tôi chơi". Nói xong rồi chỉ cần ngồi xem nó tự thao tác. |
| 12 | 83.10–98.55 | Bài tập hai: Tạo một thư mục ngoài desktop, thả vào đó vài trăm tệp tin. Nhớ dùng tệp tin không quan trọng nhé. Sau đó bảo Agent: "Vào thư mục này, phân loại và sắp xếp toàn bộ file vào các thư mục con tương ứng theo từng định dạng". Rồi ngồi quan sát nó giải quyết. |
| 13 | 98.55–114.85 | Qua hai bài tập này, các sếp sẽ nhận ra ngay điểm khác biệt lớn nhất. AI Agent có năng lực hành động thực sự chứ không chỉ dừng lại ở việc viết bài, làm ảnh hay lập kế hoạch sơ sài như AI Chat. Agent có thể xử lý triệt để các tác vụ đó, miễn là chúng ta biết cách giao việc đúng cách. |
| 14 | 114.85–136.80 | Năm 2026 rồi, hãy ngưng tư duy theo kiểu AI cũ. Đối với các doanh nghiệp, đặc biệt là các doanh nghiệp siêu nhỏ, AI Agent chính là thứ tạo ra hiệu suất cực kỳ khủng khiếp. Nó giúp giải quyết triệt để điểm yếu chí mạng về quy mô nhân sự. Một đội ngũ chỉ mười người nhờ có agent hoàn toàn có thể gánh khối lượng công việc của ba mươi đến năm mươi người, tạo đà tăng trưởng đột phá. |
| 15 | 136.80–144.75 | Sáng nay, các sếp cứ thử trải nghiệm luôn đi. Có gì thú vị, hãy quay lại đây để lại bình luận cho tôi biết nhé. |

## Khác biệt so với script người dùng gửi

1. **Đoạn kết hoàn toàn khác.** Audio thật kết bằng lời kêu gọi để lại bình luận;
   script không có câu nào như vậy. Đã dựng **cảnh 15** riêng cho đoạn này, và
   dời khẩu hiệu thương hiệu từ cảnh 14 xuống làm câu đóng của cảnh 15.
2. **Đoạn lặp ở cuối script không có trong audio** — xác nhận bằng transcript.
3. Vài câu chữ khác nhỏ, ví dụ *"để biết nó lợi hại và sẽ làm cho bạn phải giật
   mình"* (audio) so với *"để giật mình"* (script).
