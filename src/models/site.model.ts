import { gql } from "@apollo/client";
import { cloneDeep } from "@apollo/client/utilities";
import { useContract } from "@crossbell/contract";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { Indexer } from "crossbell";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import type Unidata from "unidata.js";
import type { Profiles as UniProfiles } from "unidata.js";
import type { Address } from "viem";

import { client } from "@/queries/graphql";
import type { Profile, SiteNavigationItem } from "@/types/crossbell";
import { expandCrossbellCharacter, expandUnidataProfile } from "@/utils/expand-unit";

type Contract = ReturnType<typeof useContract>;

const indexer = new Indexer();

export type GetUserSitesParams =
  | {
    address: string
    unidata: Unidata
  }
  | {
    handle: string
    unidata: Unidata
  };

export const useGetUnreadCount = (
  data: Partial<Parameters<typeof indexer.notification.getUnreadCount>[0]>,
) => {
  return useQuery({
    queryKey: ["getUnreadCount", data],
    queryFn: async () => indexer.notification.getUnreadCount(data).catch(() => ({
      count: 0,
    })),
  });
};

export const useGetTips = (
  data: Partial<Parameters<typeof getTips>[0]>,
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

      return getTips(
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

export const getSiteSubscriptions = async (data: {
  characterId: number
  cursor?: string
  limit?: number
}) => {
  return indexer.link.getBacklinksOfCharacter(data.characterId, {
    linkType: "follow",
    cursor: data.cursor,
    limit: data.limit,
  });
};

export const getSiteToSubscriptions = async (data: {
  characterId: number
  cursor?: string
}) => {
  return indexer.link.getMany(data.characterId, {
    linkType: "follow",
    cursor: data.cursor,
  });
};

export async function getCommentsBySite(input: {
  characterId?: number
  cursor?: string
}) {
  const notes = await indexer.note.getMany({
    toCharacterId: input.characterId,
    limit: 7,
    includeCharacter: true,
    cursor: input.cursor,
    includeNestedNotes: true,
    nestedNotesDepth: 3 as const,
    nestedNotesLimit: 20,
  });

  notes.list = notes.list.filter(item =>
    item.toNote?.metadata?.content?.sources?.includes("xlog"),
  );

  return notes;
}

export const getUserSites = async (params: GetUserSitesParams) => {
  let profiles: UniProfiles | null = null;

  try {
    const source = "Crossbell Profile";
    const filter = { primary: true };

    if ("address" in params) {
      profiles = await (params.unidata).profiles.get({
        source,
        filter,
        identity: params.address,
        platform: "Ethereum",
      });
    }

    if ("handle" in params) {
      profiles = await (params.unidata).profiles.get({
        source,
        filter,
        identity: params.handle,
        platform: "Crossbell",
      });
    }
  }
  catch (error) {
    return null;
  }

  const sites: Profile[]
    = profiles?.list?.map((profile) => {
      expandUnidataProfile(profile);
      return profile;
    }) ?? [];

  return sites.length > 0 ? sites : null;
};

export interface GetAccountSitesParams {
  handle: string
  unidata: Unidata
}

export const getAccountSites = (
  params: GetAccountSitesParams,
): Promise<Profile[] | null> => {
  return getUserSites({
    handle: params.handle,
    unidata: params.unidata,
  });
};

export const getSite = async (input: string) => {
  const result = await indexer.character.getByHandle(input);
  if (result) {
    return expandCrossbellCharacter(result);
  }
};

export const getSites = async (input: number[]) => {
  const oneMonthAgo = dayjs().subtract(15, "day").toISOString();
  const result = await client
    .query({
      query: gql`
      query getCharacters($identities: [Int!], $limit: Int) {
        characters( where: { characterId: { in: $identities } }, orderBy: [{ updatedAt: desc }], take: $limit ) {
          handle
          characterId
          metadata {
            uri
            content
          }
        }
        notes( where: { characterId: { in: $identities }, createdAt: { gt: "${oneMonthAgo}" }, metadata: { content: { path: "sources", array_contains: "xlog" } } }, orderBy: [{ updatedAt: desc }] ) {
          characterId
          createdAt
        }
      }`,
      variables: {
        identities: input,
      },
    });

  result.data?.characters?.forEach((site: any) => {
    if (site.metadata.content) {
      site.metadata.content.name = site.metadata?.content?.name || site.handle;
    }
    else {
      site.metadata.content = {
        name: site.handle,
      };
    }

    site.custom_domain
      = site.metadata?.content?.attributes?.find(
        (a: any) => a.trait_type === "xlog_custom_domain",
      )?.value || "";
  });

  const createdAts: {
    [key: string]: string
  } = {};
  result.data?.notes.forEach((note: any) => {
    if (!createdAts[`${note.characterId}`])
      createdAts[`${note.characterId}`] = note.createdAt;
  });
  const list = Object.keys(createdAts)
    .map((characterId: string) => {
      const character = result.data?.characters.find(
        (c: any) => c.characterId === characterId,
      );

      return {
        ...character,
        createdAt: createdAts[characterId],
      };
    })
    .sort((a: any, b: any) => {
      return b.createdAt > a.createdAt ? 1 : -1;
    });

  return list;
};

export const getSubscription = async (input: {
  toCharacterId: number
  characterId: number
}) => {
  const result = await indexer.link.getMany(input.characterId, {
    linkType: "follow",
    toCharacterId: input.toCharacterId,
  });

  return !!result?.list?.length;
};

export async function updateSite(
  payload: {
    site: string
    name?: string
    description?: string
    icon?: string | null
    subdomain?: string
    navigation?: SiteNavigationItem[]
    css?: string
    ga?: string
    custom_domain?: string
    banner?: {
      address: string
      mime_type: string
    }
    connected_accounts?: Profile["connected_accounts"]
  },
  customUnidata: Unidata,
  newbieToken?: string,
) {
  return await (customUnidata).profiles.set(
    {
      source: "Crossbell Profile",
      identity: payload.site,
      platform: "Crossbell",
      action: "update",
    },
    {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { bio: payload.description }),
      ...(payload.icon && { avatars: [payload.icon] }),
      ...(payload.banner && { banners: [payload.banner] }),
      ...(payload.subdomain && { username: payload.subdomain }),
      ...(payload.connected_accounts && {
        connected_accounts: payload.connected_accounts,
      }),
      ...((payload.navigation !== undefined
        || payload.css !== undefined
        || payload.ga !== undefined
        || payload.custom_domain !== undefined) && {
        attributes: [
          ...(payload.navigation !== undefined
            ? [
              {
                trait_type: "xlog_navigation",
                value: JSON.stringify(payload.navigation),
              },
            ]
            : []),
          ...(payload.css !== undefined
            ? [
              {
                trait_type: "xlog_css",
                value: payload.css,
              },
            ]
            : []),
          ...(payload.ga !== undefined
            ? [
              {
                trait_type: "xlog_ga",
                value: payload.ga,
              },
            ]
            : []),
          ...(payload.custom_domain !== undefined
            ? [
              {
                trait_type: "xlog_custom_domain",
                value: payload.custom_domain,
              },
            ]
            : []),
        ],
      }),
    },
    {
      newbieToken,
    },
  );
}

export async function createSite(
  address: string,
  payload: { name: string; subdomain: string },
  customUnidata: Unidata,
) {
  return await (customUnidata).profiles.set(
    {
      source: "Crossbell Profile",
      identity: address,
      platform: "Ethereum",
      action: "add",
    },
    {
      username: payload.subdomain,
      name: payload.name,
      tags: [
        `navigation:${
          JSON.stringify([
            {
              id: nanoid(),
              label: "Archives",
              url: "/archives",
            },
          ])}`,
      ],
    },
  );
}

export async function getNFTs(address: string, customUnidata: Unidata) {
  const assets = await (customUnidata).assets.get({
    source: "Ethereum NFT",
    identity: address,
  });
  return assets;
}

export async function getStat({ characterId }: { characterId: string }) {
  if (characterId) {
    const [stat, site, subscriptions, comments, notes] = await Promise.all([
      (
        await fetch(
          `https://indexer.crossbell.io/v1/stat/characters/${characterId}`,
        )
      ).json(),
      indexer.character.get(characterId),
      indexer.link.getBacklinksOfCharacter(characterId, { limit: 0 }),
      indexer.note.getMany({
        limit: 0,
        toCharacterId: characterId,
      }),
      indexer.note.getMany({
        characterId,
        sources: "xlog",
        tags: ["post"],
        limit: 0,
      }),
    ]);
    return {
      viewsCount: stat.viewNoteCount,
      createdAt: site?.createdAt,
      subscriptionCount: subscriptions?.count,
      commentsCount: comments?.count,
      notesCount: notes?.count,
    };
  }
}

const getMiraTokenDecimals = async (contract: Contract) => {
  let decimals;
  try {
    decimals = await contract.tips.getTokenDecimals();
  }
  catch (error) {
    decimals = {
      data: 18,
    };
  }
  return decimals;
};

export async function getTips(
  input: {
    toCharacterId: string | number
    characterId?: string | number
    toNoteId?: string | number
    cursor?: string
    limit?: number
  },
  contract: Contract,
) {
  const address = await contract.tips.getTokenAddress();
  const tips = await indexer?.tip.getMany({
    characterId: input.characterId,
    toNoteId: input.toNoteId,
    toCharacterId: input.toCharacterId,
    tokenAddress: address?.data || "0xAfB95CC0BD320648B3E8Df6223d9CDD05EbeDC64",
    includeMetadata: true,
    limit: input.limit || 7,
    cursor: input.cursor,
  });

  if (tips?.list?.length) {
    const decimals = await getMiraTokenDecimals(contract);
    tips.list = tips.list.filter((t) => {
      return (
        BigInt(t.amount)
        >= BigInt(1) * BigInt(10) ** BigInt(decimals?.data || 18)
      );
    });
    tips.list = tips.list.map((t) => {
      return {
        ...t,
        amount: (
          BigInt(t.amount)
          / BigInt(10) ** BigInt(decimals?.data || 18)
        )?.toString(),
      };
    });
  }

  return tips;
}

export interface IAchievementItem {
  tokenId: number
  name: string
  status: "INACTIVE" | "MINTABLE" | "MINTED" | "COMING"
  mintedAt: string | null
  transactionHash: string | null
  info: {
    tokenId: number
    name: string
    description: string
    media: string
    attributes: [
      {
        trait_type: string
        value: string
      },
    ]
  }
}

export interface AchievementSection {
  info: {
    name: string
    title: string
  }
  groups: {
    info: {
      name: string
      title: string
    }
    items: IAchievementItem[]
  }[]
}

export async function getAchievements(characterId: string) {
  const crossbellAchievements = (await indexer.achievement.getMany(characterId))
    ?.list as unknown as AchievementSection[] | undefined;
  const xLogAchievements: AchievementSection[] = [
    {
      info: {
        name: "xlog-journey",
        title: "xLog Journey",
      },
      groups: [
        {
          info: {
            name: "showcase-superstar",
            title: "Showcase Superstar",
          },
          items: [
            {
              info: {
                attributes: [
                  {
                    trait_type: "tier",
                    value: "base",
                  },
                ],
                description: "I am a superstar on xLog!",
                media:
                  "ipfs://QmVnTtYC4yQ7D1eGb3Ke9NVDadovSPZeg2q2cYA6j275Um/influencer/influencer:special.png",
                tokenId: 0,
                name: "Showcase Superstar",
              },
              tokenId: 0,
              name: "showcase-superstar",
              status: "COMING",
              mintedAt: null,
              transactionHash: null,
            },
          ],
        },
        {
          info: {
            name: "mirror-xyz-migrator",
            title: "Mirror.xyz Migrator",
          },
          items: [
            {
              info: {
                attributes: [
                  {
                    trait_type: "tier",
                    value: "base",
                  },
                ],
                description: "I migrated from Mirror.xyz to xLog!",
                media:
                  "ipfs://bafybeicqfeaco6skylodk3cridjvntdxvbdaqhbtkky7exsxgdrzfp7gae",
                tokenId: 0,
                name: "Mirror.xyz Migrator",
              },
              tokenId: 0,
              name: "mirror-xyz-migrator",
              status: "COMING",
              mintedAt: null,
              transactionHash: null,
            },
          ],
        },
      ],
    },
  ];

  return {
    list: [...xLogAchievements, ...(crossbellAchievements || [])],
  };
}

export async function mintAchievement(input: {
  characterId: string
  achievementId: number
}) {
  return indexer.achievement.mint(input.characterId, input.achievementId);
}

export async function fetchTenant(
  host: string,
  retries: number,
): Promise<string> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=_xlog-challenge.${host}&type=TXT`,
    {
      headers: {
        accept: "application/dns-json",
      },
    },
  );
  const txt = await res.json();
  if (txt.Status === 5 && retries > 0) {
    // eslint-disable-next-line no-console
    console.log("retrying", host, retries - 1);
    return await fetchTenant(host, retries - 1);
  }
  else {
    return txt?.Answer?.[0]?.data?.replace?.(/^"|"$/g, "");
  }
}

export async function checkDomainServer(domain: string, handle: string) {
  const tenant = await fetchTenant(domain, 5);

  if (!tenant || tenant !== handle)
    return false;

  else
    return true;
}

export async function checkDomain(domain: string, handle: string) {
  const check = await (
    await fetch(`/api/check-domain?domain=${domain}&handle=${handle}`)
  ).json();

  return check.data;
}

export async function getGreenfieldId(cid: string) {
  const result = await (
    await fetch(`https://ipfs-relay.crossbell.io/map/ipfs2gnfd/${cid}`)
  ).json();

  return result;
}

export const getSiteByAddress = async (input: string) => {
  const result = await indexer.character.getMany(input as Address, {
    primary: true,
  });

  if (result?.list?.[0]) {
    return expandCrossbellCharacter(result.list[0]);
  }
};
