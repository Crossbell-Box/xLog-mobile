export const callChain = <E, T extends (e?: E) => unknown>(fns?: T[]) => {
  return (event?: E) => {
    fns?.forEach((fn) => {
      fn?.(event);
    });
  };
};
