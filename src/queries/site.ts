import { useContract } from "@crossbell/contract";
import { useAccountState, useFollowCharacter, useFollowCharacters, useUnfollowCharacter } from "@crossbell/react-account";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as siteModel from "@/models/site.model";

export const useGetSite = (input?: string) => {
  return useQuery(["getSite", input], async () => {
    if (!input) {
      return null;
    }
    return siteModel.getSite(input);
  });
};

export const useGetSites = (input: number[]) => {
  return useQuery(["getSites", input], async () => {
    if (!input)
      return null;

    return siteModel.getSites(input);
  });
};

export const useGetSubscription = (toCharacterId?: number) => {
  const account = useAccountState(s => s.computed.account);

  return useQuery(
    ["getSubscription", toCharacterId, account?.characterId],
    async () => {
      if (!account?.characterId || !toCharacterId) {
        return false;
      }

      return siteModel.getSubscription({
        characterId: account?.characterId,
        toCharacterId,
      });
    },
  );
};

export function useSubscribeToSite() {
  const queryClient = useQueryClient();
  const account = useAccountState(s => s.computed.account);

  return useFollowCharacter({
    onSuccess: (data, variables: any) => {
      return Promise.all([
        queryClient.invalidateQueries([
          "getSiteSubscriptions",
          {
            characterId: variables.characterId,
          },
        ]),

        queryClient.invalidateQueries([
          "getSubscription",
          variables.characterId,
          account?.characterId,
        ]),
      ]);
    },
  });
}

export function useSubscribeToSites() {
  const queryClient = useQueryClient();
  const currentCharacterId = useAccountState(
    s => s.computed.account?.characterId,
  );

  return useFollowCharacters({
    onSuccess: (_, variables: any) =>
      Promise.all(
        variables.siteIds.flatMap((characterId: number) => {
          return [
            queryClient.invalidateQueries([
              "getSiteSubscriptions",
              {
                characterId,
              },
            ]),

            queryClient.invalidateQueries([
              "getSubscription",
              characterId,
              currentCharacterId,
            ]),
          ];
        }),
      ),
  });
}

export function useUnsubscribeFromSite() {
  const queryClient = useQueryClient();
  const account = useAccountState(s => s.computed.account);

  return useUnfollowCharacter({
    onSuccess: (data, variables: any) => {
      return Promise.all([
        queryClient.invalidateQueries([
          "getSiteSubscriptions",
          {
            siteId: variables.characterId,
          },
        ]),
        queryClient.invalidateQueries([
          "getSubscription",
          variables.characterId,
          account?.characterId,
        ]),
      ]);
    },
  });
}

export const useGetSiteSubscriptions = (data: { characterId?: number }) => {
  return useInfiniteQuery({
    queryKey: ["getSiteSubscriptions", data],
    queryFn: async ({ pageParam }) => {
      if (!data.characterId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        };
      }
      return siteModel.getSiteSubscriptions({
        characterId: data.characterId,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
};

export const useGetSiteToSubscriptions = (data: { characterId?: number }) => {
  return useInfiniteQuery({
    queryKey: ["getSiteToSubscriptions", data],
    queryFn: async ({ pageParam }) => {
      if (!data.characterId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        };
      }
      return siteModel.getSiteToSubscriptions({
        characterId: data.characterId,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
};

export const useGetNFTs = (address: string) => {
  return useQuery(["getNFTs", address], async () => {
    if (!address)
      return null;

    return await (
      await fetch(
        `/api/nfts?${
          new URLSearchParams({
            address,
          } as any)}`,
      )
    ).json();
  });
};

export const useGetCommentsBySite = (
  data: Partial<Parameters<typeof siteModel.getCommentsBySite>[0]>,
) => {
  return useInfiniteQuery({
    queryKey: ["getCommentsBySite", data],
    queryFn: async ({ pageParam }) => {
      if (!data.characterId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        };
      }
      return siteModel.getCommentsBySite({
        characterId: data.characterId,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage.cursor || undefined,
  });
};

export const useGetStat = (
  data: Partial<Parameters<typeof siteModel.getStat>[0]>,
) => {
  return useQuery(["getStat", data.characterId], async () => {
    if (!data.characterId)
      return null;

    return siteModel.getStat({
      characterId: data.characterId,
    });
  });
};

export const useGetTips = (
  data: Partial<Parameters<typeof siteModel.getTips>[0]>,
) => {
  const contract = useContract();
  return useInfiniteQuery({
    queryKey: ["getTips", data],
    queryFn: async ({ pageParam }) => {
      if (!data.toCharacterId || data.characterId === "0") {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        };
      }
      return siteModel.getTips(
        {
          ...data,
          toCharacterId: data.toCharacterId,
          cursor: pageParam,
        },
        contract,
      );
    },
    getNextPageParam: lastPage => lastPage.cursor || undefined,
  });
};

export const useGetAchievements = (characterId?: string) => {
  return useQuery(["getAchievements", characterId], async () => {
    if (!characterId)
      return null;

    return siteModel.getAchievements(characterId);
  });
};

export const useMintAchievement = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Parameters<typeof siteModel.mintAchievement>[0]) => {
      return siteModel.mintAchievement(input);
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getAchievements",
          variables.characterId,
        ]);
      },
    },
  );
};

export const useGetGreenfieldId = (cid?: string) => {
  return useQuery(["getGreenfieldId", cid], async () => {
    if (!cid)
      return null;

    return siteModel.getGreenfieldId(cid);
  });
};
