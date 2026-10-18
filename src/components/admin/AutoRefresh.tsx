"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-reads the page's data every minute while the tab is visible, so new requests show up. */
export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && router.refresh();
    const timer = setInterval(tick, seconds * 1000);
    // Coming back to the tab refreshes straight away.
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);
  return null;
}
