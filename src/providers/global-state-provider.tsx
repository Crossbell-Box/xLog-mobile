import React, { useMemo } from "react";

import { GlobalStateContext } from "@/context/global-state-context";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import type { LANGUAGES, Language } from "@/i18n";
import { LANGUAGE_STORAGE_KEY, i18n } from "@/i18n";
import { homeTabHeaderHeight } from "@/pages/Feed/HeaderAnimatedLayout";
import { cacheStorage } from "@/utils/cache-storage";

interface GlobalStateProviderProps extends React.PropsWithChildren {

}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const [language, _setLanguage] = React.useState<keyof typeof LANGUAGES>(i18n.language as keyof typeof LANGUAGES);
  const { isExpandedAnimValue, onScroll } = useScrollVisibilityHandler({ scrollThreshold: homeTabHeaderHeight });

  const setLanguage = (language: Language) => {
    _setLanguage(language);
    cacheStorage.set(LANGUAGE_STORAGE_KEY, language);
    i18n.changeLanguage(language);
  };

  const homeFeed = useMemo(() => {
    return {
      isExpandedAnimValue,
      onScroll,
    };
  }, [isExpandedAnimValue, onScroll]);

  return (
    <GlobalStateContext.Provider value={{ homeFeed, language, setLanguage }}>
      {children}
    </GlobalStateContext.Provider>
  );
}
