import { useCallback, useState } from "react";

export const useToggle = (initialValue: boolean): [boolean, (boolean) => void] => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback((_v?: boolean) => {
    if (typeof _v === "boolean") {
      setValue(_v);
    }
    else {
      setValue(v => !v);
    }
  }, []);
  return [value, toggle];
};
