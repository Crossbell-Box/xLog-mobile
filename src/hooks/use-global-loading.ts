import { useContext } from "react";

import LoadingContext from "@/context/loading-context";

export function useGlobalLoading() {
  return useContext(LoadingContext);
}
