import { useCallback, useEffect, useState } from "react";

import { useAsyncStorage } from "@react-native-async-storage/async-storage";

interface UseStorageOptions<T> {
  defaultValue?: T
  /**
   * @description If the value is not in the list, it will fallback to the previous value or the default value
   * */
  validationValues?: unknown[]
}

export function useStorage<T>(
  key: string,
  options?: UseStorageOptions<T>,
) {
  const { defaultValue, validationValues } = options || {};
  const storageController = useAsyncStorage(key);
  const [value, _setValue] = useState<T | undefined>(defaultValue);

  const validateValue = (_value?: T) => {
    if (typeof defaultValue === "undefined" || !validationValues?.length) {
      return _value;
    }
    const isValid = validationValues?.includes(_value);
    if (isValid) {
      return _value;
    }

    if (value !== undefined) {
      console.warn(`Invalid value for ${key}: ${_value}, falling back to previous value: ${value}`);
      return value;
    }

    console.warn(`Invalid value for ${key}: ${_value}, falling back to default value: ${defaultValue}`);
    return defaultValue;
  };

  const setValue = useCallback((_value: T) => {
    if (typeof _value === "undefined") {
      return storageController.removeItem().then(() => _setValue(undefined));
    }

    const value = validateValue(_value);
    return storageController.setItem(JSON.stringify(value)).then(() => _setValue(value));
  }, [validateValue]);

  useEffect(() => {
    storageController.getItem().then((value) => {
      try {
        if (JSON.parse(value) === undefined) {
          setValue(defaultValue);
        }
      }
      catch (e) {
        setValue(JSON.parse(value));
      }
    });
  }, []);

  return [value, setValue] as const;
}
