import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";

import { useAccountState, useIsConnected } from "@crossbell/react-account";
import { Mail } from "@tamagui/lucide-icons";
import { openAuthSessionAsync } from "expo-web-browser";
import type { ButtonProps } from "tamagui";
import { Stack, XStack, Text } from "tamagui";

import { APP_SCHEME } from "@/constants";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useIsLogin } from "@/hooks/use-is-login";

import { Center } from "./Base/Center";

export const ConnectEmailButton = (props: ButtonProps) => {
  const i18n = useTranslation();
  const isConnected = useIsConnected();
  const globalLoading = useGlobalLoading();

  const openWebPage = async () => {
    const redirectUrl = `${APP_SCHEME}://auth`;
    const requestUrl = new URL("https://f.crossbell.io/mobile-login");
    requestUrl.searchParams.set("redirect_uri", redirectUrl);
    const result = await openAuthSessionAsync(
      requestUrl?.toString(),
      redirectUrl,
    );
    if (result.type === "success") {
      globalLoading.show();
      const url = new URL(result.url);
      const token = url.searchParams.get("token");
      useAccountState.getState().connectEmail(token);
    }
  };

  if (isConnected) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openWebPage}
    >
      <Stack paddingVertical="$3" borderRadius={"$5"} overflow="hidden">
        <Center>
          <XStack alignItems="center" gap="$2">
            <Mail size={24}/>
            <Text fontWeight={"600"} color="$color" fontSize={"$6"}>{i18n.t("Connect with Email")}</Text>
          </XStack>
        </Center>
      </Stack>
    </TouchableOpacity>
  );
};
