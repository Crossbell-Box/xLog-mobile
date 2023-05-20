import { useAccountState, useIsNoteLiked, useMintNote, useNoteLikeCount, useNoteLikeList, useToggleLikeNote } from "@crossbell/react-account";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

import { checkMint, getComments, getMints, getPage, getPagesBySite } from "@/models/page.model";
import { cacheDelete, cacheGet } from "@/utils/cache";
import { getNoteSlug } from "@/utils/get-slug";

export const useGetPagesBySite = (
  input: Parameters<typeof getPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.characterId, input],
    queryFn: async ({ pageParam }) => {
      return getPagesBySite({
        ...input,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage.cursor || undefined,
  });
};

export async function getIdBySlug(slug: string, characterId: string | number) {
  slug = (slug as string)?.toLowerCase?.();

  const result = (await cacheGet({
    key: ["slug2id", characterId, slug],
    getValueFun: async () => {
      let note;
      let cursor = "";

      do {
        const response = await (
          await fetch(
            `https://indexer.crossbell.io/v1/notes?characterId=${characterId}&sources=xlog&cursor=${cursor}&limit=100`,
          )
        ).json();
        cursor = response.cursor;
        note = response?.list?.find(
          (item: any) =>
            slug === getNoteSlug(item)
            || slug === `${characterId}-${item.noteId}`,
        );
      } while (!note && cursor);

      return {
        noteId: note?.noteId,
      };
    },
  })) as {
    noteId: number
  };

  if (result) {
    const noteIdMatch = slug.match(`^${characterId}-(\\d+)$`);
    if (!noteIdMatch?.[1]) {
      fetch(
        `https://indexer.crossbell.io/v1/characters/${characterId}/notes/${result.noteId}`,
      )
        .then(res => res.json())
        .then((note) => {
          if ((note && getNoteSlug(note) !== slug) || note.deleted) {
            cacheDelete(["slug2id", `${characterId}`, slug]);
          }
        });
    }
  }

  return result;
}

export const useGetLikeCounts = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  return useNoteLikeCount({
    characterId: characterId || 0,
    noteId: noteId || 0,
  });
};

export function useGetComments(
  input: Partial<Parameters<typeof getComments>[0]>,
) {
  return useInfiniteQuery({
    queryKey: ["getComments", input.characterId, input.noteId],
    queryFn: async ({ pageParam }) => {
      if (!input.characterId || !input.noteId) {
        return null;
      }
      return getComments({
        characterId: input.characterId,
        noteId: input.noteId,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
}

export const useGetLikes = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  return useNoteLikeList({
    characterId: characterId || 0,
    noteId: noteId || 0,
  });
};

export const useCheckLike = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  return useIsNoteLiked({
    characterId: characterId || 0,
    noteId: noteId || 0,
  });
};

export const useGetMints = (input: {
  characterId?: number
  noteId?: number
  includeCharacter?: boolean
}) => {
  return useInfiniteQuery({
    queryKey: ["getMints", input.characterId, input.noteId, input],
    queryFn: async ({ pageParam }) => {
      if (!input.characterId || !input.noteId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        };
      }
      return getMints({
        characterId: input.characterId,
        noteId: input.noteId,
        includeCharacter: input.includeCharacter,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage.cursor || undefined,
  });
};

export const useToggleLikePage = useToggleLikeNote;

export function useMintPage() {
  const queryClient = useQueryClient();
  const address = useAccountState(s => s.wallet?.address);

  return useMintNote({
    onSuccess: (_, variables) => {
      return Promise.all([
        queryClient.invalidateQueries([
          "checkMint",
          variables.characterId,
          variables.noteId,
          address,
        ]),
        queryClient.invalidateQueries([
          "getMints",
          variables.characterId,
          variables.noteId,
        ]),
      ]);
    },
  });
}

export const useCheckMint = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  const address = useAccountState(s => s.wallet?.address);

  return useQuery(["checkMint", characterId, noteId, address], async () => {
    if (!characterId || !noteId || !address) {
      return { count: 0, list: [] };
    }

    return checkMint({
      noteCharacterId: characterId,
      noteId,
      address,
    });
  });
};

export const useGetPage = (
  input: Partial<Parameters<typeof getPage>[0]>,
) => {
  const key = ["getPage", input.characterId, input];
  return useQuery(["getPage", input.characterId, input], async () => {
    if (!input.characterId || !input.slug) {
      return null;
    }
    if (!input.noteId) {
      const slug2Id = await getIdBySlug(input.slug, input.characterId);
      if (!slug2Id?.noteId) {
        return null;
      }
      input.noteId = slug2Id.noteId;
    }
    return cacheGet({
      key,
      getValueFun: () =>
        getPage({
          slug: input.slug,
          characterId: input.characterId!,
          useStat: input.useStat,
          noteId: input.noteId,
          handle: input.handle,
        }),
    }) as Promise<ReturnType<typeof getPage>>;
  });
};
