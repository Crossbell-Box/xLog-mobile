import { useLayoutEffect, useRef, useState } from "react";

export const useMounted = () => {
  const mounted = useRef(false);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return mounted;
};
