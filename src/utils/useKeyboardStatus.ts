import { useState } from "react";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { runOnJS } from "react-native-reanimated";

export const useKeyboardStatus = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useKeyboardHandler({
    onStart(e) {
      "worklet";
      runOnJS(setKeyboardVisible)(e.progress === 1);
    },
  });

  return {
    isKeyboardVisible,
  };
};
