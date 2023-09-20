import { useIsConnected, useIsWalletSignedIn } from "@crossbell/react-account";

export const useIsLogin = () => {
  const isConnected = useIsConnected();
  const isWalletSignedIn = useIsWalletSignedIn();

  return isConnected && isWalletSignedIn;
};
