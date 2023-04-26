import { createContext } from "react";

import type { Web3Provider } from "@ethersproject/providers";

export const Web3Context = createContext<Web3Provider | null>(null);
