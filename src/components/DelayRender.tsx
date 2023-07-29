import React, { useState, useEffect } from "react";
import { InteractionManager } from "react-native";

interface DelayedRenderProps {
  timeout?: number
  when?: boolean
  placeholder?: React.ReactNode
  children: React.ReactNode
}

export const DelayedRender: React.FC<DelayedRenderProps> = ({ timeout, when, children, placeholder }) => {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    if (typeof timeout !== "number") {
      return;
    }
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

  useEffect(() => {
    if (when) {
      setReady(true);
    }
  }, [when]);

  if (!isReady) {
    return placeholder ? <>{placeholder}</> : null;
  }

  return <>{children}</>;
};
