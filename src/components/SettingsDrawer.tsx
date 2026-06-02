import { Drawer } from "vaul";
import {
  SETTINGS_LIMITS,
  useSettings,
  type BreathSettings,
} from "../store/useSettings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

interface FieldDef {
  key: keyof BreathSettings;
  label: string;
  unit?: string;
  format?: (v: number) => string;
  hint?: string;
}

const FIELDS: FieldDef[] = [
  { key: "rounds", label: "Rounds", hint: "How many full cycles" },
  { key: "breathsPerRound", label: "Breaths per round" },
  {
    key: "inhaleSeconds",
    label: "Inhale speed",
    unit: "s",
    format: (v) => v.toFixed(1),
  },
  {
    key: "exhaleSeconds",
    label: "Exhale speed",
    unit: "s",
    format: (v) => v.toFixed(1),
  },
  {
    key: "retentionSeconds",
    label: "Breath retention",
    format: (v) => formatSeconds(v),
    hint: "Hold with empty lungs",
  },
  {
    key: "recoverySeconds",
    label: "Recovery hold",
    unit: "s",
    hint: "Hold after a full inhale",
  },
];

export default function SettingsDrawer({
  open,
  onOpenChange,
  disabled,
}: Props) {
  const settings = useSettings();

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <button
          disabled={disabled}
          className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition active:scale-95 enabled:hover:bg-white/15 disabled:opacity-40"
        >
          Settings
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-3xl border-t border-white/10 bg-neutral-950/95 pb-safe outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/25" />
          <div className="flex items-center justify-between px-6 pt-4">
            <Drawer.Title className="text-xl font-semibold text-white">
              Settings
            </Drawer.Title>
            <button
              onClick={() => useSettings.getState().reset()}
              className="text-sm font-medium text-accent/90 transition hover:text-accent"
            >
              Reset
            </button>
          </div>
          <Drawer.Description className="px-6 pt-1 text-sm text-white/50">
            Tune your session. Changes apply to your next start.
          </Drawer.Description>

          <div className="mt-3 flex-1 space-y-5 overflow-y-auto px-6 pb-8 pt-2">
            {FIELDS.map((f) => {
              const limits = SETTINGS_LIMITS[f.key];
              const value = settings[f.key];
              const display = f.format
                ? f.format(value)
                : `${value}${f.unit ?? ""}`;
              return (
                <div key={f.key}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label className="text-base font-medium text-white">
                      {f.label}
                    </label>
                    <span className="font-mono text-base text-accent">
                      {display}
                    </span>
                  </div>
                  {f.hint && (
                    <p className="mb-2 text-xs text-white/40">{f.hint}</p>
                  )}
                  <input
                    type="range"
                    min={limits.min}
                    max={limits.max}
                    step={limits.step}
                    value={value}
                    onChange={(e) =>
                      settings.setSetting(f.key, Number(e.target.value))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
                  />
                </div>
              );
            })}

            <SessionSummary />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SessionSummary() {
  const { rounds, breathsPerRound, inhaleSeconds, exhaleSeconds } =
    useSettings();
  const perRoundBreathing = breathsPerRound * (inhaleSeconds + exhaleSeconds);
  const { retentionSeconds, recoverySeconds } = useSettings();
  const totalSeconds =
    rounds * (perRoundBreathing + retentionSeconds + recoverySeconds);
  return (
    <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
      Estimated session:{" "}
      <span className="font-semibold text-white">
        ~{formatSeconds(Math.round(totalSeconds))}
      </span>{" "}
      across {rounds} {rounds === 1 ? "round" : "rounds"}.
    </div>
  );
}

function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
