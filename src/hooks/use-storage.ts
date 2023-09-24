import { useCallback, useEffect, useState } from "react";

import { cacheStorage } from "@/utils/cache-storage";

interface UseStorageOptions<T> {
  defaultValue?: T
  validationValues?: unknown[]
}

export function useStorage<T>(
  key: string,
  options?: UseStorageOptions<T>,
) {
  const { defaultValue, validationValues } = options || {};
  const [value, _setValue] = useState<T | undefined>(defaultValue);

  const validateValue = useCallback((_value?: T) => {
    if (!validationValues?.length)
      return _value;

    const isValid = validationValues?.includes(_value);
    if (isValid)
      return _value;

    console.warn(`Invalid value for ${key}: ${_value}, falling back to previous value: ${value}`);
    return value || defaultValue;
  }, [value, defaultValue, validationValues]);

  const setValue = useCallback((_value?: T) => {
    if (typeof _value === "undefined") {
      cacheStorage.delete(key);
      _setValue(undefined);
    }

    const validatedValue = validateValue(_value);
    cacheStorage.set(key, JSON.stringify(validatedValue));
    _setValue(validatedValue);
  }, [validateValue]);

  useEffect(() => {
    const item = cacheStorage.getString(key);

    try {
      if (!item)
        return setValue(defaultValue); // set default value if no item found and update state

      const parsedItem = JSON.parse(item!);

      if (parsedItem)
        _setValue(parsedItem); // update state
    }
    catch (e) {
      console.error(`Failed to parse value for ${key}: ${item}, setting to default value: ${defaultValue}`);
      setValue(defaultValue); // set default value if parsing failed and update state
    }
  }, [defaultValue, setValue]);

  return [value, setValue] as const;
}
