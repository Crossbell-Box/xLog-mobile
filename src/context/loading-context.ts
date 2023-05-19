import { createContext } from "react";

interface LoadingContextValue {
  show: () => void
  hide: () => void
}

const LoadingContext = createContext<LoadingContextValue>({
  show: () => {},
  hide: () => {},
});

export default LoadingContext;
