import { indexer } from "@crossbell/indexer";
import type { NoteEntity } from "crossbell.js";

import { PageVisibilityEnum } from "@/types";
import type { ExpandedNote } from "@/types/crossbell";
import { getKeys, getStorage } from "@/utils/storage";

const getLocalPages = async (input: {
  characterId: number
  isPost?: boolean
  handle?: string
}) => {
  const pages: ExpandedNote[] = [];
  const keys = getKeys([`draft-${input.characterId}-`, `draft-${input.handle}-`]);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const page = await getStorage(key);
    if (input.isPost === undefined || page.isPost === input.isPost) {
      const note: ExpandedNote = {
        characterId: input.characterId,
        noteId: 0,
        // @ts-expect-error
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
        operator: "",
        owner: "",
        createdAt: new Date(page.date).toISOString(),
        updatedAt: new Date(page.date).toISOString(),
        deletedAt: null,
        transactionHash: "",
        blockNumber: 0,
        logIndex: 0,
        updatedTransactionHash: "",
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
          },
        },
        local: true,
      };
      pages.push(note);
    }
  }
  return pages;
};

export async function getPagesBySite(input: {
  characterId?: number
  type: "post" | "page"
  visibility?: PageVisibilityEnum
  limit?: number
  cursor?: string
  tags?: string[]
  useStat?: boolean
  keepBody?: boolean
  handle?: string // In order to be compatible with old drafts
}) {
  if (!input.characterId) {
    return {
      count: 0,
      list: [],
      cursor: null,
    };
  }

  const visibility = input.visibility || PageVisibilityEnum.All;

  const notes = await indexer.getNotes({
    characterId: input.characterId,
    limit: input.limit || 10,
    cursor: input.cursor,
    orderBy: "publishedAt",
    tags: [...(input.tags || []), input.type],
    sources: "xlog",
  });

  const list = await Promise.all(
    notes?.list.map(async (note) => {
      const expanded = note;
      if (!input.keepBody)
        delete expanded.metadata?.content?.content;

      return expanded;
    }),
  );

  const expandedNotes: {
    list: NoteEntity[]
    count: number
    cursor: string | null
  } = Object.assign(notes, {
    list,
  });

  const local = await getLocalPages({
    characterId: input.characterId,
    isPost: input.type === "post",
    handle: input.handle,
  });

  local.forEach((localPage) => {
    const index = expandedNotes.list.findIndex(
      // @ts-expect-error
      page => localPage.draftKey === `${page.noteId || page.draftKey}`,
    );
    if (index !== -1) {
      if (
        new Date(localPage.updatedAt)
          > new Date(expandedNotes.list[index].updatedAt)
      ) {
        expandedNotes.list[index] = {
          ...expandedNotes.list[index],
          metadata: {
            content: localPage.metadata?.content,
          },
          // @ts-expect-error
          local: true,
          // @ts-expect-error
          draftKey: localPage.draftKey,
        };
      }
    }
    else {
      expandedNotes.list.push(localPage);
      expandedNotes.count++;
    }
  });

  switch (visibility) {
    case PageVisibilityEnum.Published:
      expandedNotes.list = expandedNotes.list.filter(
        page =>
          (!page.metadata?.content?.date_published
              || +new Date(page.metadata?.content?.date_published) <= +new Date())
            && page.noteId,
      );
      break;
    case PageVisibilityEnum.Draft:
      expandedNotes.list = expandedNotes.list.filter(page => !page.noteId);
      break;
    case PageVisibilityEnum.Scheduled:
      expandedNotes.list = expandedNotes.list.filter(
        page =>
          page.metadata?.content?.date_published
            && +new Date(page.metadata?.content?.date_published) > +new Date(),
      );
      break;
  }

  expandedNotes.list = expandedNotes.list.sort((a, b) =>
    a.metadata?.content?.date_published && b.metadata?.content?.date_published
      ? +new Date(b.metadata?.content?.date_published)
          - +new Date(a.metadata?.content?.date_published)
      : 0,
  );

  return expandedNotes;
}
