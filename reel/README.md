# Voxa AI — 24s reel

1080×1920, 30 fps, 120 BPM. Every cut lands on the beat grid (1 beat = 0.5s).

| Time | Beat | Section | Technique |
|---|---|---|---|
| 0–2s | 1–4 | Hook: missed-call counter 1 → 12 → 47 → 128 | Number slams, shake, RGB split, whip-pan out |
| 2–4s | 5–8 | "What if every call got answered?" | Kinetic type on 16ths, zoom through the "?" |
| 4–6s | 9–12 | MEET / YOUR / NEW / VOICE | Colour shift each beat: slam, skew-slide, split, outline fill |
| 6–8s | 13–16 | VOXA AI logo | Waveform burst, masked letter rise, AI pill pop |
| 8–12s | 17–24 | Live call demo | 3D card camera move, reactive voice orb, typed transcript |
| 12–16s | 25–32 | Feature rapid fire (8 cards) | New colour and new move on every beat |
| 16–20s | 33–40 | Never sleeps / never sick / never misses | 3D text rings, camera tilt, spin-up, dive into orb, silent gap |
| 20–24s | 41–48 | End card | Drop, orb bloom, clean logo + tagline + CTA hold |

## Files
- `out/voxa-reel.mp4`: the finished reel
- `voxa-reel.html`: the composition. Open it through a local server (`npx serve reel`) and hit Play for a live preview with sound (`?t=12` jumps to 12s)
- `music.py`: synthesizes the soundtrack (`out/voxa-track.wav`), needs numpy
- `render.mjs`: renders frames with Playwright and muxes them with ffmpeg (`pip install imageio-ffmpeg`)

To re-render: `python3 music.py && node render.mjs`
