import { cacheStorage } from "./cache-storage";

const namespace = "xlog";

let data: {
  [key: string]: any
} = {};

try {
  const value = cacheStorage.getString(namespace);
  data = JSON.parse(value || "{}");
}
catch (error) {}

export const getKeys = (key: string | string[]) => {
  return Object.keys(data).filter((k) => {
    if (typeof key === "string")
      return k.startsWith(key);

    else
      return key.some(item => k.startsWith(item));
  });
};

export const getStorage = async (key: string, noCache?: boolean) => {
  if (noCache) {
    try {
      data = JSON.parse(await cacheStorage.getString(namespace) || "{}");
    }
    catch (error) {}
  }
  return data[key];
};

export const setStorage = async (key: string, value: any) => {
  data[key]
    = typeof value !== "object" ? value : Object.assign({}, data[key], value);
  await cacheStorage.set(namespace, JSON.stringify(data));
};

export const delStorage = async (key: string) => {
  delete data[key];
  await cacheStorage.delete(namespace);
};
