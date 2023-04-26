import type { FC } from "react";
import { useEffect } from "react";
import Animated, { runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Plug } from "@tamagui/lucide-icons";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as Haptics from "expo-haptics";
import { Button } from "tamagui";
import { useConnect, useAccount, useDisconnect, useSigner } from "wagmi";
import { WalletConnectLegacyConnector } from "wagmi/connectors/walletConnectLegacy";

import { siweSignIn } from "@/apis";
import { useColor } from "@/hooks/styles";
import { useGlobal } from "@/hooks/use-global";
import { i18n } from "@/i18n";
import { chains } from "@/utils/get-default-client-config";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const connector = useWalletConnect();
  const { primary } = useColor();
  const { bottom } = useSafeAreaInsets();
  const loginStatusAnimVal = useSharedValue<0 | 1>(0);
  const { connect } = useConnect({
    connector: new WalletConnectLegacyConnector({
      chains,
      options: {
        qrcode: false,
        connector,
        chainId: chains[0].id,
      },
    }),
  });

  const { disconnect } = useDisconnect();
  const account = useAccount();
  const { token, setToken } = useGlobal();
  // const { data: balance } = useBalance({ address: account.address });
  const { data: signer } = useSigner();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (connector?.accounts?.length && !account.isConnected)
          connect();
        else
          disconnect();
      }
      catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [connector]);

  // Run animation and toggle button group visibility.
  const toggleButtonStatus = (tokenValid: boolean, cb?: () => void) => {
    loginStatusAnimVal.value = withSpring(
      tokenValid ? 1 : 0,
      {
        damping: 10,
        stiffness: 100,
      },
      () => {
        cb && runOnJS(cb)();
      },
    );
  };

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    connector.connect();
  };

  const handleSignIn = async () => {
    if (signer) {
      siweSignIn(signer)
        .then(({ token }) => {
          toggleButtonStatus(!!token, () => {
            setToken(token);
          });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    }
  };

  if (token)
    return null;

  return (
    <Animated.View style={[
      {
        position: "absolute",
        bottom: bottom + 12,
        left: 24,
        right: 24,
      },
    ]}>
      {
        account.isConnected
          ? (
            <Button
              size={"$5"}
              pressStyle={{ opacity: 0.85 }}
              color={"white"}
              fontSize={"$6"}
              backgroundColor={primary}
              onPress={handleSignIn}
            >
              Sign in
            </Button>
          )
          : (
            <Button
              size={"$5"}
              pressStyle={{ opacity: 0.85 }}
              color={"white"}
              fontSize={"$6"}
              backgroundColor={primary}
              onPress={handleConnect}
              icon={<Plug size={"$1.5"} />}
            >
              {i18n.t("connect")}
            </Button>
          )
      }
    </Animated.View>
  );
};
