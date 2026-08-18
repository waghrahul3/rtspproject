import { supabase, isSupabaseConfigured } from "./supabase";
import { isStreamsConfigured, provisionStream, removeStream } from "./streams";

export interface Broadcast {
  id: string;
  name: string;
  rtspUrl: string;
  hlsUrl: string | null;
  description: string | null;
  status: "online" | "offline";
  views: number;
  publicId: string;
  createdAt: string;
}

export interface PublicBroadcast {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  status: "online" | "offline";
  views: number;
  hlsUrl: string | null;
  createdAt: string;
}

const PUBLIC_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generatePublicId(length = 7): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PUBLIC_ID_ALPHABET[Math.floor(Math.random() * PUBLIC_ID_ALPHABET.length)];
  }
  return out;
}

function requireConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase isn't configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the API Keys panel.",
    );
  }
}

// --- row mapping ------------------------------------------------------------

function mapBroadcastRow(row: Record<string, unknown>): Broadcast {
  return {
    id: String(row.id),
    name: String(row.name),
    rtspUrl: String(row.rtsp_url),
    hlsUrl: row.hls_url ? String(row.hls_url) : null,
    description: row.description ? String(row.description) : null,
    status: row.status === "online" ? "online" : "offline",
    views: Number(row.views),
    publicId: String(row.public_id),
    createdAt: String(row.created_at),
  };
}

function mapPublicBroadcastRow(row: Record<string, unknown>): PublicBroadcast {
  return {
    id: String(row.id),
    publicId: String(row.public_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    status: row.status === "online" ? "online" : "offline",
    views: Number(row.views),
    hlsUrl: row.hls_url ? String(row.hls_url) : null,
    createdAt: String(row.created_at),
  };
}

// --- broadcasts --------------------------------------------------------------

export async function listMyBroadcasts(userId: string): Promise<Broadcast[]> {
  requireConfigured();
  const { data, error } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBroadcastRow);
}

export async function getPublicBroadcast(
  publicId: string,
): Promise<PublicBroadcast | null> {
  requireConfigured();
  const { data, error } = await supabase
    .from("public_broadcasts")
    .select("*")
    .eq("public_id", publicId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPublicBroadcastRow(data) : null;
}

export async function incrementBroadcastView(publicId: string): Promise<void> {
  requireConfigured();
  const { error } = await supabase.rpc("increment_broadcast_view", {
    p_public_id: publicId,
  });
  if (error) throw error;
}

export async function createBroadcast(input: {
  userId: string;
  name: string;
  rtspUrl: string;
  hlsUrl?: string;
  description?: string;
}): Promise<Broadcast> {
  requireConfigured();
  const name = input.name.trim();
  const rtspUrl = input.rtspUrl.trim();
  const hlsUrl = input.hlsUrl?.trim() || null;
  const description = input.description?.trim() || null;

  if (name.length < 2) throw new Error("Name must be at least 2 characters");
  if (!/^rtsps?:\/\//i.test(rtspUrl)) {
    throw new Error("RTSP link must start with rtsp:// or rtsps://");
  }
  if (hlsUrl && !/^https?:\/\//i.test(hlsUrl)) {
    throw new Error("HLS preview link must be a valid http(s) URL");
  }

  // Public ids are unique (DB index). On the rare collision, retry.
  for (let attempt = 0; attempt < 3; attempt++) {
    const publicId = generatePublicId();
    const { data, error } = await supabase
      .from("broadcasts")
      .insert({
        user_id: input.userId,
        name,
        rtsp_url: rtspUrl,
        hls_url: hlsUrl,
        description,
        status: "offline",
        views: 0,
        public_id: publicId,
      })
      .select("*")
      .single();
    if (!error) {
      const row = data as Record<string, unknown>;
      // Auto-HLS: if the streams service is configured, provision an HLS
      // stream for the RTSP URL and save the generated link.
      if (isStreamsConfigured && !row.hls_url) {
        const generated = await provisionStream(publicId, rtspUrl).catch(() => null);
        if (generated) {
          const { error: updateError } = await supabase
            .from("broadcasts")
            .update({ hls_url: generated })
            .eq("id", row.id);
          if (!updateError) row.hls_url = generated;
        }
      }
      return mapBroadcastRow(row);
    }
    if (error.code !== "23505") throw error;
  }
  throw new Error("Couldn't allocate a unique broadcast id — please try again");
}

export async function updateBroadcast(
  id: string,
  input: { name: string; rtspUrl: string; hlsUrl?: string; description?: string },
): Promise<void> {
  requireConfigured();
  const { error } = await supabase
    .from("broadcasts")
    .update({
      name: input.name.trim(),
      rtsp_url: input.rtspUrl.trim(),
      hls_url: input.hlsUrl?.trim() || null,
      description: input.description?.trim() || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function setBroadcastStatus(
  id: string,
  status: "online" | "offline",
): Promise<void> {
  requireConfigured();
  const { error } = await supabase
    .from("broadcasts")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteBroadcast(id: string, publicId?: string): Promise<void> {
  requireConfigured();
  const { error } = await supabase.from("broadcasts").delete().eq("id", id);
  if (error) throw error;
  if (publicId) await removeStream(publicId);
}

/** Live refresh: fires `onChange` whenever this user's broadcasts change. */
export function subscribeToBroadcastChanges(
  userId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`broadcasts-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "broadcasts", filter: `user_id=eq.${userId}` },
      onChange,
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// --- contact messages ---------------------------------------------------------

export async function sendContactMessage(input: {
  name: string;
  email: string;
  subject?: string;
  body: string;
}): Promise<void> {
  requireConfigured();
  const name = input.name.trim();
  const email = input.email.trim();
  const body = input.body.trim();

  if (name.length < 2) throw new Error("Please enter your name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address");
  }
  if (body.length < 10) {
    throw new Error("Message must be at least 10 characters");
  }

  const { error } = await supabase.from("messages").insert({
    name,
    email,
    subject: input.subject?.trim() || null,
    body,
  });
  if (error) throw error;
}

// --- demo seeding (fallback if the migration seed didn't run) ------------------

export async function seedDemoBroadcasts(userId: string): Promise<void> {
  requireConfigured();
  const existing = await listMyBroadcasts(userId);
  if (existing.length > 0) return;

  const demos = [
    {
      name: "Warehouse entrance",
      rtspUrl: "rtsp://admin:demo@8.8.8.8:554/Streaming/Channels/101",
      hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      description:
        "Demo stream — plays a real public HLS feed so you can test the player.",
      status: "online" as const,
      views: 12847,
    },
    {
      name: "Parking lot",
      rtspUrl: "rtsp://admin:demo@8.8.8.8:554/cam/realmonitor?channel=1&subtype=0",
      status: "offline" as const,
      views: 3412,
    },
    {
      name: "Front desk",
      rtspUrl: "rtsp://admin:demo@8.8.8.8:9784/cameras/0/streaming/main?audio=1",
      status: "offline" as const,
      views: 976,
    },
  ];

  for (const demo of demos) {
    const { error } = await supabase.from("broadcasts").insert({
      user_id: userId,
      name: demo.name,
      rtsp_url: demo.rtspUrl,
      hls_url: demo.hlsUrl ?? null,
      description: demo.description ?? null,
      status: demo.status,
      views: demo.views,
      public_id: generatePublicId(),
    });
    if (error) throw error;
  }
}
