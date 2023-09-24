import React, { useEffect, useState } from "react";

import { ApolloProvider as _ApolloProvider } from "@apollo/client";
import { persistCache } from "apollo3-cache-persist";

import { cache, client } from "@/queries/graphql";
import { cacheStorageCompat } from "@/utils/cache-storage";

interface ApolloProviderProps extends React.PropsWithChildren {

}

export function ApolloProvider({ children }: ApolloProviderProps) {
  const [loadingCache, setLoadingCache] = useState(true);

  useEffect(() => {
    persistCache({
      cache,
      storage: cacheStorageCompat,
    }).then(() => setLoadingCache(false));
  }, []);

  if (loadingCache) {
    return null;
  }

  return (
    <_ApolloProvider client={client}>
      {children}
    </_ApolloProvider>
  );
}
