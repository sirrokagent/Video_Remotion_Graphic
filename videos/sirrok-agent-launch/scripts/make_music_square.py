"""Nhạc + SFX cho "Khởi đầu vuông" (22 giây) — tổng hợp bằng numpy, tất định (seed cố định).

Lịch trình (STAGES, tốc độ quay, hình bánh) chép từ src/square/SquareWheels.tsx để tiếng "cộc"
rơi đúng lúc mặt bánh vuông đập xuống đất (cực tiểu độ cao trục bánh).
Nhạc dày dần theo giai đoạn: Tuần 1 chỉ có tiếng xe nặng nề + piano trầm; Tháng 12 sáng, đầy đủ trống.
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 22.0
N = int(SR * DUR)
rng = np.random.default_rng(5)
T = np.arange(N) / SR
out = np.zeros((N, 2))

STAGES = [(2.4, 40.0, 1.5), (7.2, 6.5, 2.4), (11.4, 3.0, 3.4), (15.0, 2.0, 5.6)]
MORPH = 0.9
FINAL_TEXT = 19.2
RIDE_OFF = 20.2
R = 128.0


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def staged(t, idx, log=False):
    v = STAGES[0][idx]
    for s in STAGES[1:]:
        k = smooth(s[0] - MORPH * 0.6, s[0] + MORPH * 0.4, t)
        b = s[idx]
        v = np.exp(np.log(v) + (np.log(b) - np.log(v)) * k) if log else v + (b - v) * k
    return v


def omega(t):
    ride = np.clip((t - RIDE_OFF) / 1.4, 0, 1) ** 3
    return staged(t, 2) * (0.35 + 0.65 * smooth(0, 1.6, t)) + 6 * ride


DT = 1 / 120
steps = int(DUR / DT) + 3
ts = np.arange(steps) * DT
phi = np.concatenate([[0], np.cumsum(omega(ts[1:]) * DT)])
nexp = staged(ts, 1, log=True)
glow = smooth(STAGES[3][0] - 0.3, STAGES[3][0] + 0.6, ts)

ang = np.linspace(0, 2 * np.pi, 160, endpoint=False)


def support(n, rot):
    x = np.sign(np.cos(ang)) * np.abs(np.cos(ang)) ** (2 / n) * R
    y = np.sign(np.sin(ang)) * np.abs(np.sin(ang)) ** (2 / n) * R
    return np.max(x * np.sin(rot) + y * np.cos(rot))


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    out[i : i + len(sig), 0] += sig * gain * np.sqrt(0.5 * (1 - pan))
    out[i : i + len(sig), 1] += sig * gain * np.sqrt(0.5 * (1 + pan))


def env(n, a, d, c=4.0):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-c * np.maximum(0, tt - a) / d)


def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi:
        X *= 1 / (1 + (f / hi) ** 4)
    if lo:
        X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def clunk(strength):
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * (55 + 90 * np.exp(-tt * 25)) * tt) * env(n, 0.001, 0.18, 4)
    rattle = filt(rng.standard_normal(n), lo=600, hi=5000) * env(n, 0.0005, 0.07, 5)
    ring = np.sin(2 * np.pi * 410 * tt) * env(n, 0.001, 0.25, 5) * 0.15  # khung xe rung
    return (body + 0.5 * rattle + ring) * strength


def creak():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = 700 + 250 * np.sin(2 * np.pi * 3 * tt)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    return filt(s, lo=500, hi=3000) * np.sin(np.pi * tt / tt[-1]) * 0.25


def note(f, length, vel=1.0, bright=1.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for h, a, d in [(1, 1, 1.4), (2, 0.4 * bright, 0.9), (3, 0.2 * bright, 0.6), (4, 0.1 * bright, 0.4)]:
        s += a * np.sin(2 * np.pi * f * h * tt) * np.exp(-tt / d * (1 + f / 1000))
    return s * np.minimum(1, tt / 0.004) * vel * 0.3


def hz(m):  # số MIDI → Hz
    return 440 * 2 ** ((m - 69) / 12)


def kick():
    n = int(0.4 * SR)
    tt = np.arange(n) / SR
    return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(45 + 100 * np.exp(-tt * 30)) / SR) * env(n, 0.002, 0.3, 3))


def snare():
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    return 0.6 * filt(rng.standard_normal(n), lo=1200, hi=8000) * env(n, 0.001, 0.15, 4) + 0.4 * np.sin(2 * np.pi * 200 * tt) * env(n, 0.001, 0.06, 5)


def hat():
    n = int(0.06 * SR)
    return filt(rng.standard_normal(n), lo=7000, hi=15000) * env(n, 0.0005, 0.03, 4)


def whoosh(length, rise=True):
    n = int(length * SR)
    k = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    B = 24
    for b in range(B):
        s0, s1 = b * n // B, (b + 1) * n // B
        c = 400 + 6000 * ((b / (B - 1)) if rise else np.sin(np.pi * b / (B - 1)))
        y[s0:s1] = filt(noise[s0:s1], lo=c * 0.5, hi=c * 1.5)
    return y * ((k ** 2) if rise else np.sin(np.pi * k) ** 2)


# ---------- tiếng bánh vuông đập đất ----------
for offset, pan in [(0.0, -0.35), (0.55, 0.35)]:
    off = offset * (1 - glow)
    h = np.array([support(nexp[i], phi[i] + off[i]) for i in range(steps)])
    for i in range(2, steps - 1):
        if h[i] < h[i - 1] and h[i] <= h[i + 1] and ts[i] < RIDE_OFF:
            depth = (np.max(h[max(0, i - 40) : i]) - h[i]) / R
            if depth > 0.01:
                add(clunk(min(1.0, depth * 2.6)), ts[i], 0.8, pan)
# tiếng kẽo kẹt mỗi vòng đạp khi còn gồng
crank = phi * 0.85
k = 1
for i in range(1, steps):
    if crank[i] >= k * 2 * np.pi:
        strain = 1 - smooth(10.5, 14.5, ts[i])
        if strain > 0.05:
            add(creak(), ts[i], 0.5 * strain, 0.1)
        k += 1

# ---------- nhạc ----------
BPM = 105
BEAT = 60 / BPM
drone = filt(0.5 * np.sin(2 * np.pi * 55 * T) + 0.3 * np.sin(2 * np.pi * 82.4 * T), hi=400)
dg = smooth(0, 2, T) * (1 - smooth(14.5, 15.2, T)) * 0.12
out += (drone * dg)[:, None]

# Am – F – C – G, mỗi hợp âm 2 phách (đổi sang sáng ở Tháng 12)
prog = [[57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62]]
b = 0
x = 2.4
while x < FINAL_TEXT + 1.5:
    lvl = 0.35 + 0.65 * float(smooth(2.4, 15.0, x))
    ch = prog[(b // 2) % 4]
    if b % 2 == 0:
        bright = 0.5 + float(glow[min(steps - 1, int(x / DT))])
        for j, m in enumerate(ch):
            add(note(hz(m), 2.0, 0.6 * lvl, bright), x + j * 0.03 * (x > 11.4))
        add(note(hz(ch[0] - 24), 1.6, 0.9 * lvl), x)
    # trống thêm dần theo giai đoạn
    if x >= 7.2:
        add(kick(), x, 0.55)
    if x >= 11.4:
        add(hat(), x + BEAT / 2, 0.18, 0.3)
    if x >= 15.0:
        add(hat(), x, 0.12, -0.3)
        if b % 2 == 1:
            add(snare(), x, 0.4)
        # rải nốt sáng (arp) 8 nốt mỗi phách
        for j in range(2):
            m = ch[(b * 2 + j) % len(ch)] + 12
            add(note(hz(m), 0.5, 0.35, 1.6), x + j * BEAT / 2, 1.0, 0.25 if j else -0.25)
    x += BEAT
    b += 1

# điểm nhấn
add(whoosh(1.4, True), STAGES[3][0] - 1.35, 0.3)
n = int(3.0 * SR)
tt = np.arange(n) / SR
shimmer = sum(np.sin(2 * np.pi * hz(m) * tt) for m in [72, 76, 79, 84]) * env(n, 0.01, 2.5, 3) * 0.12
add(shimmer, STAGES[3][0], 1.0)
add(kick(), STAGES[3][0], 0.9)
for s in STAGES[1:3]:
    add(whoosh(0.7, False), s[0] - 0.35, 0.18)
add(note(hz(84), 3.0, 0.6, 1.5), FINAL_TEXT, 1.0, -0.2)
add(note(hz(88), 3.0, 0.55, 1.5), FINAL_TEXT + 0.7, 1.0, 0.2)
add(whoosh(1.5, True), RIDE_OFF, 0.35)

m = out / np.max(np.abs(out)) * 0.95
m *= np.clip((DUR - T) / 0.9, 0, 1)[:, None]
pcm = (np.clip(m, -1, 1) * 32767).astype(np.int16)
path = sys.argv[1] if len(sys.argv) > 1 else 'public/square/score.wav'
with wave.open(path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', path)
