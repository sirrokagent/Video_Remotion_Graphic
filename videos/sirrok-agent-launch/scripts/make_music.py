"""
Nhạc nền cho video ra mắt Sirrok Agent — tổng hợp bằng numpy, tất định (seed cố định).
100 BPM, mọi mốc khớp với src/theme.ts:  cảnh làm việc 8.33s, điện thoại 19.67s,
mọi nơi 26.33s, hé lộ 33.33s, thân ghost nở 34.67s, sao xanh bật 37.87s, hết 41.33s.

  python3 scripts/make_music.py /tmp/bed.wav && ffmpeg -i /tmp/bed.wav -b:a 256k public/music/bed.mp3
"""
import sys, wave
import numpy as np

SR = 48000
DUR = 1240 / 30
N = int(SR * DUR)
BEAT = 60 / 100
rng = np.random.RandomState(7)
t_all = np.arange(N) / SR

def note(m):  # midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)

def env_adsr(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai) ** 2
    if ri: e[-ri:] *= np.linspace(1, 0, ri) ** 1.5
    return e

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    # vectorised-ish: chunked recursion
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y

L = np.zeros(N); R = np.zeros(N)

def add(sig, start, gain=1.0, pan=0.0):
    i0 = int(start * SR)
    if i0 >= N: return
    s = sig[: N - i0] * gain
    L[i0:i0 + len(s)] += s * (1 - max(0, pan))
    R[i0:i0 + len(s)] += s * (1 + min(0, pan))

# ---------- pad ----------
CHORDS = [  # Fmaj7, Am7, Cmaj7, G6  (giọng thấp, ấm)
    [53, 57, 60, 64], [57, 60, 64, 67], [48, 55, 59, 64], [55, 59, 62, 64],
]
def pad_voice(freq, n, det):
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k in range(1, 7):
        s += np.sin(2 * np.pi * k * freq * (1 + det) * t) / k * np.exp(-0.45 * k)
    return s

def pad(chord, start, length, gain):
    n = int(length * SR)
    e = env_adsr(n, min(1.2, length * 0.4), min(1.4, length * 0.45))
    for i, m in enumerate(chord):
        f = note(m)
        add(pad_voice(f, n, +0.0012) * e, start, gain / len(chord), pan=-0.35)
        add(pad_voice(f, n, -0.0012) * e, start, gain / len(chord), pan=+0.35)

BAR2 = 8 * BEAT  # 4.8s / hợp âm
t = 0.0; ci = 0
while t < 33.0:
    g = 0.10 if t < 8.3 else 0.13
    pad(CHORDS[ci % 4], t, BAR2 + 1.2, g)
    t += BAR2; ci += 1

# ---------- pluck arpeggio (từ cảnh làm việc) ----------
def pluck(freq, dur=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * 2 * freq * tt)) * np.exp(-tt / 0.16)
    return s * env_adsr(n, 0.004, 0.05)

eighth = BEAT / 2
t = 8.33; i = 0
while t < 31.2:
    ch = CHORDS[int(t / BAR2) % 4]
    seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12]
    add(pluck(note(seq[i % len(seq)])), t, 0.075 if t < 26.3 else 0.09, pan=0.25 if i % 2 else -0.25)
    t += eighth; i += 1

# ---------- kick + hat ----------
def kick():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 42 + 70 * np.exp(-tt / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt / 0.13)

def hat():
    n = int(0.05 * SR)
    x = rng.randn(n); x = np.diff(np.concatenate([[0], x]))
    return x * np.exp(-np.arange(n) / SR / 0.012)

K = kick(); HAT = hat()
t = 8.33; b = 0
while t < 31.2:
    dense = t >= 26.3
    if dense or b % 2 == 0:
        add(K, t, 0.30 if dense else 0.24)
    add(HAT, t + eighth, 0.035 if not dense else 0.05, pan=0.3)
    t += BEAT; b += 1

# ---------- khoảng lặng trước hé lộ: drone thấp ----------
n = int(2.2 * SR); tt = np.arange(n) / SR
drone = np.sin(2 * np.pi * note(36) * tt) * env_adsr(n, 0.8, 0.6)
add(drone, 32.6, 0.10)

# ---------- cú hit khi thân ghost nở (34.67s) ----------
HIT = 1040 / 30
n = int(3.2 * SR); tt = np.arange(n) / SR
f = 38 + 60 * np.exp(-tt / 0.05)
sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.7)
add(sub, HIT, 0.45)
pad([48, 55, 59, 62, 64], HIT, DUR - HIT, 0.20)          # Cmaj9 ngân tới hết
pad([60, 67, 71, 74], HIT + 0.05, DUR - HIT - 0.05, 0.07)

# ---------- chuông khi sao xanh bật (37.87s) ----------
def bell(freq, dur=3.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * freq * r * tt) * np.exp(-tt / d) for r, a, d in [(1, 1, 1.2), (2.76, .45, .5), (5.4, .25, .25), (8.93, .12, .12)])
    return s * env_adsr(n, 0.002, 0.4)
STAR = 1136 / 30
add(bell(note(88)), STAR, 0.10, pan=-0.2)
add(bell(note(95)), STAR + 0.09, 0.07, pan=0.25)
add(bell(note(91)), STAR + 0.18, 0.05)

# ---------- master ----------
mix = np.stack([L, R], 1)
mix[:, 0] = onepole_lp(mix[:, 0], 9000); mix[:, 1] = onepole_lp(mix[:, 1], 9000)
fade = np.ones(N); fi = int(1.6 * SR); fade[-fi:] = np.linspace(1, 0, fi) ** 2
fo = int(0.4 * SR); fade[:fo] = np.linspace(0, 1, fo)
mix *= fade[:, None]
mix /= np.abs(mix).max() / 0.89  # -1 dBFS
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", round(DUR, 3), "s")
