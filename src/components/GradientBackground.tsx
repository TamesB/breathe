import type { Phase } from "../hooks/useBreathingSession";

interface Props {
  phase: Phase;
}

/**
 * Full-screen swirling gradient. Several large blurred blobs drift on
 * independent loops to evoke warmth slowly swirling around in the belly.
 * Hue/intensity shift subtly with the active phase.
 */
export default function GradientBackground({ phase }: Props) {
  const tint =
    phase === "retention"
      ? "saturate-[0.7] brightness-[0.75]"
      : phase === "recovery"
        ? "saturate-[1.15] brightness-110"
        : "saturate-100 brightness-100";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className={`absolute inset-0 transition-[filter] duration-[2000ms] ease-in-out ${tint}`}
      >
        {/* warm core */}
        <div className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
          <div className="absolute left-[20%] top-[25%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle_at_center,_#f2603c_0%,_transparent_60%)] opacity-70 blur-[60px] animate-drift-1" />
          <div className="absolute left-[45%] top-[40%] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle_at_center,_#ff9a5a_0%,_transparent_60%)] opacity-60 blur-[70px] animate-drift-2" />
          <div className="absolute left-[15%] top-[50%] h-[45vmax] w-[45vmax] rounded-full bg-[radial-gradient(circle_at_center,_#7a1f8f_0%,_transparent_62%)] opacity-60 blur-[80px] animate-drift-3" />
          <div className="absolute left-[55%] top-[15%] h-[40vmax] w-[40vmax] rounded-full bg-[radial-gradient(circle_at_center,_#c0392b_0%,_transparent_60%)] opacity-50 blur-[70px] animate-drift-2" />
        </div>
      </div>
      {/* darkening vignette to keep text legible */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
