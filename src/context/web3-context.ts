import { createContext } from "react";

import type { Web3Provider } from "@ethersproject/providers";

interface Web3ContextType {
  web3?: Web3Provider
  setWeb3: (web3?: Web3Provider) => void
}

export const Web3Context = createContext<Web3ContextType | null>(null);
