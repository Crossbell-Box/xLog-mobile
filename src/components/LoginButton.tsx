import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import {
  useWalletSignIn,
  useIsWalletSignedIn,
  useIsConnected,
} from "@crossbell/react-account";
import { Wallet } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Sentry from "sentry-expo";
import type { StackProps } from "tamagui";
import { Stack, Text, XStack } from "tamagui";

import { IS_IOS } from "@/constants";
import { useAppIsActive } from "@/hooks/use-app-state";
import { useRootNavigation } from "@/hooks/use-navigation";
import { GA } from "@/utils/GA";

import { Center } from "./Base/Center";

interface Props extends StackProps {
  navigateToLogin?: boolean
  beforeOpenModal?: () => Promise<void>
}

export const LoginButton: FC<Props> = (props) => {
  const { navigateToLogin = false, beforeOpenModal, ...stackProps } = props;
  const isConnected = useIsConnected();
  const isWalletSignedIn = useIsWalletSignedIn();
  const [isAfterConnect, setIsAfterConnect] = useState(false);
  let btn = null;

  if (isConnected && isWalletSignedIn)
    return null;

  if (isConnected && !isWalletSignedIn) {
    btn = (
      <OPSignToggleBtn
        beforeOpenModal={beforeOpenModal}
        afterConnect={isAfterConnect}
      />
    );
  }

  if (!isConnected && !isWalletSignedIn) {
    btn = (
      <ConnectBtn
        navigateToLogin={navigateToLogin}
        beforeOpenModal={beforeOpenModal}
        onConnect={() => setIsAfterConnect(true)}
      />
    );
  }

  return (
    <Stack {...stackProps}>
      {btn}
    </Stack>
  );
};

export function ConnectBtn({
  navigateToLogin,
  beforeOpenModal,
  onConnect,
}: {
  navigateToLogin?: boolean
  beforeOpenModal?: () => Promise<void>
  onConnect?: () => void
}) {
  const i18n = useTranslation();
  const navigation = useRootNavigation();
  const { open, isOpen, provider } = useWalletConnectModal();
  const toast = useToastController();

  const isActive = useAppIsActive();

  /**
   * Temporarily fix.
   * https://github.com/WalletConnect/modal-react-native/issues/49
  */
  useEffect(() => {
    if (isActive) {
      toast.hide();
      onConnect?.();
    }
  }, [isActive, onConnect]);
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

  const handleConnect = async () => {
    if (navigateToLogin) {
      navigation.navigate("Login");
      return;
    }

    beforeOpenModal && await beforeOpenModal();
    await provider.abortPairingAttempt();
    open({ route: "ConnectWallet" })
      .catch((e) => {
        Sentry.Native.captureException(e);
        // eslint-disable-next-line no-console
        console.log(`[WalletConnect] ${e.message}`);
      })
      .finally(() => GA.logLogin({ method: "walletconnect" }));
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handleConnect}>
      <Stack paddingVertical="$3" borderRadius={"$5"} overflow="hidden">
        <LinearGradient
          colors={["#30a19b", "#2875bf"]}
          style={{ position: "absolute", width: "100%", top: 0, bottom: 0 }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
        <Center>
          <XStack alignItems="center" gap="$2">
            <Wallet size={"$2"} color="white"/>
            <Text fontWeight={"600"} color="white" fontSize={"$6"}>{i18n.t("Connect with Wallet")}</Text>
          </XStack>
        </Center>
      </Stack>
    </TouchableOpacity>
  );
}

export function OPSignToggleBtn(
  {
    beforeOpenModal,
    afterConnect, // Start count down after connect
  }: {
    beforeOpenModal?: () => Promise<void>
    afterConnect?: boolean
  },
) {
  const { mutate: signIn } = useWalletSignIn();
  const i18n = useTranslation();
  const [autoSign, setAutoSign] = useState(false);
  const [countDown, setCountDown] = useState(3);
  const timer = useRef(null);

  useEffect(() => {
    if (afterConnect && !autoSign && !timer.current) {
      startAutoSignIfAfterConnect();
    }
  }, [afterConnect, autoSign]);

  const startAutoSignIfAfterConnect = () => {
    setAutoSign(true);
    timer.current = setInterval(() => {
      setCountDown((count) => {
        if (count === 0) {
          clearInterval(timer.current);
          setAutoSign(false);
          OPSign();
          return 0;
        }
        return count - 1;
      });
    }, 1000);
  };

  const OPSign = async () => {
    beforeOpenModal && await beforeOpenModal();
    signIn();
    GA.logEvent("operator_sign");
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={OPSign} disabled={autoSign}>
      <Stack paddingVertical="$3" borderRadius={"$5"} overflow="hidden" opacity={autoSign ? 0.3 : undefined}>
        <LinearGradient
          colors={["#30a19b", "#2875bf"]}
          style={{ position: "absolute", width: "100%", top: 0, bottom: 0 }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
        <Center>
          <XStack alignItems="center" gap="$2">
            <Wallet size={"$2"} color="white"/>
            <Text fontWeight={"600"} color="white" fontSize={"$6"}>{i18n.t("Operator Sign")} {autoSign ? `(${countDown}s)` : ""}</Text>
          </XStack>
        </Center>
      </Stack>
    </TouchableOpacity>
  );
}
