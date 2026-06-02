import { motion } from "framer-motion";
import type { SessionState } from "../hooks/useBreathingSession";

interface Props {
  state: SessionState;
}

/**
 * Central orb that scales and glows with the breath. During the breathing
 * phase it pulses between small (exhale) and large (inhale); during holds it
 * settles at a steady size (empty hold = small, recovery hold = full).
 */
export default function BreathingOrb({ state }: Props) {
  const { phase, direction, breathProgress } = state;

  // Target scale for the orb based on the current phase/direction.
  let scale = 0.78;
  if (phase === "breathing") {
    // ease the progress for a softer feel
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * breathProgress);
    scale = direction === "inhale" ? 0.7 + 0.4 * eased : 1.1 - 0.4 * eased;
  } else if (phase === "retention") {
    scale = 0.62; // lungs empty
  } else if (phase === "recovery") {
    scale = 1.12; // lungs full, held
  } else if (phase === "idle" || phase === "complete") {
    scale = 0.92;
  }

  const label =
    phase === "idle"
      ? "breathe"
      : phase === "complete"
        ? "complete"
        : phase === "retention"
          ? "hold"
          : phase === "recovery"
            ? "hold full"
            : direction;

  const sub =
    phase === "breathing"
      ? `${state.breathNumber} / ${state.totalBreaths}`
      : phase === "retention"
        ? formatTime(state.holdElapsed)
        : phase === "recovery"
          ? `${state.secondsRemaining}s`
          : "";

  // For idle / breathing we let the motion engine animate to scale with a
  // duration roughly matching the breath; holds use a gentle spring.
  const transition =
    phase === "breathing"
      ? { type: "tween" as const, ease: "linear" as const, duration: 0.08 }
      : { type: "spring" as const, stiffness: 40, damping: 14 };

  return (
    <div className="relative flex h-[58vmin] w-[58vmin] max-h-[420px] max-w-[420px] items-center justify-center">
      {/* outer halo */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,154,90,0.45)_0%,_transparent_70%)] blur-2xl"
        animate={{ scale: scale * 1.15, opacity: phase === "idle" ? 0.5 : 0.8 }}
        transition={transition}
      />
      {/* main orb */}
      <motion.div
        className="relative flex aspect-square w-[78%] items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_35%_30%,_rgba(255,255,255,0.35)_0%,_rgba(242,96,60,0.55)_38%,_rgba(122,31,143,0.55)_100%)] shadow-[0_0_80px_-10px_rgba(242,96,60,0.6)] backdrop-blur-sm"
        animate={{ scale }}
        transition={transition}
      >
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-2xl font-semibold lowercase tracking-wide text-white drop-shadow sm:text-3xl">
            {label}
          </span>
          {sub && (
            <span className="font-mono text-lg text-white/85 sm:text-xl">
              {sub}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}
