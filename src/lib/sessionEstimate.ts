import {
  retentionForRound,
  type BreathSettings,
} from "../store/useSettings";

export function estimateSessionSeconds(
  settings: Pick<
    BreathSettings,
    | "rounds"
    | "breathsPerRound"
    | "inhaleSeconds"
    | "exhaleSeconds"
    | "retentionSeconds"
    | "retentionIncreasePerRound"
    | "indefiniteRetention"
    | "recoverySeconds"
    | "roundBreakSeconds"
  >,
): number | null {
  if (settings.indefiniteRetention) return null;

  const perRoundBreathing =
    settings.breathsPerRound *
    (settings.inhaleSeconds + settings.exhaleSeconds);
  const timedSettings = {
    retentionSeconds: settings.retentionSeconds,
    retentionIncreasePerRound: settings.retentionIncreasePerRound,
    indefiniteRetention: false as const,
  };

  let totalRetention = 0;
  for (let r = 1; r <= settings.rounds; r++) {
    totalRetention += retentionForRound(timedSettings, r);
  }

  return Math.round(
    settings.rounds * (perRoundBreathing + settings.recoverySeconds) +
      totalRetention +
      Math.max(0, settings.rounds - 1) * settings.roundBreakSeconds,
  );
}

export function formatSessionDuration(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
