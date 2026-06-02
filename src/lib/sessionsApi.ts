import { supabase } from "./supabase";
import type { NewSession, SessionRecord } from "../store/useHistory";

export interface BreathingSessionRow {
  id: string;
  user_id: string;
  performed_at: string;
  created_at: string;
  rounds: number;
  breaths_per_round: number;
  inhale_seconds: number;
  exhale_seconds: number;
  recovery_seconds: number;
  retention_log: number[];
  duration_seconds: number;
}

function requireClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

function rowToRecord(row: BreathingSessionRow): SessionRecord {
  return {
    id: row.id,
    date: row.performed_at,
    rounds: row.rounds,
    breathsPerRound: row.breaths_per_round,
    inhaleSeconds: Number(row.inhale_seconds),
    exhaleSeconds: Number(row.exhale_seconds),
    recoverySeconds: Number(row.recovery_seconds),
    retentionLog: row.retention_log ?? [],
    durationSeconds: row.duration_seconds,
  };
}

function recordToInsert(session: NewSession, performedAt: string) {
  return {
    performed_at: performedAt,
    rounds: session.rounds,
    breaths_per_round: session.breathsPerRound,
    inhale_seconds: session.inhaleSeconds,
    exhale_seconds: session.exhaleSeconds,
    recovery_seconds: session.recoverySeconds,
    retention_log: session.retentionLog,
    duration_seconds: session.durationSeconds,
  };
}

export async function fetchSessions(): Promise<SessionRecord[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("breathing_sessions")
    .select("*")
    .order("performed_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data as BreathingSessionRow[]).map(rowToRecord);
}

export async function insertSession(
  session: NewSession,
  performedAt = new Date().toISOString(),
): Promise<SessionRecord> {
  const client = requireClient();
  const { data, error } = await client
    .from("breathing_sessions")
    .insert(recordToInsert(session, performedAt))
    .select()
    .single();

  if (error) throw error;
  return rowToRecord(data as BreathingSessionRow);
}

export async function bulkInsertSessions(
  sessions: SessionRecord[],
): Promise<void> {
  if (sessions.length === 0) return;
  const client = requireClient();
  const rows = sessions.map((s) => ({
    ...recordToInsert(s, s.date),
    performed_at: s.date,
  }));
  const { error } = await client.from("breathing_sessions").insert(rows);
  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("breathing_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteAllSessions(): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("breathing_sessions")
    .delete()
    .not("id", "is", null);
  if (error) throw error;
}
