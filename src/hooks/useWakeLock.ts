import { useEffect } from "react";
import { releaseWakeLock, requestWakeLock } from "../lib/wakeLock";

/** Keeps the screen awake while `enabled` (e.g. during an active session). */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      void releaseWakeLock();
      return;
    }

    void requestWakeLock();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void releaseWakeLock();
    };
  }, [enabled]);
}
