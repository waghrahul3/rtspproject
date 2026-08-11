import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Camera,
  Copy,
  Eye,
  ExternalLink,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Radio,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  listMyBroadcasts,
  createBroadcast,
  updateBroadcast,
  setBroadcastStatus,
  deleteBroadcast,
  subscribeToBroadcastChanges,
  seedDemoBroadcasts,
  type Broadcast,
} from "@/lib/broadcasts";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { DEMO_EMAIL } from "@/lib/demo";
import { getStreamStatus, isStreamsConfigured } from "@/lib/streams";

function embedCode(publicId: string) {
  const origin = window.location.origin;
  return `<iframe src="${origin}/embed/${publicId}/" style="width:100%; aspect-ratio:4/3; border:0;" allow="fullscreen; autoplay" allowfullscreen></iframe>`;
}

function copyText(text: string, message: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(message))
    .catch(() => toast.error("Couldn't copy to clipboard"));
}

function BroadcastForm({
  open,
  onOpenChange,
  userId,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initial?: Broadcast;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      rtspUrl: String(data.get("rtspUrl") ?? ""),
      hlsUrl: String(data.get("hlsUrl") ?? ""),
      description: String(data.get("description") ?? ""),
    };

    setBusy(true);
    try {
      if (initial) {
        await updateBroadcast(initial.id, payload);
        toast.success("Broadcast updated");
      } else {
        const created = await createBroadcast({ userId, ...payload });
        toast.success("Broadcast created", {
          description:
            created.hlsUrl && isStreamsConfigured
              ? "HLS preview generated automatically — hit Go live to start streaming."
              : "Paste the embed code into your website to go live.",
        });
      }
      onOpenChange(false);
      form.reset();
      onSaved();
    } catch (err) {
      toast.error("Something went wrong", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit broadcast" : "New broadcast"}</DialogTitle>
          <DialogDescription>
            {isStreamsConfigured ? (
              <>
                Paste the RTSP link from your camera — the HLS preview link is
                generated automatically. Add one manually only to override it.
              </>
            ) : (
              <>
                Paste the RTSP link from your camera. Add an HLS link only if
                you want a live preview player on the public page.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Broadcast name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Warehouse entrance"
              defaultValue={initial?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rtspUrl">RTSP link</Label>
            <Input
              id="rtspUrl"
              name="rtspUrl"
              placeholder="rtsp://admin:pass@8.8.8.8:554/Streaming/Channels/101"
              defaultValue={initial?.rtspUrl}
              className="font-mono text-xs"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hlsUrl">
              HLS preview link <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="hlsUrl"
              name="hlsUrl"
              placeholder="https://…/stream.m3u8"
              defaultValue={initial?.hlsUrl ?? ""}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Where is this camera, what does it cover…"
              defaultValue={initial?.description ?? ""}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {initial ? "Save changes" : "Create broadcast"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StreamHealthChip({
  publicId,
  health,
  reachable,
}: {
  publicId: string;
  health: Record<string, boolean> | null;
  reachable: boolean | null;
}) {
  if (reachable === false) {
    return (
      <div className="mb-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="size-1.5 rounded-full bg-slate-500" />
        Stream service offline
      </div>
    );
  }
  const ready = health?.[publicId];
  if (ready === undefined) return null;
  return (
    <div className="mb-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
      {ready ? (
        <>
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-emerald-400">Stream connected</span>
        </>
      ) : (
        <>
          <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
          <span className="text-amber-400/90">Waiting for camera</span>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Per-broadcast stream health from the auto-HLS service (publicId -> ready).
  const [streamHealth, setStreamHealth] = useState<Record<string, boolean> | null>(null);
  const [streamsReachable, setStreamsReachable] = useState<boolean | null>(null);

  const userId = user?.id ?? null;

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Load the user's broadcasts; refetch when they change (CRUD + realtime).
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const rows = await listMyBroadcasts(userId);
        if (active) setBroadcasts(rows);
      } catch (err) {
        if (active) {
          toast.error("Couldn't load broadcasts", {
            description: err instanceof Error ? err.message : "Please try again.",
          });
          setBroadcasts([]);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  // Live updates via Supabase Realtime.
  useEffect(() => {
    if (!userId) return;
    return subscribeToBroadcastChanges(userId, refresh);
  }, [userId, refresh]);

  // Poll the streams service for per-broadcast health (only when configured).
  useEffect(() => {
    if (!isStreamsConfigured || !broadcasts || broadcasts.length === 0) {
      setStreamHealth(null);
      setStreamsReachable(null);
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    const poll = async () => {
      const results = await Promise.all(
        broadcasts.map((b) => getStreamStatus(b.publicId)),
      );
      if (!active) return;
      setStreamsReachable(results.some((r) => r !== null));
      const map: Record<string, boolean> = {};
      broadcasts.forEach((b, i) => {
        const r = results[i];
        if (r) map[b.publicId] = r.ready;
      });
      setStreamHealth(map);
    };
    poll();
    timer = setInterval(poll, 15_000);
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [isStreamsConfigured, broadcasts]);

  // First time the demo account opens the dashboard, seed sample broadcasts
  // (the migration usually does this — this is the fallback).
  useEffect(() => {
    if (user?.email === DEMO_EMAIL && userId && broadcasts && broadcasts.length === 0) {
      seedDemoBroadcasts(userId)
        .then(refresh)
        .catch(() => {
          /* retry on next mount if it fails */
        });
    }
  }, [user, userId, broadcasts, refresh]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Broadcast | null>(null);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const loading = broadcasts === null;
  const list = broadcasts ?? [];
  const onlineCount = list.filter((b) => b.status === "online").length;
  const totalViews = list.reduce((acc, b) => acc + b.views, 0);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleStatus = async (id: string, current: "online" | "offline") => {
    const next = current === "online" ? "offline" : "online";
    try {
      await setBroadcastStatus(id, next);
      toast.success(next === "online" ? "Broadcast is now online" : "Broadcast paused");
    } catch {
      toast.error("Couldn't update the broadcast");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 glass">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
              <span className="size-2.5 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(187_95%_55%/0.6)]" />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 animate-blink rounded-full bg-red-500" />
            </span>
            <span className="font-display text-lg font-bold">
              rtsp<span className="text-primary">.me</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user.email && (
              <span className="hidden max-w-[220px] truncate font-mono text-xs text-muted-foreground md:block">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {/* heading + stats */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {isStreamsConfigured && (
              <span
                className={cn(
                  "mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest",
                  streamsReachable === false
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-primary/30 bg-primary/10 text-primary",
                )}
              >
                <Sparkles className="size-3" />
                {streamsReachable === false ? "Auto-HLS · service offline" : "Auto-HLS on"}
              </span>
            )}
            <h1 className="font-display text-3xl font-bold tracking-tight">
              My broadcasts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Loading…"
                : `${list.length} camera${list.length === 1 ? "" : "s"} · ${onlineCount} online · ${formatNumber(totalViews)} total views`}
            </p>
          </div>
          <div className="flex gap-3">
            <BroadcastForm
              open={formOpen}
              onOpenChange={setFormOpen}
              userId={user.id}
              onSaved={refresh}
            />
            {editing && (
              <BroadcastForm
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                userId={user.id}
                initial={editing}
                onSaved={refresh}
              />
            )}
            <Button onClick={() => setFormOpen(true)}>
              <Plus />
              New broadcast
            </Button>
          </div>
        </div>

        {/* stats strip */}
        <div className="mb-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border/60">
          {[
            { label: "Cameras", value: loading ? "—" : String(list.length), icon: Video },
            { label: "Online", value: loading ? "—" : String(onlineCount), icon: Radio },
            { label: "Views", value: loading ? "—" : formatNumber(totalViews), icon: Eye },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-card px-5 py-5">
              <s.icon className="size-5 text-primary" />
              <div>
                <div className="font-display text-xl font-bold leading-none">{s.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* broadcasts */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
              <Camera className="size-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">No broadcasts yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                {isStreamsConfigured
                  ? "Paste an RTSP link from your camera — the HLS preview is generated automatically and you'll get the embed code right away."
                  : "Paste an RTSP link from your camera and you'll get the embed code for your website right away."}
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus />
              Create broadcast
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((b) => (
              <div
                key={b.id}
                className="card-hover group flex flex-col rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold">{b.name}</h3>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {b.publicId} · {timeAgo(new Date(b.createdAt).getTime())}
                    </p>
                  </div>
                  <Badge variant={b.status === "online" ? "success" : "secondary"}>
                    <span
                      className={
                        b.status === "online"
                          ? "size-1.5 rounded-full bg-emerald-400"
                          : "size-1.5 rounded-full bg-slate-500"
                      }
                    />
                    {b.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>

                <div className="mb-4 truncate rounded-md border border-border/70 bg-[#070b12] px-3 py-2 font-mono text-[11px] text-cyan-200/70">
                  {b.rtspUrl}
                </div>

                {b.hlsUrl && (
                  <div className="mb-4 flex items-center gap-2 rounded-md border border-border/70 bg-[#070b12] px-3 py-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-emerald-300/70">
                      {b.hlsUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(b.hlsUrl ?? "", "HLS link copied")}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                      title="Copy HLS link"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                )}

                {isStreamsConfigured && b.hlsUrl && (
                  <StreamHealthChip
                    publicId={b.publicId}
                    health={streamHealth}
                    reachable={streamsReachable}
                  />
                )}

                <div className="mb-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-3.5 text-primary" />
                    {formatNumber(b.views)} views
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={b.status === "online" ? "outline" : "default"}
                    onClick={() => toggleStatus(b.id, b.status)}
                  >
                    {b.status === "online" ? <PowerOff /> : <Power />}
                    {b.status === "online" ? "Pause" : "Go live"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(embedCode(b.publicId), "Embed code copied")}
                  >
                    <Copy />
                    Embed
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/embed/${b.publicId}`} target="_blank">
                      <ExternalLink />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(b)}>
                    <Pencil />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete broadcast?</AlertDialogTitle>
                        <AlertDialogDescription>
                          “{b.name}” will be removed and its embed code will stop
                          working. This can't be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={async () => {
                            try {
                              await deleteBroadcast(b.id, b.publicId);
                              toast.success("Broadcast deleted");
                            } catch {
                              toast.error("Couldn't delete the broadcast");
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
