import { indexer } from "@crossbell/indexer";
import type { Contract } from "crossbell.js";
import { BigNumber, utils } from "ethers";

export async function getMiraTokenDecimals(
  contract: Contract,
): Promise<number> {
  try {
    return (await contract.getMiraTokenDecimals()).data;
  }
  catch (error) {
    console.error(error);
    return 18;
  }
}

export async function getMiraTokenAddress(contract: Contract): Promise<string> {
  try {
    return (await contract.getMiraTokenAddress())?.data;
  }
  catch (error) {
    return "0xAfB95CC0BD320648B3E8Df6223d9CDD05EbeDC64";
  }
}

export type GetMiraTipsParams = Omit<
Exclude<Parameters<typeof indexer.getTips>[0], undefined>,
"tokenAddress"
>;

export async function getMiraTips(
  contract: Contract,
  params: GetMiraTipsParams,
) {
  const tokenAddress = await getMiraTokenAddress(contract);

  const tips = await indexer.getTips({ tokenAddress, ...params });

  if (tips?.list?.length) {
    const decimal = await getMiraTokenDecimals(contract);

    tips.list = tips.list
      .filter(
        t => BigInt(t.amount) >= BigInt(1) * BigInt(10) ** BigInt(decimal),
      )
      .map((t) => {
        return {
          ...t,
          amountDisplay: (
            BigInt(t.amount)
						/ BigInt(10) ** BigInt(decimal)
          ).toString(),
        };
      });
  }

  return tips;
}

export async function getMiraBalance({
  address,
  contract,
}: {
  address: string
  contract: Contract
}) {
  const { data } = await contract.getMiraBalance(address);
  const decimals = await getMiraTokenDecimals(contract);
  const value = BigNumber.from(data);

  return {
    decimals,
    formatted: utils.formatUnits(value, decimals),
    symbol: "MIRA",
    value,
  };
}
