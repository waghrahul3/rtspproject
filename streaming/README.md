# Local RTSP → HLS streaming

The app plays **HLS** in the browser (hls.js). RTSP cannot play in a browser, so
something must pull your cameras' RTSP streams and republish them as HLS. This
folder sets that up **locally** with [Mediamtx](https://github.com/bluenviron/mediamtx)
(open source, single binary, free) — and a small **auto-provisioning service**
(`streams/server.ts`) that makes the HLS link appear automatically: paste an
RTSP URL into a broadcast, and the generated `.m3u8` is saved for you.

## One-command stack (Docker, recommended)

The whole streaming environment — Mediamtx **and** the auto-HLS service, wired
together — runs with a single command:

```bash
cd streaming
docker compose up -d
```

Then tell the app where the service lives (API Keys panel or `.env.local`):

```
VITE_STREAMS_API_URL=http://localhost:4000
```

Done. Create a broadcast with just an RTSP link and the HLS URL is generated
and saved automatically. To make the generated links play on the HTTPS preview
site, restart with your public base URL (see gotcha a):

```bash
HLS_BASE_URL=https://hls.yourdomain.com docker compose up -d
```

> **Verified against a real Mediamtx v1.20.0 instance** (not just mocks): the
> full lifecycle — add path → source update (patch) → status → delete — works
> against the actual Mediamtx HTTP API, and Mediamtx serves a real 1080p HLS
> master playlist. Note: `ready` only flips to `true` when Mediamtx can reach
> the camera — the sandbox where this was tested blocks outbound RTSP, so it
> stays `false` there but goes live on your network automatically.

## Automatic mode (no Docker)

Run Mediamtx (below) **and** the streams service, then set
`VITE_STREAMS_API_URL` as above:

```bash
bun streams            # streams/server.ts — default port 4000
```

Settings (env vars for `bun streams`):

| Var | Default | Meaning |
|---|---|---|
| `MEDIAMTX_URL` | `http://127.0.0.1:9997` | Mediamtx HTTP API (must match `apiAddress` in `mediamtx.yml`) |
| `HLS_BASE_URL` | `http://localhost:8888` | Public base of the HLS playlists — set your HTTPS tunnel/domain here for the preview link |
| `PORT` | `4000` | Port the streams service listens on |

If `VITE_STREAMS_API_URL` is unset, nothing changes — the HLS field stays a
manual, optional input (current behavior).

## Manual mode

If you'd rather enter HLS URLs by hand, skip the streams service and just run
Mediamtx:

## Install Mediamtx

- **Linux/macOS/Windows**: download the binary from the
  [releases page](https://github.com/bluenviron/mediamtx/releases)
  (e.g. `mediamtx_v1.x.x_linux_amd64.tar.gz`), extract it, and put
  `mediamtx` next to `mediamtx.yml` from this folder.
- **Docker**: `docker run --rm -it -p 8888:8888 -p 9997:9997 -v $PWD/streaming/mediamtx.yml:/mediamtx.yml bluenviron/mediamtx`

## Configure cameras (manual mode only)

Automatic mode creates camera paths itself, so you can skip this. Manual mode:

Edit `mediamtx.yml`:

```yaml
paths:
  cam1:
    source: rtsp://user:pass@192.168.1.100:554/Streaming/Channels/101
```

Save, then start Mediamtx (`./mediamtx`). Each camera is now available as:

```
http://<host>:8888/cam1/index.m3u8
```

## Wire it into the app (manual mode)

1. Open the dashboard, edit a broadcast (or create one).
2. Paste the HLS URL into **HLS preview link**, e.g. `http://localhost:8888/cam1/index.m3u8`.
3. Click **Go live** → the embed page plays the camera.

Verify the stream is up: `curl http://localhost:8888/cam1/index.m3u8` should print an `#EXTM3U` playlist.

## The two gotchas (read before going further)

### a) Mixed content — HTTPS pages block `http://` HLS

The app's preview/production pages are served over **HTTPS**. Browsers block an
`http://…m3u8` fetched from an HTTPS page. Two ways around it:

- **Local dev only:** browse the app via `http://localhost:5173` (the Vite dev
  server, not the HTTPS preview tunnel) and use `http://localhost:8888/...` — HTTP
  → HTTP is fine.
- **Anywhere else (preview link, real site):** serve HLS over HTTPS. Easiest:
  put Mediamtx behind [Caddy](https://caddyserver.com), which issues a free
  Let's Encrypt certificate automatically:

  ```caddyfile
  hls.yourdomain.com {
      reverse_proxy localhost:8888
  }
  ```

  Then use `https://hls.yourdomain.com/cam1/index.m3u8`.

  No domain? Use a free tunnel: `cloudflared tunnel --url http://localhost:8888`
  gives you a `https://…trycloudflare.com` URL (new one each run).

### b) CORS — the browser must be allowed to read the playlist

hls.js runs in the visitor's browser, on a different origin than your HLS
server. The HLS server must answer with `Access-Control-Allow-Origin: *`.
Mediamtx does this by default; if you reverse-proxy it (Caddy/nginx), make sure
the header is forwarded or added there.

## ffmpeg alternative (if you'd rather not run Mediamtx)

```bash
ffmpeg -re -rtsp_transport tcp \
  -i "rtsp://user:pass@192.168.1.100:554/Streaming/Channels/101" \
  -c:v copy -c:a aac -f hls -hls_time 2 -hls_list_size 6 -hls_flags delete_segments \
  -hls_segment_filename "hls/cam1_%05d.ts" "hls/cam1/index.m3u8"
```

Serve the `hls/` folder with any static server **that sends CORS headers**
(nginx `add_header Access-Control-Allow-Origin *;`, or Caddy's default which
allows it). Plain `python3 -m http.server` will NOT work for browser playback —
no CORS headers.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `curl` of the `.m3u8` returns 404 | Wrong path name — check `paths:` keys in `mediamtx.yml` |
| Camera connects but no video | Use TCP: keep `rtspTransports: [tcp]`; try `rtsps://` if the camera supports it |
| Plays locally but blank on the preview link | Mixed content — serve HLS over HTTPS (gotcha a) |
| hls.js error `CORS policy` in console | Add `Access-Control-Allow-Origin: *` on the HLS server/proxy (gotcha b) |
| Auto-provisioning returns `ready: false` | Mediamtx can't reach the camera — check the RTSP URL and that the camera is reachable from the machine running Mediamtx (not from your laptop) |
| Dashboard doesn't show the generated HLS link | `VITE_STREAMS_API_URL` isn't set or the service isn't reachable from the browser — set it and confirm `curl http://localhost:4000/health` returns `{"ok":true}` |
