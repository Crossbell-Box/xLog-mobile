import React, { useEffect, useState } from "react";

import { ApolloProvider as _ApolloProvider } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistCache } from "apollo3-cache-persist";

import { cache, client } from "@/queries/graphql";

interface ApolloProviderProps extends React.PropsWithChildren {

}

export function ApolloProvider({ children }: ApolloProviderProps) {
  const [loadingCache, setLoadingCache] = useState(true);

  useEffect(() => {
    persistCache({
      cache,
      storage: AsyncStorage,
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
