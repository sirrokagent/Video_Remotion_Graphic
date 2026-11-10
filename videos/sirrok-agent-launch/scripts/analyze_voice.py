"""
Tách giọng đọc thành hai câu, rồi đo thứ cần cho hình:

  - mốc bắt đầu từng âm tiết (tiếng Việt: một âm tiết = một chữ) → chữ hiện ra
    đúng lúc được đọc, không đoán theo tốc độ trung bình
  - năng lượng theo dải tần từng frame → sóng âm trên màn hình chạy theo giọng thật

  python3 scripts/analyze_voice.py <voice.mp3>

Ghi ra public/voice/hey.mp3, public/voice/command.mp3 và src/voice.json.
Không dùng gì ngẫu nhiên — chạy lại ra y hệt.
"""
import json, subprocess, sys
import numpy as np

SR = 48000
FPS = 30
HOP = SR // FPS
BANDS = 28
WORDS = {"hey": ["Hey", "Sirrok."], "command": ["Gửi", "báo", "giá", "cho", "khách."]}
# số âm tiết của từng chữ — "Sirrok" có hai âm tiết, chữ tiếng Việt có một
SYLL = {"hey": [1, 2], "command": [1, 1, 1, 1, 1]}


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def frame_rms(x):
    n = len(x) // HOP
    return np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)


def speech_regions(x):
    """Các đoạn có tiếng, tính theo frame 30fps."""
    r = frame_rms(x)
    on = r > max(r.max() * 0.06, 1e-4)
    regs, start = [], None
    for i, v in enumerate(on):
        if v and start is None: start = i
        if not v and start is not None:
            regs.append([start, i]); start = None
    if start is not None: regs.append([start, len(on)])
    # gộp các đoạn cách nhau < 8 frame (khoảng nghỉ giữa các chữ trong cùng câu)
    merged = []
    for a, b in regs:
        if merged and a - merged[-1][1] < 8: merged[-1][1] = b
        else: merged.append([a, b])
    return [m for m in merged if m[1] - m[0] >= 4]


def onsets(x, want):
    """Mốc bắt đầu âm tiết: các đỉnh của độ tăng năng lượng, lấy đủ `want` cái mạnh nhất."""
    sub = SR // 200  # 5ms
    n = len(x) // sub
    e = np.sqrt((x[: n * sub].reshape(n, sub) ** 2).mean(1))
    k = np.hanning(9); k /= k.sum()
    e = np.convolve(e, k, mode="same")
    d = np.diff(e, prepend=e[0]).clip(min=0)
    cand = [i for i in range(1, len(d) - 1) if d[i] >= d[i - 1] and d[i] > d[i + 1] and d[i] > d.max() * 0.08]
    cand.sort(key=lambda i: -d[i])
    picked = []
    for i in cand:  # cách nhau ít nhất 90ms
        if all(abs(i - p) * 5 >= 90 for p in picked): picked.append(i)
        if len(picked) == want: break
    picked.sort()
    if len(picked) < want:  # không đủ đỉnh rõ → chia đều trên đoạn có tiếng
        span = np.where(e > e.max() * 0.08)[0]
        picked = list(np.linspace(span[0], span[-1], want + 1)[:-1].astype(int))
    return [round(p * 5 / 1000 * FPS, 1) for p in picked]


def bands(x):
    n = len(x) // HOP
    edges = np.geomspace(90, 6000, BANDS + 1)
    win = np.hanning(2048)
    freqs = np.fft.rfftfreq(2048, 1 / SR)
    out = []
    for i in range(n):
        c = i * HOP + HOP // 2
        seg = x[max(0, c - 1024): c + 1024]
        seg = np.pad(seg, (0, 2048 - len(seg)))
        mag = np.abs(np.fft.rfft(seg * win))
        row = []
        for b in range(BANDS):
            sel = (freqs >= edges[b]) & (freqs < edges[b + 1])
            # dải hẹp ở tần thấp có thể không chứa bin FFT nào — lấy bin gần tâm dải nhất
            row.append(float(mag[sel].mean()) if sel.any() else float(mag[np.argmin(abs(freqs - np.sqrt(edges[b] * edges[b + 1])))]))
        out.append(row)
    a = np.array(out)
    a = np.log1p(a / (a.max() + 1e-9) * 60) / np.log1p(60)  # nén động — nhìn giống mắt người nghe hơn
    return np.round(a, 3).tolist()


def main(src):
    x = decode(src)
    regs = speech_regions(x)
    print("doan co tieng (frame):", regs)
    if len(regs) < 2:
        sys.exit("Khong tach duoc hai cau — can khoang nghi ro giua 'Hey Sirrok' va cau lenh.")
    parts = {"hey": regs[0], "command": [regs[1][0], regs[-1][1]]}
    meta = {}
    for name, (a, b) in parts.items():
        pad = 3  # 0.1s đệm hai đầu
        s0, s1 = max(0, (a - pad) * HOP), min(len(x), (b + pad) * HOP)
        clip = x[s0:s1]
        out = f"public/voice/{name}.mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s0 / SR:.4f}", "-t", f"{(s1 - s0) / SR:.4f}", "-i", src,
                        "-af", "afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse", "-b:a", "192k", out], check=True)
        syl = onsets(clip, sum(SYLL[name]))
        # mốc của từng CHỮ = mốc âm tiết đầu tiên của chữ đó
        idx, words = 0, []
        for w, s in zip(WORDS[name], SYLL[name]):
            words.append({"text": w, "at": syl[idx]}); idx += s
        meta[name] = {"durFrames": round(len(clip) / HOP, 1), "words": words, "bands": bands(clip)}
        print(name, "dai", meta[name]["durFrames"], "frame | chu:", [(w["text"], w["at"]) for w in words])
    json.dump(meta, open("src/voice.json", "w"), ensure_ascii=False)


if __name__ == "__main__":
    main(sys.argv[1])
