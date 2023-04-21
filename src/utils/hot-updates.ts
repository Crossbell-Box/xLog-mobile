import { Alert } from "react-native";

import * as Updates from "expo-updates";

import { IS_DEV } from "@/constants";

export async function checkHotUpdates() {
  if (IS_DEV)
    return;

  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();

    Alert.alert(
      "Update Available",
      "A new version of the app is available. Restart the app to apply the update.",
      [
        {
          text: "Restart",
          onPress: async () => {
            await Updates.reloadAsync();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  }
}
