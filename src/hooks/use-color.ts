import { useCurrentColor } from "tamagui";

export const useColors = () => {
  return {
    primary: useCurrentColor("color"),
    background: useCurrentColor("background"),
    borderColor: useCurrentColor("borderColor"),
    backgroundFocus: useCurrentColor("backgroundFocus"),
  };
};
