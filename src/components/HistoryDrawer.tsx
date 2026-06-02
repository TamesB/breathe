import { Drawer } from "vaul";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../store/useAuth";
import { computeStats, useHistory, type SessionRecord } from "../store/useHistory";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HistoryDrawer({ open, onOpenChange }: Props) {
  const sessions = useHistory((s) => s.sessions);
  const syncMode = useHistory((s) => s.syncMode);
  const isLoading = useHistory((s) => s.isLoading);
  const clearHistory = useHistory((s) => s.clearHistory);
  const authStatus = useAuth((s) => s.status);
  const stats = computeStats(sessions);

  const synced = syncMode === "remote" && authStatus === "authenticated";
  const syncLabel = isLoading
    ? "Syncing…"
    : synced
      ? "Synced to your account"
      : "Saved on this device";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <button className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition active:scale-95 hover:bg-white/15">
          History
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-3xl border-t border-white/10 bg-neutral-950/95 pb-safe outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/25" />
          <div className="flex items-center justify-between px-6 pt-4">
            <Drawer.Title className="text-xl font-semibold text-white">
              History
            </Drawer.Title>
            {sessions.length > 0 && (
              <button
                onClick={() => void clearHistory()}
                className="text-sm font-medium text-white/50 transition hover:text-white/80"
              >
                Clear
              </button>
            )}
          </div>
          <Drawer.Description className="px-6 pt-1 text-sm text-white/50">
            {syncLabel}
          </Drawer.Description>

          {sessions.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 px-6">
              <Stat label="Sessions" value={String(stats.totalSessions)} />
              <Stat label="Best hold" value={formatClock(stats.longestHold)} />
              <Stat
                label="Streak"
                value={`${stats.currentStreakDays}d`}
              />
            </div>
          )}

          <div className="mt-3 flex-1 space-y-2 overflow-y-auto px-6 pb-8 pt-1">
            {sessions.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-white/50">
                No sessions yet. Complete a breathing session and it&apos;ll show
                up here.
                {isSupabaseConfigured && authStatus !== "authenticated" && (
                  <span className="mt-2 block text-white/40">
                    Sign in via Account to sync history across devices.
                  </span>
                )}
              </div>
            ) : (
              sessions.map((s) => <HistoryRow key={s.id} session={s} />)
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 text-center">
      <div className="font-mono text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-white/45">{label}</div>
    </div>
  );
}

function HistoryRow({ session }: { session: SessionRecord }) {
  const removeSession = useHistory((s) => s.removeSession);
  const bestHold = session.retentionLog.length
    ? Math.max(...session.retentionLog)
    : 0;
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-white">
            {formatDate(session.date)}
          </div>
          <div className="text-xs text-white/45">
            {session.rounds} {session.rounds === 1 ? "round" : "rounds"} &middot;{" "}
            {session.breathsPerRound} breaths &middot;{" "}
            {formatClock(session.durationSeconds)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-accent">
            {formatClock(bestHold)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            best hold
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {session.retentionLog.map((secs, i) => (
          <span
            key={i}
            className="rounded-lg bg-white/10 px-2 py-1 font-mono text-xs text-white/85"
          >
            R{i + 1} {formatClock(secs)}
          </span>
        ))}
        <button
          onClick={() => void removeSession(session.id)}
          className="ml-auto text-xs text-white/35 transition hover:text-white/70"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function formatClock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
