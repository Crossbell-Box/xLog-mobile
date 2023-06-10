import type { PropsWithChildren } from "react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { useToastController } from "@tamagui/toast";

import { WithSpinner } from "@/components/WithSpinner";
import LoadingContext from "@/context/loading-context";

const TIMEOUT = 5 * 1000;

const LoadingProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const hide = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setVisible(false);
  };

  const show = () => {
    timer.current = setTimeout(() => {
      hide();

      toast.show(i18n.t("Request timed out"), {
        burntOptions: {
          preset: "error",
          haptic: "error",
        },
      });
    }, TIMEOUT);
    setVisible(true);
  };

  const toast = useToastController();
  const i18n = useTranslation("common");

  return (
    <LoadingContext.Provider value={{ show, hide }}>
      <WithSpinner
        isLoading={visible}
        style={StyleSheet.absoluteFill}
        flex={1}
      >
        {children}
      </WithSpinner>
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
