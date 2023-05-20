import React, { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { Link } from "@react-navigation/native";
import { ShieldCheck } from "@tamagui/lucide-icons";
import type { CharacterEntity, NoteEntity } from "crossbell";
import { Card, Paragraph, SizableText, Stack, XStack, YStack } from "tamagui";

import { CSB_SCAN } from "@/constants/env";
import { useColors } from "@/hooks/use-colors";
import { useGetGreenfieldId } from "@/queries/site";
import { toCid, toGateway, toIPFS } from "@/utils/ipfs-parser";

import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";

type Props = {
  size?: number
  character?: CharacterEntity
  page: NoteEntity
  renderOnly?: false
} | {
  size?: number
  renderOnly: true
};

const BlockchainInfoLink: FC<React.PropsWithChildren<{
  url: string
  onPress?: () => void
}>> = ({ url, children, onPress }) => {
  const { subtitle } = useColors();

  return (
    <Link numberOfLines={1} style={{ color: subtitle, textDecorationLine: "underline" }} onPress={onPress} to={{
      screen: "Web",
      params: {
        url,
      },
    }}>
      {children}
    </Link>
  );
};

export const BlockchainInfoIcon: FC<Props> = (props) => {
  const { size = 30 } = props;
  if ("renderOnly" in props) {
    return <ShieldCheck color="green" size={"$1"} />;
  }

  const { page, character: site } = props;
  const [isModalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation("common");

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const ipfs = (page ? page.metadata?.uri : site?.metadata?.uri) || "";
  const greenfieldId = useGetGreenfieldId(toCid(ipfs));

  const type = page
    ? page?.metadata?.content?.tags?.includes("post")
      ? "post"
      : "page"
    : "blog";

  return (
    <>
      <TouchableWithoutFeedback onPress={openModal}>
        <ShieldCheck color="green" width={size}/>
      </TouchableWithoutFeedback>
      <ModalWithFadeAnimation
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
      >
        <Card elevate size="$4" bordered padded>
          <XStack backgroundColor={"$green11"} borderRadius={5} alignItems="center" marginBottom="$4" paddingHorizontal={"$2"} paddingVertical={"$1"}>
            <Paragraph>
              {
                t("signed and stored on the blockchain", {
                  ns: "site",
                  name: t(type),
                })
              }
            </Paragraph>
          </XStack>
          <YStack gap="$2">
            <Stack>
              <SizableText color="$colorSubtitle" fontWeight={"700"}>
                {t("Owner")}:
              </SizableText>
              <BlockchainInfoLink
                onPress={closeModal}
                url={`${CSB_SCAN}/address/${page?.owner || site?.owner}`}
              >
                {page?.owner || site?.owner}
              </BlockchainInfoLink>
            </Stack>

            <Stack>
              <SizableText color="$colorSubtitle" fontWeight={"700"}>
                {t("Transaction Hash")}:
              </SizableText>
              {page
                ? (
                  <>
                    <BlockchainInfoLink
                      onPress={closeModal}
                      url={`${CSB_SCAN}/tx/${page?.transactionHash}`}
                    >
                      {t("Creation")} {page?.transactionHash.slice(0, 10)}
                          ...{page?.transactionHash.slice(-10)}
                    </BlockchainInfoLink>
                    <BlockchainInfoLink
                      onPress={closeModal}
                      url={`${CSB_SCAN}/tx/${page?.updatedTransactionHash}`}
                    >
                      {t("Last Update")}&nbsp;
                      {page?.updatedTransactionHash.slice(0, 10)}...
                      {page?.updatedTransactionHash.slice(-10)}
                    </BlockchainInfoLink>
                  </>
                )
                : (
                  <>
                    <BlockchainInfoLink
                      onPress={closeModal}
                      url={`${CSB_SCAN}/tx/${site?.transactionHash}`}
                    >
                      {t("Creation")} {site?.transactionHash.slice(0, 10)}
                          ...{site?.transactionHash.slice(-10)}
                    </BlockchainInfoLink>
                    <BlockchainInfoLink
                      onPress={closeModal}
                      url={`${CSB_SCAN}/tx/${site?.updatedTransactionHash}`}
                    >
                      {t("Last Update")}&nbsp;
                      {site?.updatedTransactionHash.slice(0, 10)}...
                      {site?.updatedTransactionHash.slice(-10)}
                    </BlockchainInfoLink>
                  </>
                )}
            </Stack>

            <Stack>
              <SizableText color="$colorSubtitle" fontWeight={"700"}>
                {t("IPFS Address")}:
              </SizableText>
              <BlockchainInfoLink
                onPress={closeModal}
                url={toGateway(ipfs)}
              >
                {toIPFS(ipfs)}
              </BlockchainInfoLink>
            </Stack>

            {greenfieldId.data?.greenfieldId && (
              <Stack>
                <SizableText color="$colorSubtitle" fontWeight={"700"}>
                  {t("BNB Greenfield Address")}:
                </SizableText>
                <BlockchainInfoLink
                  onPress={closeModal}
                  url={`https://greenfieldscan.com/${
                    greenfieldId.data?.transactionHash
                      ? `txn/${greenfieldId.data?.transactionHash}`
                      : ""}`}
                >
                  {greenfieldId.data?.greenfieldId}
                </BlockchainInfoLink>
              </Stack>
            )}
          </YStack>
        </Card>
      </ModalWithFadeAnimation>
    </>
  );
};
