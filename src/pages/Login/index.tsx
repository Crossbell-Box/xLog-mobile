import type { FC } from "react";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
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

export interface Props {
}

const closingDuration = 150;
const termsText = "Terms & Conditions";

export const LoginPage: FC<NativeStackScreenProps<RootStackParamList, "Login">> = (props) => {
  const { navigation } = props;
  const globalLoading = useGlobalLoading();
  const navigateToTerms = () => navigation.navigate("Web", {
    url: "https://rss3.notion.site/Legal-Public-f30edd47c3be4dd7ae5ed4e39aefbbd9?pvs=4",
    title: termsText,
  });
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
          <Text fontSize={"$2"} color={"$primary"} textAlign="center">Discovering amazing teams and creators on xLog!</Text>
          <LoginButton beforeOpenModal={beforeOpenModal}/>
          <ConnectEmailButton />
          <Text color="$colorSubtitle" fontSize={"$3"} textAlign="center">
          By connecting you agree to our <Text textDecorationLine="underline" onPress={navigateToTerms} color="$color" fontSize={"$3"}>{termsText}</Text>
          </Text>
        </YStack>
      </BottomSheet>
    </Stack>
  );
};
