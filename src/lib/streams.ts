// Client for the auto-HLS provisioning service (streams/server.ts).
// When VITE_STREAMS_API_URL is set, creating a broadcast automatically
// provisions an HLS stream for its RTSP URL and saves the generated link.
// When it's not set (default), everything behaves exactly as before — the
// HLS preview link is optional and entered manually.

const apiUrl = import.meta.env.VITE_STREAMS_API_URL as string | undefined;

export const isStreamsConfigured = Boolean(apiUrl);

export async function provisionStream(
  publicId: string,
  rtspUrl: string,
): Promise<string | null> {
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/streams`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId, rtspUrl }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { hlsUrl?: string };
    return typeof data.hlsUrl === "string" ? data.hlsUrl : null;
  } catch {
    return null;
  }
}

export interface StreamStatus {
  ready: boolean;
  hlsUrl: string | null;
}

/** Live health of a broadcast's stream on the Mediamtx side (ready = camera connected). */
export async function getStreamStatus(publicId: string): Promise<StreamStatus | null> {
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/streams/${publicId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { ready?: boolean; hlsUrl?: string | null };
    return { ready: data.ready === true, hlsUrl: data.hlsUrl ?? null };
  } catch {
    return null;
  }
}

export async function removeStream(publicId: string): Promise<void> {
  if (!apiUrl) return;
  try {
    await fetch(`${apiUrl}/streams/${publicId}`, { method: "DELETE" });
  } catch {
    // best-effort: leaving the stream on Mediamtx is harmless
  }
}
