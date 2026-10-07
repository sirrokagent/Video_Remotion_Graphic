"""
Nhạc nền phim 90 giây — tổng hợp bằng numpy, tất định (seed cố định). 100 BPM.
Mọi mốc lấy từ src/film/timeline.ts (frame tuyệt đối @30fps):
  intro 0 · wake 290 · work 510 · call 830 · island 1370 · social 1660 · connect 1940
  everywhere 2100 · reveal 2310 (thân ghost nở +40) · meet 2470 · hết 2700

  python3 scripts/make_music_film.py /tmp/film.wav && ffmpeg -i /tmp/film.wav -b:a 256k public/music/film.mp3
"""
import sys, wave
import numpy as np

SR = 48000
DUR = 2700 / 30
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


S = lambda fr: fr / 30  # frame → giây
WAKE, WORK, CALL, ISLAND, SOCIAL, CONNECT, EVERY, REVEAL, MEET = map(S, [290, 510, 830, 1370, 1660, 1940, 2100, 2310, 2470])

# ---------- pad ----------
CHORDS = [[53, 57, 60, 64], [57, 60, 64, 67], [48, 55, 59, 64], [55, 59, 62, 64]]  # Fmaj7 Am7 Cmaj7 G6
def pad_voice(freq, n, det):
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k in range(1, 7):
        s += np.sin(2 * np.pi * k * freq * (1 + det) * t) / k * np.exp(-0.45 * k)
    return s

def pad(chord, start, length, gain):
    n = int(length * SR)
    e = env_adsr(n, min(1.2, length * 0.4), min(1.4, length * 0.45))
    for m in chord:
        f = note(m)
        add(pad_voice(f, n, +0.0012) * e, start, gain / len(chord), pan=-0.35)
        add(pad_voice(f, n, -0.0012) * e, start, gain / len(chord), pan=+0.35)

def kick():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 42 + 70 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.13)

def hat():
    n = int(0.05 * SR)
    x = rng.randn(n); x = np.diff(np.concatenate([[0], x]))
    return x * np.exp(-np.arange(n) / SR / 0.012)

def boom(dur=2.6, f0=36):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 + 70 * np.exp(-tt / 0.05)
    noise = rng.randn(n) * np.exp(-tt / 0.04) * 0.25
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) + noise) * np.exp(-tt / 0.6)

def riser(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 200 * (8 ** (tt / dur))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + rng.randn(n) * 0.5
    s = s * (tt / dur) ** 2.2
    return s

def pluck(freq, dur=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * 2 * freq * tt)) * np.exp(-tt / 0.16)
    return s * env_adsr(n, 0.004, 0.05)

def bell(freq, dur=3.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * freq * r * tt) * np.exp(-tt / d) for r, a, d in [(1, 1, 1.2), (2.76, .45, .5), (5.4, .25, .25), (8.93, .12, .12)])
    return s * env_adsr(n, 0.002, 0.4)

K = kick(); HAT = hat()
BAR2 = 8 * BEAT

# ---------- mở đầu: drone thấp + cú đập theo từng nhát cắt (mỗi 18 frame) ----------
n = int(WAKE * SR); tt = np.arange(n) / SR
drone = (np.sin(2 * np.pi * note(29) * tt) + 0.5 * np.sin(2 * np.pi * note(36) * tt)) * env_adsr(n, 1.0, 1.5)
add(drone, 0, 0.12)
for k in range(0, 10):  # montage hiệu ứng ghost 0–165f
    add(boom(1.2, 44 if k % 2 else 38), S(k * 18), 0.16 if k else 0.3)
    add(HAT, S(k * 18 + 9), 0.04, pan=0.3)
add(riser(S(150)), S(15), 0.035)
pad(CHORDS[0], S(160), WAKE - S(160) + 1.0, 0.09)

# ---------- giọng nói ra lệnh: chỉ pad nhẹ ----------
t = WAKE; ci = 1
while t < WORK:
    pad(CHORDS[ci % 4], t, BAR2 + 1.2, 0.08); t += BAR2; ci += 1

# ---------- từ lúc agent làm việc: groove dày dần tới cảnh "mọi nơi" ----------
t = WORK; ci = 0
while t < REVEAL - 0.6:
    g = 0.10 + 0.05 * min(1, (t - WORK) / (EVERY - WORK))
    pad(CHORDS[ci % 4], t, min(BAR2 + 1.2, REVEAL - t + 0.4), g)
    t += BAR2; ci += 1

eighth = BEAT / 2
t = WORK; i = 0
while t < REVEAL - 0.8:
    ch = CHORDS[int((t - WORK) / BAR2) % 4]
    seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12]
    # cuộc gọi: lùi arp lại để nghe rõ thoại
    g = 0.045 if CALL <= t < ISLAND else (0.07 if t < EVERY else 0.09)
    add(pluck(note(seq[i % len(seq)])), t, g, pan=0.25 if i % 2 else -0.25)
    t += eighth; i += 1

t = WORK; b = 0
while t < REVEAL - 0.8:
    dense = t >= SOCIAL
    in_call = CALL <= t < ISLAND
    if not in_call and (dense or b % 2 == 0):
        add(K, t, 0.30 if t >= EVERY else (0.26 if dense else 0.22))
    if not in_call or b % 2 == 0:
        add(HAT, t + eighth, 0.05 if dense else 0.035, pan=0.3)
    t += BEAT; b += 1

# cú đập mở mỗi cảnh lớn
for at in [WORK, CALL, ISLAND, SOCIAL, CONNECT, EVERY]:
    add(boom(1.8, 40), at - 0.05, 0.16)
add(riser(2.4), EVERY - 2.4, 0.05)

# ---------- khoảng lặng trước hé lộ, cú hit khi thân ghost nở ----------
n = int(2.0 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * note(36) * tt) * env_adsr(n, 0.6, 0.6), REVEAL - 0.6, 0.10)
HIT = REVEAL + S(40)
add(boom(3.2, 38), HIT, 0.45)
pad([48, 55, 59, 62, 64], HIT, DUR - HIT, 0.18)          # Cmaj9 ngân tới hết
pad([60, 67, 71, 74], HIT + 0.05, DUR - HIT - 0.05, 0.06)
STAR = REVEAL + S(136)
add(bell(note(88)), STAR, 0.10, pan=-0.2)
add(bell(note(95)), STAR + 0.09, 0.07, pan=0.25)
add(bell(note(91)), STAR + 0.18, 0.05)

# ---------- màn kết "Gặp Sirrok Agent": nhịp nhẹ, khép bằng hợp âm ----------
t = MEET + 0.3; i = 0
seq = [72, 76, 79, 83, 79, 76]
while t < DUR - 2.4:
    add(pluck(note(seq[i % 6])), t, 0.05, pan=0.25 if i % 2 else -0.25)
    t += eighth; i += 1
add(bell(note(84), 4.0), DUR - 2.6, 0.08)

# ---------- master ----------
mix = np.stack([L, R], 1)
mix[:, 0] = onepole_lp(mix[:, 0], 9000); mix[:, 1] = onepole_lp(mix[:, 1], 9000)
fade = np.ones(N); fi = int(1.8 * SR); fade[-fi:] = np.linspace(1, 0, fi) ** 2
fo = int(0.05 * SR); fade[:fo] = np.linspace(0, 1, fo) ** 2
mix *= fade[:, None]
mix /= np.abs(mix).max() / 0.89  # -1 dBFS
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", round(DUR, 3), "s")
