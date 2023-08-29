import React, { useMemo, useState } from "react";

import { GlobalAnimationContext } from "@/context/global-animation-context";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { HeaderTabHeight } from "@/pages/Feed/Header";

interface GlobalAnimationProviderProps extends React.PropsWithChildren {

}

export function GlobalAnimationProvider({ children }: GlobalAnimationProviderProps) {
  const { isExpandedAnimValue, onScroll } = useScrollVisibilityHandler({ scrollThreshold: HeaderTabHeight });

  const homeFeed = useMemo(() => {
    return {
      isExpandedAnimValue,
      onScroll,
    };
  }, [isExpandedAnimValue, onScroll]);

  return (
    <GlobalAnimationContext.Provider value={{ homeFeed }}>
      {children}
    </GlobalAnimationContext.Provider>
  );
}
