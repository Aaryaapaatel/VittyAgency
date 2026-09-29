"""Synthesizes the 30s, 128 BPM soundtrack for the Plus Fitness promo -> soundtrack.wav

Usage: python3 soundtrack.py   (needs numpy)
The kick schedule mirrors kickOn() in index.html so visuals hit on the beat.
"""
import wave
import numpy as np

SR, DUR, BPM = 44100, 30.0, 128
BEAT = 60 / BPM
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rs = np.random.RandomState(3)


def kick_on(i):
    return (4 <= i < 36) or (40 <= i < 60)


def add(sig, t, gain=1.0, pan=0.0):
    s = int(t * SR)
    if s >= N:
        return
    sig = sig[: N - s]
    L[s:s + len(sig)] += sig * gain * (1 - max(pan, 0))
    R[s:s + len(sig)] += sig * gain * (1 + min(pan, 0))


def env(n, decay):
    return np.exp(-np.arange(n) / SR * decay)


def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode='same')


# ---- instruments ----
def kick_drum():
    n = int(.45 * SR); tt = np.arange(n) / SR
    freq = 45 + 110 * np.exp(-tt * 28)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 7)
    click = rs.randn(n) * env(n, 300) * .3
    return np.tanh((body + click) * 2.2) * .9


def clap():
    n = int(.25 * SR); noise = rs.randn(n)
    bp = noise - lowpass(noise, 6); bp = lowpass(bp, 2)
    e = env(n, 22)
    for d in (0.0, .011, .022):  # clap flams
        e = np.maximum(e, np.roll(env(n, 60), int(d * SR)))
    tone = np.sin(2 * np.pi * 190 * np.arange(n) / SR) * env(n, 30) * .4
    return (bp * e * .8 + tone) * .7


def hat(open_=False):
    n = int((.18 if open_ else .05) * SR); noise = rs.randn(n)
    hp = noise - lowpass(noise, 3)
    return hp * env(n, 18 if open_ else 70) * .25


def saw(freq, n, harm=8, detune=0.0):
    tt = np.arange(n) / SR; out = np.zeros(n)
    for h in range(1, harm + 1):
        out += np.sin(2 * np.pi * freq * (1 + detune) * h * tt) / h
    return out


def impact(length=2.0):
    n = int(length * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-tt * 4)) / SR) * env(n, 2.2)
    noise = lowpass(rs.randn(n), 8) * env(n, 5) * .6
    return np.tanh((boom + noise) * 1.6)


def whoosh(length=.6):
    n = int(length * SR); x = np.linspace(0, 1, n)
    noise = rs.randn(n); shaped = noise - lowpass(noise, 4)
    return shaped * (x ** 2.5) * .35


# chord roots per bar (A minor: Am F C G)
ROOTS = [55.0, 43.65, 65.41, 49.0]
CHORDS = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
bar = BEAT * 4
KICK, CLAP = kick_drum(), clap()

# ---- drums ----
for i in range(64):
    t = i * BEAT
    if kick_on(i):
        add(KICK, t, .55 if i < 8 else 1.0)
    if 8 <= i < 60 and not (36 <= i < 40):
        if i % 2 == 1:
            add(CLAP, t, .8)
        add(hat(), t + BEAT / 2, .9, pan=.3)
        add(hat(), t + BEAT / 4, .35, pan=-.3)
        add(hat(), t + 3 * BEAT / 4, .35, pan=-.3)
        if i % 4 == 3:
            add(hat(True), t + BEAT / 2, .5, pan=.2)

# build: snare roll 16.875 -> 18.75 accelerating
t = 16.875
step = BEAT / 2
while t < 18.75 - 1e-6:
    frac = (t - 16.875) / 1.875
    add(CLAP, t, .35 + .6 * frac)
    if frac > .5:
        step = BEAT / 4
    if frac > .75:
        step = BEAT / 8
    t += step

# riser
n = int(1.875 * SR); x = np.linspace(0, 1, n)
riser_noise = rs.randn(n); riser_noise -= lowpass(riser_noise, 3)
sweep = np.sin(2 * np.pi * np.cumsum(200 + 1400 * x ** 2) / SR)
add((riser_noise * .25 + sweep * .15) * x ** 2, 16.875)

# ---- bass (offbeat pumping) ----
for i in range(8, 60):
    if 36 <= i < 40:
        continue
    root = ROOTS[int(i * BEAT // bar) % 4]
    nb = int(BEAT / 2 * SR)
    b = saw(root, nb, 5) * np.minimum(1, np.arange(nb) / (SR * .005)) * env(nb, 6)
    add(np.tanh(b * 1.5) * .45, i * BEAT + BEAT / 2)

# ---- pad (sidechained) ----
pad = np.zeros(N)
for b in range(int(DUR / bar) + 1):
    s, e = int(b * bar * SR), min(N, int((b + 1) * bar * SR))
    if s >= N:
        break
    n = e - s
    chunk = np.zeros(n)
    for f in CHORDS[b % 4]:
        chunk += saw(f, n, 6, .003) + saw(f, n, 6, -.003)
    fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (SR * .05))
    pad[s:e] = lowpass(chunk, 12) * fade
duck = np.ones(N)
for i in range(64):
    if kick_on(i):
        s = int(i * BEAT * SR); m = min(N - s, int(BEAT * SR))
        duck[s:s + m] = 1 - .75 * env(m, 9)
pad_level = np.interp(np.arange(N) / SR, [0, 1.875, 3.75, 16.875, 18.75, 26.25, 30], [.03, .07, .08, .12, .06, .09, .0])
L += pad * duck * pad_level
R += np.roll(pad, 200) * duck * pad_level

# ---- FX ----
for c in (BEAT * 2, 18.75, 25.3125, 26.25):
    add(impact(), c, .9)
for c in (3.75, 7.5, 13.125, 22.5):
    w = whoosh()
    add(w, c - len(w) / SR, .9, pan=-.2)

# ---- master ----
mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
fade = np.interp(np.arange(N) / SR, [0, .05, 28.3, 30], [0, 1, 1, 0])
mix *= fade[:, None] * .92
pcm = (mix * 32767).astype(np.int16)
with wave.open('soundtrack.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote soundtrack.wav')
