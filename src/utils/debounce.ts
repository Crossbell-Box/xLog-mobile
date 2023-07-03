export const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

