import { useState, useEffect } from "react";

import { cacheStorage } from "@/utils/cache-storage";

export const useOneTimeToggler = (
  key: string,
): [
    boolean,
    () => void,
    () => Promise<void>,
  ] => {
  const [hasToggled, setHasToggled] = useState<boolean>(false);

  useEffect(() => {
    const checkToggleStatus = async () => {
      const value = await cacheStorage.getString(key);
      if (value !== null) {
        setHasToggled(true);
      }
    };
    checkToggleStatus();
  }, []);

  const toggleOffPermanently = async () => {
    await cacheStorage.set(key, "true");
    setHasToggled(true);
  };

  const toggleOff = async () => {
    setHasToggled(true);
  };

  const resetToggle = async () => {
    await cacheStorage.delete(key);
    setHasToggled(false);
  };

  // TODO: Remove this
  // useEffect(() => {
  //   resetToggle();
  // }, []);

  return [hasToggled, toggleOff, toggleOffPermanently];
};
