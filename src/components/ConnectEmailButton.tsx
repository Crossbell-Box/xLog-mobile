import React from "react";
import { useTranslation } from "react-i18next";

import { useConnectedAccount, useAccountState } from "@crossbell/react-account";
import { Mail } from "@tamagui/lucide-icons";
import { openAuthSessionAsync } from "expo-web-browser";
import type { ButtonProps } from "tamagui";
import { Button } from "tamagui";

import { APP_SCHEME } from "@/constants";
import { useGlobalLoading } from "@/hooks/use-global-loading";

export const ConnectEmailButton = (props: ButtonProps) => {
  const i18n = useTranslation();
  const account = useConnectedAccount();
  const globalLoading = useGlobalLoading();

  const openWebPage = async () => {
    const redirectUrl = `${APP_SCHEME}://auth`;
    const requestUrl = new URL("https://f.crossbell.io/mobile-login");
    requestUrl.searchParams.set("redirect_uri", redirectUrl);
    const result = await openAuthSessionAsync(
      requestUrl.toString(),
      redirectUrl,
    );
    if (result.type === "success") {
      globalLoading.show();
      const url = new URL(result.url);
      const token = url.searchParams.get("token");
      useAccountState.getState().connectEmail(token);
    }
  };

  if (account) return null;

  return (
    <Button
      borderWidth={0}
      pressStyle={{ opacity: 0.85 }}
      color={"white"}
      fontSize={"$6"}
      fontWeight={"700"}
      backgroundColor={"$primary"}
      onPress={openWebPage}
      icon={<Mail size={"$1.5"} />}
      {...props}
    >
      {i18n.t("Connect Email")}
    </Button>
  );
};
