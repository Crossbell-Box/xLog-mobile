import { configureChains } from "wagmi";
import { crossbell } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";

import { getWalletConnectConnector } from "./wallets/wallet-connectors/get-wallet-connect-connector";
import { getWalletConnectLegacyConnector } from "./wallets/wallet-connectors/get-wallet-connect-legacy-connector";

export type GetDefaultClientConfigOptions = {
	appName: string;
	// To get started with Wallet Connect v2, you will need to retrieve a Project ID. You can find your Project ID [here](https://cloud.walletconnect.com/sign-in).
	walletConnectProjectId?: string | null;
};

export function getDefaultClientConfig({
	appName,
	walletConnectProjectId,
}: GetDefaultClientConfigOptions) {
	const { chains, provider } = configureChains(
		[crossbell],
		[publicProvider()],
		{ pollingInterval: 1_000 }
	);

	const connectors = [
		new InjectedConnector({
			chains,
			options: {
				shimDisconnect: true,
				name: (detectedName) =>
					`Injected (${
						typeof detectedName === "string"
							? detectedName
							: detectedName.join(", ")
					})`,
			},
		}),
		new MetaMaskConnector({
			chains,
			options: {
				shimDisconnect: true,
				UNSTABLE_shimOnConnectSelectAccount: true,
			},
		}),
		new CoinbaseWalletConnector({
			chains,
			options: {
				appName,
				headlessMode: true,
			},
		}),
		walletConnectProjectId
			? getWalletConnectConnector({
					chains,
					options: { projectId: walletConnectProjectId },
			  })
			: getWalletConnectLegacyConnector({
					chains,
					options: { qrcode: true, chainId: chains[0].id },
			  }),
	];

	return {
		autoConnect: true,
		connectors,
		provider,
	};
}