import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

/**
 * Creates an AsyncStorage persister
 */
export function createAsyncStoragePersister(storageKey = "reactQuery") {
  return {
    persistClient: async (client: PersistedClient) => {
      await AsyncStorage.setItem(storageKey, JSON.stringify(client));
    },
    restoreClient: async () => {
      const value = await AsyncStorage.getItem(storageKey);
      if (value !== null)
        return JSON.parse(value) as PersistedClient;

      return undefined;
    },
    removeClient: async () => {
      await AsyncStorage.removeItem(storageKey);
    },
  } as Persister;
}
