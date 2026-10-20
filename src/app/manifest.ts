import type { MetadataRoute } from "next";
import { TOKEN } from "@/lib/tokenConfig";

// Web app manifest, emitted by Next's metadata route convention as
// /manifest.webmanifest and linked from every page automatically -- no
// <link rel="manifest"> needed in the layout.
//
// Written as a .ts route rather than a static manifest.json so the name and
// description stay keyed off tokenConfig, the same single source the page
// copy and OG tags already read from.
// Metadata routes are Route Handlers under the hood, and `output: "export"`
// refuses to build one that hasn't declared itself static. Importing
// tokenConfig -- which reads process.env at module scope -- is enough for
// Next to stop assuming it, so say so explicitly.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stable identity for the installed app, and the reason start_url below
    // could be moved off "/" without breaking anyone: the browser derives an
    // id from start_url when none is given, so changing start_url on an
    // id-less manifest registers as a *different* app and strands everyone
    // who already installed the old one. This stays "/" permanently.
    id: "/",
    name: `${TOKEN.name} (${TOKEN.ticker})`,
    // Launcher labels truncate past ~12 characters on Android.
    short_name: TOKEN.name,
    description: `${TOKEN.name} (${TOKEN.ticker}) -- ${TOKEN.standard} token on ${TOKEN.chain}. Buy, track your referral tree, and claim rewards.`,
    // The installed app opens the compact app home, not the marketing
    // landing page. Someone who installed the app is already sold; "/" is
    // for strangers arriving from a search or a referral link, and it stays
    // the site's front door on the web.
    start_url: "/app",
    // Scope stays at the root so the dashboard, referral program and
    // roadmap all open inside the app rather than kicking out to a browser.
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["finance"],
    lang: "en",
    // No `orientation` on purpose: the dashboard's referral tree and charts
    // are genuinely more readable in landscape, so locking to portrait would
    // cost more than the consistency is worth.
    icons: [
      // "any" icons are drawn as-is. They carry the page background baked in
      // rather than transparency, so the gold logo never lands on a white
      // launcher and disappears.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable icons get cropped to whatever shape the launcher uses
      // (circle, squircle, teardrop). Only the central 80% survives that
      // crop, so these hold the same logo at a smaller scale -- shipping the
      // "any" artwork as maskable would clip the ring on a circular mask.
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Long-press shortcuts on the installed Android icon. Both point at
    // routes that work without a connected wallet (each shows its own
    // connect gate), so a shortcut never dead-ends.
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Your balance, referral tree, and rewards",
        url: "/dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Referral Program",
        short_name: "Referrals",
        description: "How the referral levels and VIP Pool pay out",
        url: "/referral-program",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
