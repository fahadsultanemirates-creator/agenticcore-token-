/*
 * AgenticCore (AC) service worker.
 *
 * Scope is deliberately narrow. This site is a wallet dApp: every buy,
 * balance read, and referral lookup is a live JSON-RPC call to BNB Smart
 * Chain, and connecting a wallet runs over a WalletConnect relay socket.
 * A service worker that caches or replays any of that would serve stale
 * balances, or -- far worse -- interfere with a signing request. So this
 * worker touches exactly one category of traffic: same-origin GET requests
 * for the app's own static assets and pages. Everything else (any POST,
 * anything cross-origin, any WebSocket) falls straight through to the
 * network as if no worker were installed.
 *
 * Bump CACHE_VERSION whenever the caching rules below change; the activate
 * handler deletes every cache that doesn't match the current name.
 */

const CACHE_VERSION = "v2";
const RUNTIME_CACHE = `ac-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Cached at install so the offline fallback is guaranteed present the first
// time the network drops, rather than only after a lucky earlier visit.
//
// The two entry points are in here for a less obvious reason: a service
// worker does not control the navigation that registered it, so the very
// page a visitor landed on is the one page that never passes through the
// fetch handler and never gets cached. "/app" is the manifest's start_url,
// so without it a freshly installed app shows the offline page the first
// time it is opened without a connection; "/" is where web visitors land.
const PRECACHE_URLS = [OFFLINE_URL, "/app", "/", "/icon-192.png", "/icon-512.png"];

// How long a navigation waits for the network before falling back to cache.
// The live presale numbers are worth waiting for, but not past the point
// where the page feels broken on a bad mobile connection.
const NAVIGATION_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      // Individually, not addAll(): addAll() rejects as a unit, so one
      // missing icon would leave the offline page uncached too.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      // Take over straight away rather than waiting for every tab to close.
      // Safe here because the worker holds no cross-version state -- the old
      // caches are dropped wholesale in activate.
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("ac-") && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// Lets the page trigger an immediate update instead of waiting for the next
// navigation (see ServiceWorkerRegistrar).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/** Content-hashed build output -- the filename changes whenever the bytes do. */
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

/** Our own images, icons, and fonts out of public/. */
function isStaticAsset(url) {
  return /\.(?:png|jpe?g|svg|gif|webp|avif|ico|woff2?|ttf)$/i.test(url.pathname);
}

function isCacheableResponse(response) {
  // 'basic' excludes opaque cross-origin responses, which have no readable
  // status and would poison the cache with unusable entries.
  return response && response.status === 200 && response.type === "basic";
}

async function cachePut(request, response) {
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response);
}

/**
 * Network first, falling back to cache and then the offline page. Used for
 * page navigations, where fresh beats fast: presale progress, prices, and
 * referral totals all change under the user.
 */
async function handleNavigation(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NAVIGATION_TIMEOUT_MS);

  try {
    const response = await fetch(request, { signal: controller.signal });
    if (isCacheableResponse(response)) {
      // Clone before the body is consumed by the page.
      cachePut(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/** Cache first. Only for URLs whose contents can never change. */
async function handleImmutable(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    cachePut(request, response.clone());
  }
  return response;
}

/**
 * Stale while revalidate: serve the cached copy instantly and refresh it in
 * the background. Right for logos and fonts, which change rarely and never
 * matter enough to block paint on.
 */
async function handleStaticAsset(request) {
  const cached = await caches.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (isCacheableResponse(response)) {
        cachePut(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;

  const response = await networkFetch;
  if (response) return response;

  return new Response("", { status: 504, statusText: "Offline" });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // --- Everything below this line is a reason to stay out of the way. ---

  // Writes and wallet traffic: never intercepted, never cached.
  if (request.method !== "GET") return;

  // Cross-origin: RPC endpoints, the WalletConnect relay, explorer APIs,
  // wallet deep links. Not ours to cache.
  if (new URL(request.url).origin !== self.location.origin) return;

  // Range requests (media seeking) break when served a full cached body.
  if (request.headers.has("range")) return;

  // Chrome issues these during devtools inspection; intercepting throws.
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;

  const url = new URL(request.url);

  // The worker itself and the manifest must always come from the network, or
  // a bad deploy becomes permanently sticky.
  if (url.pathname === "/sw.js" || url.pathname === "/manifest.webmanifest") return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(handleImmutable(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  }

  // Anything else -- Next's RSC payloads, JSON, anything unrecognised --
  // is left to the browser's own HTTP cache.
});
