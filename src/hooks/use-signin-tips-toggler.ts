import { useOneTimeToggle } from "./use-one-time-toggle";

export const useOneTimeToggler = () => {
  const [hasBeenDisplayed, close, closePermanently] = useOneTimeToggle("sigin-tips");

  return {
    hasBeenDisplayed,
    close,
    closePermanently,
  };
};
