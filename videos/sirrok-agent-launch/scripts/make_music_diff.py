"""Nhạc + SFX cho "BE DIFFERENT" (24,5 giây) — tổng hợp bằng numpy, tất định (seed cố định).

Mốc khớp src/different/BeDifferent.tsx:
  0–10,4 s  đám đông bước đều: nhịp bước chân đồng loạt, tiếng tích tắc, drone thấp, piano thưa
  10,4 s    cận cảnh người khác biệt — nhạc "mở ra": boom trầm, hợp âm piano + dây
  11,85 s   ném cặp (vút) → 12,45 s cặp rơi (bịch)
  13,4 s    bước chân riêng của anh ta, vòng hợp âm Am–F–C–G dâng dần
  17 s      máy quay bay lên, dây + cymbal dâng tới cao trào, ngân rồi tắt ở 24,5 s
Ra: wav; chuẩn hoá loudnorm ra public/different/score.mp3.
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 24.5
N = int(SR * DUR)
rng = np.random.default_rng(11)
t = np.arange(N) / SR
out = np.zeros((N, 2))

DROP = 10.4
THROW = 11.85
LAND = 12.45
GO = 13.4
RISE = 17.0
STEP_CROWD = 1 / 2.7  # nhịp chạy của đám đông (khớp hoạt hình)
STEP_HERO = 1 / 2.65  # nhịp chạy của người khác biệt


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = gain * np.sqrt(0.5 * (1 - pan)), gain * np.sqrt(0.5 * (1 + pan))
        out[i : i + len(sig), 0] += sig * l
        out[i : i + len(sig), 1] += sig * r
    else:
        out[i : i + len(sig)] += sig * gain


def env(n, a=0.005, d=0.3, curve=4.0):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, tt - a) / max(d, 1e-4))


def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi:
        X *= 1 / (1 + (f / hi) ** 4)
    if lo:
        X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def reverb(x, seconds=2.4, mix=0.35, seed=3):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = r.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR * (6.9 / seconds))[:, None]
    ir[:, 0] = filt(ir[:, 0], hi=5000)
    ir[:, 1] = filt(ir[:, 1], hi=5000)
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    y = np.zeros((len(x), 2))
    for c in range(2):
        src = x if x.ndim == 1 else x[:, c]
        Y = np.fft.irfft(np.fft.rfft(src, nfft) * np.fft.rfft(ir[:, c], nfft), nfft)[: len(x)]
        y[:, c] = Y
    y *= mix / (np.max(np.abs(y)) + 1e-9) * (np.max(np.abs(x)) + 1e-9)
    dry = np.stack([x, x], 1) if x.ndim == 1 else x
    return dry * (1 - mix * 0.5) + y


def note_hz(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'Eb': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'Bb': 1, 'B': 2}
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + 12 * (o - 4)) / 12)


def piano(f, length=3.0, vel=1.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for h, a, d in [(1, 1.0, 1.6), (2, 0.45, 1.0), (3, 0.22, 0.7), (4, 0.12, 0.5), (5, 0.06, 0.35)]:
        s += a * np.sin(2 * np.pi * f * h * tt * (1 + 0.0004 * h * h)) * np.exp(-tt / d * (1 + f / 900))
    s += 0.25 * filt(rng.standard_normal(n), lo=1500, hi=6000) * env(n, 0.0005, 0.012, 5)
    return s * np.minimum(1, tt / 0.003) * vel * 0.35


def strings(freqs, length, attack=1.2, release=1.5):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.0045):
            ph = 2 * np.pi * f * (1 + det) * tt + 0.8 * np.sin(2 * np.pi * 5.2 * tt) * 0.002 * f / 5.2
            s += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.33
    s = filt(s, lo=90, hi=2400)
    e = np.minimum(1, tt / attack) * np.clip((length - tt) / release, 0, 1)
    return s * e / max(1, len(freqs)) * 0.5


def boom(length=3.5, gain=1.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = 32 + 55 * np.exp(-tt * 5)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.004, length * 0.5, 3)
    s += 0.4 * filt(rng.standard_normal(n), hi=700) * env(n, 0.002, 0.6, 4)
    return np.tanh(1.3 * s) * gain


def footstep(crisp=False):
    n = int(0.16 * SR)
    noise = rng.standard_normal(n)
    s = filt(noise, lo=120 if crisp else 60, hi=3800 if crisp else 1200) * env(n, 0.001, 0.05, 5)
    tt = np.arange(n) / SR
    s += 0.6 * np.sin(2 * np.pi * (85 if crisp else 65) * tt) * env(n, 0.001, 0.04, 5)
    return s


def whoosh(length=0.6):
    n = int(length * SR)
    k = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    B = 20
    for b in range(B):
        s0, s1 = b * n // B, (b + 1) * n // B
        c = 500 + 4500 * np.sin(np.pi * b / (B - 1))
        y[s0:s1] = filt(noise[s0:s1], lo=c * 0.5, hi=c * 1.5)
    return y * np.sin(np.pi * k) ** 2


def thud():
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (70 + 60 * np.exp(-tt * 30)) * tt) * env(n, 0.001, 0.12, 4)
    s += 0.5 * filt(rng.standard_normal(n), hi=2500) * env(n, 0.0005, 0.03, 5)
    # nảy nhẹ
    s2 = np.zeros(n)
    j = int(0.11 * SR)
    s2[j:] = s[: n - j] * 0.3
    return s + s2


def tick():
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 1800 * tt) * env(n, 0.0005, 0.012, 5)


# ---------- phần 1: đám đông, đồng loạt ----------
dry = np.zeros(N)
drone = (0.5 * np.sin(2 * np.pi * 55 * t) + 0.3 * np.sin(2 * np.pi * 82.4 * t + 1) + 0.15 * np.sin(2 * np.pi * 110 * t + 2))
drone = filt(drone, hi=500)
denv = np.clip(t / 2.5, 0, 1) * (1 - 0.7 * np.clip((t - 8.6) / 1.6, 0, 1)) * (t < DROP)
out[:, 0] += drone * denv * 0.06
out[:, 1] += drone * denv * 0.06

k = 0
x = 0.35
while x < DROP - 0.35:
    g = 0.55 * min(1, x / 2)
    # tiếng bước của hàng trăm người: nhiều lớp lệch nhau vài ms
    for j in range(6):
        add(footstep(False), x + (rng.random() - 0.5) * 0.03, g * 0.07, (rng.random() - 0.5) * 1.2)
    add(tick(), x, 0.03 * min(1, x / 2), 0.0)
    x += STEP_CROWD
    k += 1

# piano thưa: A – E – C – E
for i, (nm, at) in enumerate([('A3', 0.8), ('E4', 2.9), ('C4', 5.0), ('E4', 7.1)]):
    dry[int(at * SR) : int(at * SR) + int(3.0 * SR)] += piano(note_hz(nm), 3.0, 0.4)[: N - int(at * SR)]

# riser trước khi "mở ra"
rn = int(1.7 * SR)
riser = filt(rng.standard_normal(rn), lo=300, hi=6000) * np.linspace(0, 1, rn) ** 3
add(riser, DROP - 1.75, 0.22)

# ---------- phần 2: người khác biệt ----------
add(boom(4.0, 0.95), DROP)
for nm in ['A2', 'E3', 'A3', 'C4', 'B4']:
    a = int(DROP * SR)
    seg = piano(note_hz(nm), 4.0, 0.9)
    dry[a : a + len(seg)] += seg[: N - a]
add(strings([note_hz('A3'), note_hz('E4'), note_hz('C5')], GO - DROP + 0.6, attack=0.8, release=0.6), DROP, 0.55)

add(whoosh(0.55), THROW - 0.15, 0.45, -0.3)
add(thud(), LAND, 0.8, -0.35)

# bước chân riêng: rõ, có vang
x = GO + 0.4
while x < 24.0:
    fade = 1 - min(1, max(0, (x - 17.5) / 5))
    add(footstep(True), x, 0.5 * fade, -0.15)
    # bước đầu chậm, tăng tốc thành nhịp chạy trong ~1,2 s
    x += STEP_HERO + 0.25 * max(0.0, 1 - (x - GO) / 1.3)

# vòng hợp âm Am – F – C – G (mỗi hợp âm 1,4 s), dâng dần
prog = [
    ['A2', 'E3', 'A3', 'C4', 'E4'],
    ['F2', 'C3', 'F3', 'A3', 'C4'],
    ['C3', 'G3', 'C4', 'E4', 'G4'],
    ['G2', 'D3', 'G3', 'B3', 'D4'],
]
x = GO
ci = 0
while x < 23.2:
    ch = prog[ci % 4]
    lvl = 0.55 + 0.45 * min(1, (x - GO) / 6)
    for j, nm in enumerate(ch):  # rải hợp âm
        a = int((x + j * 0.11) * SR)
        if a < N:
            seg = piano(note_hz(nm), 2.2, 0.7 * lvl)
            dry[a : a + len(seg)] += seg[: N - a]
    add(strings([note_hz(n) for n in ch[1:4]], 1.75, attack=0.5, release=0.6), x, 0.35 + 0.35 * lvl)
    x += 1.4
    ci += 1

# cao trào khi máy bay lên
cym_n = int((22.4 - RISE) * SR)
cym = filt(rng.standard_normal(cym_n), lo=4000, hi=14000) * np.linspace(0, 1, cym_n) ** 2.5
add(cym, RISE, 0.12)
add(strings([note_hz('A3'), note_hz('E4'), note_hz('A4'), note_hz('C5')], 24.5 - RISE, attack=4.0, release=1.8), RISE, 0.6)
add(boom(2.5, 0.6), 22.4)
for nm in ['A1', 'A2', 'E3', 'A3', 'C4', 'E4', 'A4']:
    a = int(22.4 * SR)
    seg = piano(note_hz(nm), 2.1, 0.9)
    dry[a : a + len(seg)] += seg[: N - a]

# vang cho piano
out += reverb(dry, 2.6, 0.45)

m = out / np.max(np.abs(out)) * 0.95
m *= np.clip((DUR - t) / 0.8, 0, 1)[:, None]
pcm = (np.clip(m, -1, 1) * 32767).astype(np.int16)
path = sys.argv[1] if len(sys.argv) > 1 else 'public/different/score.wav'
with wave.open(path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', path)
