import { useContract } from "@crossbell/contract";
import { useAccountState, useIsNoteLiked, useMintNote, useNoteLikeCount, useNoteLikeList, usePostNote, usePostNoteForNote, useToggleLikeNote } from "@crossbell/react-account";
import { useRefCallback } from "@crossbell/util-hooks";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Comment } from "@/components/CommentItem";
import { getAnonymousCommentInformation } from "@/hooks/use-setup-anonymous-comment";
import { anonymousComment, checkMint, getComment, getComments, getMints, getPage, getPagesBySite, updateComment } from "@/models/page.model";
import type { EditorValues, NoteType } from "@/types";
import { cacheDelete, cacheGet } from "@/utils/cache";
import { editor2Crossbell } from "@/utils/editor-converter";
import { getNoteSlug } from "@/utils/get-slug";

export const useGetPagesBySiteLite = (
  input: Parameters<typeof getPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.characterId, input],
    queryFn: async ({ pageParam }) => {
      const url = `https://xlog.app/api/pages?${new URLSearchParams({
        ...input,
        ...(pageParam && { cursor: pageParam }),
      } as any).toString()}`;
      const response = await fetch(url);
      const result: ReturnType<typeof getPagesBySite> = await response.json();
      return result;
    },
    getNextPageParam: lastPage => lastPage.cursor || undefined,
  });
};

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
          await fetch(`https://indexer.crossbell.io/v1/notes?characterId=${characterId}&sources=xlog&cursor=${cursor}&limit=100`)
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

export function useAnonymousComment() {
  const queryClient = useQueryClient();

  return useMutation(
    async (
      payload: Parameters<typeof anonymousComment>[0] & {
        originalNoteId?: number
        originalCharacterId?: number
      },
    ) => {
      return anonymousComment(payload);
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getComments",
          variables.originalCharacterId || variables.targetCharacterId,
          variables.originalNoteId || variables.targetNoteId,
        ]);
      },
    },
  );
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

export function useCommentPage() {
  const queryClient = useQueryClient();
  const postNoteForNote = usePostNoteForNote({
    noAutoResume: true,
  });

  const mutateAsync = useRefCallback(
    ({
      characterId,
      noteId,
      content,
      originalCharacterId,
      originalNoteId,
    }: {
      characterId: number
      noteId: number
      content: string
      originalCharacterId?: number
      originalNoteId?: number
    }) => {
      return postNoteForNote.mutateAsync(
        {
          note: {
            characterId,
            noteId,
          },
          metadata: {
            content,
            tags: ["comment"],
            sources: ["xlog"],
          },
        },
        {
          onSuccess() {
            queryClient.invalidateQueries([
              "getComments",
              originalCharacterId || characterId,
              originalNoteId || noteId,
            ]);
          },
        },
      );
    },
  );

  return {
    ...postNoteForNote,
    mutateAsync,
  };
}

export const useSubmitComment = () => {
  const commentPage = useCommentPage();
  const updateComment = useUpdateComment();
  const anonymousComment = useAnonymousComment();

  const submitComment = async ({
    originalCharacterId,
    originalNoteId,
    characterId,
    noteId,
    content,
    comment,
    anonymous,
  }: {
    originalCharacterId: number
    originalNoteId: number
    characterId?: number
    noteId?: number
    content: string
    comment?: Comment
    anonymous?: boolean
  }) => {
    if (!characterId || !noteId) {
      return;
    }

    if (comment) {
      if (content) {
        return await updateComment.mutateAsync({
          content,
          characterId: comment.characterId,
          noteId: comment.noteId,
          originalCharacterId,
          originalNoteId,
        });
      }
    }
    else {
      if (anonymous) {
        const { email, nickname } = await getAnonymousCommentInformation();
        if (content && email && nickname) {
          return await anonymousComment.mutate({
            targetCharacterId: characterId,
            targetNoteId: noteId,
            content,
            name: nickname,
            email,
            originalCharacterId,
            originalNoteId,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      else {
        return await commentPage.mutateAsync({
          characterId,
          noteId,
          content,
          originalCharacterId,
          originalNoteId,
        });
      }
    }
  };

  return submitComment;
};

export function useUpdateComment() {
  const queryClient = useQueryClient();
  const contract = useContract();

  return useMutation(
    async (
      payload: Parameters<typeof updateComment>[0] & {
        originalNoteId?: number
        originalCharacterId?: number
      },
    ) => {
      return updateComment(payload, contract);
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getComments",
          variables.originalCharacterId || variables.characterId,
          variables.originalNoteId || variables.noteId,
        ]);
      },
    },
  );
}

export function useGetComment(
  ...input: Partial<Parameters<typeof getComment>>
) {
  return useInfiniteQuery({
    queryKey: ["getComment", ...input],
    queryFn: async () => {
      if (!input[0] || !input[1]) {
        return null;
      }
      return getComment(...input);
    },
  });
}

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

export function useCreatePage() {
  const queryClient = useQueryClient();
  const { mutateAsync: _, ...postNote } = usePostNote();

  const mutate = useRefCallback(
    (
      input: {
        characterId?: number
        type?: NoteType
      } & EditorValues,
    ) => {
      if (!input.characterId) {
        throw new Error("characterId is required");
      }

      return postNote.mutate(
        {
          characterId: input.characterId,
          metadata: editor2Crossbell({
            values: input,
            autofill: true,
            type: input.type || "post",
          }).metadata.content,
        },
        {
          onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["getPagesBySite", input.characterId]);
            queryClient.invalidateQueries(["getPage", input.characterId]);
          },
        },
      );
    },
  );

  return {
    ...postNote,
    mutate,
  };
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
  return useQuery(["getPage", input.characterId, input], async () => {
    if (!input.characterId || (!input.slug && !input.noteId)) {
      return null;
    }
    return getPage({
      characterId: input.characterId,
      slug: input.slug,
      noteId: input.noteId,
      useStat: input.useStat,
      handle: input.handle,
    });
  });
};
