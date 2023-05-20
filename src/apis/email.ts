import type {
  CharacterMetadata,
  LinkItemType,
  NoteMetadata,
  LinkItemNote,
} from "crossbell";

import { request } from "./utils";

export async function registerSendCodeToEmail(
  email: string,
): Promise<{ ok: boolean; msg: string }> {
  const result = await request("/newbie/account/signup/email", {
    method: "POST",
    body: { email },
  });

  if (result.ok)
    return { ok: true, msg: "Email Sent" };

  else
    return { ok: false, msg: `${result.message}` };
}

export async function registerVerifyEmailCode(body: {
  email: string
  code: string
}): Promise<{ ok: boolean; msg: string }> {
  const result = await request("/newbie/account/signup/email/verify", {
    method: "POST",
    body,
  });

  if (result.ok)
    return { ok: true, msg: "Email Sent" };

  else
    return { ok: false, msg: `${result.message}` };
}

export async function registerByEmail(body: {
  email: string
  emailVerifyCode: string
  password: string
  characterName: string
}): Promise<{ ok: boolean; msg: string; token: string }> {
  const result = await request("/newbie/account/signup", {
    method: "PUT",
    body,
  });

  if (result.token)
    return { ok: true, msg: "Registered", token: result.token };

  else
    return { ok: false, msg: `${result.message}`, token: "" };
}

export async function connectByEmail(body: {
  email: string
  password: string
}): Promise<{ ok: boolean; msg: string; token: string }> {
  const result = await request("/newbie/account/signin", {
    method: "POST",
    body,
  });

  if (result.token)
    return { ok: true, msg: "Connected", token: result.token };

  else
    return { ok: false, msg: `${result.message}`, token: "" };
}

export async function resetPasswordSendCodeToEmail(
  email: string,
): Promise<{ ok: boolean; msg: string }> {
  const result = await request("/newbie/account/reset-password/email", {
    method: "POST",
    body: { email },
  });

  if (result.ok)
    return { ok: true, msg: "Email Sent" };

  else
    return { ok: false, msg: `${result.message}` };
}

export async function resetPasswordVerifyEmailCode(body: {
  email: string
  code: string
}): Promise<{ ok: boolean; msg: string }> {
  const result = await request("/newbie/account/reset-password/email/verify", {
    method: "POST",
    body,
  });

  if (result.ok)
    return { ok: true, msg: "Email Sent" };

  else
    return { ok: false, msg: `${result.message}` };
}

export async function resetPasswordByEmail(body: {
  email: string
  emailVerifyCode: string
  password: string
}): Promise<{ ok: boolean; msg: string }> {
  const result = await request("/newbie/account/reset-password", {
    method: "POST",
    body,
  });

  if (result.ok)
    return { ok: true, msg: "Password reset successful, please login again." };

  else
    return { ok: false, msg: `${result.message}` };
}

export type FetchAccountInfoResult =
	| {
	  ok: true
	  email: string
	  characterId: number
	  csb: string
	  }
	| {
	  ok: false
	  msg: string
	  };

export async function fetchAccountInfo(
  token: string,
): Promise<FetchAccountInfoResult> {
  const { email, characterId, message, csb } = await request(
    "/newbie/account",
    { method: "GET", token },
  );

  if (email && characterId)
    return { ok: true, email, characterId, csb };

  else
    return { ok: false, msg: message };
}

export async function updateHandle(
  token: string,
  handle: string,
): Promise<{ ok: boolean; msg: string }> {
  return request("/newbie/contract/characters/me/handle", {
    method: "POST",
    token,
    body: { handle },
  });
}

export async function deleteAccount(token: string): Promise<void> {
  return request("/newbie/account", {
    method: "DELETE",
    token,
    body: {},
    handleResponse() {},
  });
}

export async function linkNote({
  token,
  noteId,
  characterId,
  linkType,
  data,
}: {
  token: string
  characterId: number
  noteId: number
  linkType: string
  data?: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/newbie/contract/links/notes/${characterId}/${noteId}/${linkType}`,
    { method: "PUT", token, body: { data } },
  );
}

export async function unlinkNote({
  token,
  noteId,
  characterId,
  linkType,
}: {
  token: string
  characterId: number
  noteId: number
  linkType: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/newbie/contract/links/notes/${characterId}/${noteId}/${linkType}`,
    { method: "DELETE", token },
  );
}

export async function linkCharacter({
  token,
  toCharacterId,
  linkType,
  data,
}: {
  token: string
  toCharacterId: number
  linkType: string
  data?: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/newbie/contract/links/characters/${toCharacterId}/${linkType}`,
    { method: "PUT", token, body: { data } },
  );
}

export async function linkCharacters({
  token,
  toCharacterIds,
  toAddresses,
  linkType,
  data,
}: {
  token: string
  toCharacterIds: number[]
  toAddresses: string[]
  linkType: string
  data?: string
}): Promise<{ transactionHash: string; data: string }> {
  return request("/newbie/contract/links/characters", {
    method: "PUT",
    token,
    body: { data, linkType, toCharacterIds, toAddresses },
  });
}

export async function unlinkCharacter({
  token,
  toCharacterId,
  linkType,
}: {
  token: string
  toCharacterId: number
  linkType: string
}): Promise<{ transactionHash: string; data: string }> {
  return request(
    `/newbie/contract/links/characters/${toCharacterId}/${linkType}`,
    { method: "DELETE", token },
  );
}

export async function putNote({
  token,
  ...body
}: {
  token: string
  metadata: NoteMetadata
  linkItemType?: LinkItemType
  linkItem?: LinkItemNote
  locked?: boolean
}): Promise<{ transactionHash: string; data: string }> {
  return request("/newbie/contract/notes", {
    method: "PUT",
    token,
    body,
  });
}

export async function refillBalance({
  token,
}: {
  token: string
}): Promise<{ balance: string } | { ok: boolean; message: string }> {
  return request("/newbie/account/balance/refill", {
    method: "POST",
    token,
    body: {},
  });
}

export async function updateCharactersMetadata({
  token,
  metadata,
  mode = "merge",
}: {
  token: string
  metadata: CharacterMetadata
  mode?: "merge" | "replace"
}): Promise<{ transactionHash: string; data: string }> {
  return request("/newbie/contract/characters/me/metadata", {
    method: "POST",
    token,
    body: { metadata, mode },
  });
}

export function getWithdrawProof({
  token,
}: {
  token: string
}): Promise<{ proof: string; nonce: number; expires: number }> {
  return request("/newbie/account/withdraw/proof", {
    method: "GET",
    token,
  });
}
