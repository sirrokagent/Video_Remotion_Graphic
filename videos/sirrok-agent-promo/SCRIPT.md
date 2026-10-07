# SCRIPT — sirrok-agent-promo

**Voice:** Daniel — Steady Broadcaster (ElevenLabs, `onwK4e9ZLuTAKqWW03F9`)
**Voice settings:** model `eleven_multilingual_v2` · language `vi` · stability 0.40 · similarity 0.80 · style 0.15
**Voice direction:** Monk Mode. Thực chiến, kỷ luật, thẳng thắn — nói như người
đã làm rồi mới nói, không như người đang bán hàng. Câu ngắn, ngắt dứt khoát,
không lên giọng ở cuối. Không hype, không cảm thán.

**Trạng thái:** ĐÃ THU XONG. Tám file ở `public/audio/vo-01..08.mp3`, tổng
**42.68s** giọng. Các cửa sổ `**Time:**` dưới đây là mốc THẬT, đã đo bằng
ffprobe, không phải phỏng đoán. Mỗi dòng bắt đầu đúng tại điểm vào của frame
tương ứng; phần dư trong frame là khoảng nghỉ ở đuôi để hình kịp đáp xuống.

**Nếu sửa chữ ở bất kỳ dòng nào → phải thu lại dòng đó** rồi chạy lại bước
đồng bộ duration; đừng sửa chữ mà giữ file cũ.

---

## Line 1 — Hook (Frame 1)

**Time:** 0.00 – 3.06s · frame 0.0 – 4.6s (1.54s nghỉ đuôi để lưới sụp lại)
**Delivery:** Lạnh, nêu sự thật. Dừng rõ ở dấu ba chấm.

    Hai mươi, ba mươi người. Hoặc... một agent.

## Line 2 — Mỗi đầu việc một người (Frame 2)

**Time:** 4.60 – 11.15s · frame 4.6 – 11.5s
**Delivery:** Liệt kê dứt từng tiếng, mỗi từ một nhịp, dồn dần như đang đếm hoá đơn.

    Content. Quảng cáo. Báo cáo. Support. Mỗi đầu việc một người.

## Line 3 — Bạn không thiếu người (Frame 3)

**Time:** 11.50 – 15.49s · frame 11.5 – 16.2s (0.71s nghỉ trên khung trắng)
**Delivery:** Hạ giọng, chậm lại. Đây là câu lật. Nghỉ hẳn giữa hai câu.

    Bạn không thiếu người. Bạn thiếu một thứ biết tự làm.

## Line 4 — Sirrok Agent (Frame 4)

**Time:** 16.20 – 20.84s · frame 16.2 – 21.7s (0.86s hold trên lockup)
**Delivery:** Đọc tên thương hiệu tách riêng, chắc, rồi mới vào câu sau.

    Sirrok Agent. Một agent, gánh việc của cả ba mươi người.

## Line 5 — Bạn không gõ. Bạn nói. (Frame 5)

**Time:** 21.70 – 29.60s · frame 21.7 – 29.9s
**Delivery:** Ba động từ "nghe / chia việc / làm xong" là ba nhịp tách rời — mỗi
nhịp có một dòng tác vụ tick ✓ trên hình. Đừng đọc liền một hơi.

    Bạn không gõ. Bạn nói. Nó nghe, nó chia việc, rồi nó làm xong — và trả lại kết quả.

## Line 6 — Ngay trên Dynamic Island (Frame 6)

**Time:** 29.90 – 35.38s · frame 29.9 – 35.7s
**Delivery:** Nhẹ hơn, gần như nói riêng. Đây là chi tiết, không phải tuyên bố.

    Ngay trên Dynamic Island. Một dòng, biết việc đang chạy tới đâu.

## Line 7 — Ở đâu bạn làm việc (Frame 7)

**Time:** 35.70 – 42.02s · frame 35.7 – 42.3s
**Delivery:** Bốn tên nền tảng là bốn nhịp rời — mỗi tên một thiết bị xếp vào
hình. Câu cuối chậm lại, đóng xuống.

    MacBook. iPad. Android. iPhone. Bạn ở đâu, nó ở đó.

## Line 8 — CTA (Frame 8)

**Time:** 42.30 – 47.04s · frame 42.3 – 48.0s (0.96s hold end-card)
**Delivery:** Khẩu hiệu thương hiệu, đọc nguyên văn. Dứt khoát, không mời mọc.
Câu cuối là một lệnh, không phải một lời đề nghị.

    Sirrok Agent. Đừng chỉ đứng nhìn. Hãy tham gia cuộc chơi.

---

## Bốn dòng đã siết lại sau lần thu đầu

Lần thu đầu cho 51.26s giọng — vượt brief 45s mất 14%. Bốn dòng dài nhất được
cắt chữ (không phải tăng tốc đọc, vì tăng tốc sẽ phá nhịp Monk Mode):

| Dòng | Trước | Sau | Tiết kiệm |
|---|---|---|---|
| 1 | "Hai mươi, ba mươi người **để hệ thống của bạn chạy được**. Hoặc... một agent." | "Hai mươi, ba mươi người. Hoặc... một agent." | 4.37s |
| 2 | "…Mỗi đầu việc một người **— mỗi người một mức lương**." | "…Mỗi đầu việc một người." | 1.30s |
| 4 | "Một agent, gánh **trọn khối** việc của cả **team** ba mươi người." | "Một agent, gánh việc của cả ba mươi người." | 2.51s |
| 7 | "**Ở đâu bạn làm việc**, nó ở đó." | "**Bạn ở đâu**, nó ở đó." | 0.42s |

Mức lương ở dòng 2 không mất đi — nó chuyển thành pill trên từng thẻ vai trò
trong hình, nơi nó đọc nhanh hơn lời nói.
