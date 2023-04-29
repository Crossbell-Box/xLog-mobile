import { useContext } from "react";

import { GlobalContext } from "@/context/global-context";

export function useGlobal() {
  const context = useContext(GlobalContext);

  if (!context)
    throw new Error("You need to add `GlobalProvider` to your root component");

  return context;
}
