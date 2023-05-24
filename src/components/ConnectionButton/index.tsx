import type { FC } from "react";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn, FadeOut, FlipInXDown, FlipOutXUp } from "react-native-reanimated";

import {
  useConnectedAccount,
  useWalletSignIn,
  useAccountBalance,
  useDisconnectAccount,
  useIsWalletSignedIn,
} from "@crossbell/react-account";
import { Plug } from "@tamagui/lucide-icons";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as Haptics from "expo-haptics";
import { Button, Card, H4, Paragraph, Stack } from "tamagui";

import { useDrawer } from "@/hooks/use-drawer";
import { useOneTimeToggler } from "@/hooks/use-signin-tips-toggler";

import { DelayedRender } from "../DelayRender";
import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const { isLoading } = useAccountBalance();
  const connectedAccount = useConnectedAccount();

  if (!connectedAccount && isLoading)
    // TODO Loading
    return null;

  return (
    <Animated.View style={[
      {
        position: "absolute",
        bottom: 12,
        left: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      },
    ]}>
      {(() => {
        switch (connectedAccount?.type) {
          case "email":
            return <DisconnectBtn />;
          case "wallet":
            return <OPSignToggleBtn />;
          default:
            return <ConnectBtn />;
        }
      })()}
    </Animated.View>
  );
};

function ConnectBtn() {
  const i18n = useTranslation();
  const connector = useWalletConnect();
  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    connector.connect();
  };

  return (
    <Animated.View entering={FlipInXDown.delay(500).duration(300)} exiting={FlipOutXUp.delay(500).duration(300)}>
      <Button
        pressStyle={{ opacity: 0.85 }}
        color={"white"}
        fontSize={"$6"}
        fontWeight={"700"}
        backgroundColor={"$primary"}
        onPress={handleConnect}
        icon={<Plug size={"$1.5"} />}
      >
        {i18n.t("Connect")}
      </Button>
    </Animated.View>
  );
}

function OPSignToggleBtn() {
  const { mutate: signIn, isLoading: isSignInLoading } = useWalletSignIn();
  const isWalletSignedIn = useIsWalletSignedIn();
  const { t } = useTranslation();
  const { hasBeenDisplayed, close, closePermanently } = useOneTimeToggler();

  if (!isWalletSignedIn) {
    return (
      <Stack>
        <Animated.View entering={FlipInXDown.delay(500).duration(300)} >
          <Button
            pressStyle={{ opacity: 0.85 }}
            color={"white"}
            fontSize={"$6"}
            backgroundColor={"$primary"}
            onPress={() => {
              signIn();
              closePermanently();
            }}
            icon={<Plug size={"$1.5"} />}
          >
            {isSignInLoading ? `${t("Loading")}...` : t("Operator Sign")}
          </Button>
        </Animated.View>
        <DelayedRender timeout={2000}>
          <ModalWithFadeAnimation isVisible={!hasBeenDisplayed}>
            <Card elevate bordered>
              <Card.Header bordered padding="$3">
                <H4>{t("Operator Sign") || ""}</H4>
              </Card.Header>
              <Paragraph padding="$3">
                {t("By signing, you can interact without clicking to agree the smart contracts every time. We are in Beta, and new users who try it out will be rewarded with 0.01 $CSB.")}
              </Paragraph>
              <Card.Footer padded alignItems="center" justifyContent="center" gap="$4">
                <Button minWidth={"45%"} onPress={close} backgroundColor={"$backgroundFocus"} color={"$primary"} borderRadius="$5">{t("Confirm")}</Button>
                <Button minWidth={"45%"} onPress={closePermanently} borderRadius="$5">{t("Do not show again")}</Button>
              </Card.Footer>
            </Card>
          </ModalWithFadeAnimation>
        </DelayedRender>
      </Stack>
    );
  }

  return null;
}

export function DisconnectBtn() {
  const _disconnect = useDisconnectAccount();
  const { closeDrawer } = useDrawer();
  const { t } = useTranslation();

  const disconnect = () => {
    closeDrawer();
    _disconnect();
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
      <Button
        pressStyle={{ opacity: 0.85 }}
        color={"white"}
        fontSize={"$6"}
        backgroundColor={"$primary"}
        onPress={disconnect}
      >
        {t("Disconnect")}
      </Button>
    </Animated.View>
  );
}
