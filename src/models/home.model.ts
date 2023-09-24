import { gql } from "@apollo/client";
import { indexer } from "@crossbell/indexer";
import type { CharacterEntity, NoteEntity } from "crossbell";
import dayjs from "dayjs";

import { client } from "@/queries/graphql";
import { expandCrossbellNote } from "@/utils/expand-unit";

import filter from "../data/filter.json";
import topics from "../data/topics.json";

export type SourceType =
  | "post"
  | "short";

export type SearchType =
  | "latest"
  | "following"
  | "topic"
  | "hottest"
  | "search"
  | "tag"
  | "comments"
  | "character"
  | "featured";

export async function getFeed(params: {
  sourceType: SourceType
  searchType?: SearchType
  cursor?: string
  limit?: number
  characterId?: number
  daysInterval?: number
  searchKeyword?: string
  tags?: string[]
  topic?: string
}) {
  const {
    searchType: _searchType,
    sourceType,
    cursor,
    limit = 12,
    characterId,
    daysInterval,
    searchKeyword,
    tags: _tags = [],
    topic,
  } = params;

  let searchType = _searchType;
  if (_searchType === "search" && !searchKeyword) {
    searchType = "latest";
  }

  const sourceQuery = `{
    content: {
      path: "tags",
      array_contains: "${sourceType}"
    }
  },`;

  const cursorQuery = cursor
    ? `
    cursor: {
      note_characterId_noteId_unique: {
        characterId: ${cursor.split("_")[0]},
        noteId: ${cursor.split("_")[1]}
      },
    },
  `
    : "";

  const resultFields = `
    characterId
    noteId
    character {
      handle
      characterId
      metadata {
        content
      }
    }
    stat {
      viewDetailCount
    }
    createdAt
    metadata {
      uri
      content
    }
  `;

  let resultAll: {
    list: NoteEntity[]
    cursor?: string | null
    count?: number
  } = {
    list: [],
    count: 0,
  };

  const tags = [..._tags, sourceType];

  switch (searchType) {
    case "latest": {
      const result = await client
        .query({
          query: gql`
          query getNotes($filter: [Int!], $limit: Int) {
            notes(
              where: {
                characterId: {
                  notIn: $filter
                },
                deleted: {
                  equals: false,
                },
                metadata: {
                    AND: [
                      ${sourceQuery}
                      {
                        content: {
                          path: "sources",
                          array_contains: "xlog"
                        }
                      }
                    ],
                    NOT: [
                      {
                        content: {
                          path: "tags",
                          array_starts_with: "comment"
                        }
                      }
                    ]
                }
              },
              orderBy: [{ createdAt: desc }],
              take: $limit,
              ${cursorQuery}
            ) {
              ${resultFields}
            }
          }
        `,
          variables: {
            filter: filter.latest,
            limit,
          },
        });

      const list = result?.data?.notes as NoteEntity[];

      resultAll = {
        list,
        cursor: list?.length
          ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
            ?.noteId}`
          : undefined,
        count: list?.length || 0,
      };
      break;
    }
    case "comments": {
      const result = await client
        .query(
          {
            query: gql`
            query getNotes($filter: [Int!], $limit: Int) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    AND: [
                      ${sourceQuery}
                      {
                        content: {
                          path: "sources",
                          array_contains: "xlog"
                        }
                      }, 
                      {
                        content: {
                          path: "tags",
                          array_contains: "comment"
                        }
                      }
                    ]
                  },
                },
                orderBy: [{ createdAt: desc }],
                take: $limit,
                ${cursorQuery}
              ) {
                ${resultFields}
                toNote {
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
              }
            }
          `,
            variables: {
              filter: filter.latest,
              limit,
            },
          },
        );

      const list = await Promise.all(
        result?.data?.notes
          .filter((page: NoteEntity) => {
            return !page.toNote?.metadata?.content?.tags?.includes("comment");
          })
          .map(async (page: NoteEntity) => {
            const expand = await expandCrossbellNote({ note: page });

            if (expand.toNote) {
              expand.toNote = await expandCrossbellNote({ note: expand.toNote });
            }

            return expand;
          }),
      );

      resultAll = {
        list,
        cursor: list?.length
          ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
            ?.noteId}`
          : undefined,
        count: list?.length || 0,
      };
      break;
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
        const result = await indexer.note.getManyOfCharacterFollowing(
          characterId,
          {
            sources: "xlog",
            tags,
            limit,
            cursor,
            includeCharacter: true,
          },
        );

        const list = await Promise.all(
          result.list.map((page: NoteEntity) =>
            expandCrossbellNote({ note: page }),
          ),
        );

        resultAll = {
          list,
          cursor: result.cursor,
          count: result.count,
        };
        break;
      }
    }
    case "topic": {
      const info = topics.find(t => t.name === topic);

      if (!info) {
        return {
          list: [],
          cursor: "",
          count: 0,
        };
      }

      const includeString = [
        ...(info.includeKeywords?.map(
          topicIncludeKeyword =>
            `{ content: { path: "title", string_contains: "${topicIncludeKeyword}" } }, { content: { path: "content", string_contains: "${topicIncludeKeyword}" } }`,
        ) || []),
        ...(info.includeTags?.map(
          topicIncludeTag =>
            `{ content: { path: "tags", array_contains: "${topicIncludeTag}" } },`,
        ) || []),
      ].join("\n");

      if (info.notes) {
        const orString = info.notes
          .map(
            note =>
              `{ noteId: { equals: ${
                note.split("-")[1]
              } }, characterId: { equals: ${note.split("-")[0]}}},`,
          )
          .join("\n");
        const result = await client
          .query(
            {
              query: gql`
            query getNotes($filter: [Int!], $limit: Int) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    AND: [
                      ${sourceQuery}
                      {
                        content: {
                          path: "sources",
                          array_contains: "xlog"
                        },
                      }
                    ]
                  },
                  OR: [
                    {
                      metadata: {
                        OR: [
                          ${includeString}
                        ]
                      }
                    },
                    {
                      OR: [
                        ${orString}
                      ]
                    }
                  ]
                },
                orderBy: [{ createdAt: desc }],
                take: $limit,
                ${cursorQuery}
              ) {
                ${resultFields}
              }
            }
          `,
              variables: {
                filter: filter.latest,
                limit,
              },
            },
          );

        const list = await Promise.all(
          result?.data?.notes.map((page: NoteEntity) =>
            expandCrossbellNote({ note: page }),
          ),
        );

        resultAll = {
          list,
          cursor: list?.length
            ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
              ?.noteId}`
            : undefined,
          count: list?.length || 0,
        };
        break;
      }
      else {
        const excludeString = [
          ...(info.excludeKeywords?.map(
            topicExcludeKeyword =>
              `{ NOT: { content: { path: "content", string_contains: "${topicExcludeKeyword}" } } },`,
          ) || []),
        ].join("\n");
        const result = await client
          .query(
            {
              query: gql`
            query getNotes($filter: [Int!], $limit: Int) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    AND: [
                      {
                        content: {
                          path: "sources",
                          array_contains: "xlog"
                        },
                      },
                      {
                        content: {
                          path: "tags",
                          array_contains: "post"
                        }
                      },
                      ${excludeString},
                      {
                        OR: [
                          ${includeString}
                        ]
                      }
                    ]
                  },
                },
                orderBy: [{ createdAt: desc }],
                take: $limit,
                ${cursorQuery}
              ) {
                ${resultFields}
              }
            }
          `,
              variables: {
                filter: filter.latest,
                limit,
              },
            },
          );

        const list = await Promise.all(
          result?.data?.notes.map((page: NoteEntity) =>
            expandCrossbellNote({ note: page }),
          ),
        );

        resultAll = {
          list,
          cursor: list?.length
            ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
              ?.noteId}`
            : undefined,
          count: list?.length || 0,
        };
        break;
      }
    }
    case "hottest": {
      let time;
      if (daysInterval) {
        time = dayjs().subtract(daysInterval, "day").toISOString();
      }

      const result = await client
        .query(

          {
            query: gql`
          query getNotes($filter: [Int!]) {
            notes(
              where: {
                characterId: {
                  notIn: $filter
                },
                deleted: {
                  equals: false,
                },
                ${
  time
    ? `
                createdAt: {
                  gt: "${time}"
                },
                `
    : ""
}
                stat: {
                  viewDetailCount: {
                    gt: 0
                  },
                },
                metadata: {
                  AND: [
                    ${sourceQuery}
                    {
                      content: {
                        path: "sources",
                        array_contains: "xlog"
                      },
                    }
                  ]
                },
              },
              take: 40,
              orderBy: {
                stat: {
                  viewDetailCount: desc
                }
              },
            ) {
              stat {
                viewDetailCount
              }
              ${resultFields}
            }
          }
        `,
            variables: {
              filter: filter.latest,
            },
          },
        );

      const list = result?.data?.notes as NoteEntity[];

      resultAll = {
        list,
        cursor: "",
        count: list?.length || 0,
      };
      break;
    }
    case "featured": {
      const result = await client
        .query(
          {
            query: gql`
          query getNotes($filter: [Int!], $limit: Int) {
            notes(
              where: {
                characterId: {
                  notIn: $filter
                },
                deleted: {
                  equals: false,
                },
                metadata: {
                  AND: [
                    ${sourceQuery}
                    {
                      content: {
                        path: "sources",
                        array_contains: "xlog"
                      }
                    }
                  ],
                  NOT: [
                    {
                      content: {
                        path: "tags",
                        array_starts_with: "comment"
                      }
                    }
                  ]
                },
                OR: [
                  # With over 30 views
                  {
                    stat: {
                      viewDetailCount: {
                        gt: 30
                      },
                    },
                  },
                  # Or have received comments
                  {
                    fromNotes: {
                      some: {
                        deleted: {
                          equals: false,
                        }
                      }
                    }
                  },
                  # Or have received tips
                  {
                    receivedTips: {
                      some: {
                        blockNumber: {
                          gt: 0
                        }
                      }
                    }
                  }
                ]
              },
              orderBy: [{ createdAt: desc }],
              take: $limit,
              ${cursorQuery}
            ) {
              stat {
                viewDetailCount
              }
              ${resultFields}
            }
          }
        `,
            variables: {
              filter: filter.latest,
              limit,
            },
          },
        );

      let list = await Promise.all(
        result?.data?.notes.map(
          async (
            page: NoteEntity & {
              stat: {
                viewDetailCount: number
                hotScore?: number
              }
            },
          ) => {
            const secondAgo = dayjs().diff(dayjs(page.createdAt), "second");
            page.stat.hotScore
              = page.stat.viewDetailCount / Math.max(Math.log10(secondAgo), 1);

            return await expandCrossbellNote({ note: page });
          },
        ),
      );

      const cursor = list?.length
        ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
          ?.noteId}`
        : undefined;

      list = list.sort((a, b) => {
        if (a.stat?.hotScore && b.stat?.hotScore) {
          return b.stat.hotScore - a.stat.hotScore;
        }
        else {
          return 0;
        }
      });

      resultAll = {
        list,
        cursor,
        count: list?.length || 0,
      };
      break;
    }
    case "character": {
      const result = await indexer.note.getMany({
        sources: "xlog",
        tags,
        limit,
        cursor,
        characterId,
        includeCharacter: true,
      });

      const list = await Promise.all(
        result.list.map((page: NoteEntity) => expandCrossbellNote({
          note: page,
          useStat: false,
        })),
      );

      resultAll = {
        list,
        cursor: result.cursor,
        count: result.count,
      };

      break;
    }
    case "search": {
      const result = await indexer.search.notes(searchKeyword!, {
        sources: ["xlog"],
        tags,
        limit,
        cursor,
        includeCharacterMetadata: true,
        orderBy: "createdAt",
      });

      const list = await Promise.all(
        result.list.map((page: NoteEntity) =>
          expandCrossbellNote({
            note: page,
            useStat: false,
            keyword: searchKeyword,
          }),
        ),
      );

      resultAll = {
        list,
        cursor: result.cursor,
        count: result.count,
      };
      break;
    }
    case "tag": {
      if (tags.length <= 1) {
        resultAll = {
          list: [],
          cursor: "",
          count: 0,
        };
        break;
      }

      const result = await indexer.note.getMany({
        sources: "xlog",
        tags,
        limit,
        cursor,
        characterId,
        includeCharacter: true,
        excludeCharacterId: filter.latest,
      } as any);

      const list = await Promise.all(
        result.list.map((page: NoteEntity) =>
          expandCrossbellNote({
            note: page,
            useStat: false,
          }),
        ),
      );

      resultAll = {
        list,
        cursor: result.cursor,
        count: result.count,
      };
      break;
    }
  }

  return resultAll;
}

export const getShowcase = async () => {
  const oneMonthAgo = dayjs().subtract(10, "day").toISOString();

  const listResponse = await client
    .query({
      query: gql`
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
      variables: {
        filter: filter.latest,
      },
    });

  const characterList = listResponse.data?.characters.map((c: any) =>
    parseInt(c.characterId),
  );

  const result = await client
    .query({
      query: gql`
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
      variables: {
        identities: characterList,
      },
    });

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
