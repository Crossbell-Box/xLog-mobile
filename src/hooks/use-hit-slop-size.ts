import { useCallback, useMemo, useState } from "react";

import { callChain } from "@/utils/call-chain";

export const useHitSlopSize = (hitSlopSize: number) => {
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });
  const onLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({
      width,
      height,
    });
  }, []);

  const hitSlop = useMemo(() => {
    return {
      top: Math.max((hitSlopSize - layout.height) / 2, 0),
      bottom: Math.max((hitSlopSize - layout.height) / 2, 0),
      left: Math.max((hitSlopSize - layout.width) / 2, 0),
      right: Math.max((hitSlopSize - layout.width) / 2, 0),
    };
  }, [layout, hitSlopSize]);

  return {
    hitSlop,
    onLayout: callChain([onLayout]),
  };
};
