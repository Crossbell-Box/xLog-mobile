import { useEffect } from "react";
import { AppState } from "react-native";

import { useIsConnected } from "@crossbell/react-account";

import { useGlobalLoading } from "./use-global-loading";

export const useFnLoadingWithStateChange = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  {
    enabled: _enabled,
  }: {
    enabled?: boolean
  } = {},
) => {
  const isConnected = useIsConnected();
  const enabled = typeof _enabled === "boolean"
    ? _enabled
    : isConnected ?? true;
  const { show, hide } = useGlobalLoading();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const disposer = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        hide();
      }
    });

    return () => {
      disposer.remove();
    };
  }, [enabled]);

  return async (...args) => {
    enabled && show();
    await new Promise(resolve => setTimeout(resolve, 100));
    await fn(args);
    enabled && hide();
  };
};
