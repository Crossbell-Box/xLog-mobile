import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const useOneTimeToggle = (
  key: string,
): [
    boolean,
    () => void,
    () => Promise<void>,
  ] => {
  const [hasToggled, setHasToggled] = useState<boolean>(false);

  useEffect(() => {
    const checkToggleStatus = async () => {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        setHasToggled(true);
      }
    };
    checkToggleStatus();
  }, []);

  const toggleOffPermanently = async () => {
    await AsyncStorage.setItem(key, "true");
    setHasToggled(true);
  };

  const toggleOff = async () => {
    setHasToggled(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetToggle = async () => {
    await AsyncStorage.removeItem(key);
    setHasToggled(false);
  };

  // TODO: Remove this
  // useEffect(() => {
  //   resetToggle();
  // }, []);

  return [hasToggled, toggleOff, toggleOffPermanently];
};
