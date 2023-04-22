import type { MarkRequired } from "ts-essentials";

const RETRY_SYMBOL = Symbol("async-retry:retry");

export type AsyncRetryCallback<T> = (
  RETRY: typeof RETRY_SYMBOL
) => Promise<T | typeof RETRY_SYMBOL>;

export interface AsyncRetryConfig<T> {
  delayMs?: number
  maxRetryTimes?: number
  defaultValue?: T
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function asyncRetry<T>(
  callback: AsyncRetryCallback<T>,
  config: MarkRequired<AsyncRetryConfig<T>, "defaultValue">
): Promise<T>;
export async function asyncRetry<T>(
  callback: AsyncRetryCallback<T>,
  config?: AsyncRetryConfig<T>
): Promise<T | undefined>;
export async function asyncRetry<T>(
  callback: AsyncRetryCallback<T>,
  { delayMs = 1000, maxRetryTimes = 60, defaultValue }: AsyncRetryConfig<T> = {},
): Promise<T | undefined> {
  let retryTimes = 0;

  while (true) {
    const result = await callback(RETRY_SYMBOL);

    if (result !== RETRY_SYMBOL) {
      return result;
    }
    else {
      if (retryTimes < maxRetryTimes) {
        await sleep(delayMs);
        retryTimes += 1;
      }
      else {
        return defaultValue;
      }
    }
  }
}
