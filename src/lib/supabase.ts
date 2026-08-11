import { createClient } from "@supabase/supabase-js";

// In the Keys/API keys UI, set:
//   VITE_SUPABASE_URL     — https://<project-ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY — the project's anon/public key
// For local development, point VITE_SUPABASE_URL at http://127.0.0.1:54321
// and use the anon key printed by `supabase status`.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder-anon-key",
);
