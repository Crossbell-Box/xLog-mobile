import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
// import { cacheExchange, createClient, fetchExchange } from "@urql/core";

// export const client = createClient({
//   url: "https://indexer.crossbell.io/v1/graphql",
//   exchanges: [cacheExchange, fetchExchange],
// });

export const cache = new InMemoryCache();

// Initialize Apollo Client
export const client = new ApolloClient({
  uri: "https://indexer.crossbell.io/v1/graphql",
  cache,
  defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
});
