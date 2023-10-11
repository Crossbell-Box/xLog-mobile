import type { NoteEntity } from "crossbell";

import { bgLength } from "@/constants/bgs";

export const computedBgIdx = (note?: NoteEntity): number => {
  const title = String(note?.metadata?.content?.title);
  const placeholderBgIndex = title?.length % bgLength || 0;
  return placeholderBgIndex;
};
