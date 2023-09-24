import { MMKV } from "react-native-mmkv";

const id = "cache-storage";

export const cacheStorage = new MMKV({ id });

export const cacheStorageCompat = {
  setItem(key: string, value: string) {
    cacheStorage.set(key, value);
  },
  getItem(key: string) {
    const value = cacheStorage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem(key: string) {
    cacheStorage.delete(key);
  },
};
