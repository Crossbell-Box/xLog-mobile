import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { createUniversalProvider } from "@/utils/universal-provider";

function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createUniversalProvider();
      setInitialized(true);
    }
    catch (err: unknown) {
      Alert.alert("Error", "Error initializing");
    }
  }, []);

  useEffect(() => {
    if (!initialized)
      onInitialize();
  }, [initialized, onInitialize]);

  return initialized;
}

export default useInitialization;
