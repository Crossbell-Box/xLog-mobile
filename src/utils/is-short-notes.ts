import type { NoteEntity } from "crossbell";

export const isShortNotes = (note: NoteEntity) => {
  return note?.metadata?.content?.tags?.includes("short");
};
