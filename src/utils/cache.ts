import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPIRE_TIME = 60 * 60 * 1000 * 24 * 7;

export async function cacheGet(options: {
  key: string | object | number | Array<string | number | object>
  getValueFun: () => Promise<any>
  allowEmpty?: boolean
}) {
  const { key: _key, getValueFun, allowEmpty = false } = options;

  const key = Array.isArray(_key) ? _key.map(String).join("-") : _key.toString();
  try {
    const cacheValue = await AsyncStorage.getItem(key);
    if (cacheValue !== null) {
      const parsedValue = JSON.parse(cacheValue);
      if (new Date().getTime() < parsedValue.expire) {
        return parsedValue.value;
      }
    }

    const value = await getValueFun();
    if (value || allowEmpty) {
      const newCacheValue = {
        value,
        expire: new Date().getTime() + EXPIRE_TIME,
      };
      await AsyncStorage.setItem(key, JSON.stringify(newCacheValue));
    }
    return value;
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

export async function cacheDelete(_key: string | string[]) {
  const key = Array.isArray(_key) ? _key.join("-") : _key;
  try {
    await AsyncStorage.removeItem(key);
  }
  catch (error) {
    console.error(error);
  }
}
