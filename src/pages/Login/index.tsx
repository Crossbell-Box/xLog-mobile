import type { FC } from "react";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheet from "@gorhom/bottom-sheet";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Stack, Text, YStack } from "tamagui";

import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { ConnectEmailButton } from "@/components/ConnectEmailButton";
import { LoginButton } from "@/components/LoginButton";
import { useAppIsActive } from "@/hooks/use-app-state";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useIsLogin } from "@/hooks/use-is-login";
import type { RootStackParamList } from "@/navigation/types";

import { TERMS_PAGE_TITLE } from "../Introduction";

export interface Props {
}

const closingDuration = 150;

export const LoginPage: FC<NativeStackScreenProps<RootStackParamList, "Login">> = (props) => {
  const { navigation } = props;
  const i18n = useTranslation("translation");
  const globalLoading = useGlobalLoading();
  const { bottom } = useSafeAreaInsets();
  const isLogin = useIsLogin();
  const appIsActive = useAppIsActive();
  const { background } = useColors();

  useEffect(() => {
    if (appIsActive && isLogin) {
      globalLoading.hide();
      navigation.goBack();
    }
  }, [appIsActive, isLogin]);

  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const onDismiss = useCallback(() => navigation.goBack(), []);
  const onClose = useCallback(() => bottomSheetRef.current.close({ duration: closingDuration }), []);
  const beforeOpenModal = useCallback(async () => {
    onClose();
    await new Promise(resolve => setTimeout(resolve, closingDuration * 2));
  }, []);

  const navigateToTerms = async () => {
    onDismiss();
    await new Promise(resolve => setTimeout(resolve, closingDuration * 2));
    navigation.navigate("Web", {
      url: "https://rss3.notion.site/Legal-Public-f30edd47c3be4dd7ae5ed4e39aefbbd9?pvs=4",
      title: i18n.t(TERMS_PAGE_TITLE),
    });
  };

  return (
    <Stack flex={1} backgroundColor="$colorTransparent" onPress={onClose}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onDismiss}
        index={0}
        backgroundStyle={{ backgroundColor: background }}
      >
        <YStack flex={1} alignItems="stretch" justifyContent="space-between" paddingHorizontal={24} paddingBottom={bottom} >
          <Text fontSize={"$2"} color={"$primary"} textAlign="center">{i18n.t("Discovering amazing teams and creators on xLog!")}</Text>
          <LoginButton beforeOpenModal={beforeOpenModal}/>
          <ConnectEmailButton />
          <Text color="$colorSubtitle" fontSize={"$3"} textAlign="center" onPress={navigateToTerms}>
            <Trans
              ns="translation"
              i18nKey="Agree to out Terms & Conditions"
              values={{ terms: i18n.t("Terms & Conditions", { ns: "translation" }) }}
              components={{
                T: <Text textDecorationLine="underline" color="$color" fontSize={"$3"}/>,
              }}
            />
          </Text>
        </YStack>
      </BottomSheet>
    </Stack>
  );
};
