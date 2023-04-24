import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import type { Web3Provider as EthersWeb3ProviderType } from "@ethersproject/providers";
import { Web3Provider as EthersWeb3Provider } from "@ethersproject/providers";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { INFURA_ID } from "@/constants/env";
import { Web3Context } from "@/context/web3-context";

interface Web3ProviderProps {
  children: React.ReactNode
  connected?: boolean
  provider?: EthersWeb3ProviderType | undefined
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [web3, setWeb3] = useState<EthersWeb3ProviderType | undefined>(
    undefined,
  );
  const connector = useWalletConnect();

  const Web3ContextValue = useMemo(
    () => ({ web3, setWeb3 }),
    [web3],
  );

  // Initialises wallet connect native web3 provider
  useEffect(() => {
    if (Platform.OS !== "web" && connector.connected) {
      (async function setWeb3Provider() {
        const walletConnectProvider = new WalletConnectProvider({
          connector,
          infuraId: INFURA_ID,
        });
        await walletConnectProvider.enable();
        const ethersProvider = new EthersWeb3Provider(walletConnectProvider);
        setWeb3(ethersProvider);
      })();
    }
  }, [connector]);

  return (
    <Web3Context.Provider value={Web3ContextValue}>
      {children}
    </Web3Context.Provider>
  );
}
