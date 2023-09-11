import { useContext } from "react";

import { PostIndicatorContext } from "@/context/post-indicator-context";

export const usePostIndicatorStore = () => {
  return useContext(PostIndicatorContext);
};
