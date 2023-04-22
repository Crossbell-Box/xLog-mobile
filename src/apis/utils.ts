import { indexer } from "@crossbell/indexer";

interface RequestConfig<T> {
  method: string
  body?: Record<string, unknown>
  token?: string
  handleResponse?: (res: Response) => T
}

export function request<T = any>(
  url: `/${"newbie" | "siwe"}/${string}`,
  { body, method, token, handleResponse }: RequestConfig<T>,
): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (token)
    headers.set("Authorization", `Bearer ${token}`);

  return fetch(indexer.endpoint + url, {
    method,
    headers,
    body: body && JSON.stringify(body),
  }).then(
    handleResponse
			?? (async (res) => {
			  const result = await res.json();

			  if (!res.ok)
			    throw new Error(result.message);

			  return result;
			}),
  );
}
