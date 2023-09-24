import { useMemo } from "react";

import type { NoteEntity } from "crossbell";

import { toGateway } from "@/utils/ipfs-parser";
import { isShortNotes } from "@/utils/is-short-notes";
import { extractImagesFromContent } from "@/utils/markdown/extract-images-from-content";

export const getCoverImage = (note: NoteEntity) => {
  const isShort = isShortNotes(note);

  let sourceUri;

  if (isShort) {
    sourceUri = note?.metadata?.content?.attachments?.find(i => Boolean(i.address))?.address;
  }
  else {
    const cover = note?.metadata?.content?.attachments?.find(
      attachment => attachment.name === "cover",
    )?.address;

    if (cover) {
      sourceUri = cover;
    }
    else {
      const { images } = extractImagesFromContent(note?.metadata?.content?.content);
      sourceUri = images?.[0];
    }
  }

  const coverImage = toGateway(sourceUri);

  return coverImage;
};

export const useCoverImage = (note: NoteEntity) => {
  return useMemo(() => getCoverImage(note), [note]);
};
