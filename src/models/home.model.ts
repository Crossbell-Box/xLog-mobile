import { indexer } from "@crossbell/indexer";
import { createClient, cacheExchange, fetchExchange } from "@urql/core";
import type { CharacterEntity } from "crossbell";
import dayjs from "dayjs";

import { client } from "@/queries/graphql";

import filter from "../data/filter.json";

export type FeedType = "latest" | "following" | "topic" | "hot";

export async function getFeed({
  type,
  cursor,
  limit = 10,
  characterId,
  noteIds,
  daysInterval,
}: {
  type?: FeedType
  cursor?: string
  limit?: number
  characterId?: number
  noteIds?: string[]
  daysInterval?: number
}) {
  switch (type) {
    case "latest": {
      const result = await indexer.note.getMany({
        sources: "xlog",
        tags: ["post"],
        limit,
        cursor,
        includeCharacter: true,
      });

      return {
        list: result.list,
        cursor: result.cursor,
        count: result.count,
      };
    }
    case "following": {
      if (!characterId) {
        return {
          list: [],
          cursor: "",
          count: 0,
        };
      }
      else {
        const result = await indexer.note.getManyOfCharacterFollowing(characterId, {
          sources: "xlog",
          tags: ["post"],
          limit,
          cursor,
          includeCharacter: true,
        });

        return {
          list: result.list,
          cursor: result.cursor,
          count: result.count,
        };
      }
    }
    case "topic": {
      if (!noteIds) {
        return {
          list: [],
          cursor: "",
          count: 0,
        };
      }
      const client = createClient({
        url: "https://indexer.crossbell.io/v1/graphql",
        exchanges: [cacheExchange, fetchExchange],
      });

      const orString = noteIds
        .map(
          note =>
            `{ noteId: { equals: ${note.split("-")[1]
            } }, characterId: { equals: ${note.split("-")[0]}}},`,
        )
        .join("\n");
      const result = await client
        .query(
          `
              query getNotes {
                notes(
                  where: {
                    OR: [
                      ${orString}
                    ]
                  },
                  orderBy: [{ createdAt: desc }],
                  take: 1000,
                ) {
                  characterId
                  noteId
                  character {
                    handle
                    metadata {
                      content
                    }
                  }
                  createdAt
                  metadata {
                    uri
                    content
                  }
                }
              }`,
          {},
        )
        .toPromise();

      const list = result?.data?.notes;

      return {
        list,
        cursor: "",
        count: list?.length || 0,
      };
    }
    case "hot": {
      const client = createClient({
        url: "https://indexer.crossbell.io/v1/graphql",
        exchanges: [cacheExchange, fetchExchange],
      });

      let time;
      if (daysInterval)
        time = dayjs().subtract(daysInterval, "day").toISOString();

      const result = await client
        .query(
          `
              query getNotes {
                notes(
                  where: {
                    ${time ? `createdAt: { gt: "${time}" },` : ""}
                    stat: { viewDetailCount: { gt: 0 } },
                    metadata: { content: { path: "sources", array_contains: "xlog" }, AND: { content: { path: "tags", array_contains: "post" } } }
                  },
                  orderBy: { stat: { viewDetailCount: desc } },
                  take: 50,
                ) {
                  stat {
                    viewDetailCount
                  }
                  characterId
                  noteId
                  character {
                    handle
                    metadata {
                      content
                    }
                  }
                  createdAt
                  metadata {
                    uri
                    content
                  }
                }
              }`,
          {},
        )
        .toPromise();

      let list = await Promise.all(
        result?.data?.notes.map(async (page: any) => {
          if (daysInterval) {
            const secondAgo = dayjs().diff(dayjs(page.createdAt), "second");
            page.stat.hotScore
              = page.stat.viewDetailCount / Math.max(Math.log10(secondAgo), 1);
          }

          return page;
        }),
      );

      if (daysInterval) {
        list = list.sort((a, b) => {
          if (a.stat?.hotScore && b.stat?.hotScore)
            return b.stat.hotScore - a.stat.hotScore;
          else
            return 0;
        });
      }

      return {
        list,
        cursor: "",
        count: list?.length || 0,
      };
    }
  }
}

export const getShowcase = async () => {
  const oneMonthAgo = dayjs().subtract(10, "day").toISOString();

  const listResponse = await client
    .query(
      `
        query getCharacters($filter: [Int!]) {
          characters(
            where: {
              characterId: {
                notIn: $filter
              }
              notes: {
                some: {
                  stat: { viewDetailCount: { gte: 100 } }
                  metadata: {
                    content: { path: "sources", array_contains: "xlog" }
                    AND: { content: { path: "tags", array_contains: "post" } }
                  }
                }
              }
            }
          ) {
            characterId
          }
        }`,
      {
        filter: filter.latest,
      },
    )
    .toPromise();
  const characterList = listResponse.data?.characters.map((c: any) =>
    parseInt(c.characterId),
  );

  const result = await client
    .query(
      `
        query getCharacters($identities: [Int!]) {
          characters( where: { characterId: { in: $identities } }, orderBy: [{ updatedAt: desc }] ) {
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
      {
        identities: characterList,
      },
    )
    .toPromise();

  result.data?.characters?.forEach((site: any) => {
    if (site.metadata?.content) {
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
    if (!createdAts[`${note.characterId}`]) {
      createdAts[`${note.characterId}`] = note.createdAt;
    }
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
    })
    .slice(0, 100);

  return list as CharacterEntity[];
};
