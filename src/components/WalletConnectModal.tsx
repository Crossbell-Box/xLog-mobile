import type { ComponentProps } from "react";

import { useNetInfo } from "@react-native-community/netinfo";
import { WalletConnectModal as Modal, type IProviderMetadata } from "@walletconnect/modal-react-native";
import * as Clipboard from "expo-clipboard";
import { resolveScheme } from "expo-linking";

import { OIA_HOST, WALLET_PROJECT_ID } from "@/constants/env";
import { useThemeStore } from "@/hooks/use-theme-store";

const onCopyClipboard = (value: string) => {
  return Clipboard.setStringAsync(value);
};

const sessionParams: ComponentProps<typeof Modal>["sessionParams"] = {
  namespaces: {
    eip155: {
      methods: ["personal_sign"],
      chains: ["eip155:1"],
      events: ["chainChanged", "accountsChanged"],
      rpcMap: {},
    },
  },
};

const providerMetadata: IProviderMetadata = {
  name: "WalletConnect",
  url: "https://walletconnect.com/",
  icons: ["https://walletconnect.org/walletconnect-logo.png"],
  description: "Connect with WalletConnect",
  redirect: {
    native: `${resolveScheme({})}://`,
    universal: OIA_HOST,
  },
};

export function WalletConnectModal() {
  const { mode } = useThemeStore();
  const netInfo = useNetInfo();

  if (!netInfo.isConnected) {
    return null;
  }

  return (
    <Modal
      themeMode={mode}
      projectId={WALLET_PROJECT_ID}
      sessionParams={sessionParams}
      onCopyClipboard={onCopyClipboard}
      providerMetadata={providerMetadata}
    />
  );
}
