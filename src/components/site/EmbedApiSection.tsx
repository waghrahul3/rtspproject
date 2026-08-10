import { FileCode2, KeyRound, Link2, Radio } from "lucide-react";
import CameraFeed from "@/components/site/CameraFeed";
import { CopyButton, Reveal, SectionHeading } from "@/components/site/shared";

const EMBED_CODE = `<iframe src="https://rtsp.me/embed/474NtQT5/" style="width:100%; aspect-ratio:4/3; border:0;" allow="fullscreen; autoplay" allowfullscreen></iframe>`;

const SHARE_LINK = "https://rtsp.me/embed/474NtQT5/";

const PHP_CODE = `<?php
// rtsp.me API client — PHP example
$data = [
  'email'    => 'you@example.com',
  'password' => '••••••••',
  'id'       => '474NtQT5', // omit to list all cameras
];

$ch = curl_init('https://rtsp.me/api/');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`;

const API_PARAMS = [
  { name: "email", type: "string", note: "current email" },
  { name: "password", type: "string", note: "current password" },
  { name: "id", type: "string", note: "unique broadcast ID · optional — omitting it lists all cameras" },
];

export default function EmbedApiSection() {
  return (
    <section id="api" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="How to watch"
          title={
            <>
              Add broadcasting to{" "}
              <span className="text-gradient">your platform</span>
            </>
          }
          description="After creating a broadcast you get the player code. Embed it anywhere — or go further and build your own access control with our API."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* embed */}
          <Reveal>
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <FileCode2 className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">HTML5 player</h3>
                  <p className="text-xs text-muted-foreground">
                    One iframe — works on every modern browser
                  </p>
                </div>
              </div>

              <div className="code-block relative mb-4 flex-1">
                <pre className="overflow-x-auto whitespace-pre-wrap">{EMBED_CODE}</pre>
                <div className="absolute right-3 top-3">
                  <CopyButton text={EMBED_CODE} />
                </div>
              </div>

              <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-[#070b12] px-4 py-3">
                <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Link2 className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{SHARE_LINK}</span>
                </span>
                <CopyButton text={SHARE_LINK} label="Copy link" />
              </div>

              <div className="corner-frame overflow-hidden rounded-lg">
                <CameraFeed
                  title="474NtQT5"
                  status="online"
                  views={12847}
                  className="aspect-[4/3] w-full"
                />
              </div>
              <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                powered by rtsp.me
              </div>
            </div>
          </Reveal>

          {/* API */}
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <KeyRound className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">Streams via API</h3>
                  <p className="text-xs text-muted-foreground">
                    Build your own monetization & access control
                  </p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-border/70 bg-[#070b12] px-4 py-2.5 font-mono text-xs">
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-bold text-emerald-400">POST</span>
                <span className="text-cyan-200/90">https://rtsp.me/api/</span>
              </div>

              <div className="mb-5 overflow-hidden rounded-lg border border-border/70">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-secondary/50 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-4 py-2.5">Param</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_PARAMS.map((p) => (
                      <tr key={p.name} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-2.5 font-mono text-xs text-primary">{p.name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.type}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="code-block relative flex-1">
                <pre className="overflow-x-auto">{PHP_CODE}</pre>
                <div className="absolute right-3 top-3">
                  <CopyButton text={PHP_CODE} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                <Radio className="size-4 shrink-0 text-primary" />
                Basic knowledge of PHP is enough — the response includes live
                status, viewer count and stream URLs for your cameras.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
