import { createSyncStoragePersister as tanstackCreateSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import { cacheStorageCompat } from "./cache-storage";

/**
 * Creates an AsyncStorage persister
 */
export async function createSyncStoragePersisterAsync(storageKey = "reactQuery") {
  // await ensureCacheStorageDirExists();

  return tanstackCreateSyncStoragePersister({
    storage: cacheStorageCompat,
    key: storageKey,
  });
}
