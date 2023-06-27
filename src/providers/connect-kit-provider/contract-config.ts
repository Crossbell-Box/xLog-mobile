import React, { useEffect } from "react";

import type { ContractConfig } from "@crossbell/contract";
import { useAccountState } from "@crossbell/react-account";
import type { ModalConfig } from "@crossbell/react-account/modal-config";
import { setupModal } from "@crossbell/react-account/modal-config";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import type { Address } from "viem";

export function useContractConfig() {
  const { provider: walletConnectProvider, open, address } = useWalletConnectModal();

  const [provider, setProvider] = React.useState<Exclude<ContractConfig["provider"], string>>();

  React.useEffect(() => {
    if (address && walletConnectProvider) {
      (async function setWeb3Provider() {
        walletConnectProvider.setDefaultChain(
          "3737",
          "https://rpc.crossbell.io",
        );

        await walletConnectProvider.enable();

        // TODO
        // @ts-expect-error
        setProvider(walletConnectProvider);
      })().catch(console.error);
    }
  }, [address, walletConnectProvider]);

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
      return open();
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
    address: address as Address,

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
