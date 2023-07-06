import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import NetInfo from "@react-native-community/netinfo";
import { useToastController } from "@tamagui/toast";

import { debounce } from "@/utils/debounce";

export const useNetworkChecker = () => {
  const toast = useToastController();
  const i18n = useTranslation("common");
  const disposer = useRef<() => void>();

  const onNetworkError = useCallback(debounce(() => {
    toast.show(i18n.t("Network Error"), {
      burntOptions: {
        preset: "error",
        haptic: "warning",
      },
    });
  }, 5 * 1000), []);

  useEffect(() => {
    if (disposer.current) {
      disposer.current();
    }

    disposer.current = NetInfo.addEventListener((state) => {
      if (state.isConnected === false || state.isInternetReachable === false) {
        onNetworkError();
      }
    });

    return () => disposer.current();
  }, [toast]);
};
