import { gql } from "@apollo/client";
import { indexer } from "@crossbell/indexer";
import type { CharacterEntity, Contract, ListResponse, MintedNoteEntity, NoteEntity } from "crossbell";
import type { Address } from "viem";

import type { Language } from "@/i18n";
import { client } from "@/queries/graphql";
import type { NoteType, PageVisibilityEnum, PagesSortTypes } from "@/types";
import type { ExpandedNote } from "@/types/crossbell";
import { expandCrossbellNote } from "@/utils/expand-unit";
import { getKeys, getStorage } from "@/utils/storage";

const getLocalPages = async (input: {
  characterId: number
  isPost?: boolean
  handle?: string
}) => {
  const pages: ExpandedNote[] = [];
  const keys = getKeys([`draft-${input.characterId}-`, `draft-${input.handle}-`]);

  for (const key of keys) {
    const page = await getStorage(key);
    if (input.isPost === undefined || page.isPost === input.isPost) {
      const note: ExpandedNote & NoteEntity = {
        characterId: input.characterId,
        noteId: 0,
        draftKey: key
          .replace(`draft-${input.characterId}-`, "")
          .replace(`draft-${input.handle}-${input.characterId}-`, ""), // In order to be compatible with old drafts
        linkItemType: null,
        linkKey: "",
        toCharacterId: null,
        toAddress: null,
        toNoteId: null,
        toHeadCharacterId: null,
        toHeadNoteId: null,
        toContractAddress: null,
        toTokenId: null,
        toLinklistId: null,
        toUri: null,
        deleted: false,
        locked: false,
        contractAddress: null,
        uri: null,
        operator: "" as Address, // TODO: check usage and replace it with viem's `zeroAddress`.
        owner: "" as Address, // TODO: check usage and replace it with viem's `zeroAddress`.
        createdAt: new Date(page.date).toISOString(),
        publishedAt: new Date(page.date).toISOString(),
        updatedAt: new Date(page.date).toISOString(),
        deletedAt: null,
        transactionHash: "" as Address, // TODO: check usage and replace it with viem's `zeroAddress`.
        blockNumber: 0,
        logIndex: 0,
        updatedTransactionHash: "" as Address, // TODO: check usage and replace it with viem's `zeroAddress`.
        updatedBlockNumber: 0,
        updatedLogIndex: 0,
        metadata: {
          content: {
            title: page.values?.title,
            content: page.values?.content,
            date_published: page.values?.publishedAt,
            summary: page.values?.excerpt,
            tags: [
              page.isPost ? "post" : "page",
              ...(page.values?.tags
                ?.split(",")
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag) || []),
            ],
            slug: page.values?.slug,
            sources: ["xlog"],
            disableAISummary: page.values?.disableAISummary,
          },
        },
        local: true,
        stat: { viewDetailCount: 0 },
      };
      pages.push(note);
    }
  }

  return pages;
};

export async function getMints({
  characterId,
  noteId,
  cursor,
  includeCharacter,
}: {
  characterId: number
  noteId: number
  cursor?: string
  includeCharacter?: boolean
}) {
  const data = await indexer.mintedNote.getManyOfNote(characterId, noteId, {
    cursor,
    limit: 5,
  });

  if (includeCharacter) {
    await Promise.all(
      data.list.map(async (item: any) => {
        if (!item.character) {
          item.character = await indexer.character.getPrimary(item.owner);
        }
      }),
    );
  }

  return data as ListResponse<
  MintedNoteEntity & {
    character: CharacterEntity
  }
  >;
}

export async function anonymousComment(input: {
  targetCharacterId: number
  targetNoteId: number
  content: string
  name: string
  email: string
}) {
  return await fetch("https://xlog.app/api/anonymous/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetCharacterId: input.targetCharacterId,
      targetNoteId: input.targetNoteId,
      content: input.content,
      name: input.name,
      email: input.email,
    }),
  });
}

export async function checkMint({
  address,
  noteCharacterId,
  noteId,
}: {
  address: string
  noteCharacterId: number
  noteId: number
}) {
  return indexer.mintedNote.getManyOfAddress(address as Address, {
    noteCharacterId,
    noteId,
  });
}

export async function getComment(...parmas: Parameters<typeof indexer.note.get>) {
  const res = (await indexer.note.get(...parmas)) || {
    count: 0,
    list: [],
  };

  return res as Awaited<ReturnType<typeof indexer.note.get>>;
}

export async function getComments({
  characterId,
  noteId,
  cursor,
  limit,
}: {
  characterId: number
  noteId: number
  cursor?: string
  limit?: number
}) {
  type Options = Parameters<typeof indexer.note.getMany>[0];
  const options: Options = {
    toCharacterId: characterId,
    toNoteId: noteId,
    cursor,
    includeCharacter: true,
    includeNestedNotes: true,
    nestedNotesDepth: 3 as const,
    nestedNotesLimit: 20,
    limit: limit ?? 5,
  };

  const res = (await indexer.note.getMany(options)) || {
    count: 0,
    list: [],
  };

  return res as Awaited<ReturnType<typeof indexer.note.getMany>>;
}

export async function updateComment(
  {
    content,
    characterId,
    noteId,
  }: {
    content: string
    characterId: number
    noteId: number
  },
  contract: Contract,
) {
  return contract.note.setMetadata({
    characterId,
    noteId,
    metadata: {
      content,
      tags: ["comment"],
      sources: ["xlog"],
    },
  });
}

export async function checkMirror(characterId: number) {
  const notes = await indexer.note.getMany({
    characterId,
    sources: "xlog",
    tags: ["post", "Mirror.xyz"],
    limit: 0,
  });

  return notes.count === 0;
}

export async function getPage<TRender extends boolean = false>(input: {
  slug?: string
  characterId: number
  useStat?: boolean
  noteId?: number
  handle?: string // In order to be compatible with old drafts
}) {
  const mustLocal = input.slug?.startsWith("local-") && !input.noteId;

  let page: NoteEntity | null = null;

  if (!mustLocal) {
    if (!input.noteId) {
      const result = await client
        .query({
          query: gql`
          query getNotes {
            notes(
              where: {
                characterId: {
                  equals: ${input.characterId},
                },
                deleted: {
                  equals: false,
                },
                metadata: {
                  AND: [
                    {
                      content: {
                        path: ["sources"],
                        array_contains: ["xlog"]
                      },
                    },
                    {
                      OR: [
                        {
                          content: {
                            path: ["attributes"],
                            array_contains: [{
                              trait_type: "xlog_slug",
                              value: "${input.slug}",
                            }]
                          }
                        },
                        {
                          content: {
                            path: ["title"],
                            equals: "${decodeURIComponent(input.slug!)}"
                          },
                        }
                      ]
                    }
                  ]
                },
              },
              orderBy: [{ createdAt: desc }],
              take: 1,
            ) {
              characterId
              noteId
              uri
              metadata {
                uri
                content
              }
              owner
              createdAt
              updatedAt
              publishedAt
              transactionHash
              blockNumber
              updatedTransactionHash
              updatedBlockNumber
              ${
  input.useStat
    ? `stat {
                viewDetailCount
              }`
    : ""
}
            }
          }`,
        });
      page = result.data.notes[0];
    }
    else {
      const result = await client
        .query({
          query: gql`
          query getNote {
            note(
              where: {
                note_characterId_noteId_unique: {
                  characterId: ${input.characterId},
                  noteId: ${input.noteId},
                },
              },
            ) {
              characterId
              noteId
              uri
              metadata {
                uri
                content
              }
              owner
              createdAt
              updatedAt
              publishedAt
              transactionHash
              blockNumber
              updatedTransactionHash
              updatedBlockNumber
              ${
  input.useStat
    ? `stat {
                viewDetailCount
              }`
    : ""
}
            }
          }`,
        });
      page = result.data.note;
    }
  }

  // local page
  const local = await getLocalPages({
    characterId: input.characterId,
    handle: input.handle,
  });
  const localPages = local.filter(
    page =>
      page.draftKey === `${input.noteId}` || page.draftKey === input.slug,
  );
  const localPage
    = localPages.length
    && localPages.reduce((prev, current) => {
      return prev.updatedAt > current.updatedAt ? prev : current;
    });

  let expandedNote: ExpandedNote | undefined;
  if (page) {
    expandedNote = await expandCrossbellNote({
      note: page,
      useStat: input.useStat,
    });
  }

  if (localPage) {
    if (expandedNote) {
      if (new Date(localPage.updatedAt) > new Date(expandedNote.updatedAt)) {
        expandedNote = {
          ...expandedNote,
          metadata: {
            content: localPage.metadata?.content,
          },
          local: true,
        };
      }
    }
    else {
      expandedNote = localPage;
    }
  }

  return expandedNote;
}

export type GetPagesBySite = (input: {
  characterId?: number
  type: NoteType | NoteType[]
  visibility?: PageVisibilityEnum
  limit?: number
  cursor?: string
  tags?: string[]
  useStat?: boolean
  useHTML?: boolean
  keepBody?: boolean
  handle?: string
  skipExpansion?: boolean
  sortType?: PagesSortTypes
  useImageDimensions?: boolean
  translateTo?: Language
}) => Promise<{
  pinnedNoteId: number | undefined
  list: any[]
  count: any
  cursor: string | null
} | {
  count: number
  list: never[]
  cursor: null
}>;
