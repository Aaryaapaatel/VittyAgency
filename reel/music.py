"""Synthesizes the 120 BPM soundtrack for the Voxa AI reel.

Every visual cut in voxa-reel.html lands on the beat grid defined here
(1 beat = 0.5s), so picture and sound stay locked.

    python3 music.py  ->  out/voxa-track.wav
"""
import os
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
DUR = 24.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * (1 - max(pan, 0))
    R[i : i + len(sig)] += sig * (1 + min(pan, 0))


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    return att * np.exp(-t / d)


def lowpass(x, cutoff):
    """One-pole lowpass; cutoff may be scalar or per-sample array."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# ---------- instruments ----------
def kick(big=False):
    n = int(SR * (0.9 if big else 0.45))
    t = np.arange(n) / SR
    f = 42 + 160 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (3.2 if big else 7))
    click = rng.standard_normal(n) * np.exp(-t * 300) * 0.35
    return np.tanh((body + click) * 1.8)


def clap():
    n = int(SR * 0.3)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    e = np.zeros(n)
    for off in (0, 0.011, 0.022):
        e += np.where(t >= off, np.exp(-(t - off) * 60), 0)
    e += np.exp(-t * 14) * 0.5
    x = noise * e
    return x - lowpass(x, 900)


def hat(open_=False):
    n = int(SR * (0.25 if open_ else 0.06))
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = x - lowpass(x, 7000)
    return x * np.exp(-t * (14 if open_ else 70))


def tick():
    n = int(SR * 0.05)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90)


def saw(freq, n):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.12, 0.0, 0.12):
        f = freq * 2 ** (det / 12)
        out += 2 * ((t * f) % 1) - 1
    return out / 3


def stab(notes, length=0.35, bright=4200):
    n = int(SR * length)
    x = sum(saw(hz(m), n) for m in notes) / len(notes)
    t = np.arange(n) / SR
    cut = 300 + bright * np.exp(-t * 9)
    return lowpass(x, cut) * env(n, 0.003, length * 0.45)


def pad(notes, length):
    n = int(SR * length)
    x = sum(saw(hz(m), n) for m in notes) / len(notes)
    t = np.arange(n) / SR
    e = np.clip(t / 0.4, 0, 1) * np.clip((length - t) / 1.5, 0, 1)
    return lowpass(x, 1400) * e


def bass(midi, length=0.22):
    n = int(SR * length)
    t = np.arange(n) / SR
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sign(np.sin(2 * np.pi * f * t))
    return lowpass(x, 500) * env(n, 0.004, length * 0.5)


def impact(length=2.5):
    n = int(SR * length)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 90 * np.exp(-t * 6)) / SR) * np.exp(-t * 1.6)
    crash = rng.standard_normal(n)
    crash = (crash - lowpass(crash, 3000)) * np.exp(-t * 2.2) * 0.35
    return np.tanh(boom * 1.6) + crash


def riser(length):
    n = int(SR * length)
    t = np.arange(n) / SR
    p = t / length
    x = rng.standard_normal(n)
    x = lowpass(x, 400 + 9000 * p**2)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1400 * p**2) / SR) * 0.25
    return (x * 0.8 + tone) * p**2


def whoosh(length=0.5, reverse=False):
    n = int(SR * length)
    t = np.arange(n) / SR
    p = t / length
    x = rng.standard_normal(n)
    x = lowpass(x, 300 + 5000 * np.sin(np.pi * p))
    e = np.sin(np.pi * p) ** 2
    out = x * e
    return out[::-1] if reverse else out


def ring():
    """Two-tone phone ring burst for the hook."""
    n = int(SR * 0.42)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 1320 * t) + np.sin(2 * np.pi * 1760 * t)
    gate = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    return tone * gate * env(n, 0.002, 0.3) * 0.35


# ---------- arrangement ----------
# A minor: Am - F - C - G, one bar (2s) each
PROG = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [67, 72, 76]), (55, [67, 71, 74])]


def chord_at(t):
    return PROG[int(t // (4 * BEAT)) % 4]


def b(i):
    return i * BEAT


# HOOK 0-2s: ring + impacts on counter slams
add(impact(1.8), 0, 0.9)
add(ring(), 0.0, 0.8)
add(ring(), 0.5, 0.6, 0.3)
for tt in (0.5, 0.75, 1.0):
    add(kick(), tt, 0.8)
    add(stab([69, 72, 76], 0.2), tt, 0.35)
add(clap(), 1.0, 0.6)
add(whoosh(0.5), 1.5, 0.5)

# KINETIC TYPE 2-4s: tick + kick on every quarter-beat word slam
for k in range(6):
    tt = 2.0 + k * 0.25
    add(tick(), tt, 0.45, (-0.4, 0.4)[k % 2])
    add(kick(), tt, 0.55 if k % 2 else 0.8)
for k in range(8):
    add(hat(), 3.5 + k * 0.0625, 0.18 + k * 0.03)
add(whoosh(0.5, reverse=True), 3.5, 0.6)

# GROOVE 4-20s
for i in range(8, 39):  # beats 4.0s .. 19.5s
    t0 = b(i)
    filtered = 16 <= i < 24  # demo section (8-12s) sits lighter
    add(kick(big=i in (8, 12)), t0, 0.95)
    if i % 2 == 1:
        add(clap(), t0, 0.5 if filtered else 0.7)
    for s in (0.25, 0.5, 0.75):
        add(hat(open_=(s == 0.5)), t0 + s * BEAT, (0.07 if s != 0.5 else 0.12), 0.3)
    root, notes = chord_at(t0)
    add(bass(root - 12), t0 + BEAT / 2, 0.55)
    add(bass(root - 12, 0.12), t0 + BEAT * 0.75, 0.3)
    if not filtered:
        add(stab(notes, 0.3, 5200 if i >= 24 else 3200), t0 + (0 if i >= 24 else BEAT / 2), 0.22, (-0.3, 0.3)[i % 2])

# accents on section hits
add(impact(1.6), b(8), 0.55)   # MEET
add(impact(2.0), b(12), 0.6)   # VOXA logo
add(whoosh(0.6), b(15.5), 0.4)
add(impact(1.2), b(24), 0.45)  # rapid features start
add(pad([69, 72, 76, 81], 4.0), b(16), 0.12)

# BUILD 16-19.5s: riser + accelerating snare roll
add(riser(3.5), 16.0, 0.55)
roll_t = 18.0
step = BEAT / 2
while roll_t < 19.5:
    add(clap(), roll_t, 0.25 + 0.4 * (roll_t - 18) / 1.5)
    roll_t += step
    step = max(BEAT / 8, step * 0.82)
add(whoosh(0.5, reverse=True), 19.5, 0.8)
# 19.5-20.0 is a deliberate gap: kick and bass above stop at beat 38

# DROP 20s: final hit + chord ring-out
add(impact(4.0), 20.0, 1.0)
add(kick(big=True), 20.0, 1.0)
add(pad([57, 64, 69, 72, 76], 4.0), 20.0, 0.35)
add(stab([69, 72, 76, 81], 1.2, 6000), 20.0, 0.4)
for i in range(40, 44):
    add(kick(), b(i), 0.5 * (1 - (i - 40) / 4))
    add(hat(open_=True), b(i) + BEAT / 2, 0.08)

# ---------- master ----------
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 1.1)
fade = np.ones(N)
fn = int(SR * 1.2)
fade[-fn:] = np.linspace(1, 0, fn) ** 2
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.92

os.makedirs(os.path.join(os.path.dirname(__file__), "out"), exist_ok=True)
path = os.path.join(os.path.dirname(__file__), "out", "voxa-track.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("wrote", path)
