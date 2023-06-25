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
import type { StackProps } from "tamagui";
import { Button, Card, H4, Paragraph, Stack } from "tamagui";

import { useDrawer } from "@/hooks/use-drawer";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useOneTimeTogglerWithSignOP } from "@/hooks/use-signin-tips-toggler";

import { DelayedRender } from "../DelayRender";
import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";

interface Props extends StackProps {
  navigateToLogin?: boolean
}

export const ConnectionButton: FC<Props> = (props) => {
  const { navigateToLogin = false, ...stackProps } = props;
  const { isLoading } = useAccountBalance();
  const connectedAccount = useConnectedAccount();

  if (!connectedAccount && isLoading)
    // TODO Loading
    return null;

  return (
    <Stack {...stackProps}>
      {(() => {
        switch (connectedAccount?.type) {
          case "email":
            return <DisconnectBtn navigateToLogin={navigateToLogin} />;
          case "wallet":
            return <OPSignToggleBtn />;
          default:
            return <ConnectBtn navigateToLogin={navigateToLogin} />;
        }
      })()}
    </Stack>
  );
};

function ConnectBtn({ navigateToLogin }: { navigateToLogin: boolean }) {
  const i18n = useTranslation();
  const connector = useWalletConnect();
  const navigation = useRootNavigation();

  const handleConnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // eslint-disable-next-line no-console
    connector.connect().catch(console.log);
  };

  return (
    <Animated.View entering={FlipInXDown.delay(500).duration(300)} exiting={FlipOutXUp.delay(500).duration(300)}>
      <Button
        borderWidth={0}
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
  const { hasBeenDisplayed, closePermanently } = useOneTimeTogglerWithSignOP();

  const OPSign = () => {
    signIn();
    closePermanently();
  };

  const closeAndOPSign = () => {
    closePermanently();
    OPSign();
  };

  if (!isWalletSignedIn) {
    return (
      <Stack>
        <Animated.View entering={FlipInXDown.delay(500).duration(300)} >
          <Button
            pressStyle={{ opacity: 0.85 }}
            color={"white"}
            fontSize={"$6"}
            backgroundColor={"$primary"}
            borderWidth={0}
            onPress={OPSign}
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
                <Button minWidth={"45%"} onPress={closeAndOPSign} backgroundColor={"$backgroundFocus"} color={"$primary"} borderRadius="$5">{t("Confirm")}</Button>
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

export function DisconnectBtn({ navigateToLogin }: { navigateToLogin: boolean }) {
  const _disconnect = useDisconnectAccount();
  const { t } = useTranslation();
  const navigation = useRootNavigation();

  const disconnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }

    _disconnect();
    navigation.navigate("Home", { screen: "Feed" });
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
      <Button
        pressStyle={{ opacity: 0.85 }}
        color={"$colorFocus"}
        fontSize={"$6"}
        borderColor={"$borderColorFocus"}
        onPress={disconnect}
      >
        {t("Disconnect")}
      </Button>
    </Animated.View>
  );
}
