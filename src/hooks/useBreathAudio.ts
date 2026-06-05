import { useEffect, useRef } from "react";
import {
  playCompleteCue,
  playExhaleCue,
  playInhaleCue,
  playReleaseCue,
  playRetentionCue,
  playRoundBreakCue,
} from "../lib/breathAudio";
import type { SessionState } from "./useBreathingSession";
import { useSettings } from "../store/useSettings";

export function useBreathAudio(state: SessionState) {
  const soundEnabled = useSettings((s) => s.soundEnabled);
  const prevRef = useRef({
    phase: state.phase,
    direction: state.direction,
    round: state.round,
  });

  useEffect(() => {
    if (!soundEnabled || state.isPaused) {
      prevRef.current = {
        phase: state.phase,
        direction: state.direction,
        round: state.round,
      };
      return;
    }

    const prev = prevRef.current;

    if (state.phase !== prev.phase) {
      switch (state.phase) {
        case "retention":
          playRetentionCue();
          break;
        case "recovery":
          playReleaseCue();
          break;
        case "roundBreak":
          playRoundBreakCue();
          break;
        case "complete":
          playCompleteCue();
          break;
        default:
          break;
      }
    }

    if (
      state.phase === "breathing" &&
      state.direction !== prev.direction
    ) {
      if (state.direction === "inhale") playInhaleCue();
      else if (state.direction === "exhale") playExhaleCue();
    }

    prevRef.current = {
      phase: state.phase,
      direction: state.direction,
      round: state.round,
    };
  }, [
    soundEnabled,
    state.phase,
    state.direction,
    state.round,
    state.isPaused,
  ]);
}
