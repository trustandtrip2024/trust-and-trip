# Hero video clips

Drop 3 MP4 clips here to replace the image fallback:

- `hero-1.mp4` — ideally beach / tropical
- `hero-2.mp4` — ideally mountain / snow
- `hero-3.mp4` — ideally culture / street / sunset

## Specs

- Format: MP4 (H.264), muted, looping-safe (no hard cut at end)
- Resolution: 1920x1080 (Full HD) — max 2560x1440 if higher budget
- Duration: 8–15 seconds each
- File size: **under 2.5 MB each** — compress with HandBrake or `ffmpeg`
- Aspect: 16:9
- No audio track (saves bytes)

## Recommended sources

- https://www.pexels.com/search/videos/travel/
- https://coverr.co/s/travel
- https://mixkit.co/free-stock-video/travel/

## Compress command (ffmpeg)

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -vf "scale=1920:-2" -an hero-1.mp4
```

If clips are missing, `HeroV2.tsx` falls back to the image slideshow automatically.
