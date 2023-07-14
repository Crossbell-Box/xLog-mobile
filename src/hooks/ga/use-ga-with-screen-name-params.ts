import { useMemo } from "react";

import { useCurrentRoute } from "../use-current-route";

export const useGAWithScreenParams = () => {
  const screenName = useCurrentRoute()?.name;
  const params = useMemo(() => ({
    screen_class: screenName,
    screen_name: screenName,
  }), [screenName]);

  return params;
};
