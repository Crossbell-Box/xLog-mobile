import type { ExpandedNote } from "@/types/crossbell";
import { toGateway } from "@/utils/ipfs-parser";
import { isShortNotes } from "@/utils/is-short-notes";

export const getCoverImage = (note: ExpandedNote) => {
  const isShort = isShortNotes(note);
  const source = isShort
    ? note?.metadata?.content?.attachments?.[0]?.address
    : note?.metadata?.content?.images?.[0];
  const coverImage = toGateway(source);
  return coverImage;
};

export const useCoverImage = (note: ExpandedNote) => {
  return getCoverImage(note);
};
