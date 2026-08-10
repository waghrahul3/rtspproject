import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  broadcasts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    rtspUrl: v.string(),
    hlsUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.union(v.literal("online"), v.literal("offline")),
    views: v.number(),
    publicId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_publicId", ["publicId"]),
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    body: v.string(),
    createdAt: v.number(),
  }),
});
