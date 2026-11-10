"""
Cắt các file giọng thành từng câu và đo thứ cần cho hình (bản cho phim 90 giây):
mốc bắt đầu từng chữ + năng lượng 28 dải tần mỗi frame → src/voice.json,
từng câu → public/voice/<id>.mp3.

  python3 scripts/analyze_lines.py <thư mục chứa narr.mp3 agent.mp3 client.mp3>

Ranh giới câu (frame @30fps trong file gốc) đo bằng năng lượng rồi khớp tay với
kịch bản — ghi ở LINES bên dưới. Mốc từng chữ đo tự động (analyze_voice.onsets).
Không có gì ngẫu nhiên — chạy lại ra y hệt.
"""
import json, os, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from analyze_voice import FPS, HOP, SR, bands, decode, onsets  # noqa: E402

# số âm tiết của các chữ không phải tiếng Việt; chữ tiếng Việt = 1
SYL = {"sirrok": 2, "iphone": 2, "android": 3, "email": 2, "agent": 2}

# id: (file, frame đầu, frame cuối, câu)
LINES = {
    # giọng dẫn chuyện — Brian (trầm, vang)
    "n1": ("narr", 1, 67, "Mỗi ngày, có hàng trăm việc đang chờ bạn."),
    "n2": ("narr", 81, 136, "Giờ thì… chỉ cần nói một câu."),
    "hey": ("narr", 154, 179, "Hey Sirrok."),
    "command": ("narr", 203, 233, "Gửi báo giá cho khách."),
    "n3": ("narr", 256, 365, "Sirrok tự mở thư, tự lập báo giá, và gửi đi."),
    "n4": ("narr", 383, 468, "Rồi tự gọi cho khách hàng… và chốt luôn lịch hẹn."),
    "n5": ("narr", 485, 633, "Mọi tiến độ, hiện ngay trên màn hình của bạn. Mac. iPhone. Android."),
    "n6": ("narr", 647, 740, "Nó viết bài, dựng hình, và đăng lên mọi nền tảng."),
    "n7": ("narr", 756, 816, "Kết nối với mọi công cụ bạn đang dùng."),
    "n8": ("narr", 827, 872, "Ở mọi nơi. Mọi lúc."),
    "n9": ("narr", 891, 979, "Sirrok Agent. Bạn ra lệnh. Nó làm."),
    # cuộc gọi — agent (Sarah) và khách (Eric)
    "a1": ("agent", 1, 145, "Chào anh Minh, em là Sirrok, trợ lý của anh Tuấn. Báo giá vừa gửi qua email cho anh ạ."),
    "a2": ("agent", 177, 276, "Dạ vâng. Em đặt lịch ký hợp đồng lúc chín giờ sáng mai anh nhé."),
    "a3": ("agent", 301, 393, "Em đã gửi lời mời vào lịch của anh. Chúc anh một ngày tốt lành."),
    "c1": ("client", 2, 98, "À, anh nhận được rồi. Giá vậy là ổn đấy em."),
    "c2": ("client", 126, 176, "Được. Chín giờ nhé."),
}


def syl(word):
    return SYL.get("".join(ch for ch in word.lower() if ch.isalnum()), 1)


def main(src_dir):
    os.makedirs("public/voice", exist_ok=True)
    cache, meta = {}, {}
    for lid, (name, a, b, text) in LINES.items():
        path = os.path.join(src_dir, f"{name}.mp3")
        if name not in cache:
            cache[name] = decode(path)
        x = cache[name]
        pad = 3
        s0, s1 = max(0, (a - pad) * HOP), min(len(x), (b + pad) * HOP)
        clip = x[s0:s1]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s0 / SR:.4f}", "-t", f"{(s1 - s0) / SR:.4f}", "-i", path,
                        "-af", "afade=t=in:d=0.02,areverse,afade=t=in:d=0.05,areverse", "-b:a", "192k", f"public/voice/{lid}.mp3"], check=True)
        words = text.split()
        counts = [syl(w) for w in words]
        on = onsets(clip, sum(counts))
        idx, out = 0, []
        for w, c in zip(words, counts):
            out.append({"text": w, "at": on[idx]}); idx += c
        meta[lid] = {"durFrames": round(len(clip) / HOP, 1), "words": out, "bands": bands(clip)}
        print(f"{lid:8s} {meta[lid]['durFrames']:6.1f}f  " + " ".join(f"{w['text']}@{w['at']}" for w in out))
    json.dump(meta, open("src/voice.json", "w"), ensure_ascii=False)


if __name__ == "__main__":
    main(sys.argv[1])
