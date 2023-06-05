import { useState, useEffect } from "react";
import type { AppStateStatus } from "react-native";
import { AppState } from "react-native";

export function useAppState() {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
}

export function useAppIsActive() {
  const appState = useAppState();
  return appState === "active";
}
