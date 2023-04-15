import { WalletConnectLegacyConnector } from "wagmi/connectors/walletConnectLegacy";

type SerializedOptions = string;

const sharedConnectors = new Map<
	SerializedOptions,
	WalletConnectLegacyConnector
>();

type WalletConnectLegacyConnectorOptions = ConstructorParameters<
	typeof WalletConnectLegacyConnector
>[0];

function createConnector(options: WalletConnectLegacyConnectorOptions) {
	const connector = new WalletConnectLegacyConnector(options);
	sharedConnectors.set(JSON.stringify(options), connector);
	return connector;
}

export function getWalletConnectLegacyConnector(
	options: WalletConnectLegacyConnectorOptions
) {
	const serializedOptions = JSON.stringify(options);
	const sharedConnector = sharedConnectors.get(serializedOptions);

	return sharedConnector ?? createConnector(options);
}