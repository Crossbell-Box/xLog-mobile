import { asyncRetry } from "@/utils/async-retry";

export async function waitUntilTransactionFinished(transactionHash: string) {
  try {
    await asyncRetry(
      async RETRY =>
        await fetch(
          `https://scan.crossbell.io/api?module=transaction&action=gettxreceiptstatus&txhash=${transactionHash}`,
        )
          .then(res => res.json())
          .then(res => res?.status === "1" || RETRY),
    );
  }
  catch (error) {
    console.error(error);
  }
}
