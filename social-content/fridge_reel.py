"""Animated cartoon reel: "checking the fridge every 10 minutes hoping new food appeared".

Original character ("Vitty guy"), drawn frame by frame with pycairo, with a
synthesised soundtrack. Output: 1080x1920 (9:16) MP4.

Usage: python3 fridge_reel.py [output.mp4]
Requires: pycairo, numpy, ffmpeg on PATH.
"""
import math, os, subprocess, sys, wave
import cairo
import numpy as np

W, H, FPS = 1080, 1920, 30
OUT = sys.argv[1] if len(sys.argv) > 1 else "fridge-check.mp4"
FONT = "Inter"
INK = (0.08, 0.08, 0.1)
SKIN = (0.98, 0.84, 0.69)
HOODIE = (0.95, 0.45, 0.33)
PANTS = (0.22, 0.27, 0.42)
HAIR = (0.25, 0.16, 0.12)

# cycle start times; cycle 3 is the punchline
S = [0.4, 4.6, 8.8]
SLAM = S[2] + 3.4
TOTAL = SLAM + 2.8


def hexc(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lerp(a, b, k): return a + (b - a) * k
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_back(x):
    x = clamp(x); c = 1.9
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def rrect(c, x, y, w, h, r):
    c.new_sub_path()
    c.arc(x + w - r, y + r, r, -math.pi / 2, 0); c.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    c.arc(x + r, y + h - r, r, math.pi / 2, math.pi); c.arc(x + r, y + r, r, math.pi, 1.5 * math.pi)
    c.close_path()

def fill_stroke(c, col, lw=7, a=1.0):
    c.set_source_rgba(*col, a); c.fill_preserve()
    c.set_source_rgb(*INK); c.set_line_width(lw); c.stroke()

def text(c, s, x, y, size, col=INK, stroke=None, sw=0, weight=cairo.FONT_WEIGHT_BOLD, scale=1.0):
    if scale <= 0.01: return
    c.save(); c.translate(x, y); c.scale(scale, scale)
    c.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, weight); c.set_font_size(size)
    ext = c.text_extents(s)
    c.move_to(-ext.x_advance / 2, size * 0.35); c.text_path(s)
    if stroke:
        c.set_source_rgb(*stroke); c.set_line_width(sw); c.set_line_join(cairo.LINE_JOIN_ROUND); c.stroke_preserve()
    c.set_source_rgb(*col); c.fill(); c.restore()


# ---------------------------------------------------------------- state
def state(t):
    """Everything that animates, as a function of time."""
    st = dict(door=0.0, reach=0.0, lean=0.0, jump=0.0, eye=1.0, lid=0.15, mouth="flat",
              look=(1, 0), brow=0.0, egg=0.0, bubble=0.0, shake=0.0, card=0.0, cta=0.0,
              minutes=0.0, sweat=0.0)
    # clock: 9:00 -> 9:10 -> 9:20, spinning fast during the skip before cycles 2 and 3
    for k, s in enumerate(S[1:], 1):
        st["minutes"] = max(st["minutes"], 10 * (k - 1) + 10 * ease((t - (s - 1.0)) / 0.8))
        if s - 1.1 < t < s + 0.1:
            st["card"] = max(st["card"], ease_back((t - (s - 1.1)) / 0.3) if t < s - 0.2 else clamp((s + 0.1 - t) / 0.3))
    for k, s in enumerate(S):
        u = t - s
        if u < 0: continue
        last = k == 2
        st["reach"] = ease(u / 0.4) if u < 0.8 else (1 - ease((u - 2.9) / 0.4) if not last else 0.0)
        if not last:
            st["door"] = ease_out((u - 0.4) / 0.5) * (1 - ease((u - 2.5) / 0.5))
        else:
            st["door"] = ease_out((u - 0.3) / 0.35) * (1 - ease((u - 3.15) / 0.25))
        if k == 0:  # hopeful, then crushed
            if 0.8 < u < 1.6: st.update(eye=1.25, lid=0.0, mouth="smile", brow=0.6)
            elif u >= 1.6: st.update(eye=1.0, lid=0.55, mouth="frown", brow=-0.5, look=(1, 0.4))
        elif k == 1:  # lean in and scan every shelf
            if 0.8 < u < 2.4:
                st.update(lean=ease((u - 0.8) / 0.4) * 45, lid=0.45, brow=-0.8, mouth="flat",
                          look=(math.cos(u * 7), math.sin(u * 5) * 0.8))
            elif u >= 2.4: st.update(lean=45 * (1 - ease((u - 2.4) / 0.4)), lid=0.6, mouth="frown", brow=-0.5, look=(1, 0.5))
        else:  # the egg talks back
            if 0.6 < u < 1.5: st.update(eye=1.3, lid=0.0, mouth="smile", brow=0.8)
            st["egg"] = ease_back((u - 1.2) / 0.3)
            st["bubble"] = ease_back((u - 1.35) / 0.3) * (1 - ease((u - 3.1) / 0.15))
            if u >= 1.75:
                st.update(eye=1.55, lid=0.0, mouth="O", brow=1.0, look=(0.6, 0.2), sweat=clamp((u - 2.0) / 0.3))
                st["jump"] = -70 * math.sin(math.pi * clamp((u - 1.75) / 0.35))
            if u > 3.2: st["shake"] = max(0.0, 1 - (u - 3.4) / 0.5)
            st["cta"] = ease_back((u - 3.9) / 0.35)
    # blinks
    for b in (2.4, 4.0, 7.2, 13.4):
        if 0 < t - b < 0.14 and st["eye"] < 1.5: st["lid"] = 1.0
    return st


# ---------------------------------------------------------------- scene
FX0, FX1, FY0, FY1 = 590, 980, 560, 1440   # fridge body
DY0 = 830                                   # main door top (freezer above)

def background(c):
    c.set_source_rgb(*hexc("#5b7f8f")); c.paint()                 # wall
    for x in range(0, W, 90):                                         # wallpaper stripes
        c.rectangle(x, 0, 45, 1440); c.set_source_rgba(1, 1, 1, 0.05); c.fill()
    c.rectangle(0, 1440, W, H - 1440); c.set_source_rgb(*hexc("#c9a27a")); c.fill()  # floor
    c.set_source_rgba(0, 0, 0, 0.18); c.set_line_width(4)
    for y in (1530, 1650, 1800):
        c.move_to(0, y); c.line_to(W, y); c.stroke()
    for i in range(-6, 14):
        c.move_to(540 + i * 130, 1440); c.line_to(540 + i * 260, H); c.stroke()
    c.rectangle(0, 1420, W, 24); fill_stroke(c, hexc("#e8dccb"), 5)  # skirting
    # window with moon (it's night)
    rrect(c, 70, 760, 300, 300, 18); fill_stroke(c, hexc("#1d2a4a"), 8)
    c.arc(280, 840, 42, 0, 2 * math.pi); c.set_source_rgb(*hexc("#f6f0c4")); c.fill()
    c.arc(262, 828, 42, 0, 2 * math.pi); c.set_source_rgb(*hexc("#1d2a4a")); c.fill()
    for sx, sy in ((120, 820), (170, 950), (300, 990), (230, 900)):
        c.arc(sx, sy, 4, 0, 2 * math.pi); c.set_source_rgb(1, 1, 0.9); c.fill()
    c.set_source_rgb(*INK); c.set_line_width(8)
    c.move_to(220, 760); c.line_to(220, 1060); c.move_to(70, 910); c.line_to(370, 910); c.stroke()

def wall_clock(c, minutes):
    cx, cy, r = 230, 640, 80
    c.arc(cx, cy, r, 0, 2 * math.pi); fill_stroke(c, (1, 1, 1), 9)
    for i in range(12):
        a = i * math.pi / 6
        c.move_to(cx + math.cos(a) * (r - 14), cy + math.sin(a) * (r - 14))
        c.line_to(cx + math.cos(a) * (r - 24), cy + math.sin(a) * (r - 24))
    c.set_source_rgb(*INK); c.set_line_width(5); c.stroke()
    m = minutes * 6  # degrees; spin an extra full turn per skip for drama
    ma = math.radians(m * 7 - 90)
    ha = math.radians(9 * 30 + minutes * 0.5 - 90)
    c.set_line_cap(cairo.LINE_CAP_ROUND)
    c.move_to(cx, cy); c.line_to(cx + math.cos(ha) * 40, cy + math.sin(ha) * 40); c.set_line_width(10); c.stroke()
    c.move_to(cx, cy); c.line_to(cx + math.cos(ma) * 62, cy + math.sin(ma) * 62); c.set_line_width(6); c.stroke()
    c.arc(cx, cy, 8, 0, 2 * math.pi); c.fill()

def egg(c, x, y, face, t):
    c.save(); c.translate(x, y)
    c.scale(1, 1.25); c.arc(0, 0, 34, 0, 2 * math.pi); c.restore()
    fill_stroke(c, (1, 0.99, 0.95), 5)
    if face > 0.01:
        c.save(); c.translate(x, y); c.scale(face, face)
        for ex in (-12, 12):
            c.arc(ex, -8, 5, 0, 2 * math.pi); c.set_source_rgb(*INK); c.fill()
        c.move_to(-10, 14); c.line_to(10, 14); c.set_line_width(4); c.stroke()   # deadpan
        c.restore()

def fridge_inside(c, st, t):
    x0, x1, y0, y1 = FX0 + 14, FX1 - 14, DY0 + 12, FY1 - 14
    c.rectangle(x0, y0, x1 - x0, y1 - y0); c.set_source_rgb(*hexc("#fff8dc")); c.fill()
    c.set_source_rgb(*hexc("#d9d2b8")); c.set_line_width(8)
    for y in (1040, 1250):
        c.move_to(x0, y); c.line_to(x1, y); c.stroke()
    c.arc((x0 + x1) / 2, y0 + 22, 16, 0, 2 * math.pi); c.set_source_rgb(1, 1, 0.75); c.fill()  # bulb
    # the same sad contents, every single time
    rrect(c, 820, 900, 56, 132, 16); fill_stroke(c, hexc("#d93a2b"), 5)                       # ketchup
    rrect(c, 830, 880, 36, 26, 6); fill_stroke(c, (1, 1, 1), 4)
    egg(c, 700, 1000, st["egg"], t)
    c.move_to(690, 1240); c.arc(735, 1240, 45, math.pi, 2 * math.pi); c.close_path()            # half lemon
    fill_stroke(c, hexc("#f7d43a"), 5)
    c.move_to(860, 1415); c.curve_to(820, 1360, 900, 1330, 920, 1415); c.close_path()           # wilted leaf
    fill_stroke(c, hexc("#8fb84a"), 5)

def fridge(c, st, t):
    rrect(c, FX0, FY0, FX1 - FX0, FY1 - FY0, 34); fill_stroke(c, hexc("#eef2f4"), 9)
    c.move_to(FX0, DY0); c.line_to(FX1, DY0); c.set_line_width(7); c.stroke()
    rrect(c, FX0 + 30, 640, 18, 140, 9); fill_stroke(c, hexc("#b8c2c8"), 5)       # freezer handle
    for i, col in enumerate(("#ff6b6b", "#ffd93d", "#6bcB77")):                     # magnets
        c.arc(FX0 + 150 + i * 70, 640 + (i % 2) * 40, 18, 0, 2 * math.pi); fill_stroke(c, hexc(col), 4)
    o = st["door"]
    if o > 0.001: fridge_inside(c, st, t)
    th = o * math.radians(118)
    w = FX1 - FX0
    xf = FX1 - w * math.cos(th)
    grow = 1 + 0.10 * math.sin(th)
    yc, hh = (DY0 + FY1) / 2, (FY1 - DY0) / 2
    c.move_to(FX1, DY0); c.line_to(FX1, FY1)
    c.line_to(xf, yc + hh * grow); c.line_to(xf, yc - hh * grow); c.close_path()
    front = math.cos(th) > 0
    fill_stroke(c, hexc("#eef2f4") if front else hexc("#d6dde1"), 9)
    if front:
        hx = lerp(xf, FX1, 0.09)
        c.rectangle(hx - 9, yc - 140 * grow, 18, 200 * grow); fill_stroke(c, hexc("#b8c2c8"), 5)
    else:  # door shelves with a lonely water bottle
        for k in (0.3, 0.65):
            yy = yc - hh * grow + 2 * hh * grow * k
            c.move_to(FX1, yy); c.line_to(xf, yy + 10); c.set_line_width(6); c.stroke()

def light(c, st):
    """Night-time darkness, with the fridge glow cutting through it."""
    o = st["door"]
    cx, cy = (FX0 + FX1) / 2 - 120, 1050
    g = cairo.RadialGradient(cx, cy, 60, cx, cy, 900)
    g.add_color_stop_rgba(0, 0, 0, 0, 0.62 * (1 - 0.95 * o))
    g.add_color_stop_rgba(0.6, 0, 0, 0, 0.62 * (1 - 0.55 * o))
    g.add_color_stop_rgba(1, 0, 0, 0, 0.62)
    c.set_source_rgb(0.03, 0.04, 0.12); c.mask(g)
    if o > 0.01:
        g2 = cairo.RadialGradient(cx, cy, 0, cx, cy, 650)
        g2.add_color_stop_rgba(0, 1, 0.92, 0.6, 0.28 * o); g2.add_color_stop_rgba(1, 1, 0.92, 0.6, 0)
        c.set_source(g2); c.paint()


# ---------------------------------------------------------------- character
def limb(c, pts, col, w):
    c.set_line_cap(cairo.LINE_CAP_ROUND); c.set_line_join(cairo.LINE_JOIN_ROUND)
    for lw, cc in ((w + 12, INK), (w, col)):
        c.move_to(*pts[0])
        if len(pts) == 3: c.curve_to(*pts[1], *pts[1], *pts[2])
        else: c.line_to(*pts[1])
        c.set_source_rgb(*cc); c.set_line_width(lw); c.stroke()

def character(c, st, t):
    bx = 400 + st["lean"] * 0.4
    jy = st["jump"]
    breathe = math.sin(t * 2.4) * 4
    hip_y = 1235 + jy
    # legs
    for dx, fx in ((-26, -40), (26, 30)):
        limb(c, [(bx + dx, hip_y), (bx + fx, 1395 + min(0, jy * 0.4))], PANTS, 40)
        c.save(); c.translate(bx + fx + 14, 1410 + min(0, jy * 0.4)); c.scale(1.6, 1)
        c.arc(0, 0, 20, 0, 2 * math.pi); c.restore(); fill_stroke(c, hexc("#f4f4f4"), 6)
    # back arm
    sh_y = 1000 + jy + breathe
    limb(c, [(bx - 55, sh_y), (bx - 95, sh_y + 110), (bx - 70, sh_y + 190)], HOODIE, 38)
    c.arc(bx - 70, sh_y + 200, 22, 0, 2 * math.pi); fill_stroke(c, SKIN, 6)
    # hoodie body
    rrect(c, bx - 92, 955 + jy + breathe, 184, 300 - breathe, 70); fill_stroke(c, HOODIE, 8)
    rrect(c, bx - 55, 1110 + jy, 110, 70, 22); fill_stroke(c, hexc("#d93f2a"), 5)          # pocket
    # front arm reaches for the handle
    rest = (bx + 60, sh_y + 200)
    handle = (FX0 + 40, 1110)
    o = st["door"]
    if o > 0.05:  # follow the door edge for a moment, then let go
        th = o * math.radians(118)
        xf = FX1 - (FX1 - FX0) * math.cos(th)
        handle = (min(lerp(xf, FX1, 0.09), FX0 + 120), 1110)
    k = st["reach"]
    hand = (lerp(rest[0], handle[0], k), lerp(rest[1], handle[1], k))
    sh = (bx + 55, sh_y)
    elbow = ((sh[0] + hand[0]) / 2 + 10, max(sh[1], hand[1]) + 40 - 30 * k)
    limb(c, [sh, elbow, hand], HOODIE, 38)
    c.arc(hand[0], hand[1], 23, 0, 2 * math.pi); fill_stroke(c, SKIN, 6)
    head(c, bx + st["lean"] + 15, 840 + jy + breathe * 0.6, st, t)

def head(c, hx, hy, st, t):
    R = 118
    # hair tuft (springs when he jumps)
    spring = 1 + 0.35 * abs(st["jump"]) / 70
    c.move_to(hx - 70, hy - 85)
    for i, (dx, h) in enumerate(((-50, 70), (-15, 95), (25, 80), (60, 55))):
        c.line_to(hx + dx - 15, hy - R + 10); c.line_to(hx + dx, hy - R - h * spring * 0.55)
    c.line_to(hx + 75, hy - 80); c.close_path(); fill_stroke(c, HAIR, 7)
    c.arc(hx, hy, R, 0, 2 * math.pi); fill_stroke(c, SKIN, 8)
    c.save(); c.translate(hx - 92, hy + 10); c.scale(0.7, 1); c.arc(0, 0, 26, 0, 2 * math.pi); c.restore()
    fill_stroke(c, SKIN, 6)                                                            # ear
    # hair fringe over the head
    c.move_to(hx - R + 8, hy - 30)
    c.curve_to(hx - 60, hy - 140, hx + 60, hy - 150, hx + R - 6, hy - 40)
    c.curve_to(hx + 40, hy - 70, hx - 40, hy - 60, hx - R + 8, hy - 30)
    fill_stroke(c, HAIR, 7)
    # eyes
    e, lid = st["eye"], st["lid"]
    lx, ly = st["look"]
    for ex in (hx + 18, hx + 76):
        ey = hy + 5
        rx, ry = 22 * e, 30 * e
        c.save(); c.translate(ex, ey); c.scale(rx, ry); c.arc(0, 0, 1, 0, 2 * math.pi); c.restore()
        fill_stroke(c, (1, 1, 1), 6)
        pr = 11 if e < 1.5 else 7
        c.arc(ex + lx * (rx - pr - 4), ey + ly * (ry - pr - 6), pr, 0, 2 * math.pi)
        c.set_source_rgb(*INK); c.fill()
        if lid > 0.02:  # eyelid drops from the top
            c.save(); c.translate(ex, ey); c.scale(rx + 3, ry + 3); c.arc(0, 0, 1, 0, 2 * math.pi); c.restore()
            c.save(); c.clip()
            top = ey - ry - 3
            c.rectangle(ex - rx - 5, top, 2 * rx + 10, (2 * ry + 6) * lid)
            c.set_source_rgb(*SKIN); c.fill_preserve(); c.restore()
            c.new_path()
            c.move_to(ex - rx - 2, top + (2 * ry + 6) * lid); c.line_to(ex + rx + 2, top + (2 * ry + 6) * lid)
            c.set_source_rgb(*INK); c.set_line_width(6); c.stroke()
        # brows: >0 raised, <0 angry/annoyed
        b = st["brow"]
        by = ey - ry - 18 - 14 * max(b, 0)
        tilt = -10 * min(b, 0) * (1 if ex > hx + 40 else -1)
        c.move_to(ex - 20, by - tilt * 0.5 + (0 if b >= 0 else 6)); c.line_to(ex + 20, by + tilt * 0.5)
        c.set_source_rgb(*HAIR); c.set_line_width(9); c.set_line_cap(cairo.LINE_CAP_ROUND); c.stroke()
    # mouth
    mx, my = hx + 52, hy + 70
    c.set_source_rgb(*INK); c.set_line_width(7)
    m = st["mouth"]
    if m == "smile":
        c.arc(mx, my - 14, 24, 0.15 * math.pi, 0.85 * math.pi); c.stroke()
    elif m == "frown":
        c.arc(mx, my + 20, 22, 1.2 * math.pi, 1.8 * math.pi); c.stroke()
    elif m == "O":
        c.save(); c.translate(mx, my + 4); c.scale(1, 1.3); c.arc(0, 0, 16, 0, 2 * math.pi); c.restore()
        fill_stroke(c, hexc("#6b1d1d"), 6)
    else:
        c.move_to(mx - 18, my); c.line_to(mx + 18, my); c.stroke()
    if st["sweat"] > 0:  # sweat drop
        s = st["sweat"]; sx, sy = hx - 70, hy - 50 + 30 * s
        c.move_to(sx, sy - 26); c.curve_to(sx + 20, sy, sx + 16, sy + 16, sx, sy + 16)
        c.curve_to(sx - 16, sy + 16, sx - 20, sy, sx, sy - 26); fill_stroke(c, hexc("#8fd3ff"), 5, a=s)


# ---------------------------------------------------------------- overlays
def caption(c):
    rrect(c, 70, 120, W - 140, 330, 40); fill_stroke(c, (1, 1, 1), 8)
    for i, line in enumerate(("Me opening the fridge", "every 10 minutes hoping", "new food appeared")):
        text(c, line, W / 2, 205 + i * 92, 66)

def bubble(c, s):
    if s <= 0.01: return
    c.save(); c.translate(720, 590); c.scale(s, s)
    rrect(c, -270, -95, 540, 170, 50); fill_stroke(c, (1, 1, 1), 8)
    c.move_to(-60, 70); c.line_to(-20, 300); c.line_to(20, 70); fill_stroke(c, (1, 1, 1), 8)
    c.rectangle(-70, 55, 100, 17); c.set_source_rgb(1, 1, 1); c.fill()
    text(c, "bro... it's still", 0, -35, 54)
    text(c, "just me.", 0, 30, 54)
    c.restore()

def overlays(c, st, t):
    if st["card"] > 0.01:
        text(c, "10 MINUTES LATER...", W / 2, 1640, 92, hexc("#ffd93d"), INK, 16, scale=st["card"])
    bubble(c, st["bubble"])
    if st["cta"] > 0.01:
        text(c, "Tag the friend who", W / 2, 1610, 76, (1, 1, 1), INK, 14, scale=st["cta"])
        text(c, "does this", W / 2, 1705, 76, (1, 1, 1), INK, 14, scale=st["cta"])
    text(c, "@vittyagency", W / 2, 1860, 40, (1, 1, 1), INK, 6, weight=cairo.FONT_WEIGHT_NORMAL)


def render(surf, t):
    st = state(t)
    c = cairo.Context(surf)
    c.set_operator(cairo.OPERATOR_SOURCE); c.set_source_rgb(0, 0, 0); c.paint()
    c.set_operator(cairo.OPERATOR_OVER)
    if st["shake"] > 0:
        c.translate(math.sin(t * 95) * 26 * st["shake"], math.cos(t * 80) * 20 * st["shake"])
    background(c); wall_clock(c, st["minutes"])
    fridge(c, st, t); character(c, st, t)
    light(c, st)
    c.identity_matrix()
    caption(c); overlays(c, st, t)
    surf.flush()
    return surf.get_data()


# ---------------------------------------------------------------- audio
def soundtrack(path):
    SR = 44100; n = int(TOTAL * SR); a = np.zeros(n); tt = np.arange(n) / SR
    rng = np.random.default_rng(7)
    def add(sig, at, g=1.0):
        s = int(at * SR); e = min(n, s + len(sig))
        if e > s: a[s:e] += sig[:e - s] * g
    def env(d, k): x = np.arange(int(d * SR)) / SR; return np.exp(-x * k), x
    def tone(f, d, k=6, g=1.0, at=0.0, shape=np.sin):
        e, x = env(d, k); add(shape(2 * np.pi * f * x) * e, at, g)
    # sneaky late-night pizzicato bassline
    notes = [110, 0, 130.8, 0, 146.8, 0, 130.8, 0]
    step = 0.3
    for i in range(int(SLAM / step)):
        f = notes[i % 8]
        if f: tone(f, 0.25, 14, 0.35, i * step)
        if i % 2: tone(f * 4 if f else 523, 0.08, 40, 0.06, i * step)
    for s in S:
        e, x = env(0.25, 18); add(rng.standard_normal(len(x)) * e * 0.5 + np.sin(2 * np.pi * 70 * x) * e, s + 0.4, 0.35)  # door pop
    hum = 0.04 * np.sin(2 * np.pi * 120 * tt) * (1 + 0.3 * np.sin(2 * np.pi * 3 * tt))
    for s, d in ((S[0] + 0.5, 2.4), (S[1] + 0.5, 2.4), (S[2] + 0.4, 2.8)):
        seg = (tt > s) & (tt < s + d); a[seg] += hum[seg]
    for s in S[:2]:
        e, x = env(0.3, 14); add(np.sin(2 * np.pi * 55 * x) * e, s + 3.0, 0.6)                               # door close
    for s in S[1:]:
        for k in range(14): tone(2400, 0.03, 120, 0.15, s - 1.0 + k * 0.06)                                  # clock spin
        e, x = env(0.5, 4); add(np.sin(2 * np.pi * (300 + 900 * x) * x) * e, s - 1.1, 0.12)                  # whoosh
    for k, f in enumerate((311, 293, 277, 262)):  # wah-wah-wah-waaah (disappointment)
        d = 0.9 if k == 3 else 0.32
        e, x = env(d, 2.5); vib = 1 + (0.02 * np.sin(2 * np.pi * 6 * x) if k == 3 else 0)
        add(np.tanh(2 * np.sin(2 * np.pi * f * vib * x)) * e, S[0] + 1.6 + k * 0.33, 0.12)
    e, x = env(0.25, 10); add(np.sin(2 * np.pi * 900 * x) * e, S[2] + 1.35, 0.15)                             # bubble pop
    e, x = env(0.7, 4); add(np.sin(2 * np.pi * (220 + 500 * np.sin(np.pi * x / 0.7)) * x) * e, S[2] + 1.75, 0.35)  # boing
    e, x = env(0.6, 6); add((rng.standard_normal(len(x)) * 0.6 + np.sin(2 * np.pi * 45 * x)) * e, S[2] + 3.4, 0.8)  # SLAM
    tone(523, 0.18, 12, 0.18, S[2] + 3.9); tone(784, 0.4, 6, 0.18, S[2] + 4.05)                               # CTA ding
    a = np.tanh(a * 1.3) * 0.85
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


if __name__ == "__main__":
    wav = OUT + ".wav"
    soundtrack(wav)
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                          "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", OUT],
                         stdin=subprocess.PIPE)
    for f in range(int(TOTAL * FPS)):
        p.stdin.write(bytes(render(surf, f / FPS)))
    p.stdin.close(); p.wait(); os.remove(wav)
    print("wrote", OUT)
