import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useBreathingSession,
  type CompletedSession,
} from "../hooks/useBreathingSession";
import { useSettings } from "../store/useSettings";
import { useHistory } from "../store/useHistory";
import GradientBackground from "./GradientBackground";
import BreathingOrb from "./BreathingOrb";
import Controls from "./Controls";
import SettingsDrawer from "./SettingsDrawer";
import HistoryDrawer from "./HistoryDrawer";
import AccountDrawer from "./AccountDrawer";

export default function SessionScreen() {
  const addSession = useHistory((s) => s.addSession);
  const handleComplete = useCallback(
    (session: CompletedSession) => {
      if (session.rounds === 0) return;
      void addSession(session);
    },
    [addSession],
  );
  const { state, start, togglePause, skipPhase, reset } = useBreathingSession({
    onComplete: handleComplete,
  });
  const settings = useSettings();
  const isInfiniteHold = settings.indefiniteRetention;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const lastTapTsRef = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isInfiniteHold) return;
      if (state.phase !== "retention") return;

      const target = e.target as HTMLElement | null;
      if (
        target?.closest?.("button, input, textarea, select, a") != null
      ) {
        return;
      }

      const now = Date.now();
      const last = lastTapTsRef.current;
      lastTapTsRef.current = now;

      // Double-tap (two quick taps/clicks) to end the indefinite hold.
      if (last != null && now - last <= 320) {
        lastTapTsRef.current = null;
        skipPhase();
      }
    },
    [isInfiniteHold, skipPhase, state.phase],
  );

  const isActive =
    state.phase === "breathing" ||
    state.phase === "retention" ||
    state.phase === "recovery" ||
    state.phase === "roundBreak";

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-between px-6 pb-safe pt-safe"
      onPointerDown={onPointerDown}
    >
      <GradientBackground phase={state.phase} />

      {/* Header */}
      <header className="flex w-full max-w-md items-center justify-between pt-6">
        <span className="text-lg font-semibold tracking-tight text-white">
          breathe
        </span>
        {isActive ? (
          <RoundDots current={state.round} total={state.totalRounds} />
        ) : (
          <span className="text-sm text-white/50">Wim Hof method</span>
        )}
      </header>

      {/* Center stage */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 py-6">
        <PhaseGuide phase={state.phase} round={state.round} />
        <BreathingOrb state={state} />
      </main>

      {/* Footer / controls */}
      <footer className="flex w-full max-w-md flex-col items-center gap-4 pb-8">
        <AnimatePresence mode="wait">
          {state.phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <p className="text-center text-sm text-white/60">
                {settings.rounds} rounds &middot; {settings.breathsPerRound}{" "}
                breaths &middot;{" "}
                {isInfiniteHold
                  ? "indefinite hold"
                  : `${formatShort(settings.retentionSeconds)} hold`}
              </p>
              <button
                onClick={start}
                className="w-full rounded-full bg-white py-4 text-lg font-semibold text-black shadow-xl transition active:scale-[0.98] hover:bg-white/90"
              >
                Start
              </button>
              <div className="flex w-full flex-wrap items-center justify-center gap-3">
                <SettingsDrawer
                  open={settingsOpen}
                  onOpenChange={setSettingsOpen}
                />
                <HistoryDrawer
                  open={historyOpen}
                  onOpenChange={setHistoryOpen}
                />
                <AccountDrawer
                  open={accountOpen}
                  onOpenChange={setAccountOpen}
                />
              </div>
            </motion.div>
          )}

          {isActive && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <Controls
                isPaused={state.isPaused}
                showSkip={state.phase === "retention"}
                onTogglePause={togglePause}
                skipLabel={isInfiniteHold ? "I need to breathe" : "Skip"}
                onSkip={skipPhase}
                onReset={reset}
              />
            </motion.div>
          )}

          {state.phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex w-full flex-col items-center gap-5"
            >
              <CompleteSummary retentionLog={state.retentionLog} />
              <button
                onClick={reset}
                className="w-full rounded-full bg-white py-4 text-lg font-semibold text-black shadow-xl transition active:scale-[0.98] hover:bg-white/90"
              >
                Done
              </button>
              <HistoryDrawer
                open={historyOpen}
                onOpenChange={setHistoryOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
}

function PhaseGuide({
  phase,
  round,
}: {
  phase: ReturnType<typeof useBreathingSession>["state"]["phase"];
  round: number;
}) {
  const text =
    phase === "idle"
      ? "inhale determination · exhale persistence"
      : phase === "breathing"
        ? `Round ${round} · breathe fully and freely`
        : phase === "retention"
          ? "exhale and hold · relax into the stillness"
          : phase === "recovery"
            ? "big breath in · hold it"
            : phase === "roundBreak"
              ? "rest · next round starting soon"
              : phase === "complete"
              ? "well done"
              : "";
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={`${phase}-${round}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="px-4 text-center text-base font-medium text-white/75"
      >
        {text}
      </motion.p>
    </AnimatePresence>
  );
}

function RoundDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i < current ? "bg-accent" : "bg-white/25"
          }`}
        />
      ))}
    </div>
  );
}

function CompleteSummary({ retentionLog }: { retentionLog: number[] }) {
  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
      <h2 className="text-xl font-semibold text-white">Session complete</h2>
      <p className="mt-1 text-sm text-white/60">
        Your breath retention this session:
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {retentionLog.length === 0 && (
          <span className="text-sm text-white/50">No rounds recorded</span>
        )}
        {retentionLog.map((secs, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white"
          >
            <span className="text-white/50">R{i + 1}</span>{" "}
            <span className="font-mono font-semibold">{formatShort(secs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatShort(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m${s}s`;
}
