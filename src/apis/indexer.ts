import type { NoteLinkType } from "@crossbell/indexer";
import { indexer } from "@crossbell/indexer";
import type { NoteEntity } from "crossbell.js";

export interface GetIsNoteMintedConfig {
  noteCharacterId: number
  noteId: number
  byAddress: string
}

export async function getIsNoteMinted({
  noteId,
  noteCharacterId,
  byAddress,
}: GetIsNoteMintedConfig): Promise<boolean> {
  const { count } = await indexer.getMintedNotesOfAddress(byAddress, {
    limit: 0,
    noteCharacterId,
    noteId,
  });

  return count > 0;
}

export type GetIsNoteLinkedConfig = Pick<
NoteEntity,
"characterId" | "noteId"
> & {
  fromCharacterId: number
  linkType: NoteLinkType
};

export interface GetIsNoteLinkedResult {
  isLinked: boolean
  transactionHash: string | null
}

export async function getIsNoteLinked({
  fromCharacterId,
  characterId,
  noteId,
  linkType,
}: GetIsNoteLinkedConfig): Promise<GetIsNoteLinkedResult> {
  const { count, list } = await indexer.getLinks(fromCharacterId, {
    linkType,
    toCharacterId: characterId,
    toNoteId: noteId,
    limit: 1,
  });

  return {
    isLinked: count > 0,
    transactionHash: list?.[0]?.transactionHash ?? null,
  };
}

export interface GetNoteLinkCountParams {
  characterId: number
  noteId: number
  linkType: NoteLinkType
}

export function getNoteLinkCount({
  characterId,
  noteId,
  linkType,
}: GetNoteLinkCountParams) {
  return indexer
    .getBacklinksOfNote(characterId, noteId, {
      linkType,
      limit: 0,
    })
    .then(res => res.count);
}
