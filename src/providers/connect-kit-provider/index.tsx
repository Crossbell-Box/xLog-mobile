import React from "react";

import { InitContractProvider } from "@crossbell/contract";
import type { BaseSigner } from "@crossbell/react-account";
import { useAccountState, ReactAccountProvider } from "@crossbell/react-account";
import { useRefCallback } from "@crossbell/util-hooks";
import { Web3Provider } from "@ethersproject/providers";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import type { Address } from "viem";

import { Web3Context } from "@/context/web3-context";

import { useContractConfig } from "./contract-config";

export function ConnectKitProvider({ children }: React.PropsWithChildren) {
  const accountState = useAccountState();
  const connector = useWalletConnect();
  const contractConfig = useContractConfig();
  const address = (connector.accounts?.[0] ?? null) as Address;
  const web3Provider = React.useMemo(() => {
    if (contractConfig.provider)
      return new Web3Provider(contractConfig.provider, 3737);
    else
      return null;
  }, [contractConfig.provider]);

  const onDisconnect = useRefCallback(() => connector.killSession());
  const getSigner = useRefCallback(async (): Promise<BaseSigner> => web3Provider.getSigner(address) as BaseSigner);

  React.useEffect(() => {
    if (address) {
      accountState.connectWallet(address);
    }
  }, [address]);

  React.useEffect(() => {
    accountState.refreshEmail();
    accountState.markSSRReady();
  }, []);

  return (
    <InitContractProvider {...contractConfig}>
      <ReactAccountProvider getSigner={getSigner} onDisconnect={onDisconnect}>
        <Web3Context.Provider value={web3Provider}>
          {children}
        </Web3Context.Provider>
      </ReactAccountProvider>
    </InitContractProvider>
  );
}

