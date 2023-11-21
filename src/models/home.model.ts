import { gql } from "@apollo/client";
import dayjs from "dayjs";

import { client } from "@/queries/graphql";
import type { ExpandedNote } from "@/types/crossbell";

import filter from "../data/filter.json";

export type FeedType =
  | "latest"
  | "following"
  | "topic"
  | "hottest"
  | "search"
  | "tag"
  | "comments"
  | "character"
  | "featured"
  | "shorts";

export interface GetFeedOptions {
  type?: FeedType
  cursor?: string
  limit?: number
  characterId?: number
  daysInterval?: number
  searchKeyword?: string
  tags?: string[]
  topic?: string
}

export type GetFeedResult = Promise<{
  list: ExpandedNote[]
  cursor?: string | null | undefined
  count?: number | undefined
}>;

export const getShowcase = async () => {
  const oneMonthAgo = dayjs().subtract(10, "day").toISOString();

  const listResponse = await client
    .query(
      {
        query: gql`
        query getCharacters($filter: [Int!]) {
          characters(
            where: {
              characterId: { notIn: $filter }
              notes: {
                some: {
                  stat: { viewDetailCount: { gte: 300 } }
                  metadata: {
                    AND: [
                      { content: { path: "sources", array_contains: "xlog" } }
                      { content: { path: "tags", array_contains: "post" } }
                    ]
                  }
                }
              }
            }
          ) {
            characterId
          }
        }
      `,
        variables: {
          filter: filter.latest,
        },
      },
    );
  const characterList = listResponse.data?.characters.map((c: any) =>
    parseInt(c.characterId),
  );

  const result = await client
    .query(

      {
        query: gql`
        query getCharacters($identities: [Int!]) {
          characters(
            where: {
              characterId: {
                in: $identities
              }
            },
            orderBy: [{
              updatedAt: desc
            }]
          ) {
            handle
            characterId
            metadata {
              uri
              content
            }
          }
          notes(
            where: {
              characterId: {
                in: $identities
              },
              createdAt: {
                gt: "${oneMonthAgo}"
              },
              metadata: {
                content: {
                  path: "sources",
                  array_contains: "xlog"
                }
              }
            },
            orderBy: [{
              updatedAt: desc
            }]
          ) {
            characterId
            createdAt
          }
        }
      `,
        variables: {
          identities: characterList,
        },
      },
    );

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
    .slice(0, 50);

  return list;
};
