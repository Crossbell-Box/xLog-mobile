import type { FC } from "react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { StyleSheet, ScrollView, Linking, Platform } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useDisconnectAccount,
  useAccountCharacter,
  useAccountState,
  useDeleteCharacter,
  useDeleteEmailAccount,
} from "@crossbell/react-account";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowRight, Trash2 } from "@tamagui/lucide-icons";
import { ListItem, Text, YGroup, YStack, Stack, Button, H4, Paragraph } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { SettingsStackParamList } from "@/navigation/types";

export interface Props {

}

export const Advanced: FC<NativeStackScreenProps<SettingsStackParamList, "Advanced">> = (props) => {
  const { color, background } = useColors();
  const character = useAccountCharacter();
  const account = useAccountState();
  const disconnect = useDisconnectAccount();
  const characterName = character?.metadata?.content?.name;
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["45%"], []);
  const i18n = useTranslation("common");
  const [enteredUsername, setEnteredUsername] = useState("");
  const globalLoading = useGlobalLoading();
  const { mutateAsync: characterMutateAsync } = useDeleteCharacter({
    onSuccess: disconnect,
  });
  const { mutateAsync: emailMutateAsync } = useDeleteEmailAccount({
    onSuccess: disconnect,
  });
  const rootNavigation = useRootNavigation();
  const openDeleteAccountModal = useCallback(() => bottomSheetRef.current.present(), []);
  const onDismiss = useCallback(() => setEnteredUsername(""), []);
  const deleteCharacter = useCallback(() => {
    globalLoading.show();
    (
      account.email
        ? emailMutateAsync()
        : characterMutateAsync({ characterId: character.characterId })
    )
      .then(() => {
        disconnect();
        bottomSheetRef.current.close();
        rootNavigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      })
      .finally(globalLoading.hide);
  }, [character]);

  const usernameIsMatched = enteredUsername === characterName;

  return (
    <>
      <YStack flex={1}>
        <YStack flex={1}>
          <ScrollView>
            <YStack gap="$3" padding="$3">
              <YGroup bordered>
                <YGroup.Item>
                  <ListItem
                    icon={Trash2}
                    scaleIcon={1.2}
                    iconAfter={<ArrowRight />}
                    onPress={openDeleteAccountModal}
                    title={i18n.t("Delete account")}
                    subTitle={i18n.t("This action cannot be undone.")}
                  />
                </YGroup.Item>
              </YGroup>
            </YStack>

          </ScrollView>
        </YStack>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          index={0}
          onDismiss={onDismiss}
          backgroundStyle={{ backgroundColor: background }}
        >
          <ScrollView keyboardShouldPersistTaps={"always"}>
            <YStack gap="$3" padding="$3">
              <H4 textAlign="center">{i18n.t("Delete Account?")}</H4>
              <Paragraph>
                <Trans
                  i18nKey="delete account alert"
                  values={{ name: characterName }}
                  components={{
                    T: <Text fontWeight={"$10"}/>,
                  }}
                />
              </Paragraph>
              <Stack borderRadius={"$5"} borderColor={"$borderColor"} borderWidth={1}>
                <BottomSheetTextInput
                  placeholder="Enter your username"
                  style={{ fontSize: 16, color, padding: 12 }}
                  onChangeText={setEnteredUsername}
                />
              </Stack>
              <Button
                onPress={deleteCharacter}
                opacity={usernameIsMatched ? 1 : 0.3}
                disabled={!usernameIsMatched}
                backgroundColor={"red"}
                color={"white"}
                fontSize={"$5"}
              >
                Confirm Delete
              </Button>
            </YStack>
          </ScrollView>
        </BottomSheetModal>
      </YStack>
    </>
  );
};

