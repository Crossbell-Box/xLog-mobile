import { useDisconnectAccount } from "@crossbell/react-account";

import { GA } from "@/utils/GA";

import { useGlobalLoading } from "./use-global-loading";
import { useRootNavigation } from "./use-navigation";

export const useDisconnect = ({ navigateToLogin }: { navigateToLogin?: boolean } = { navigateToLogin: false }) => {
  const _disconnect = useDisconnectAccount();
  const navigation = useRootNavigation();
  const globalLoading = useGlobalLoading();

  const disconnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }
    globalLoading.show();
    _disconnect();
    GA.logEvent("user_signout");
    globalLoading.hide();
    navigation.navigate("Home", { screen: "Feed" });
  };

  return { disconnect };
};
