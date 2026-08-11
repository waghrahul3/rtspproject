/**
 * Smoke test for the auto-HLS provisioning service (streams/server.ts).
 *
 * Runs an in-process mock of the Mediamtx HTTP API, boots the REAL streams
 * service against it, and asserts the whole API surface:
 *   - POST   /streams        provision + re-provision (conflict -> patch)
 *   - GET    /streams/:id    ready / not-ready
 *   - DELETE /streams/:id    incl. idempotent re-delete
 *   - validation errors (missing publicId, bad publicId, non-RTSP source)
 *   - /health, unknown route, CORS preflight
 *
 * Optional live-DB leg — exercises the exact steps the dashboard's
 * createBroadcast flow performs, against a real Supabase project:
 *   bun streams/smoke-test.ts --supabase-url <url> --anon-key <anon>
 * It signs in as the demo user, inserts a throwaway broadcast, provisions a
 * stream through the running service, verifies the generated HLS link is
 * saved on the row, then removes the stream and the row again.
 */

const MOCK_PORT = 19997;
const SERVICE_PORT = 14000;
const HLS_BASE = "http://localhost:8888"; // same default the service uses

// --- tiny assert harness -----------------------------------------------------
let failures = 0;
const results: Array<{ ok: boolean; name: string; detail?: string }> = [];
function check(name: string, cond: boolean, detail?: string) {
  results.push({ ok: cond, name, detail });
  if (!cond) failures++;
}

// --- mock Mediamtx HTTP API --------------------------------------------------
const paths = new Map<string, { source: string }>();
const ops: string[] = [];

const mock = Bun.serve({
  port: MOCK_PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      /* no body */
    }

    // The real Mediamtx API is REST-style: name in the URL, JSON body = {source}.
    // (mirrors api/openapi.yaml in the mediamtx repo)
    if (req.method === "POST" && url.pathname.startsWith("/v3/config/paths/add/")) {
      const name = url.pathname.split("/").pop() ?? "";
      ops.push(`add:${name}`);
      if (paths.has(name)) {
        return Response.json({ error: "path already exists" }, { status: 400 });
      }
      paths.set(name, { source: String(body.source ?? "") });
      return Response.json({});
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/v3/config/paths/patch/")) {
      const name = url.pathname.split("/").pop() ?? "";
      ops.push(`patch:${name}`);
      if (!paths.has(name)) {
        return Response.json({ error: "path not found" }, { status: 404 });
      }
      paths.set(name, { source: String(body.source ?? "") });
      return Response.json({});
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/v3/config/paths/delete/")) {
      const name = url.pathname.split("/").pop() ?? "";
      ops.push(`delete:${name}`);
      if (!paths.has(name)) {
        return Response.json({ error: "path not found" }, { status: 404 });
      }
      paths.delete(name);
      return Response.json({});
    }

    if (req.method === "GET" && url.pathname === "/v3/paths/list") {
      // real Mediamtx returns { itemCount, pageCount, items: [...] }
      const items = [...paths.entries()].map(([name, p]) => ({
        name,
        ready: true,
        source: p.source,
      }));
      return Response.json({ itemCount: items.length, pageCount: 1, items });
    }

    return Response.json({ error: "not found" }, { status: 404 });
  },
});

// --- boot the REAL service against the mock ----------------------------------
process.env.MEDIAMTX_URL = `http://127.0.0.1:${MOCK_PORT}`;
process.env.HLS_BASE_URL = HLS_BASE;
process.env.PORT = String(SERVICE_PORT);
await import("./server.ts");

const base = `http://127.0.0.1:${SERVICE_PORT}`;
const hlsFor = (id: string) => `${HLS_BASE}/${id}/index.m3u8`;
const jsonReq = (path: string, init: RequestInit = {}) =>
  fetch(`${base}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });

console.log("=== service API (mock Mediamtx) ===");

// /health
let r = await fetch(`${base}/health`);
check(
  "GET /health",
  r.status === 200 && ((await r.json()) as { ok?: boolean }).ok === true,
  String(r.status),
);

// provision
r = await jsonReq("/streams", {
  method: "POST",
  body: JSON.stringify({
    publicId: "SMOKE1",
    rtspUrl: "rtsp://admin:pass@192.168.1.10:554/Streaming/Channels/101",
  }),
});
const prov = (await r.json()) as { hlsUrl?: string; ready?: boolean };
check(
  "POST /streams provisions a stream",
  r.status === 200 && prov.hlsUrl === hlsFor("SMOKE1") && prov.ready === true,
  JSON.stringify(prov),
);
check("mock received add:SMOKE1", ops.includes("add:SMOKE1"));

// same publicId again -> upsert should patch, not fail
r = await jsonReq("/streams", {
  method: "POST",
  body: JSON.stringify({
    publicId: "SMOKE1",
    rtspUrl: "rtsp://admin:pass@192.168.1.10:554/Streaming/Channels/102",
  }),
});
check("POST /streams re-provision patches existing path", r.status === 200, String(r.status));
check("mock received patch:SMOKE1", ops.includes("patch:SMOKE1"));

// validation
r = await jsonReq("/streams", {
  method: "POST",
  body: JSON.stringify({ rtspUrl: "rtsp://x/y" }),
});
check("POST /streams rejects missing publicId", r.status === 400, String(r.status));

r = await jsonReq("/streams", {
  method: "POST",
  body: JSON.stringify({ publicId: "bad id!", rtspUrl: "rtsp://x/y" }),
});
check("POST /streams rejects invalid publicId", r.status === 400, String(r.status));

r = await jsonReq("/streams", {
  method: "POST",
  body: JSON.stringify({ publicId: "SMOKE2", rtspUrl: "https://example.com/x.m3u8" }),
});
check("POST /streams rejects non-RTSP source", r.status === 400, String(r.status));

// get
r = await fetch(`${base}/streams/SMOKE1`);
const got = (await r.json()) as { ready?: boolean; hlsUrl?: string };
check(
  "GET /streams/SMOKE1 reports ready + hlsUrl",
  r.status === 200 && got.ready === true && got.hlsUrl === hlsFor("SMOKE1"),
  JSON.stringify(got),
);

r = await fetch(`${base}/streams/UNKNOWN`);
const unk = (await r.json()) as { ready?: boolean };
check("GET /streams/UNKNOWN reports not ready", r.status === 200 && unk.ready === false, JSON.stringify(unk));

// delete + idempotent delete
r = await fetch(`${base}/streams/SMOKE1`, { method: "DELETE" });
check("DELETE /streams/SMOKE1", r.status === 204, String(r.status));
check("mock received delete:SMOKE1", ops.includes("delete:SMOKE1"));

r = await fetch(`${base}/streams/SMOKE1`, { method: "DELETE" });
check("DELETE again is idempotent", r.status === 204, String(r.status));

// unknown route + CORS preflight
r = await fetch(`${base}/nope`);
check("unknown route -> 404", r.status === 404, String(r.status));

r = await fetch(`${base}/streams`, { method: "OPTIONS" });
check(
  "OPTIONS preflight has CORS headers",
  r.status === 204 && r.headers.get("access-control-allow-origin") === "*",
  `status=${r.status} acao=${r.headers.get("access-control-allow-origin")}`,
);

// --- optional live-DB leg (real Supabase, same flow as the dashboard) --------
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const supabaseUrl = arg("--supabase-url");
const anonKey = arg("--anon-key");

if (supabaseUrl && anonKey) {
  console.log("\n=== live Supabase leg (dashboard createBroadcast flow) ===");
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(supabaseUrl, anonKey);

  const { data: signIn, error: signInError } = await sb.auth.signInWithPassword({
    email: "demo@rtsp.me",
    password: "demo123456",
  });
  check("demo sign-in", !signInError && !!signIn.session, signInError?.message);
  if (signInError) {
    failures++;
    printResults();
    process.exit(1);
  }
  const userId = signIn!.user!.id;

  const publicId = "SMOKETEST" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const rtspUrl = "rtsp://admin:demo@10.0.0.55:554/Streaming/Channels/101";
  console.log(`  broadcast public_id: ${publicId}`);

  const { data: row, error: insertError } = await sb
    .from("broadcasts")
    .insert({
      user_id: userId,
      name: "SMOKE TEST",
      rtsp_url: rtspUrl,
      hls_url: null,
      description: "auto-HLS smoke test — removed after the test",
      status: "offline",
      views: 0,
      public_id: publicId,
    })
    .select("*")
    .single();
  check("insert broadcast", !insertError && !!row, insertError?.message);
  if (insertError) {
    failures++;
    printResults();
    process.exit(1);
  }

  // the exact call src/lib/streams.ts makes
  const pr = await jsonReq("/streams", {
    method: "POST",
    body: JSON.stringify({ publicId, rtspUrl }),
  });
  const provData = (await pr.json()) as { hlsUrl?: string };
  check("provision stream for the broadcast", pr.status === 200 && !!provData.hlsUrl, JSON.stringify(provData));

  if (provData.hlsUrl) {
    const { error: updErr } = await sb
      .from("broadcasts")
      .update({ hls_url: provData.hlsUrl })
      .eq("id", row!.id);
    check("save generated HLS link on the broadcast", !updErr, updErr?.message);
  }

  const { data: readBack } = await sb
    .from("broadcasts")
    .select("hls_url")
    .eq("id", row!.id)
    .single();
  check("broadcast now carries the auto-generated hls_url", readBack?.hls_url === hlsFor(publicId), JSON.stringify(readBack));

  // cleanup: remove stream + row
  await fetch(`${base}/streams/${publicId}`, { method: "DELETE" });
  await sb.from("broadcasts").delete().eq("id", row!.id);
  const { data: gone } = await sb.from("broadcasts").select("id").eq("id", row!.id).maybeSingle();
  check("cleanup removed the broadcast row", !gone);
  check("mock received delete for cleanup", ops.includes(`delete:${publicId}`));
  console.log(`  cleaned up broadcast ${publicId}`);
}

// --- report ---------------------------------------------------------------
function printResults() {
  let passed = 0;
  for (const res of results) {
    if (res.ok) passed++;
    console.log(`${res.ok ? "PASS" : "FAIL"}  ${res.name}${res.detail ? `  (${res.detail})` : ""}`);
  }
  console.log(`\n${passed}/${results.length} checks passed`);
}
printResults();

mock.stop(true);
process.exit(failures === 0 ? 0 : 1);
