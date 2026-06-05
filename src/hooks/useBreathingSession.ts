import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings, type BreathSettings } from "../store/useSettings";

export type Phase =
  | "idle"
  | "breathing"
  | "retention"
  | "recovery"
  | "roundBreak"
  | "complete";
export type BreathDirection = "inhale" | "exhale" | "hold";

export interface SessionState {
  phase: Phase;
  round: number;
  totalRounds: number;
  /** 1-based current breath number during the breathing phase */
  breathNumber: number;
  totalBreaths: number;
  /** inhale / exhale / hold - drives the orb */
  direction: BreathDirection;
  /** 0..1 progress of the current inhale or exhale segment */
  breathProgress: number;
  /** seconds elapsed in the current hold (retention) */
  holdElapsed: number;
  /** seconds remaining (recovery countdown / retention target) */
  secondsRemaining: number;
  retentionTarget: number;
  isPaused: boolean;
  /** recorded retention durations (seconds) per completed round */
  retentionLog: number[];
}

export interface CompletedSession {
  rounds: number;
  breathsPerRound: number;
  inhaleSeconds: number;
  exhaleSeconds: number;
  recoverySeconds: number;
  retentionLog: number[];
  durationSeconds: number;
}

interface SessionOptions {
  onComplete?: (session: CompletedSession) => void;
}

const FRAME = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export function useBreathingSession(options: SessionOptions = {}) {
  const [state, setState] = useState<SessionState>({
    phase: "idle",
    round: 1,
    totalRounds: useSettings.getState().rounds,
    breathNumber: 0,
    totalBreaths: useSettings.getState().breathsPerRound,
    direction: "hold",
    breathProgress: 0,
    holdElapsed: 0,
    secondsRemaining: 0,
    retentionTarget: useSettings.getState().retentionSeconds,
    isPaused: false,
    retentionLog: [],
  });

  // Internal mutable machine (refs so the rAF loop is stable).
  const cfg = useRef<BreathSettings>(useSettings.getState());
  const phaseRef = useRef<Phase>("idle");
  const roundRef = useRef(1);
  const elapsedRef = useRef(0); // ms within the current phase
  const lastTsRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const retentionLogRef = useRef<number[]>([]);

  // Keep the latest onComplete without re-creating the rAF callbacks.
  const onCompleteRef = useRef(options.onComplete);
  onCompleteRef.current = options.onComplete;

  // stopLoop is defined further down; bridge via a ref so finish can call it.
  const stopLoopRef = useRef<() => void>();

  const publish = useCallback((next: Partial<SessionState>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  const finish = useCallback(() => {
    stopLoopRef.current?.();
    phaseRef.current = "complete";
    const c = cfg.current;
    const retention = [...retentionLogRef.current];
    const completedRounds = retention.length;
    const breathingSeconds =
      completedRounds * c.breathsPerRound * (c.inhaleSeconds + c.exhaleSeconds);
    const recoverySeconds = completedRounds * c.recoverySeconds;
    const roundBreakSeconds =
      Math.max(0, completedRounds - 1) * c.roundBreakSeconds;
    const totalRetention = retention.reduce((a, b) => a + b, 0);
    publish({ phase: "complete", retentionLog: retention });
    onCompleteRef.current?.({
      rounds: completedRounds,
      breathsPerRound: c.breathsPerRound,
      inhaleSeconds: c.inhaleSeconds,
      exhaleSeconds: c.exhaleSeconds,
      recoverySeconds: c.recoverySeconds,
      retentionLog: retention,
      durationSeconds: Math.round(
        breathingSeconds +
          recoverySeconds +
          roundBreakSeconds +
          totalRetention,
      ),
    });
  }, [publish]);

  const goToPhase = useCallback(
    (phase: Phase, opts?: { round?: number }) => {
      phaseRef.current = phase;
      elapsedRef.current = 0;
      if (opts?.round != null) roundRef.current = opts.round;
      publish({
        phase,
        round: roundRef.current,
        retentionLog: [...retentionLogRef.current],
      });
    },
    [publish],
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);
  stopLoopRef.current = stopLoop;

  const tick = useCallback(() => {
    const now = FRAME();
    if (lastTsRef.current == null) lastTsRef.current = now;
    const delta = now - lastTsRef.current;
    lastTsRef.current = now;

    if (!pausedRef.current) elapsedRef.current += delta;

    const c = cfg.current;
    const elapsedMs = elapsedRef.current;
    const elapsedS = elapsedMs / 1000;

    switch (phaseRef.current) {
      case "breathing": {
        const breathDur = c.inhaleSeconds + c.exhaleSeconds;
        const totalDur = c.breathsPerRound * breathDur;
        if (elapsedS >= totalDur) {
          goToPhase("retention");
          break;
        }
        const idx = Math.floor(elapsedS / breathDur);
        const within = elapsedS - idx * breathDur;
        let direction: BreathDirection;
        let progress: number;
        if (within < c.inhaleSeconds) {
          direction = "inhale";
          progress = within / c.inhaleSeconds;
        } else {
          direction = "exhale";
          progress = (within - c.inhaleSeconds) / c.exhaleSeconds;
        }
        publish({
          direction,
          breathProgress: progress,
          breathNumber: Math.min(idx + 1, c.breathsPerRound),
          totalBreaths: c.breathsPerRound,
        });
        break;
      }
      case "retention": {
        if (!c.indefiniteRetention && elapsedS >= c.retentionSeconds) {
          retentionLogRef.current = [
            ...retentionLogRef.current,
            Math.round(c.retentionSeconds),
          ];
          goToPhase("recovery");
          break;
        }
        publish({
          direction: "hold",
          holdElapsed: Math.floor(elapsedS),
          secondsRemaining: c.indefiniteRetention
            ? 0
            : Math.ceil(c.retentionSeconds - elapsedS),
          retentionTarget: c.indefiniteRetention ? 0 : c.retentionSeconds,
        });
        break;
      }
      case "recovery": {
        if (elapsedS >= c.recoverySeconds) {
          if (roundRef.current >= c.rounds) {
            finish();
            return;
          }
          goToPhase("roundBreak");
          break;
        }
        publish({
          direction: "hold",
          secondsRemaining: Math.ceil(c.recoverySeconds - elapsedS),
        });
        break;
      }
      case "roundBreak": {
        if (elapsedS >= c.roundBreakSeconds) {
          goToPhase("breathing", { round: roundRef.current + 1 });
          break;
        }
        publish({
          direction: "hold",
          secondsRemaining: Math.ceil(c.roundBreakSeconds - elapsedS),
        });
        break;
      }
      default:
        break;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [goToPhase, publish, finish]);

  const startLoop = useCallback(() => {
    stopLoop();
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop, tick]);

  const start = useCallback(() => {
    cfg.current = useSettings.getState();
    retentionLogRef.current = [];
    roundRef.current = 1;
    pausedRef.current = false;
    elapsedRef.current = 0;
    phaseRef.current = "breathing";
    setState({
      phase: "breathing",
      round: 1,
      totalRounds: cfg.current.rounds,
      breathNumber: 1,
      totalBreaths: cfg.current.breathsPerRound,
      direction: "inhale",
      breathProgress: 0,
      holdElapsed: 0,
      secondsRemaining: 0,
      retentionTarget: cfg.current.retentionSeconds,
      isPaused: false,
      retentionLog: [],
    });
    startLoop();
  }, [startLoop]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    publish({ isPaused: true });
  }, [publish]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    publish({ isPaused: false });
  }, [publish]);

  const togglePause = useCallback(() => {
    if (pausedRef.current) resume();
    else pause();
  }, [pause, resume]);

  const skipPhase = useCallback(() => {
    if (phaseRef.current !== "retention") return;
    retentionLogRef.current = [
      ...retentionLogRef.current,
      Math.round(elapsedRef.current / 1000),
    ];
    goToPhase("recovery");
  }, [goToPhase]);

  const reset = useCallback(() => {
    const c = cfg.current;
    const inSession =
      phaseRef.current === "breathing" ||
      phaseRef.current === "retention" ||
      phaseRef.current === "recovery" ||
      phaseRef.current === "roundBreak";

    // In indefinite mode, "Stop" acts like "finish now" so you keep the rounds
    // you already recorded.
    if (c.indefiniteRetention && inSession) {
      // If the user stops during the current indefinite hold, record it as the
      // final round time so we don't lose the last measurement.
      if (phaseRef.current === "retention") {
        retentionLogRef.current = [
          ...retentionLogRef.current,
          Math.round(elapsedRef.current / 1000),
        ];
      }
      finish();
      return;
    }

    stopLoop();
    phaseRef.current = "idle";
    roundRef.current = 1;
    elapsedRef.current = 0;
    pausedRef.current = false;
    retentionLogRef.current = [];
    const s = useSettings.getState();
    setState({
      phase: "idle",
      round: 1,
      totalRounds: s.rounds,
      breathNumber: 0,
      totalBreaths: s.breathsPerRound,
      direction: "hold",
      breathProgress: 0,
      holdElapsed: 0,
      secondsRemaining: 0,
      retentionTarget: s.retentionSeconds,
      isPaused: false,
      retentionLog: [],
    });
  }, [finish, stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

  return { state, start, pause, resume, togglePause, skipPhase, reset };
}
