import { useOneTimeToggler } from "./use-one-time-toggle";

export const useOneTimeTogglerWithSignOP = () => {
  const [hasBeenDisplayed, close, closePermanently] = useOneTimeToggler("sign-op-tips");

  return {
    hasBeenDisplayed,
    close,
    closePermanently,
  };
};
