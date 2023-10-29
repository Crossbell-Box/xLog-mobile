import React, { useMemo } from "react";

import { type Country } from "@/constants/countries";
import { GlobalStateContext } from "@/context/global-state-context";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { HeaderTabHeight } from "@/pages/Feed/Header";
import { cacheStorage } from "@/utils/cache-storage";

import { COUNTRY_INFO_KEY } from "./preload-provider";

interface GlobalStateProviderProps extends React.PropsWithChildren {

}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [country, _setCountry] = React.useState<Country>(
    JSON.parse(cacheStorage.getString(COUNTRY_INFO_KEY) || "{}"),
  );
  const isChinese = country.alpha2 === "cn";
  const { isExpandedAnimValue, onScroll } = useScrollVisibilityHandler({ scrollThreshold: HeaderTabHeight });

  const setCountry = (country: Country) => {
    _setCountry(country);
    cacheStorage.set(COUNTRY_INFO_KEY, JSON.stringify(country));
  };

  const homeFeed = useMemo(() => {
    return {
      isExpandedAnimValue,
      onScroll,
    };
  }, [isExpandedAnimValue, onScroll]);

  return (
    <GlobalStateContext.Provider value={{ homeFeed, country, isChinese, setCountry }}>
      {children}
    </GlobalStateContext.Provider>
  );
}
