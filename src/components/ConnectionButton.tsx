import type { FC } from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";
import Animated, { FadeIn, FadeOut, FlipInXDown } from "react-native-reanimated";

import {
  useConnectedAccount,
  useWalletSignIn,
  useAccountBalance,
  useDisconnectAccount,
  useIsWalletSignedIn,
} from "@crossbell/react-account";
import { Plug, Wallet } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import * as Haptics from "expo-haptics";
import * as Sentry from "sentry-expo";
import type { StackProps } from "tamagui";
import { Stack } from "tamagui";

import { IS_IOS } from "@/constants";
import { useAppIsActive } from "@/hooks/use-app-state";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useOneTimeTogglerWithSignOP } from "@/hooks/use-signin-tips-toggler";
import { useToggle } from "@/hooks/use-toggle";
import { GA } from "@/utils/GA";

import type { AlertDialogInstance } from "./AlertDialog";
import { AlertDialog } from "./AlertDialog";
import { Button } from "./Base/Button";
import { DelayedRender } from "./DelayRender";

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
  const { open, isOpen } = useWalletConnectModal();
  const toast = useToastController();

  const isActive = useAppIsActive();

  /**
   * Temporarily fix.
   * https://github.com/WalletConnect/modal-react-native/issues/49
  */
  useEffect(() => { isActive && toast.hide(); }, [isActive]);
  useEffect(() => {
    if (!IS_IOS) {
      return;
    }

    async function getAppId(scheme) {
      const response = await fetch(`https://itunes.apple.com/search?term=${scheme}&entity=software`);
      const data = await response.json();
      const id = data.results[0].trackId;
      return id;
    }

    const _originalOpenURL = Linking.openURL.bind(Linking);
    let prevScheme = "";

    Linking.openURL = async (url) => {
      const isHttp = url.startsWith("http") || url.startsWith("https");

      if (isHttp) {
        Alert.alert(
          i18n.t("Alert"),
          i18n.t("Didn't find your wallet, would you like to download it?"),
          [
            {
              text: i18n.t("Cancel"),
              style: "cancel",
            },
            {
              text: i18n.t("Confirm"),
              onPress: async () => {
                toast.show(i18n.t("Redirecting..."), {
                  burntOptions: {
                    preset: "none",
                    haptic: "none",
                  },
                });
                try {
                  const appId = await getAppId(prevScheme);
                  Linking.openURL(`itms-apps://itunes.apple.com/app/id${appId}`);
                }
                catch (e) {
                  Alert.alert(
                    i18n.t("Alert"),
                    i18n.t("Redirecting failed, please download it from App Store manually."),
                  );
                }
              },
            },
          ],
        );
      }
      else {
        prevScheme = url.split(":")[0];
        await _originalOpenURL(url);
      }
    };

    return () => {
      Linking.openURL = _originalOpenURL;
    };
  }, [isOpen]);

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
  const [visible, toggle] = useToggle(false);
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
    toggle(!hasBeenDisplayed);
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
            visible={visible}
            title={i18n.t("Operator Sign")}
            description={i18n.t("By signing, you can interact without clicking to agree the smart contracts every time. We are in Beta, and new users who try it out will be rewarded with 0.01 $CSB.")}
            renderCancel={() => <Button onPress={closePermanently}>{i18n.t("Do not show again")}</Button>}
            renderConfirm={() => <Button type="primary" onPress={closeAndOPSign}>{i18n.t("Confirm")}</Button>}
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
