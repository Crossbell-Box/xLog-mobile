import { useState, type FC, type PropsWithChildren, useEffect } from "react";

import { QueryClient } from "@tanstack/react-query";
import type { Persister } from "@tanstack/react-query-persist-client";
import { PersistQueryClientProvider as TanstackPersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { createSyncStoragePersisterAsync } from "@/utils/persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

export const PersistQueryClientProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [persister, setPersister] = useState<Persister | undefined>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    createSyncStoragePersisterAsync().then((persister) => {
      setPersister(persister);
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  return (
    <TanstackPersistQueryClientProvider
      key={"PersistQueryClientProvider"}
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryIsReadyForPersistance = query.state.status === "success";
            if (queryIsReadyForPersistance)
              return !((query.state?.data as any)?.pages?.length > 1);

            else
              return false;
          },
        },
      }}
    >
      {children}
    </TanstackPersistQueryClientProvider>
  );
};
