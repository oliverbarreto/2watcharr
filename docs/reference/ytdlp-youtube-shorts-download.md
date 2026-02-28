# Can yt-dlp download youtube shorts?

✅ Yes — yt-dlp library can download YouTube Shorts without any special workaround.

YouTube Shorts are just regular YouTube videos hosted at a different URL format (`/shorts/VIDEO_ID`), and yt-dlp automatically handles them.

## Examples

✅ Example: Download a YouTube Short
```
yt-dlp https://www.youtube.com/shorts/VIDEO_ID
```
or
```
yt-dlp https://youtu.be/VIDEO_ID
```
Both work the same.

🎯 Download in Best Quality
```
yt-dlp -f bestvideo+bestaudio https://www.youtube.com/shorts/VIDEO_ID
```
🎵 Download Audio Only

```
yt-dlp -x --audio-format mp3 https://www.youtube.com/shorts/VIDEO_ID
````

📂 Download via Python (yt-dlp library)
```python
from yt_dlp import YoutubeDL

url = "https://www.youtube.com/shorts/VIDEO_ID"

ydl_opts = {
    'format': 'best',
    'outtmpl': '%(title)s.%(ext)s'
}

with YoutubeDL(ydl_opts) as ydl:
    ydl.download([url])
```

## ⚠️ Notes
- Works exactly like normal YouTube videos.
- No special Shorts flag required.
- If the Short is age-restricted or region-locked, you may need cookies.

- If you'd like, I can also show:
    - How to download an entire Shorts playlist
    - How to auto-detect and batch download Shorts from a channel
    How to embed it in a backend API
