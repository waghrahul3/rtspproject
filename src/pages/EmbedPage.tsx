import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { Eye, Loader2, SearchX } from "lucide-react";
import { api } from "../convex/_generated/api";
import CameraFeed from "@/components/site/CameraFeed";
import { CopyButton } from "@/components/site/shared";
import { formatNumber } from "@/lib/utils";

export default function EmbedPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const broadcast = useQuery(api.broadcasts.getByPublicId, {
    publicId: publicId ?? "",
  });
  const recordView = useMutation(api.broadcasts.recordView);

  useEffect(() => {
    if (broadcast && broadcast.status === "online" && publicId) {
      recordView({ publicId });
    }
  }, [broadcast, publicId, recordView]);

  const shareUrl = `${window.location.origin}/embed/${publicId}/`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#020409] px-4 py-10">
      <div className="w-full max-w-3xl">
        {broadcast === undefined ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : broadcast === null ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-8 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-secondary">
              <SearchX className="size-7 text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold">Broadcast not found</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This stream doesn't exist or was removed.
              </p>
            </div>
            <Link
              to="/"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              ← Go to rtsp.me
            </Link>
          </div>
        ) : (
          <>
            <div className="corner-frame overflow-hidden rounded-xl">
              <CameraFeed
                title={broadcast.name || broadcast.publicId}
                status={broadcast.status}
                hlsUrl={broadcast.hlsUrl}
                views={broadcast.views}
                className="aspect-[4/3] w-full"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-semibold text-foreground">
                  {broadcast.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{broadcast.publicId}</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-3.5 text-primary" />
                    {formatNumber(broadcast.views)} views
                  </span>
                  {broadcast.description && (
                    <span className="truncate">{broadcast.description}</span>
                  )}
                </div>
              </div>
              <CopyButton text={shareUrl} label="Copy link" />
            </div>

            <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/60">
              powered by{" "}
              <Link to="/" className="text-primary/80 hover:text-primary">
                rtsp.me
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
