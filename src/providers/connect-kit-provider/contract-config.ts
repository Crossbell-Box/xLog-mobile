import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { ContractConfig } from "@crossbell/contract";
import { useAccountState } from "@crossbell/react-account";
import type { ModalConfig } from "@crossbell/react-account/modal-config";
import { setupModal } from "@crossbell/react-account/modal-config";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import type { Address } from "viem";

import { useToast } from "@/hooks/useToast";

export function useContractConfig() {
  const { provider: walletConnectProvider, open, address } = useWalletConnectModal();
  const toast = useToast();
  const i18n = useTranslation("common");
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
      const tips = i18n.t("You do not have enough $CSB to perform this action.");
      toast.warn(tips);
      return Promise.resolve();
    },

    async showConnectModal() {
      return open();
    },

    showUpgradeEmailAccountModal() {
      // TODO: implement
      throw new Error("showUpgradeEmailAccountModal is not implemented yet");
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

    showSwitchNetworkModal() {
      const tips = i18n.t("Please switch to the Crossbell network in your wallet.");
      toast.warn(tips);
      throw new Error(tips);
    },
  } satisfies ContractConfig), [address, provider]);

  useEffect(() => {
    setupModal(modals);
  }, [modals]);

  return contractConfig;
}
