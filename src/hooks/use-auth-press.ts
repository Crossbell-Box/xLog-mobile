import { useConnectedAccount } from "@crossbell/react-account";

import { useRootNavigation } from "./use-navigation";

export function useAuthPress<T extends Function>(fn: T, cb?: (isConnected) => void) {
  const connectedAccount = useConnectedAccount();
  const navigation = useRootNavigation();
  return () => {
    cb?.(connectedAccount);

    if (connectedAccount) {
      fn();
    }
    else {
      navigation.navigate("Login");
    }
  };
}
