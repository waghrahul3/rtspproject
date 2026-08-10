import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim();
    const body = args.body.trim();
    if (name.length < 2) throw new Error("Please enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address");
    }
    if (body.length < 10) {
      throw new Error("Message must be at least 10 characters");
    }
    await ctx.db.insert("messages", {
      name,
      email,
      subject: args.subject?.trim() || undefined,
      body,
      createdAt: Date.now(),
    });
  },
});
