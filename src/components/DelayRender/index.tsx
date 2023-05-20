import React, { useState, useEffect } from "react";
import { InteractionManager } from "react-native";

interface DelayedRenderProps {
  timeout?: number
  placeholder?: React.ReactNode
  children: React.ReactNode
}

export const DelayedRender: React.FC<DelayedRenderProps> = ({ timeout = 0, children, placeholder }) => {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      if (timeout > 0) {
        setTimeout(() => setReady(true), timeout);
      }
      else {
        setReady(true);
      }
    });

    return () => {
      interactionHandle.cancel();
    };
  }, [timeout]);

  if (!isReady) {
    return <>{placeholder}</>;
  }

  return <>{children}</>;
};
