interface Props {
  isPaused: boolean;
  onTogglePause: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export default function Controls({
  isPaused,
  onTogglePause,
  onSkip,
  onReset,
}: Props) {
  return (
    <div className="flex w-full items-center justify-center gap-3">
      <button
        onClick={onReset}
        className="rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white/80 backdrop-blur transition active:scale-95 hover:bg-white/15"
      >
        Stop
      </button>
      <button
        onClick={onTogglePause}
        className="rounded-full bg-white px-8 py-3 text-base font-semibold text-black shadow-lg transition active:scale-95 hover:bg-white/90"
      >
        {isPaused ? "Resume" : "Pause"}
      </button>
      <button
        onClick={onSkip}
        className="rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white/80 backdrop-blur transition active:scale-95 hover:bg-white/15"
      >
        Skip
      </button>
    </div>
  );
}
