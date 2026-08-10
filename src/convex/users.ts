import { query } from "./_generated/server";
import { auth } from "./auth";

export const viewer = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});
