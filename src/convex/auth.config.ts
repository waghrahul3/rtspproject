import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Injected by the Convex deployment; set by the platform in production.
      domain: process.env.CONVEX_SITE_URL ?? "http://localhost:5173",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
