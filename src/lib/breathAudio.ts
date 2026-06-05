let ctx: AudioContext | null = null;

export async function unlockAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    ctx = new Ctx();
  }
  if (ctx.state === "suspended") await ctx.resume();
}

function playTone({
  startFreq,
  endFreq,
  duration,
  volume = 0.12,
  type = "sine",
}: {
  startFreq: number;
  endFreq?: number;
  duration: number;
  volume?: number;
  type?: OscillatorType;
}) {
  if (!ctx || ctx.state !== "running") return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(startFreq, now);
  if (endFreq != null && endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(endFreq, 1),
      now + duration,
    );
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

export function playInhaleCue() {
  playTone({ startFreq: 220, endFreq: 330, duration: 0.18, volume: 0.08 });
}

export function playExhaleCue() {
  playTone({ startFreq: 330, endFreq: 220, duration: 0.18, volume: 0.07 });
}

export function playRetentionCue() {
  playTone({ startFreq: 196, duration: 0.35, volume: 0.1, type: "triangle" });
}

export function playRoundBreakCue() {
  playTone({ startFreq: 440, duration: 0.2, volume: 0.07 });
}

export function playCompleteCue() {
  playTone({ startFreq: 330, endFreq: 523, duration: 0.45, volume: 0.1 });
}

export function playReleaseCue() {
  playTone({ startFreq: 392, endFreq: 262, duration: 0.22, volume: 0.08 });
}
