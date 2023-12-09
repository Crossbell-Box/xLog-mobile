import { useMemo } from "react";

import { useCharacter, useNote } from "@crossbell/indexer";

import { APP_HOST } from "@/constants/env";
import { useGlobalState } from "@/context/global-state-context";
import { getNoteSlug } from "@/utils/get-slug";

export function usePostWebViewLink(params: {
  noteId: number
  characterId: number
  search?: Record<string, string>
}) {
  const { noteId, characterId, search = {} } = params;
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const { language } = useGlobalState();

  const webviewUri = useMemo(() => {
    const slug = getNoteSlug(note.data);

    if (!slug) return null;
    const webviewUrl = new URL(`/${language}/site/${character?.data?.handle}/${slug}`, APP_HOST);
    webviewUrl.search = new URLSearchParams(search)?.toString();
    return webviewUrl?.toString();
  }, [
    note.data,
    character?.data?.handle,
  ]);

  return webviewUri;
}
