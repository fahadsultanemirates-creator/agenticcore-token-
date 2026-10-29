"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/track-visit`;

// Fires once per route (initial load and every client-side navigation,
// since usePathname() changes trigger the effect) -- a plain page-view
// counter for the admin panel, not full analytics. Never blocks or shows
// anything to the visitor; a failed/unreachable call is silently ignored.
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch(ENDPOINT, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
