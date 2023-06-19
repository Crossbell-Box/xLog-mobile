import { useEffect, useRef } from "react";

export function useMultiPressHandler(callback: Function, options: {
  threshold?: number
  interval?: number
  disabled?: boolean
} = {}) {
  const {
    threshold = 3,
    interval = 300,
    disabled = false,
  } = options;

  const pressCount = useRef(0);
  let timer = null;

  const onPress = () => {
    if (disabled) {
      return;
    }

    const newPressCount = pressCount.current + 1;

    pressCount.current = newPressCount;
    if (newPressCount === threshold) {
      callback();
      resetPressCount();
    }
    else {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        resetPressCount();
      }, interval);
    }
  };

  const resetPressCount = () => {
    pressCount.current = 0;
    if (timer) {
      clearTimeout(timer);
    }
  };

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return onPress;
}
