"""Render a vertical (9:16) relatable-humour reel: "just 5 more minutes".

Usage: python3 make_reel.py [output.mp4]
Requires: Pillow, numpy, ffmpeg on PATH.
"""
import math, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
OUT = sys.argv[1] if len(sys.argv) > 1 else "just-5-more-minutes.mp4"
BOLD = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
font = lambda p, s: ImageFont.truetype(p, s)

# (start_s, dur_s, clock, caption, bg_top, bg_bottom, kind)
SCENES = [
    (0.0, 2.6, None,       "POV: you said\n\"just 5 more\nminutes\"",                ("#ffb347", "#ff5e62"), "hook"),
    (2.6, 2.4, "11:02 PM", "One reel.\nThen sleep.\nI'm responsible.",               ("#3a3d7a", "#1d1f45"), "clock"),
    (5.0, 2.4, "11:47 PM", "Learning how\ncheese is made\nin Switzerland",           ("#2c2f63", "#16173a"), "clock"),
    (7.4, 2.4, "12:58 AM", "Emotionally invested\nin a guy restoring\na rusty knife", ("#22244f", "#101130"), "clock"),
    (9.8, 2.4, "2:13 AM",  "Reading comments\non a video I\ndidn't even watch",     ("#1a1b3d", "#0b0b22"), "clock"),
    (12.2, 2.6, "3:41 AM", "Googling \"can you\nsurvive on 3 hrs\nof sleep\"",       ("#111229", "#050512"), "clock"),
    (14.8, 2.8, "7:00 AM", "ALARM",                                                   ("#ff3b3b", "#a10000"), "alarm"),
    (17.6, 2.4, None,      "Me: who did\nthis to me?!",                                ("#fdfbfb", "#e2d1c3"), "punch"),
    (20.0, 3.0, None,      "Tag the friend\nwho does this",                            ("#ffb347", "#ff5e62"), "cta"),
]
TOTAL = SCENES[-1][0] + SCENES[-1][1]

def gradient(top, bot):
    t = np.array(Image.new("RGB", (1, 1), top)).reshape(3).astype(float)
    b = np.array(Image.new("RGB", (1, 1), bot)).reshape(3).astype(float)
    k = np.linspace(0, 1, H)[:, None]
    col = (t * (1 - k) + b * k).astype(np.uint8)
    return Image.fromarray(np.repeat(col[:, None, :], W, axis=1))

BGS = [gradient(*s[4]) for s in SCENES]

def ease_back(x):  # overshoot pop
    x = min(max(x, 0), 1); c = 1.70158
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def text_layer(txt, f, fill, stroke=None, sw=0, spacing=18):
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    box = [int(v) for v in d.multiline_textbbox((0, 0), txt, font=f, align="center", spacing=spacing, stroke_width=sw)]
    im = Image.new("RGBA", (box[2] - box[0] + 40, box[3] - box[1] + 40), (0, 0, 0, 0))
    ImageDraw.Draw(im).multiline_text((20 - box[0], 20 - box[1]), txt, font=f, fill=fill, align="center",
                                      spacing=spacing, stroke_width=sw, stroke_fill=stroke)
    return im

def paste_center(base, layer, cx, cy, scale=1.0, alpha=1.0, angle=0):
    if scale <= 0.01 or alpha <= 0: return
    if scale != 1: layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))), Image.LANCZOS)
    if angle: layer = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        a = layer.getchannel("A").point(lambda v: int(v * alpha)); layer.putalpha(a)
    base.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))

# Pre-render static text layers
CAP = {}
for i, s in enumerate(SCENES):
    kind = s[5]
    size = {"hook": 112, "alarm": 230, "punch": 120, "cta": 110}.get(kind, 84)
    fill = "#1a1a1a" if kind == "punch" else "white"
    CAP[i] = text_layer(s[3], font(BOLD, size), fill, stroke="#00000055" if fill == "white" else None, sw=4 if fill == "white" else 0)
CLOCK_F = font(BOLD, 170)
SMALL_F = font(SEMI, 46)
HANDLE = text_layer("@vittyagency", SMALL_F, "#ffffffcc")
FOLLOW = text_layer("Follow for more relatable chaos", font(SEMI, 50), "white")

def phone(img, t_local, clock):
    """Draw a phone with glowing screen + clock in the upper half."""
    d = ImageDraw.Draw(img)
    pw, ph, cx, top = 420, 760, W // 2, 230
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(8, 0, -1):
        gd.rounded_rectangle((cx - pw/2 - r*14, top - r*14, cx + pw/2 + r*14, top + ph + r*14), 80, fill=(120, 170, 255, 6))
    img.alpha_composite(glow)
    d.rounded_rectangle((cx - pw/2, top, cx + pw/2, top + ph), 60, fill="#0d0d0d")
    d.rounded_rectangle((cx - pw/2 + 18, top + 18, cx + pw/2 - 18, top + ph - 18), 46, fill="#7aa7ff")
    # fake feed tiles scrolling
    off = (t_local * 900) % 260
    for k in range(-1, 4):
        y = top + 40 + k * 260 - off
        y0, y1 = max(y, top + 30), min(y + 230, top + ph - 30)
        if y1 > y0: d.rounded_rectangle((cx - pw/2 + 40, y0, cx + pw/2 - 40, y1), 24, fill=("#a8c4ff" if k % 2 else "#c9dbff"))
    # clock pill over the phone
    paste_center(img, text_layer(clock, CLOCK_F, "white", stroke="#000000", sw=6), cx, top + ph + 40)

def render(t):
    i = max(j for j, s in enumerate(SCENES) if s[0] <= t)
    s0, dur, clock, _, _, kind = SCENES[i]
    tl = t - s0
    img = BGS[i].copy().convert("RGBA")
    shake = (math.sin(t * 90) * 22, math.cos(t * 77) * 18) if kind == "alarm" else (0, 0)
    pop = ease_back(tl / 0.35)
    if clock and kind == "clock":
        phone(img, tl, clock)
        paste_center(img, CAP[i], W/2, 1500, pop, min(1, tl / 0.2))
    elif kind == "alarm":
        if int(t * 6) % 2 == 0:
            img.alpha_composite(Image.new("RGBA", (W, H), (255, 255, 255, 60)))
        paste_center(img, text_layer(clock, CLOCK_F, "white", stroke="#000", sw=6), W/2 + shake[0], 620 + shake[1], pop)
        paste_center(img, CAP[i], W/2 + shake[0] * 1.5, 1050 + shake[1], pop * (1 + 0.05 * math.sin(t * 30)), angle=math.sin(t * 40) * 4)
    elif kind == "punch":
        paste_center(img, CAP[i], W/2, H/2 - 80, pop, angle=-3)
        z = text_layer("( 0 hours of sleep )", font(SEMI, 54), "#555555")
        paste_center(img, z, W/2, H/2 + 230, ease_back((tl - 0.6) / 0.35), min(1, max(0, (tl - 0.6) / 0.2)))
    else:  # hook / cta
        bob = math.sin(tl * 4) * 10
        paste_center(img, CAP[i], W/2, H/2 - 60 + bob, pop)
        if kind == "cta":
            paste_center(img, FOLLOW, W/2, H/2 + 300, ease_back((tl - 0.5) / 0.35), min(1, max(0, (tl - 0.5) / 0.2)))
    # progress bar + handle
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W * t / TOTAL, 12), fill="#ffffffdd")
    paste_center(img, HANDLE, W/2, H - 140)
    # quick white flash on scene cut
    if tl < 0.08 and i:
        img.alpha_composite(Image.new("RGBA", (W, H), (255, 255, 255, int(160 * (1 - tl / 0.08)))))
    return img.convert("RGB")

# ---------- audio: lo-fi beat + whooshes + alarm ----------
SR = 44100
n = int(TOTAL * SR); a = np.zeros(n)
tt = np.arange(n) / SR
def add(sig, at, gain=1.0):
    s = int(at * SR); e = min(n, s + len(sig)); a[s:e] += sig[:e - s] * gain
def env(d, k): x = np.arange(int(d * SR)) / SR; return np.exp(-x * k), x
bpm = 100; beat = 60 / bpm
for b in range(int(TOTAL / beat)):
    bt = b * beat
    in_alarm = 14.8 <= bt < 17.6
    if in_alarm: continue
    e, x = env(0.35, 9); add(np.sin(2 * np.pi * (50 + 90 * np.exp(-x * 30)) * x) * e, bt, 0.9)   # kick
    if b % 2: e, x = env(0.18, 25); add(np.random.randn(len(x)) * e, bt, 0.25)                  # snare
    e, x = env(0.05, 80); add(np.random.randn(len(x)) * e, bt + beat / 2, 0.08)                 # hat
# soft chord pad (night vibe), fades as scenes get darker
for root, st in [(220, 0), (196, 4.8), (174.6, 9.6), (164.8, 12.2)]:
    seg = (tt >= st) & (tt < min(st + 4.8, 14.8))
    for m in (1, 1.26, 1.5):
        a[seg] += 0.05 * np.sin(2 * np.pi * root * m * tt[seg])
for s in SCENES[1:]:  # whoosh on each cut
    e, x = env(0.3, 12); add(np.random.randn(len(x)) * e * np.linspace(0, 1, len(x)) ** 0.3, s[0] - 0.05, 0.18)
for k in range(10):  # alarm beeps
    e, x = env(0.12, 2); add(np.sign(np.sin(2 * np.pi * 1760 * x)) * e, 14.8 + k * 0.28, 0.22)
e, x = env(0.6, 6); add(np.sin(2 * np.pi * 330 * x * (1 - x)) * e, 17.6, 0.5)  # "huh?" boing
a = np.tanh(a * 1.2) * 0.8
with wave.open("_audio.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((a * 32767).astype(np.int16).tobytes())

# ---------- encode ----------
p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                      "-r", str(FPS), "-i", "-", "-i", "_audio.wav", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", OUT],
                     stdin=subprocess.PIPE)
for f in range(int(TOTAL * FPS)):
    p.stdin.write(render(f / FPS).tobytes())
p.stdin.close(); p.wait()
import os; os.remove("_audio.wav")
print("wrote", OUT)
