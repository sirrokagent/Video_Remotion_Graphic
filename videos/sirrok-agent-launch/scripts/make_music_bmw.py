"""Nhạc + hiệu ứng âm thanh cho video BMW M3/M4 30 giây — tổng hợp bằng numpy, tất định (seed cố định).

120 BPM: 1 phách = 15 frame (30 fps). Mốc khung hình khớp src/bmw/timeline.ts.
Ra: public/bmw/score.wav (sau đó chuẩn hoá loudnorm thành score.mp3).
"""
import numpy as np
import wave
import sys

SR = 48000
FPS = 30
DUR = 900 / FPS
N = int(SR * DUR)
rng = np.random.default_rng(7)

# Mốc (frame) — giống src/bmw/timeline.ts
DROP = 96
CUTS = [96, 216, 306, 396, 426, 456, 486, 516, 696, 786]
SPECS = [516, 576, 636]
DRIFT = 306
PURPLE = 696
END = 786
BREAK = (672, 696)  # nghỉ ngắn trước cú hit thứ hai


def t_of(frame):
    return frame / FPS


def idx(frame):
    return int(t_of(frame) * SR)


out = np.zeros((N, 2))


def add(sig, at_frame, gain=1.0, pan=0.0):
    i = idx(at_frame) if isinstance(at_frame, (int, np.integer)) else int(at_frame * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l = gain * np.sqrt(0.5 * (1 - pan))
    r = gain * np.sqrt(0.5 * (1 + pan))
    out[i : i + len(sig), 0] += sig * l
    out[i : i + len(sig), 1] += sig * r


def env(n, a=0.005, d=0.3, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def lp(x, cutoff):
    # one-pole low-pass (lặp 2 lần cho dốc hơn)
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        for i in range(len(x)):
            acc = (1 - a) * x[i] + a * acc
            y[i] = acc
        x = y
    return x


def lp_fast(x, cutoff):
    # low-pass qua FFT (nhanh cho tín hiệu dài)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bp_fast(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (f / hi) ** 4)) * (1 / (1 + (lo / np.maximum(f, 1)) ** 4))
    return np.fft.irfft(X, len(x))


# ---------- nhạc cụ ----------
def kick(gain=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 42 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.002, 0.35, 3.2)
    s += 0.3 * rng.standard_normal(n) * env(n, 0.0005, 0.01, 6)
    return np.tanh(1.6 * s) * gain


def snare():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    noise = bp_fast(rng.standard_normal(n), 900, 7000) * env(n, 0.001, 0.18, 4)
    body = np.sin(2 * np.pi * 190 * t) * env(n, 0.001, 0.08, 5)
    return 0.6 * noise + 0.5 * body


def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    s = bp_fast(rng.standard_normal(n), 6000, 14000)
    return s * env(n, 0.0005, 0.12 if open_ else 0.03, 4)


def impact(gain=1.0, length=2.6):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 30 + 70 * np.exp(-t * 6)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, length * 0.6, 3.0)
    crack = lp_fast(rng.standard_normal(n), 3500) * env(n, 0.001, 0.25, 5)
    tail = lp_fast(rng.standard_normal(n), 900) * env(n, 0.01, length, 3.5) * 0.35
    return np.tanh(1.4 * (boom + 0.5 * crack + tail)) * gain


def whoosh(length=0.6, rise=True):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # quét bộ lọc: chia khối, mỗi khối cutoff khác nhau
    y = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        s, e = b * n // blocks, (b + 1) * n // blocks
        k = b / (blocks - 1)
        c = 400 + 7000 * (k if rise else 1 - k) ** 2
        y[s:e] = bp_fast(noise[s:e], c * 0.5, c * 1.6)
    shape = np.sin(np.pi * t) ** 1.5 if not rise else (t ** 2.2) * (1 - np.clip((t - 0.92) / 0.08, 0, 1))
    return y * shape


def riser(length, f0=80, f1=900):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** (t ** 1.6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sign(np.sin(ph)) * 0.25 + np.sin(ph * 1.005) * 0.4
    tone = lp_fast(tone, 3000)
    noise = whoosh(length, True) * 0.8
    return (tone * t ** 2 + noise) * 0.7


def engine_rev(length=2.4, idle=38, peak=190, gain=1.0):
    """Tiếng động cơ 6 xy-lanh vọt ga: tần số nổ quét lên rồi tụt nhẹ (sang số)."""
    n = int(length * SR)
    t = np.arange(n) / SR
    u = t / length
    # tăng tốc mạnh, tụt ở 60% (sang số) rồi tăng tiếp
    curve = np.where(u < 0.6, (u / 0.6) ** 0.7, 0.72 + 0.28 * np.clip((u - 0.6) / 0.4, 0, 1) ** 0.8)
    f = idle + (peak - idle) * curve
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.zeros(n)
    for h, a in [(1, 1.0), (2, 0.7), (3, 0.55), (4, 0.35), (6, 0.25), (8, 0.12)]:
        s += a * np.sin(h * ph + 0.3 * h)
    # rung nổ: điều biên theo nhịp đánh lửa (3 lần/vòng cho 6 xy-lanh)
    s *= 0.65 + 0.35 * np.sin(ph * 0.5) ** 2
    s += 0.25 * lp_fast(rng.standard_normal(n), 1800) * (0.4 + curve)
    s = np.tanh(2.2 * s)
    s = lp_fast(s, 2600)
    e = np.minimum(1, t / 0.08) * np.clip((length - t) / 0.35, 0, 1)
    return s * e * gain * 0.5


def tire_screech(length=1.8):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 1150 + 120 * np.sin(2 * np.pi * 5.5 * t) + 60 * np.sin(2 * np.pi * 13 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * 0.5 + 0.3 * np.sin(2 * ph) + 0.6 * bp_fast(rng.standard_normal(n), 900, 4000)
    e = np.minimum(1, t / 0.12) * np.clip((length - t) / 0.6, 0, 1)
    return s * e * 0.35


def tick():
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.01, 5) * 0.5


# ---------- nền ----------
t = np.arange(N) / SR
# drone (Rê thứ) — dâng dần
drone = np.zeros(N)
for f, a in [(36.71, 0.5), (73.42, 0.35), (110.0, 0.18), (146.83, 0.12), (220.0, 0.06)]:
    drone += a * np.sin(2 * np.pi * f * t + f)
drone = lp_fast(drone, 900)
dr_env = np.clip(t / 3.0, 0, 1) * (0.55 + 0.45 * np.clip((t - t_of(DROP)) / 2, 0, 1))
dr_env *= 1 - 0.85 * np.clip((t - t_of(880)) / 0.67, 0, 1)
out[:, 0] += drone * dr_env * 0.35
out[:, 1] += drone * dr_env * 0.35

# rumble mở đầu
rum = lp_fast(rng.standard_normal(idx(DROP)), 120)
rum *= np.linspace(0.2, 1, len(rum)) ** 2
add(rum / np.max(np.abs(rum)) * 0.5, 0)

# bass xung 8 phách theo vòng hợp âm Dm – Bb – F – C
roots = [73.42, 58.27, 87.31, 65.41]
beat = 15
step = 7.5  # 1/8 nốt = 7,5 frame
k = 0
fr = float(DROP)
while fr < 880:
    if not (BREAK[0] <= fr < BREAK[1]):
        bar = int((fr - DROP) // (beat * 4))
        f = roots[bar % 4]
        n = int(0.22 * SR)
        tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sign(np.sin(2 * np.pi * f * tt)) * 0.5)
        s = lp_fast(s, 420) * env(n, 0.004, 0.18, 3)
        add(s * (0.42 if k % 2 == 0 else 0.3), fr / FPS)
    fr += step
    k += 1

# trống
fr = DROP
b = 0
while fr < 870:
    if not (BREAK[0] <= fr < BREAK[1]):
        add(kick(0.95), fr)
        if b % 2 == 1:
            add(snare(), fr, 0.55)
        add(hat(), (fr + 7.5) / FPS, 0.2, 0.3)
        add(hat(b % 4 == 3), fr, 0.12, -0.3)
    fr += beat
    b += 1
# fill trống trước cú hit thứ hai
for i, f_ in enumerate(range(BREAK[0] - 15, BREAK[0], 3)):
    add(snare(), f_, 0.25 + 0.06 * i)

# ---------- SFX ----------
add(riser(t_of(DROP) - 0.3, 60, 700), 0.3, 0.55)
add(impact(1.0), DROP)
for c in CUTS[1:]:
    add(whoosh(0.5, True), (c / FPS) - 0.45, 0.32, 0.4 if c % 2 else -0.4)
add(engine_rev(2.6, 38, 200, 1.0), DROP + 6)  # vọt ga khi vào cảnh xe chạy sa mạc
add(tire_screech(2.4), DRIFT + 4, 0.9, -0.2)
add(engine_rev(1.6, 50, 170, 0.6), DRIFT + 2)
add(impact(0.65, 1.6), CUTS[3])
for s_ in SPECS:
    add(impact(0.55, 1.2), s_)
    for j in range(10):  # tiếng đếm số
        add(tick(), (s_ + 3 + j * 2.4) / FPS, 0.45)
add(engine_rev(3.0, 40, 220, 0.85), SPECS[0] + 4)
add(riser(t_of(BREAK[1] - BREAK[0]) + 0.4, 120, 1400), (BREAK[0] - 12) / FPS, 0.5)
add(impact(1.0), PURPLE)
add(tire_screech(2.2), PURPLE + 2, 0.75, 0.2)
add(engine_rev(2.0, 45, 210, 0.8), PURPLE + 4)
add(impact(1.1, 3.6), END)
add(whoosh(0.9, False), (END + 30) / FPS, 0.35)

# master
m = out / np.max(np.abs(out)) * 0.95
fade = np.clip((DUR - t) / 0.4, 0, 1)
m *= fade[:, None]
pcm = (np.clip(m, -1, 1) * 32767).astype(np.int16)
path = sys.argv[1] if len(sys.argv) > 1 else 'public/bmw/score.wav'
with wave.open(path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', path, DUR, 's')
