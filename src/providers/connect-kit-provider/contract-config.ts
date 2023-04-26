import React from "react";

import type { ContractConfig } from "@crossbell/contract";
import { useAccountState } from "@crossbell/react-account";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { INFURA_ID } from "@/constants/env";

import { modals } from "./modals"

export function useContractConfig() {
  const connector = useWalletConnect();
  const address = connector.accounts?.[0];
  const [provider, setProvider] = React.useState<Exclude<ContractConfig["provider"], string>>();

  React.useEffect(() => {
    if (address) {
      (async function setWeb3Provider() {
        const walletConnectProvider = new WalletConnectProvider({
          connector,
          infuraId: INFURA_ID,
          chainId: 3737,
          rpc: {
            3737: "https://rpc.crossbell.io",
          },
        });

        await walletConnectProvider.enable();

        setProvider(walletConnectProvider);
      })();
    }
  }, [address])

  return React.useMemo(() => ({
    address,

    provider,

    openConnectModal: modals.showConnectModal,
  
    openMintNewCharacterModel: modals.showWalletMintNewCharacterModal,
  
    openFaucetHintModel: () => modals.showNoEnoughCSBModal("claim-csb"),
  
    getCurrentCharacterId: () => useAccountState.getState().computed.account?.characterId ?? null,
  
    showSwitchNetworkModal() {
      // TODO: implement
      throw new Error("showSwitchNetworkModal not implemented");
    },
  } satisfies ContractConfig), [address, provider]);
};
