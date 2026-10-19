"use client";

import { useEffect } from "react";

// Registers /sw.js (see public/sw.js) and handles the update handshake.
// Mounted once in the root layout; renders nothing.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev builds serve uncompiled, frequently-changing assets, and a worker
    // caching them is a reliable source of "why am I seeing the old page".
    // The PWA only needs to work in production, where it's served over
    // HTTPS anyway.
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // Bypass the HTTP cache when checking sw.js for updates, so a new
          // deploy is picked up even if a CDN served the worker with a long
          // max-age.
          updateViaCache: "none",
        });

        // A new worker reaching 'installed' while one is already in control
        // means a newer deploy is waiting. Activate it right away, so the
        // user's *next* navigation runs the new build instead of whatever
        // they first installed -- on a phone, tabs can stay open for weeks.
        //
        // Deliberately no reload here. Forcing one the moment a deploy lands
        // would be reasonable on a content site and is wrong on this one: a
        // reload mid-flow drops an in-progress wallet connection or a buy
        // the user is part-way through signing. Activating quietly and
        // letting the next navigation pick it up costs nothing and can't
        // interrupt anyone.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage("SKIP_WAITING");
            }
          });
        });
      } catch (error) {
        // Registration failing is not fatal -- the site is a normal web app
        // without it. Logged rather than swallowed so it's visible if the
        // worker ever stops being served correctly.
        console.error("[pwa] service worker registration failed", error);
      }
    };

    // Defer past load: registration competes with the first paint's own
    // requests otherwise, and nothing on the first visit needs the worker.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
