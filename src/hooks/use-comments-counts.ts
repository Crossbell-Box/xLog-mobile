import { useGetComments } from "@/queries/page";

export const useCommentCounts = ({
  characterId,
  noteId,
}: {
  characterId: number
  noteId: number
}) => {
  const comments = useGetComments({ characterId, noteId });
  return { data: comments.data?.pages?.[0]?.count || 0 };
};
