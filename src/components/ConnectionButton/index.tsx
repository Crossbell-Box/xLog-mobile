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
import { Plug, Wallet } from "@tamagui/lucide-icons";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import * as Haptics from "expo-haptics";
import * as Sentry from "sentry-expo";
import type { StackProps } from "tamagui";
import { Button, Card, H4, Paragraph, Stack } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";
import { useOneTimeTogglerWithSignOP } from "@/hooks/use-signin-tips-toggler";
import { GA } from "@/utils/GA";

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
            return null;
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
  const navigation = useRootNavigation();
  const { open } = useWalletConnectModal();

  const handleConnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    open({ route: "ConnectWallet" })
      .catch((e) => {
        Sentry.Native.captureException(e);
        // eslint-disable-next-line no-console
        console.log(`[WalletConnect] ${e.message}`);
      })
      .finally(() => GA.logLogin({ method: "walletconnect" }));
  };

  return (
    <Animated.View>
      <Button
        borderWidth={0}
        pressStyle={{ opacity: 0.85 }}
        color={"white"}
        fontSize={"$6"}
        fontWeight={"700"}
        backgroundColor={"$primary"}
        onPress={handleConnect}
        icon={navigateToLogin ? <Plug size="$1.5" /> : <Wallet size={"$1.5"} />}
      >
        {i18n.t(navigateToLogin ? "Connect" : "Connect Wallet")}
      </Button>
    </Animated.View>
  );
}

function OPSignToggleBtn() {
  const { mutate: signIn, isLoading: isSignInLoading } = useWalletSignIn();
  const isWalletSignedIn = useIsWalletSignedIn();
  const i18n = useTranslation();
  const { hasBeenDisplayed, closePermanently } = useOneTimeTogglerWithSignOP();

  const OPSign = () => {
    signIn();
    GA.logEvent("Operator Sign");
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
            {isSignInLoading ? `${i18n.t("Loading")}...` : i18n.t("Operator Sign")}
          </Button>
        </Animated.View>
        <DelayedRender timeout={2000}>
          <ModalWithFadeAnimation isVisible={!hasBeenDisplayed}>
            <Card elevate bordered>
              <Card.Header bordered padding="$3">
                <H4>{i18n.t("Operator Sign") || ""}</H4>
              </Card.Header>
              <Paragraph padding="$3">
                {i18n.t("By signing, you can interact without clicking to agree the smart contracts every time. We are in Beta, and new users who try it out will be rewarded with 0.01 $CSB.")}
              </Paragraph>
              <Card.Footer padded alignItems="center" justifyContent="center" gap="$4">
                <Button minWidth={"45%"} onPress={closeAndOPSign} backgroundColor={"$backgroundFocus"} color={"$primary"} borderRadius="$5">{i18n.t("Confirm")}</Button>
                <Button minWidth={"45%"} onPress={closePermanently} borderRadius="$5">{i18n.t("Do not show again")}</Button>
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
  const i18n = useTranslation();
  const navigation = useRootNavigation();

  const disconnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }

    _disconnect();
    GA.logEvent("user_signout");
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
        {i18n.t("Disconnect")}
      </Button>
    </Animated.View>
  );
}
