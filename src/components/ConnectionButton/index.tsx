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
import type { IProviderMetadata } from "@walletconnect/modal-react-native";
import { WalletConnectModal, useWalletConnectModal } from "@walletconnect/modal-react-native";
import type { ConnectParams } from "@walletconnect/universal-provider";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { resolveScheme } from "expo-linking";
import type { StackProps } from "tamagui";
import { Button, Card, H4, Paragraph, Stack } from "tamagui";

import { APP_SCHEME } from "@/constants";
import { WALLET_PROJECT_ID, WALLET_RELAY_URL } from "@/constants/env";
import { useDrawer } from "@/hooks/use-drawer";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useOneTimeTogglerWithSignOP } from "@/hooks/use-signin-tips-toggler";
import { useThemeStore } from "@/hooks/use-theme-store";

import { DelayedRender } from "../DelayRender";
import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";

interface Props extends StackProps {
  navigateToLogin?: boolean
}

const providerMetadata: IProviderMetadata = {
  name: "WalletConnect",
  url: "https://walletconnect.com/",
  icons: ["https://walletconnect.org/walletconnect-logo.png"],
  description: "Connect with WalletConnect",
  redirect: {
    native: `${resolveScheme({})}://`,
  },
};

const sessionParams: ConnectParams = {
  namespaces: {
    // ...
  },
};

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
  const { mode } = useThemeStore();
  const navigation = useRootNavigation();
  const { isOpen, open, close, provider, isConnected, address } = useWalletConnectModal();

  const handleConnect = () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    open({ route: "ConnectWallet" });
  };

  const onCopyClipboard = (value: string) => {
    return Clipboard.setStringAsync(value);
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
      <WalletConnectModal
        projectId={WALLET_PROJECT_ID}
        providerMetadata={providerMetadata}
        onCopyClipboard={onCopyClipboard}
        sessionParams={sessionParams}
        relayUrl={WALLET_RELAY_URL}
        themeMode={mode}
      />
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
