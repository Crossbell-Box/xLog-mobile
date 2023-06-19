import { useCallback, useEffect, useState } from "react";

import { useAsyncStorage } from "@react-native-async-storage/async-storage";

interface UseStorageOptions<T> {
  defaultValue?: T
  validationValues?: unknown[]
}

export function useStorage<T>(
  key: string,
  options?: UseStorageOptions<T>,
) {
  const { defaultValue, validationValues } = options || {};
  const storageController = useAsyncStorage(key);
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
    if (typeof _value === "undefined")
      return storageController.removeItem().then(() => _setValue(undefined));

    const validatedValue = validateValue(_value);
    return storageController.setItem(JSON.stringify(validatedValue)).then(() => _setValue(validatedValue));
  }, [validateValue, storageController]);

  useEffect(() => {
    storageController.getItem().then((item) => {
      try {
        const parsedItem = JSON.parse(item!);

        if (parsedItem)
          _setValue(parsedItem);

        else
          setValue(defaultValue);
      }
      catch (e) {
        console.error(`Failed to parse value for ${key}: ${item}, setting to default value: ${defaultValue}`);
        setValue(defaultValue);
      }
    });
  }, [defaultValue, setValue, storageController]);

  return [value, setValue] as const;
}
