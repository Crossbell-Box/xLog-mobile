import { useDisconnectAccount } from "@crossbell/react-account";

import { GA } from "@/utils/GA";

import { useRootNavigation } from "./use-navigation";

export const useDisconnect = ({ navigateToLogin }: { navigateToLogin?: boolean } = { navigateToLogin: false }) => {
  const _disconnect = useDisconnectAccount();
  const navigation = useRootNavigation();

  const disconnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }

    _disconnect();
    GA.logEvent("user_signout");
    navigation.navigate("Home", { screen: "Feed" });
  };

  return { disconnect };
};
