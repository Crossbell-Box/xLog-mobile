import { useContext } from "react";

import { Web3Context } from "@/context/web3-context";

export function useWeb3() {
  const context = useContext(Web3Context);

  if (!context)
    throw new Error("You need to add `Web3Provider` to your root component");

  return context;
}
