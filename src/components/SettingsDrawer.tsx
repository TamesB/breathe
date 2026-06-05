import { Drawer } from "vaul";
import {
  retentionForRound,
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

const GENERAL_FIELDS: FieldDef[] = [
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
];

const TIMED_RETENTION_FIELDS: FieldDef[] = [
  {
    key: "retentionSeconds",
    label: "Breath retention",
    format: (v) => formatSeconds(v),
    hint: "Hold with empty lungs (round 1)",
  },
  {
    key: "retentionIncreasePerRound",
    label: "Hold increase per round",
    unit: "s",
    hint: "Add extra seconds to each following round",
  },
];

const AFTER_RETENTION_FIELDS: FieldDef[] = [
  {
    key: "recoverySeconds",
    label: "Recovery hold",
    unit: "s",
    hint: "Hold after a full inhale",
  },
  {
    key: "roundBreakSeconds",
    label: "Break between rounds",
    unit: "s",
    hint: "Pause after recovery hold before the next round",
  },
];

type RetentionTab = "timed" | "indefinite";

export default function SettingsDrawer({
  open,
  onOpenChange,
  disabled,
}: Props) {
  const settings = useSettings();
  const retentionTab: RetentionTab = settings.indefiniteRetention
    ? "indefinite"
    : "timed";

  function setRetentionTab(tab: RetentionTab) {
    settings.setSetting("indefiniteRetention", tab === "indefinite");
  }

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
            {GENERAL_FIELDS.map((f) => (
              <RangeField key={f.key} field={f} settings={settings} />
            ))}

            <RetentionTabs
              activeTab={retentionTab}
              onTabChange={setRetentionTab}
            />

            {retentionTab === "timed" ? (
              TIMED_RETENTION_FIELDS.map((f) => (
                <RangeField key={f.key} field={f} settings={settings} />
              ))
            ) : (
              <IndefiniteRetentionPanel />
            )}

            {AFTER_RETENTION_FIELDS.map((f) => (
              <RangeField key={f.key} field={f} settings={settings} />
            ))}

            <SessionSummary />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function RetentionTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: RetentionTab;
  onTabChange: (tab: RetentionTab) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-base font-medium text-white">Breath hold</p>
      <div className="flex rounded-full bg-white/10 p-1">
        <button
          type="button"
          onClick={() => onTabChange("timed")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
            activeTab === "timed"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white"
          }`}
        >
          Fixed duration
        </button>
        <button
          type="button"
          onClick={() => onTabChange("indefinite")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
            activeTab === "indefinite"
              ? "bg-white text-black"
              : "text-white/70 hover:text-white"
          }`}
        >
          You choose
        </button>
      </div>
    </div>
  );
}

function IndefiniteRetentionPanel() {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-sm text-white/75">
        Hold with empty lungs until you tap{" "}
        <span className="font-medium text-white">I need to breathe</span> or
        double-tap the screen. Each round&apos;s hold time is recorded.
      </p>
      <p className="mt-2 text-xs text-white/45">
        Your configured number of rounds still applies.
      </p>
    </div>
  );
}

function RangeField({
  field,
  settings,
  disabled,
}: {
  field: FieldDef;
  settings: ReturnType<typeof useSettings.getState>;
  disabled?: boolean;
}) {
  const value = settings[field.key] as number;
  const limits =
    SETTINGS_LIMITS[field.key as keyof typeof SETTINGS_LIMITS];
  const display = field.format
    ? field.format(value)
    : `${value}${field.unit ?? ""}`;

  return (
    <div aria-disabled={disabled ? true : undefined}>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-base font-medium text-white">{field.label}</label>
        <span className="font-mono text-base text-accent">{display}</span>
      </div>
      {field.hint && (
        <p className="mb-2 text-xs text-white/40">{field.hint}</p>
      )}
      <input
        type="range"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={value}
        onChange={(e) =>
          settings.setSetting(field.key, Number(e.target.value))
        }
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-accent"
      />
    </div>
  );
}

function SessionSummary() {
  const { rounds, breathsPerRound, inhaleSeconds, exhaleSeconds } =
    useSettings();
  const {
    retentionSeconds,
    retentionIncreasePerRound,
    recoverySeconds,
    roundBreakSeconds,
    indefiniteRetention,
  } = useSettings();

  if (indefiniteRetention) {
    return (
      <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
        Estimated session: depends on your hold time. {rounds} round
        {rounds === 1 ? "" : "s"} total; each ends when you request to
        breathe.
      </div>
    );
  }

  const perRoundBreathing =
    breathsPerRound * (inhaleSeconds + exhaleSeconds);
  const timedSettings = {
    retentionSeconds,
    retentionIncreasePerRound,
    indefiniteRetention: false as const,
  };
  let totalRetention = 0;
  for (let r = 1; r <= rounds; r++) {
    totalRetention += retentionForRound(timedSettings, r);
  }
  const totalSeconds =
    rounds * (perRoundBreathing + recoverySeconds) +
    totalRetention +
    Math.max(0, rounds - 1) * roundBreakSeconds;
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
