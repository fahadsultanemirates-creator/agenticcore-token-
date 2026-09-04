import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route in this app is already fully static (no API routes,
  // middleware, or server-only rendering) — export plain HTML so it can be
  // served from any static host without a server runtime.
  output: "export",
  turbopack: {
    // @coinbase/cdp-sdk is pulled in transitively via wagmi's Coinbase/Base
    // Account connector purely to support Base Pay's x402 subscription
    // billing — a feature this app never uses. It statically imports a
    // long chain of optional @x402/* payment packages we don't install, so
    // stub the whole SDK out rather than aliasing each subpath.
    resolveAlias: {
      "@coinbase/cdp-sdk": "./src/lib/empty-module.ts",
    },
  },
};

export default nextConfig;
