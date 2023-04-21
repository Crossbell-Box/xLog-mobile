import { useCurrentColor } from "tamagui";

export const useColor = () => {
  const primary = useCurrentColor("orange9");

  return {
    primary,
  };
};
