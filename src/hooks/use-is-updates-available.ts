import { useEffect, useState } from "react";

import * as Updates from "expo-updates";

import { IS_DEV } from "@/constants";

export const useIsUpdatesAvailable = () => {
  const [isUpdatesAvailable, setIsUpdatesAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(!IS_DEV);

  useEffect(() => {
    if (IS_DEV) {
      setIsUpdatesAvailable(false);
    }
    else {
      Updates.checkForUpdateAsync()
        .then((update) => {
          if (update.isAvailable) {
            setIsUpdatesAvailable(true);

            setIsDownloading(true);
            Updates.fetchUpdateAsync()
              .then(res => setIsDownloaded(res.isNew))
              .finally(() => setIsDownloading(false));
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return {
    isUpdatesAvailable,
    isDownloading,
    isDownloaded,
    isLoading,
  };
};
