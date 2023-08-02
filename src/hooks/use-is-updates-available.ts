import { useEffect, useState } from "react";

import * as Updates from "expo-updates";

import { IS_DEV } from "@/constants";

export const useIsUpdatesAvailable = () => {
  const [isUpdatesAvailable, setIsUpdatesAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(!IS_DEV);

  useEffect(() => {
    if (IS_DEV) {
      setIsUpdatesAvailable(false);
    }
    else {
      Updates.checkForUpdateAsync()
        .then((update) => {
          setIsUpdatesAvailable(update.isAvailable);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return { isUpdatesAvailable, isLoading };
};
