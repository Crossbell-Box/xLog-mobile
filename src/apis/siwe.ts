import type {
  CharacterMetadata,
  LinkItemNote,
  LinkItemType,
  NoteMetadata,
} from "crossbell";
import type { Signer } from "ethers";

import { request } from "./utils";

interface Siwe { token: string }

export async function siweSignIn(signer: Signer): Promise<Siwe> {
  const address = await signer.getAddress();

  const { message } = await request<{ message: string }>("/siwe/challenge", {
    method: "POST",
    body: {
      address,
      domain: "crossbell.io",
      uri: "https://crossbell.io",
      statement: "Sign in with Crossbell to the app.",
    },
  });

  const { token } = await request<{ token: string }>("/siwe/login", {
    method: "POST",
    body: {
      address,
      signature: await signer.signMessage(message),
    },
  });

  return { token };
}

export function siweGetAccount(siwe: Siwe): Promise<{ address: string }> {
  return request("/siwe/account", { method: "GET", token: siwe.token });
}

export function siweGetBalance(siwe: Siwe): Promise<{ balance: string }> {
  return request("/siwe/account/balance", { method: "GET", token: siwe.token });
}

export async function siweUpdateMetadata({
  siwe,
  mode = "merge",
  characterId,
  metadata,
}: {
  siwe: Siwe
  characterId: number
  mode?: "merge" | "replace"
  metadata: CharacterMetadata
}): Promise<{ transactionHash: string; data: string }> {
  return request(`/siwe/contract/characters/${characterId}/metadata`, {
    method: "POST",
    token: siwe.token,
    body: { metadata, mode },
  });
}

export async function siweLinkNote({
  siwe,
  fromCharacterId,
  noteId,
  characterId,
  linkType,
  data,
}: {
  siwe: Siwe
  fromCharacterId: number
  characterId: number
  noteId: number
  linkType: string
  data?: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/siwe/contract/characters/${fromCharacterId}/links/notes/${characterId}/${noteId}/${linkType}`,
    { method: "PUT", token: siwe.token, body: { data } },
  );
}

export async function siweUnlinkNote({
  siwe,
  fromCharacterId,
  noteId,
  characterId,
  linkType,
}: {
  siwe: Siwe
  fromCharacterId: number
  characterId: number
  noteId: number
  linkType: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/siwe/contract/characters/${fromCharacterId}/links/notes/${characterId}/${noteId}/${linkType}`,
    { method: "DELETE", token: siwe.token },
  );
}

export async function siweLinkCharacter({
  siwe,
  characterId,
  toCharacterId,
  linkType,
  data,
}: {
  siwe: Siwe
  characterId: number
  toCharacterId: number
  linkType: string
  data?: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/siwe/contract/characters/${characterId}/links/characters/${toCharacterId}/${linkType}`,
    { method: "PUT", token: siwe.token, body: { data } },
  );
}

export async function siweLinkCharacters({
  siwe,
  characterId,
  toCharacterIds,
  toAddresses,
  linkType,
  data,
}: {
  siwe: Siwe
  characterId: number
  toCharacterIds: number[]
  toAddresses: string[]
  linkType: string
  data?: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(`/siwe/contract/characters/${characterId}/links/characters`, {
    method: "PUT",
    token: siwe.token,
    body: { data, linkType, toCharacterIds, toAddresses },
  });
}

export async function siweUnlinkCharacter({
  siwe,
  characterId,
  toCharacterId,
  linkType,
}: {
  siwe: Siwe
  characterId: number
  toCharacterId: number
  linkType: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/siwe/contract/characters/${characterId}/links/characters/${toCharacterId}/${linkType}`,
    { method: "DELETE", token: siwe.token },
  );
}

export async function siwePutNote({
  siwe,
  characterId,
  ...body
}: {
  siwe: Siwe
  characterId: number
  metadata: NoteMetadata
  linkItemType?: LinkItemType
  linkItem?: LinkItemNote
  locked?: boolean
}): Promise<{ transactionHash: string; data: string }> {
  return request(`/siwe/contract/characters/${characterId}/notes`, {
    method: "PUT",
    token: siwe.token,
    body,
  });
}

export function siweMintNote({
  siwe,
  characterId,
  noteId,
}: {
  siwe: Siwe
  characterId: number
  noteId: number
}) {
  return request(
    `/siwe/contract/characters/${characterId}/notes/${noteId}/minted`,
    {
      method: "PUT",
      token: siwe.token,
      body: {},
    },
  );
}
