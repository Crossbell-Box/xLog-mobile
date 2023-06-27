import React, { useCallback, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { StyleSheet, ScrollView, Linking, Platform } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useDisconnectAccount,
  useAccountCharacter,
  useDeleteCharacter,
} from "@crossbell/react-account";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight, Check, Cog, Copy, Droplet, Eye, Info, Palette, Thermometer, Trash2 } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import * as Clipboard from "expo-clipboard";
import { ListItem, Text, ListItemTitle, Switch, YGroup, YStack, Stack, Button, ListItemSubtitle, ListItemText, H3, H4, Paragraph, Input, XStack } from "tamagui";

import type { AlertDialogInstance } from "@/components/AlertDialog";
import { AlertDialog } from "@/components/AlertDialog";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { UniLink } from "@/components/UniLink";
import { APP_SCHEME, IS_DEV, IS_PROD, IS_STAGING, VERSION } from "@/constants";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useMultiPressHandler } from "@/hooks/use-multi-press-handler";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useNotification } from "@/hooks/use-notification";
import { useThemeStore } from "@/hooks/use-theme-store";
import { i18n } from "@/i18n";
import { allThemes } from "@/styles/theme";

export interface Props {

}

export const Advanced: React.FC<Props> = () => {
  const { color, background } = useColors();
  const character = useAccountCharacter();
  const disconnect = useDisconnectAccount();
  const characterName = character.metadata?.content?.name;
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["45%"], []);
  const { t } = useTranslation("common");
  const [enteredUsername, setEnteredUsername] = useState("");
  const globalLoading = useGlobalLoading();
  const { mutateAsync } = useDeleteCharacter({
    onSuccess: disconnect,
  });

  const openDeleteAccountModal = useCallback(() => bottomSheetRef.current.present(), []);
  const onDismiss = useCallback(() => setEnteredUsername(""), []);
  const deleteCharacter = useCallback(() => {
    globalLoading.show();
    mutateAsync({ characterId: character.characterId }).finally(globalLoading.hide);
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
                    title={t("Delete account")}
                    subTitle={t("This action cannot be undone.")}
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
              <H4 textAlign="center">{t("Delete Account?")}</H4>
              <Paragraph>
                <Trans
                  i18n={i18n}
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

