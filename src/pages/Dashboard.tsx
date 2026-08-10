import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
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
  Trash2,
  Video,
} from "lucide-react";
import { api } from "../convex/_generated/api";
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
import { formatNumber, timeAgo } from "@/lib/utils";

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
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: {
    _id: string;
    name: string;
    rtspUrl: string;
    hlsUrl?: string;
    description?: string;
  };
}) {
  const create = useMutation(api.broadcasts.create);
  const update = useMutation(api.broadcasts.update);
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
        await update({ id: initial._id as never, ...payload });
        toast.success("Broadcast updated");
      } else {
        await create(payload);
        toast.success("Broadcast created", {
          description: "Paste the embed code into your website to go live.",
        });
      }
      onOpenChange(false);
      form.reset();
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
            Paste the RTSP link from your camera. Add an HLS link only if you
            want a live preview player on the public page.
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
              defaultValue={initial?.hlsUrl}
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
              defaultValue={initial?.description}
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const user = useQuery(api.users.viewer);
  const broadcasts = useQuery(api.broadcasts.listMine);
  const setStatus = useMutation(api.broadcasts.setStatus);
  const remove = useMutation(api.broadcasts.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{
    _id: string;
    name: string;
    rtspUrl: string;
    hlsUrl?: string;
    description?: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const loading = broadcasts === undefined || user === undefined;
  const list = broadcasts ?? [];
  const onlineCount = list.filter((b) => b.status === "online").length;
  const totalViews = list.reduce((acc, b) => acc + b.views, 0);

  const onSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleStatus = async (id: string, current: "online" | "offline") => {
    try {
      await setStatus({ id: id as never, status: current === "online" ? "offline" : "online" });
      toast.success(current === "online" ? "Broadcast paused" : "Broadcast is now online");
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
            {user?.email && (
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
            <BroadcastForm open={formOpen} onOpenChange={setFormOpen} />
            {editing && (
              <BroadcastForm
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                initial={editing}
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
                Create your first broadcast by pasting an RTSP link — you'll get
                the embed code for your website right away.
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
                key={b._id}
                className="card-hover group flex flex-col rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold">{b.name}</h3>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {b.publicId} · {timeAgo(b.createdAt)}
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
                    onClick={() => toggleStatus(b._id, b.status)}
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
                              await remove({ id: b._id as never });
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
