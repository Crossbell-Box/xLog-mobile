const BASE_URL = "https://faucet.crossbell.io";

function request<T = any>(
  url: `/${string}`,
  {
    body,
    method,
    reCAPTCHAToken,
  }: {
    method: string
    body?: Record<string, unknown>
    reCAPTCHAToken?: string
  },
): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (reCAPTCHAToken)
    headers.set("X-ReCaptcha-Response", reCAPTCHAToken);

  return fetch(BASE_URL + url, {
    method,
    headers,
    body: body && JSON.stringify(body),
  }).then(async (res) => {
    const result = await res.json();

    if (!res.ok)
      throw new Error(result.error);

    return result;
  });
}

export interface FaucetGetAddressInfoResponse {
  eligible: boolean
  balance: string
  claimed_today: boolean
  has_enough_mainnet_txs: boolean
  error?: string
}
export async function faucetGetAddressInfo(
  address: string,
): Promise<FaucetGetAddressInfoResponse> {
  return request(`/addresses/${address}`, { method: "GET" });
}

interface FaucetClaimResponse {
  transaction_hash: string
  error?: string
}
export interface FaucetClaimParams {
  address: string
  reCAPTCHAToken: string
  tweetId?: string
}
export async function faucetClaim({
  address,
  reCAPTCHAToken,
  tweetId,
}: FaucetClaimParams): Promise<FaucetClaimResponse> {
  return request<FaucetClaimResponse>("/claim", {
    method: "POST",
    reCAPTCHAToken,
    body: {
      address,
      ...(tweetId ? { tweet_id: tweetId } : {}),
    },
  });
}

interface FaucetGetTransactionResponse {
  transaction_hash: string
  is_pending: boolean
  value: string
  error?: string
}
export async function faucetGetTransaction(
  transactionHash: string,
): Promise<FaucetGetTransactionResponse> {
  return await request(`/transactions/${transactionHash}`, {
    method: "GET",
  });
}

export function faucetGetSiteKey() {
  return fetch(`${BASE_URL}/site_key`).then(res => res.text());
}
