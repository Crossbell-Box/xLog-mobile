import { useConnectedAccount } from "@crossbell/react-account";

import { useRootNavigation } from "./use-navigation";

export function useNavigateToLogin() {
  const navigation = useRootNavigation();
  return () => navigation.navigate("Login");
}

export function useAuthPress<T extends Function>(fn: T, cb?: (isConnected) => void) {
  const connectedAccount = useConnectedAccount();
  const navigationToLogin = useNavigateToLogin();
  return () => {
    cb?.(connectedAccount);

    if (connectedAccount) {
      fn();
    }
    else {
      navigationToLogin();
    }
  };
}
