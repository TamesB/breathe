import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BreathSettings {
  rounds: number;
  breathsPerRound: number;
  inhaleSeconds: number;
  exhaleSeconds: number;
  retentionSeconds: number;
  /** Extra seconds added to retention each round (timed mode only). */
  retentionIncreasePerRound: number;
  /**
   * If true, the breath-hold will not auto-end after `retentionSeconds`.
   * Instead, each round continues until the user requests to breathe.
   */
  indefiniteRetention: boolean;
  recoverySeconds: number;
  roundBreakSeconds: number;
}

export const DEFAULT_SETTINGS: BreathSettings = {
  rounds: 3,
  breathsPerRound: 30,
  inhaleSeconds: 1.6,
  exhaleSeconds: 1.6,
  retentionSeconds: 90,
  retentionIncreasePerRound: 0,
  indefiniteRetention: false,
  recoverySeconds: 15,
  roundBreakSeconds: 5,
};

export const SETTINGS_LIMITS = {
  rounds: { min: 1, max: 10, step: 1 },
  breathsPerRound: { min: 10, max: 60, step: 1 },
  inhaleSeconds: { min: 0.8, max: 5, step: 0.1 },
  exhaleSeconds: { min: 0.8, max: 5, step: 0.1 },
  retentionSeconds: { min: 15, max: 300, step: 5 },
  retentionIncreasePerRound: { min: 0, max: 30, step: 5 },
  recoverySeconds: { min: 5, max: 60, step: 1 },
  roundBreakSeconds: { min: 2, max: 10, step: 1 },
} as const;

/** Timed retention target for a 1-based round number. */
export function retentionForRound(
  settings: Pick<
    BreathSettings,
    "retentionSeconds" | "retentionIncreasePerRound" | "indefiniteRetention"
  >,
  round: number,
): number {
  if (settings.indefiniteRetention) return 0;
  return (
    settings.retentionSeconds +
    (round - 1) * settings.retentionIncreasePerRound
  );
}

interface SettingsState extends BreathSettings {
  setSetting: <K extends keyof BreathSettings>(
    key: K,
    value: BreathSettings[K],
  ) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: "breathe-settings",
      version: 4,
      migrate: (persisted, version) => {
        if (version < 4) {
          return {
            ...DEFAULT_SETTINGS,
            ...(persisted as Partial<BreathSettings>),
          };
        }
        return persisted as SettingsState;
      },
    },
  ),
);
