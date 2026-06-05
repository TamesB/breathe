import { motion, AnimatePresence } from "framer-motion";
import { usePwaInstall } from "../hooks/usePwaInstall";

export default function InstallBanner() {
  const { visible, canNativeInstall, showIosGuide, install, dismiss } =
    usePwaInstall();

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-safe"
        >
          <div className="pointer-events-auto mb-4 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">Install Breathe</p>
                <p className="mt-1 text-sm text-white/60">
                  {showIosGuide && !canNativeInstall
                    ? "Tap Share, then Add to Home Screen for the full app experience."
                    : "Add to your home screen for quick access and offline use."}
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss install prompt"
                className="shrink-0 text-sm text-white/40 transition hover:text-white/70"
              >
                ✕
              </button>
            </div>

            {canNativeInstall && (
              <button
                type="button"
                onClick={() => void install()}
                className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Add to home screen
              </button>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
