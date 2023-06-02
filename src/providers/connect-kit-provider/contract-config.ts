import React, { useEffect } from "react";

import type { ContractConfig } from "@crossbell/contract";
import { useAccountState } from "@crossbell/react-account";
import type { ModalConfig } from "@crossbell/react-account/modal-config";
import { setupModal } from "@crossbell/react-account/modal-config";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import WalletConnectProvider from "@walletconnect/web3-provider";
import type { Address } from "viem";

import { INFURA_ID } from "@/constants/env";

// TODO
// import { modals } from "./modals";

export function useContractConfig() {
  const connector = useWalletConnect();

  const address = connector.accounts?.[0] as Address;
  const [provider, setProvider] = React.useState<Exclude<ContractConfig["provider"], string>>();

  React.useEffect(() => {
    if (address) {
      (async function setWeb3Provider() {
        let walletConnectProvider: WalletConnectProvider;

        try {
          walletConnectProvider = new WalletConnectProvider({
            connector,
            infuraId: INFURA_ID,
            chainId: 3737,
            rpc: {
              3737: "https://rpc.crossbell.io",
            },
          });
        }
        catch (error) {
          console.error(error);
          return;
        }

        await walletConnectProvider.enable();

        // TODO
        // @ts-expect-error
        setProvider(walletConnectProvider);
      })().catch(console.error);
    }
  }, [address]);

  const modals: ModalConfig = {
    showClaimCSBTipsModal() {
      // TODO: implement
      throw new Error("showClaimCSBTipsModal is not implemented yet");
    },

    showNoEnoughCSBModal() {
      // TODO: implement
      throw new Error("showNoEnoughCSBModal is not implemented yet");
    },

    async showConnectModal() {
      await connector.connect();
    },

    showUpgradeEmailAccountModal() {
      // TODO: implement
      throw new Error("showUpgradeAccountModal is not implemented yet");
    },

    showWalletMintNewCharacterModal() {
      // TODO: implement
      throw new Error("showWalletMintNewCharacterModal is not implemented yet");
    },
  };

  const contractConfig = React.useMemo(() => ({
    address,

    provider,

    openConnectModal: modals.showConnectModal,

    openMintNewCharacterModel: modals.showWalletMintNewCharacterModal,

    openFaucetHintModel: () => modals.showNoEnoughCSBModal("claim-csb"),

    getCurrentCharacterId: () => useAccountState.getState().computed.account?.characterId ?? null,

    // showSwitchNetworkModal() {
    //   // TODO: implement
    //   throw new Error("showSwitchNetworkModal not implemented");
    // },
  } satisfies ContractConfig), [address, provider]);

  useEffect(() => {
    setupModal(modals);
  }, [modals]);

  return contractConfig;
}
