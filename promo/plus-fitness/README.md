# Plus Fitness — 30s Promo

**Final video:** [`plus-fitness-promo.mp4`](plus-fitness-promo.mp4). 1080×1920 (9:16 for Reels, Shorts and TikTok), 30 fps, 30 s, with a 128 BPM soundtrack.

Colours: navy & black (`#020308`, `#0a1c4f`, `#13307a`) with an electric-blue accent (`#2a63ff`).
Fonts: Anton + Montserrat (OFL).

## Timeline (all cuts land on the beat)
| Time | Scene |
|---|---|
| 0:00–0:03.7 | Light sweep → **+** logo slam with shockwave → "PLUS FITNESS" wordmark |
| 0:03.7–0:07.5 | Kinetic type: NO · LIMITS · NO · EXCUSES |
| 0:07.5–0:13.1 | Programs: Strength · Cardio · HIIT · Personal Training (animated icons, slab wipes) |
| 0:13.1–0:18.7 | Stat rings: 100% Effort · 24/7 Access · 0 Excuses, then the build-up |
| 0:18.7–0:22.5 | The drop: plus-sign tunnel, strobe, TRAIN HARDER / PUSH FURTHER |
| 0:22.5–0:26.2 | STRONGER+ FASTER+ FITTER+ → **YOU+** |
| 0:26.2–0:30 | End card: logo, "Elevate your limits", **JOIN TODAY** call to action |

## Editing & re-rendering
All text lives in `index.html` (`FEATURES`, `STATS`, and the scene functions). Change the copy there, e.g. remove "24/7 ACCESS" if the gym isn't open 24/7, or add an address or phone number to the end card.

```bash
python3 soundtrack.py                 # -> soundtrack.wav (needs numpy)
node render.mjs --stills 2,10,20      # quick PNG previews in stills/
node render.mjs                       # -> plus-fitness-promo.mp4 (needs playwright + ffmpeg)
```
To preview live, serve this folder (e.g. `npx http-server`), open `index.html` and click to play it with the music.
