import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { useAccountState } from "@crossbell/react-account";
import { Star } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import type { FontSizeTokens, SizeTokens } from "tamagui";
import { Button, Card, H4, Paragraph, SizableText, XStack, YStack } from "tamagui";

import { CSB_SCAN, CSB_XCHAR } from "@/constants/env";
import { useAuthPress } from "@/hooks/use-auth-press";
import { useFnLoadingWithStateChange } from "@/hooks/use-fn-loading-with-state-change";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useCheckMint, useGetMints, useMintPage } from "@/queries/page";

import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";
import { UniLink } from "../UniLink";
import { XTouch } from "../XTouch";

interface Props {
  characterId: number
  noteId: number
  iconSize?: SizeTokens
  fontSize?: FontSizeTokens
}

export const ReactionMint: React.FC<Props> = ({ characterId, noteId, iconSize = "$1", fontSize = "$6" }) => {
  const mintPage = useMintPage();
  const navigation = useRootNavigation();
  const i18n = useTranslation("common");

  const account = useAccountState(s => s.computed.account);

  const [isMintOpen, setIsMintOpen] = useState(false);

  const mints = useGetMints({
    characterId,
    noteId,
    includeCharacter: true,
  });
  const isMint = useCheckMint({
    characterId,
    noteId,
  });

  const mint = useFnLoadingWithStateChange(() => {
    return mintPage.mutateAsync({
      characterId,
      noteId,
    });
  });

  const handleMintAction = useAuthPress(() => {
    if (characterId && noteId) {
      if (isMint.data?.count) {
        setIsMintOpen(true);
      }
      else {
        mint();
      }
    }
  });

  const onOpenList = () => {
    if (mintsCount < 1) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("CharacterListPage", {
      title: i18n.t("Mint List"),
      characterId,
      noteId,
      type: "mint",
    });
  };

  const closeIsMintOpen = () => {
    setIsMintOpen(false);
  };

  const mintsCount = mints.data?.pages?.[0]?.count || 0;
  const isMinted = isMint.isSuccess && isMint.data.count;

  return (
    <>
      <XTouch enableHaptics hitSlopSize={44} touchableComponent={TouchableWithoutFeedback} onPress={handleMintAction} onLongPress={onOpenList} delayLongPress={150}>
        <XStack alignItems="center" gap="$1.5">
          <Star
            size={iconSize}
            color={isMinted ? "$primary" : "$color"}
          />
          <SizableText size={fontSize} color={isMinted ? "$primary" : "$color"}>
            {mintsCount}
          </SizableText>
        </XStack>
      </XTouch>
      <ModalWithFadeAnimation
        isVisible={isMintOpen}
        onBackdropPress={closeIsMintOpen}
      >
        <Card elevate bordered>
          <Card.Header bordered padding="$3">
            <H4>{i18n.t("Mint successfully") || ""}</H4>
          </Card.Header>
          <YStack padding="$3">
            <Paragraph>
              <Trans i18nKey="mint stored">
            This post has been minted to NFT by you, view it on&nbsp;
                <UniLink
                  url={`${CSB_XCHAR}/${account?.character?.handle}/collections`}
                  onPress={closeIsMintOpen}
                >
              xChar
                </UniLink>&nbsp;
            or&nbsp;
                <UniLink
                  url={`${CSB_SCAN}/tx/${isMint.data?.list?.[0]?.transactionHash}`}
                  onPress={closeIsMintOpen}
                >
              Crossbell Scan
                </UniLink>
              </Trans>
            </Paragraph>
          </YStack>
          <Card.Footer padded alignItems="center" justifyContent="center" gap="$4">
            <Button minWidth={"45%"} onPress={closeIsMintOpen} backgroundColor={"$backgroundFocus"} color={"$primary"} borderRadius="$5">{i18n.t("Got it, thanks!")}</Button>
          </Card.Footer>
        </Card>
      </ModalWithFadeAnimation>
    </>
  );
};
