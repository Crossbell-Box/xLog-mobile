import { useContract } from "@crossbell/contract";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as siteModel from "@/models/site.model";

import { useUnidata } from "./unidata";

export const useGetSite = (input?: string) => {
  const unidata = useUnidata();
  return useQuery(["getSite", input], async () => {
    if (!input)
      return null;

    return siteModel.getSite(input, unidata);
  });
};

export const useGetSites = (input: number[]) => {
  return useQuery(["getSites", input], async () => {
    if (!input)
      return null;

    return siteModel.getSites(input);
  });
};

export const useGetSiteSubscriptions = (data: { siteId: string }) => {
  const unidata = useUnidata();
  return useInfiniteQuery({
    queryKey: ["getSiteSubscriptions", data],
    queryFn: async ({ pageParam }) => {
      if (!data.siteId) {
        return {
          total: 0,
          list: [],
          cursor: undefined,
        };
      }
      return siteModel.getSiteSubscriptions(
        {
          ...data,
          cursor: pageParam,
        },
        unidata,
      );
    },
    // @ts-expect-error
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
};

export const useGetSiteToSubscriptions = (data: { siteId: string }) => {
  const unidata = useUnidata();
  return useInfiniteQuery({
    queryKey: ["getSiteToSubscriptions", data],
    queryFn: async ({ pageParam }) => {
      if (!data.siteId) {
        return {
          total: 0,
          list: [],
          cursor: undefined,
        };
      }
      return siteModel.getSiteToSubscriptions(
        {
          ...data,
          cursor: pageParam,
        },
        unidata,
      );
    },
    // @ts-expect-error
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
};

export const useGetOperators = (
  data: Parameters<typeof siteModel.getOperators>[0],
) => {
  return useQuery(["getOperators", data], async () => {
    if (!data.characterId)
      return null;

    return siteModel.getOperators(data);
  });
};

export const useIsOperators = (
  data: Partial<Parameters<typeof siteModel.isOperators>[0]>,
) => {
  return useQuery(["isOperators", data], async () => {
    if (!data.characterId || !data.operator)
      return null;

    return siteModel.isOperators({
      characterId: data.characterId,
      operator: data.operator,
    });
  });
};

export function useAddOperator() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Parameters<typeof siteModel.addOperator>[0]) => {
      return siteModel.addOperator(input, contract);
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getOperators",
          {
            characterId: variables.characterId,
          },
        ]);
        queryClient.invalidateQueries(["isOperators", variables]);
      },
    },
  );
}

export function useRemoveOperator() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Partial<Parameters<typeof siteModel.removeOperator>[0]>) => {
      if (!input.operator || !input.characterId)
        return null;

      return siteModel.removeOperator(
        {
          operator: input.operator,
          characterId: input.characterId,
        },
        contract,
      );
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getOperators",
          {
            characterId: variables.characterId,
          },
        ]);
        queryClient.invalidateQueries(["isOperators", variables]);
      },
    },
  );
}

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

export function useTipCharacter() {
  const queryClient = useQueryClient();
  const contract = useContract();
  const mutation = useMutation(
    async (payload: Parameters<typeof siteModel.tipCharacter>[0]) => {
      return siteModel.tipCharacter(payload, contract);
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getTips",
          {
            toCharacterId: variables.toCharacterId,
          },
        ]);
      },
    },
  );
  return mutation;
}

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

export const useGetMiraBalance = (characterId?: string) => {
  const contract = useContract();
  return useQuery(["getMiraBalance", characterId], async () => {
    if (!characterId) {
      return {
        data: "Loading...",
      };
    }
    return siteModel.getMiraBalance(characterId, contract);
  });
};

export const useGetGreenfieldId = (cid?: string) => {
  return useQuery(["getGreenfieldId", cid], async () => {
    if (!cid)
      return null;

    return siteModel.getGreenfieldId(cid);
  });
};
