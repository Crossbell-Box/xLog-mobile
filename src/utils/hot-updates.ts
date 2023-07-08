import * as Updates from "expo-updates";

import { IS_DEV } from "@/constants";

export async function checkHotUpdates() {
  if (IS_DEV) {
    throw new Error("No updates available in dev mode");
  }

  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    return await Updates.fetchUpdateAsync();
  }
  else {
    throw new Error("No updates available");
  }
}
