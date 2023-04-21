import { Alert, Linking } from "react-native";

import { WALLET_PROJECT_ID } from "@/constants/env";
import { isAndroid } from "@/constants/platform";
import InstalledAppModule from "@/modules/InstalledAppModule";
import type { WalletInfo } from "@/types/api";

import { getUrlParams } from "./get-url-params";

export async function isAppInstalled(
  applicationId?: string | null,
  appScheme?: string | null,
): Promise<boolean> {
  return await InstalledAppModule.isAppInstalled(
    isAndroid ? applicationId : appScheme,
  );
}

function getScheme(url: string): string | null {
  if (!url)
    return null;

  const scheme = url.split("://")[0];
  // Schemes from explorer-api should't have this urls, but just in case
  if (!scheme || scheme === "http" || scheme === "https")
    return null;

  return `${scheme}://`;
}

function formatNativeUrl(appUrl: string, wcUri: string): string {
  let safeAppUrl = appUrl;
  if (!safeAppUrl.includes("://")) {
    safeAppUrl = appUrl.replaceAll("/", "").replaceAll(":", "");
    safeAppUrl = `${safeAppUrl}://`;
  }
  const encodedWcUrl = encodeURIComponent(wcUri);
  return `${safeAppUrl}wc?uri=${encodedWcUrl}`;
}

function formatUniversalUrl(appUrl: string, wcUri: string): string {
  let plainAppUrl = appUrl;
  if (appUrl.endsWith("/"))
    plainAppUrl = appUrl.slice(0, -1);

  const encodedWcUrl = encodeURIComponent(wcUri);

  return `${plainAppUrl}/wc?uri=${encodedWcUrl}`;
}

export const navigateDeepLink = async (
  universalLink: string,
  deepLink: string,
  wcURI: string,
) => {
  let tempDeepLink;

  if (universalLink && universalLink !== "") {
    tempDeepLink = formatUniversalUrl(universalLink, wcURI);
  }
  else if (deepLink && deepLink !== "") {
    tempDeepLink = formatNativeUrl(deepLink, wcURI);
  }
  else {
    Alert.alert("No valid link found for this wallet");
    return;
  }

  try {
    // Note: Could not use .canOpenURL() to check if the app is installed
    // Due to having to add it to the iOS info.plist
    await Linking.openURL(tempDeepLink);
  }
  catch (error) {
    Alert.alert(`Unable to open this DeepLink: ${tempDeepLink}`);
  }
};

const setInstalledFlag = async (
  wallets: WalletInfo[],
): Promise<WalletInfo[]> => {
  const promises = wallets.map(async (wallet) => {
    const applicationId = getUrlParams(wallet?.app?.android)?.id;
    const appScheme = getScheme(wallet?.mobile?.native);
    const isInstalled = await isAppInstalled(applicationId, appScheme);
    return { ...wallet, isInstalled };
  });
  return Promise.all(promises);
};

export const fetchAllWallets = () => {
  return fetch(
    `https://explorer-api.walletconnect.com/v3/wallets?projectId=${WALLET_PROJECT_ID}&sdks=sign_v2`,
  )
    .then(res => res.json())
    .then(
      (wallet) => {
        const result: WalletInfo[] = Object.keys(wallet?.listings).map(
          key => wallet?.listings[key],
        );
        return result;
      },
      () => {
        Alert.alert("Error", "Error fetching all wallets");
      },
    )
    .then(async (wallets: WalletInfo[] | void) => {
      if (wallets) {
        return (await setInstalledFlag(wallets)).sort((a, b) => {
          if (a.isInstalled && !b.isInstalled)
            return -1;
          else if (!a.isInstalled && b.isInstalled)
            return 1;
          else
            return 0;
        });
      }
    });
};
