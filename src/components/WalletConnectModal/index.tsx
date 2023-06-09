import { WalletConnectModal as Modal, type IProviderMetadata } from "@walletconnect/modal-react-native";
import type { ConnectParams } from "@walletconnect/universal-provider";
import * as Clipboard from "expo-clipboard";
import { resolveScheme } from "expo-linking";

import { WALLET_PROJECT_ID, WALLET_RELAY_URL } from "@/constants/env";
import { useThemeStore } from "@/hooks/use-theme-store";

const onCopyClipboard = (value: string) => {
  return Clipboard.setStringAsync(value);
};

const sessionParams: ConnectParams = {
  namespaces: {
    eip155: {
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
      ],
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
  },
};

export function WalletConnectModal() {
  const { mode } = useThemeStore();

  return (
    <Modal
      projectId={WALLET_PROJECT_ID}
      providerMetadata={providerMetadata}
      onCopyClipboard={onCopyClipboard}
      sessionParams={sessionParams}
      relayUrl={WALLET_RELAY_URL}
      themeMode={mode}
    />
  );
}
