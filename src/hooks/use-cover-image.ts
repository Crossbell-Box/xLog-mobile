import { useMemo } from "react";

import type { ExpandedNote } from "@/types/crossbell";
import { toGateway } from "@/utils/ipfs-parser";

export const getCoverImage = (note: ExpandedNote) => {
  const coverImage = toGateway(note?.metadata?.content?.images?.[0]);
  return coverImage;
};

export const useCoverImage = (note: ExpandedNote) => {
  const coverImage = useMemo(() => getCoverImage(note), [note]);
  return coverImage;
};
