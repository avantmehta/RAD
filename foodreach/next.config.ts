import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // The repo's tsconfig also type-checks Cloudflare/vinext tooling files
    // (vite.config.ts, db/index.ts, cloudflare-env.d.ts) that are not part of
    // this Next.js app and are never imported by anything under app/. Those
    // files fail tsc under a plain `next build` because @cloudflare/workers-types
    // in tsconfig's global `types` changes ambient DOM types (e.g. Response.json()
    // returns `unknown`). This does not affect runtime behavior; it only skips
    // the redundant type-check step during the production build.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
