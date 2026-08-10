import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const PUBLIC_ID_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generatePublicId(): string {
  let out = "";
  for (let i = 0; i < 7; i++) {
    out += PUBLIC_ID_ALPHABET[
      Math.floor(Math.random() * PUBLIC_ID_ALPHABET.length)
    ];
  }
  return out;
}

export const listMine = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("broadcasts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("broadcasts")
      .withIndex("by_publicId", (q) => q.eq("publicId", args.publicId))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    rtspUrl: v.string(),
    hlsUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const name = args.name.trim();
    const rtspUrl = args.rtspUrl.trim();
    const hlsUrl = args.hlsUrl?.trim() || undefined;

    if (name.length < 2) throw new Error("Name must be at least 2 characters");
    if (!/^rtsps?:\/\//i.test(rtspUrl)) {
      throw new Error("RTSP link must start with rtsp:// or rtsps://");
    }
    if (hlsUrl && !/^https?:\/\//i.test(hlsUrl)) {
      throw new Error("HLS preview link must be a valid http(s) URL");
    }

    let publicId = generatePublicId();
    while (
      await ctx.db
        .query("broadcasts")
        .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
        .first()
    ) {
      publicId = generatePublicId();
    }

    return await ctx.db.insert("broadcasts", {
      userId,
      name,
      rtspUrl,
      hlsUrl,
      description: args.description?.trim() || undefined,
      status: "offline",
      views: 0,
      publicId,
      createdAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("broadcasts"),
    status: v.union(v.literal("online"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const broadcast = await ctx.db.get(args.id);
    if (!broadcast || broadcast.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const update = mutation({
  args: {
    id: v.id("broadcasts"),
    name: v.string(),
    rtspUrl: v.string(),
    hlsUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const broadcast = await ctx.db.get(args.id);
    if (!broadcast || broadcast.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      rtspUrl: args.rtspUrl.trim(),
      hlsUrl: args.hlsUrl?.trim() || undefined,
      description: args.description?.trim() || undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const broadcast = await ctx.db.get(args.id);
    if (!broadcast || broadcast.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const recordView = mutation({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db
      .query("broadcasts")
      .withIndex("by_publicId", (q) => q.eq("publicId", args.publicId))
      .first();
    if (!broadcast || broadcast.status !== "online") return;
    await ctx.db.patch(broadcast._id, { views: broadcast.views + 1 });
  },
});
