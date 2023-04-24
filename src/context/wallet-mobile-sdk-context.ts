import { createContext } from "react";

import type { ethers } from "ethers";

interface Metadata {
  name: string
}

interface WalletMobileSDKContextType {
  connected: boolean
  address: string | null
  metadata: Metadata | null
  onConnected: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => void
  personalSign: (
    message: string | ethers.utils.Bytes,
    address: string
  ) => Promise<string>
}

export const WalletMobileSDKContext
  = createContext<WalletMobileSDKContextType | null>(null);
