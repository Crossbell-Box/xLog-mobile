import type { PropsWithChildren } from "react";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";

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
    timer.current = setTimeout(() => hide(), TIMEOUT);
    setVisible(true);
  };

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
