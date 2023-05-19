import type { NoteEntity } from "crossbell.js";
import { pinyin } from "pinyin-pro";

export const getNoteSlug = (note?: NoteEntity): string => {
  if (!note) return "";

  const characterId = note?.character?.characterId;
  const noteId = note?.noteId;
  const slug
        = note?.metadata?.content?.attributes?.find(
          (a: any) => a.trait_type === "xlog_slug",
        )?.value
        || getDefaultSlug(
          note?.metadata?.content?.title || "",
          `${characterId}-${noteId}`,
        );

  return slug.toString();
};

export const getDefaultSlug = (title: string, id?: string) => {
  let generated
    = pinyin(title, {
      toneType: "none",
      type: "array",
      nonZh: "consecutive",
    })
      ?.map(word => word.trim())
      ?.filter(word => word)
      ?.join("-")
      ?.replace(/\s+/g, "-")
    || id?.replace("local-", "")
    || "";
  generated = generated.replace(/[^a-zA-Z0-9\s-_]/g, "");

  return generated;
};
