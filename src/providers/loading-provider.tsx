import type { PropsWithChildren } from "react";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { WithSpinner } from "@/components/WithSpinner";
import LoadingContext from "@/context/loading-context";

const LoadingProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

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
