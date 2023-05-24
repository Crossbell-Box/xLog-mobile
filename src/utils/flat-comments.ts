import type { Comment } from "@/components/CommentItem";

export function flatComments(comment?: Comment, depth = 0, list: Array<{
  depth: number
  data: Comment
}> = []) {
  if (!comment) return list;

  if (!comment?.fromNotes?.list?.length) {
    return [{
      depth,
      data: comment,
    }];
  }

  comment?.fromNotes?.list?.forEach((item: Comment) => {
    list.push({
      depth,
      data: item,
    });
    flatComments(item, depth + 1, list);
  });

  return list;
}
