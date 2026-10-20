"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Share, X } from "lucide-react";

// Chrome's install event isn't in lib.dom yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "ac:pwa-install-dismissed";

// iOS has no beforeinstallprompt and never will -- installing there is a
// manual trip through Safari's Share sheet. Holding the hint back a few
// seconds keeps it from being the first thing a new visitor sees.
const IOS_HINT_DELAY_MS = 8000;

function hasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    // Private mode / blocked storage. Showing the prompt again is a far
    // smaller problem than throwing during render.
    return false;
  }
}

/**
 * Offers "add to home screen" on Android (via Chrome's install event) and
 * explains the manual route on iOS. Renders nothing when the app is already
 * installed, already dismissed, or when the browser can't install it.
 *
 * Sits above the Forge chat button rather than beside it -- both are fixed
 * to the bottom-right, and on a phone there isn't room for two.
 */
export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // display-mode: standalone is how an installed PWA renders. matchMedia
    // covers Android and desktop; navigator.standalone is the iOS-only
    // equivalent.
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isInstalled || hasDismissed()) return;

    const onBeforeInstallPrompt = (event: Event) => {
      // Without preventDefault, Chrome shows its own mini-infobar and this
      // card would be a duplicate ask.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallEvent(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const isIos = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos) {
      iosTimer = setTimeout(() => setShowIosHint(true), IOS_HINT_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Storage unavailable -- the prompt just reappears next visit.
    }
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    // The event is single-use: Chrome won't let the same one be prompted
    // twice, so drop it either way. If the user declined, the browser will
    // fire a fresh event on a later visit.
    await installEvent.userChoice;
    setInstallEvent(null);
  }, [installEvent]);

  if (dismissed) return null;
  if (!installEvent && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-label="Install AgenticCore"
      className="fixed inset-x-4 bottom-24 z-40 rounded-2xl border border-ac-border bg-ac-bg-card p-4 shadow-2xl sm:inset-x-auto sm:right-8 sm:w-80"
    >
      <div className="flex items-start gap-3">
        <Image
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Install AgenticCore</p>
          <p className="mt-1 text-xs leading-relaxed text-ac-muted">
            {installEvent
              ? "Add it to your home screen for one-tap access to your dashboard and referrals."
              : "Tap Share, then “Add to Home Screen” to install."}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ac-muted transition hover:bg-ac-bg-elevated hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {installEvent ? (
        <button
          onClick={install}
          className="mt-3 w-full rounded-full bg-ac-violet px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
        >
          Install app
        </button>
      ) : (
        <p className="mt-3 flex items-center justify-center gap-2 rounded-full border border-ac-border px-5 py-2.5 text-xs font-semibold text-ac-muted">
          <Share className="h-4 w-4" />
          Share &rarr; Add to Home Screen
        </p>
      )}
    </div>
  );
}
