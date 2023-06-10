import { useEffect } from "react";
import { AppState } from "react-native";

import { useIsConnected } from "@crossbell/react-account";

import { useGlobalLoading } from "./use-global-loading";

/**
 * @description This hook is used to show global loading when the app is in the background.
*/
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
  const globalLoading = useGlobalLoading();

  const hide = () => enabled && globalLoading.hide();
  const show = () => enabled && globalLoading.show();

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
    show();
    await new Promise(resolve => setTimeout(resolve, 100));
    await fn(args);
    hide();
  };
};
