import { LogBox } from "react-native";

LogBox.ignoreLogs([
  // TODO: https://forum.moralis.io/t/ethereum-react-native-boilerplate-questions/4511/267
  "The provided value 'moz",
  // TODO: https://forum.moralis.io/t/ethereum-react-native-boilerplate-questions/4511/267
  "The provided value 'ms-stream",
]);

// @ts-expect-error
const errorUtils = global.ErrorUtils;
const defaultErrorHandler = errorUtils.getGlobalHandler();

function customErrorHandler(error: Error, isFatal: boolean): void {
  // We need to switch to the ConnectionV2 to solve this issue.
  // TODO: https://github.com/WalletConnect/walletconnect-monorepo/issues/1706
  if (error.message.includes("PollingBlockTracker - encountered an error while attempting to update latest block"))
    return;

  defaultErrorHandler(error, isFatal);
}

errorUtils.setGlobalHandler(customErrorHandler);
