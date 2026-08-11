/**
 * Auto-HLS provisioning service.
 *
 * Turns an RTSP URL into a public HLS playback URL automatically by talking to
 * Mediamtx's HTTP API. Run this next to Mediamtx (see streaming/README.md) on
 * any always-on machine (your dev box, a Raspberry Pi, or a small VPS).
 *
 * Endpoints:
 *   POST   /streams          body { publicId, rtspUrl } -> { hlsUrl, ready }
 *   GET    /streams/:id                                 -> { publicId, ready, hlsUrl }
 *   DELETE /streams/:id                                 -> 204
 *   GET    /health                                      -> { ok: true }
 *
 * Env vars:
 *   MEDIAMTX_URL   Mediamtx API base   (default http://127.0.0.1:9997)
 *   HLS_BASE_URL   Public base for HLS (default http://localhost:8888)
 *                  -> use your HTTPS tunnel/domain here for the public preview
 *   PORT           Listen port         (default 4000)
 */

const mediamtxUrl = process.env.MEDIAMTX_URL ?? "http://127.0.0.1:9997";
const hlsBaseUrl = (process.env.HLS_BASE_URL ?? "http://localhost:8888").replace(/\/+$/, "");
const port = Number(process.env.PORT ?? 4000);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

function badRequest(message: string) {
  return json(400, { error: message });
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Call the Mediamtx API and throw a descriptive error on failure. */
async function mediamtx(path: string, method: string, body?: unknown) {
  const res = await fetch(`${mediamtxUrl}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 200);
    throw new Error(`Mediamtx ${method} ${path}: ${res.status} ${text}`);
  }
  return res;
}

/** Add a Mediamtx path for a camera; if it already exists, update its source. */
async function upsertPath(name: string, source: string) {
  try {
    await mediamtx(`/v3/config/paths/add/${name}`, "POST", { source });
  } catch (err) {
    // Path already exists (or any other conflict) -> patch the source instead.
    if (String(err).includes("400")) {
      await mediamtx(`/v3/config/paths/patch/${name}`, "PATCH", { source });
    } else {
      throw err;
    }
  }
}

async function deletePath(name: string) {
  await mediamtx(`/v3/config/paths/delete/${name}`, "DELETE");
}

async function pathReady(name: string): Promise<boolean> {
  try {
    const res = await mediamtx("/v3/paths/list", "GET");
    // Real Mediamtx returns { itemCount, pageCount, items: [...] }.
    const data = (await res.json()) as
      | Array<{ name: string; ready?: boolean }>
      | { items?: Array<{ name: string; ready?: boolean }> };
    const items = Array.isArray(data) ? data : (data.items ?? []);
    return items.some((p) => p.name === name && p.ready === true);
  } catch {
    return false;
  }
}

const hlsUrlFor = (name: string) => `${hlsBaseUrl}/${name}/index.m3u8`;

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (req.method === "GET" && path === "/health") {
      return json(200, { ok: true });
    }

    // POST /streams  { publicId, rtspUrl }
    if (req.method === "POST" && path === "/streams") {
      const body = await readBody(req);
      const name = String(body?.publicId ?? "").trim();
      const source = String(body?.rtspUrl ?? "").trim();
      if (!name || !/^[A-Za-z0-9_-]+$/.test(name)) {
        return badRequest("publicId is required (alphanumeric)");
      }
      if (!/^rtsps?:\/\//i.test(source)) {
        return badRequest("rtspUrl must start with rtsp:// or rtsps://");
      }
      try {
        await upsertPath(name, source);
        return json(200, { publicId: name, hlsUrl: hlsUrlFor(name), ready: await pathReady(name) });
      } catch (err) {
        return json(502, { error: err instanceof Error ? err.message : "failed to provision stream" });
      }
    }

    // GET /streams/:id
    const getMatch = path.match(/^\/streams\/([A-Za-z0-9_-]+)$/);
    if (req.method === "GET" && getMatch) {
      const name = getMatch[1];
      return json(200, { publicId: name, hlsUrl: hlsUrlFor(name), ready: await pathReady(name) });
    }

    // DELETE /streams/:id
    const delMatch = path.match(/^\/streams\/([A-Za-z0-9_-]+)$/);
    if (req.method === "DELETE" && delMatch) {
      try {
        await deletePath(delMatch[1]);
      } catch (err) {
        // Removing a path that doesn't exist is fine.
        if (!String(err).includes("404") && !String(err).includes("400")) {
          return json(502, { error: err instanceof Error ? err.message : "failed to remove stream" });
        }
      }
      return new Response(null, { status: 204, headers: CORS });
    }

    return json(404, { error: "not found" });
  },
});

console.log(`streams service listening on :${port} (Mediamtx: ${mediamtxUrl}, HLS: ${hlsBaseUrl})`);
