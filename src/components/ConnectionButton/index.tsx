import type { FC } from "react";
import { useEffect, useRef } from "react";
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
import { Button, Stack } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";
import { useOneTimeTogglerWithSignOP } from "@/hooks/use-signin-tips-toggler";
import { GA } from "@/utils/GA";

import type { AlertDialogInstance } from "../AlertDialog";
import { AlertDialog } from "../AlertDialog";
import { DelayedRender } from "../DelayRender";

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
  const { mutate: signIn } = useWalletSignIn();
  const isWalletSignedIn = useIsWalletSignedIn();
  const i18n = useTranslation();
  const alertDialogRef = useRef<AlertDialogInstance>(null);
  const { hasBeenDisplayed, closePermanently } = useOneTimeTogglerWithSignOP();

  const OPSign = () => {
    signIn();
    GA.logEvent("operator_sign");
    closePermanently();
  };

  const closeAndOPSign = () => {
    closePermanently();
    OPSign();
  };

  useEffect(() => {
    alertDialogRef.current?.toggle(!hasBeenDisplayed);
  }, [hasBeenDisplayed]);

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
            {i18n.t("Operator Sign")}
          </Button>
        </Animated.View>
        <DelayedRender timeout={2000}>
          <AlertDialog
            ref={alertDialogRef}
            title={i18n.t("Operator Sign")}
            description={i18n.t("By signing, you can interact without clicking to agree the smart contracts every time. We are in Beta, and new users who try it out will be rewarded with 0.01 $CSB.")}
            renderCancel={() => <Button onPress={closePermanently}>{i18n.t("Do not show again")}</Button>}
            renderConfirm={() => <Button backgroundColor="$primary" color="$color" onPress={closeAndOPSign}>{i18n.t("Confirm")}</Button>}
          />
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
