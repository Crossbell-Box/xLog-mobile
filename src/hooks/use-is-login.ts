import { useConnectedAccount, useIsConnected, useIsWalletSignedIn } from "@crossbell/react-account";

export const useIsLogin = () => {
  const type = useConnectedAccount()?.type;
  const isEmail = type === "email";
  const isConnected = useIsConnected();
  const isWalletSignedIn = useIsWalletSignedIn();

  if (isEmail) {
    return isConnected;
  }

  return isConnected && isWalletSignedIn;
};
