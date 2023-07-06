import React from "react";
import { useTranslation } from "react-i18next";

import { useConnectedAccount } from "@crossbell/react-account";
import { Mail } from "@tamagui/lucide-icons";
import type { ButtonProps } from "tamagui";
import { Button } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";
import { GA } from "@/utils/GA";

export const ConnectEmailButton = (props: ButtonProps) => {
  const i18n = useTranslation();
  const navigation = useRootNavigation();
  const account = useConnectedAccount();

  const openWebPage = () => {
    GA.logLogin({ method: "email" });
    navigation.navigate("EmailLogin");
  };

  // const openWebPage = async () => {
  //   const redirectUrl = `${APP_SCHEME}://auth`;
  //   const requestUrl = new URL("http://192.168.1.190:9080");
  //   requestUrl.searchParams.set("redirect_uri", redirectUrl);
  //   const result = await WebBrowser.openAuthSessionAsync(
  //     requestUrl.toString(),
  //     redirectUrl,
  //   );
  // };

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
