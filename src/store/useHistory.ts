import { create } from "zustand";
import {
  bulkInsertSessions,
  deleteAllSessions,
  deleteSession as deleteRemoteSession,
  fetchSessions,
  insertSession,
} from "../lib/sessionsApi";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface SessionRecord {
  id: string;
  /** ISO timestamp of when the session completed */
  date: string;
  rounds: number;
  breathsPerRound: number;
  inhaleSeconds: number;
  exhaleSeconds: number;
  recoverySeconds: number;
  /** actual retention (hold) duration in seconds, per round */
  retentionLog: number[];
  /** total elapsed session time in seconds */
  durationSeconds: number;
}

export type NewSession = Omit<SessionRecord, "id" | "date">;

export type SyncMode = "guest" | "remote";

const GUEST_STORAGE_KEY = "breathe-history";

interface HistoryState {
  sessions: SessionRecord[];
  syncMode: SyncMode;
  isLoading: boolean;
  addSession: (session: NewSession) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadRemote: () => Promise<void>;
  mergeLocalToRemote: () => Promise<void>;
  onSignOut: () => void;
  initGuest: () => void;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readGuestSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as {
      state?: { sessions?: SessionRecord[] };
    };
    return parsed?.state?.sessions ?? [];
  } catch {
    return [];
  }
}

function writeGuestSessions(sessions: SessionRecord[]) {
  localStorage.setItem(
    GUEST_STORAGE_KEY,
    JSON.stringify({ state: { sessions }, version: 1 }),
  );
}

function isAuthenticated() {
  return useAuth.getState().status === "authenticated" && isSupabaseConfigured;
}

export const useHistory = create<HistoryState>((set, get) => ({
  sessions: readGuestSessions(),
  syncMode: "guest",
  isLoading: false,

  initGuest: () => {
    if (get().syncMode === "guest") {
      set({ sessions: readGuestSessions() });
    }
  },

  mergeLocalToRemote: async () => {
    const local = readGuestSessions();
    if (local.length === 0) return;
    await bulkInsertSessions(local);
    writeGuestSessions([]);
  },

  loadRemote: async () => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true });
    try {
      await get().mergeLocalToRemote();
      const sessions = await fetchSessions();
      set({ sessions, syncMode: "remote", isLoading: false });
    } catch (err) {
      console.error("Failed to load remote history:", err);
      set({
        sessions: readGuestSessions(),
        syncMode: "guest",
        isLoading: false,
      });
    }
  },

  onSignOut: () => {
    set({ sessions: readGuestSessions(), syncMode: "guest" });
  },

  addSession: async (session) => {
    if (isAuthenticated()) {
      try {
        const record = await insertSession(session);
        set((state) => ({
          sessions: [record, ...state.sessions].slice(0, 200),
          syncMode: "remote",
        }));
        return;
      } catch (err) {
        console.error("Remote insert failed, saving locally:", err);
      }
    }

    const record: SessionRecord = {
      ...session,
      id: makeId(),
      date: new Date().toISOString(),
    };
    const sessions = [record, ...get().sessions].slice(0, 200);
    writeGuestSessions(sessions);
    set({ sessions, syncMode: "guest" });
  },

  removeSession: async (id) => {
    if (isAuthenticated()) {
      try {
        await deleteRemoteSession(id);
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          syncMode: "remote",
        }));
        return;
      } catch (err) {
        console.error("Remote delete failed:", err);
      }
    }

    const sessions = get().sessions.filter((s) => s.id !== id);
    writeGuestSessions(sessions);
    set({ sessions });
  },

  clearHistory: async () => {
    if (isAuthenticated()) {
      try {
        await deleteAllSessions();
        set({ sessions: [], syncMode: "remote" });
        writeGuestSessions([]);
        return;
      } catch (err) {
        console.error("Remote clear failed:", err);
      }
    }

    writeGuestSessions([]);
    set({ sessions: [] });
  },
}));

export interface HistoryStats {
  totalSessions: number;
  longestHold: number;
  totalBreathingSeconds: number;
  currentStreakDays: number;
}

export function computeStats(sessions: SessionRecord[]): HistoryStats {
  let longestHold = 0;
  let totalBreathingSeconds = 0;
  for (const s of sessions) {
    totalBreathingSeconds += s.durationSeconds;
    for (const hold of s.retentionLog) {
      if (hold > longestHold) longestHold = hold;
    }
  }
  return {
    totalSessions: sessions.length,
    longestHold,
    totalBreathingSeconds,
    currentStreakDays: computeStreak(sessions),
  };
}

/** Consecutive-day streak counting back from today (or yesterday). */
function computeStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(
    sessions.map((s) => startOfDay(new Date(s.date)).getTime()),
  );
  let streak = 0;
  const cursor = startOfDay(new Date());
  if (!days.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.getTime())) return 0;
  }
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
