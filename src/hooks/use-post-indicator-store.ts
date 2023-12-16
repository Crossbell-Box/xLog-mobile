import { useCallback, useContext } from "react";

import { PostIndicatorContext } from "@/context/post-indicator-context";
import { postIndicatorSubscribers } from "@/providers/post-indicator-provider";

export const usePostIndicatorStore = () => {
  const { isProcessing, addPostTask } = useContext(PostIndicatorContext);

  const subscribe = useCallback((callback) => {
    postIndicatorSubscribers.add(callback);
    return () => {
      postIndicatorSubscribers.delete(callback);
    };
  }, []);

  return { isProcessing, addPostTask, subscribe };
};
