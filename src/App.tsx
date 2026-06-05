import { useEffect } from "react";
import InstallBanner from "./components/InstallBanner";
import SessionScreen from "./components/SessionScreen";
import { useAuth } from "./store/useAuth";
import { useHistory } from "./store/useHistory";

export default function App() {
  useEffect(() => {
    const unsubscribe = useAuth.getState().init();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = useAuth.subscribe((state, prev) => {
      if (!state.initialized) return;

      if (
        state.status === "authenticated" &&
        (prev.status !== "authenticated" || !prev.initialized)
      ) {
        void useHistory.getState().loadRemote();
      } else if (
        state.status === "guest" &&
        prev.status === "authenticated"
      ) {
        useHistory.getState().onSignOut();
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <SessionScreen />
      <InstallBanner />
    </>
  );
}
