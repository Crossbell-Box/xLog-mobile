import React from "react";
import { useTranslation } from "react-i18next";

import { useConnectedAccount } from "@crossbell/react-account";
import { Mail } from "@tamagui/lucide-icons";
import type { ButtonProps } from "tamagui";
import { Button } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";

export const ConnectEmailButton = (props: ButtonProps) => {
  const i18n = useTranslation();
  const navigation = useRootNavigation();
  const account = useConnectedAccount();

  const openWebPage = () => {
    navigation.navigate("EmailLogin");
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
