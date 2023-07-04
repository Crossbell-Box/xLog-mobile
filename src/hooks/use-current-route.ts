import { useNavigation } from "@react-navigation/native";

import { getActiveRoute } from "@/utils/get-active-route";

export const useCurrentRoute = () => {
  const navigation = useNavigation();
  return getActiveRoute(navigation.getState()) as {
    name: string
    params: Record<string, unknown>
  } | undefined;
};
