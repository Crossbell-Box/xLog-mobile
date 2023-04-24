import type { FC } from "react";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AsyncStorage, { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useDrawerProgress } from "@react-navigation/drawer";
import { Plug } from "@tamagui/lucide-icons";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as Haptics from "expo-haptics";
import { Button, useWindowDimensions, XStack } from "tamagui";

import { siweSignIn, siweGetAccount, siweGetBalance } from "@/apis";
import { SIWE_TOKEN } from "@/constants/storage-keys";
import { useColor } from "@/hooks/styles";
import { useWeb3 } from "@/hooks/use-web3";
import { i18n } from "@/i18n";
import { useUnidata } from "@/queries/unidata";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const connector = useWalletConnect();
  const { primary } = useColor();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { web3 } = useWeb3();
  const { getItem, setItem, removeItem } = useAsyncStorage(SIWE_TOKEN);
  const a = useUnidata();
  console.log(a);

  const onConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    connector.connected
      ? connector.killSession()
      : connector.connect();
  };

  const onSignIn = async () => {
    const token = await getItem();
    console.log(token);
    console.log({
      account: await siweGetAccount({ token }),
      balance: await siweGetBalance({ token }),
    });

    return;
    siweSignIn(web3.getSigner()).then(({ token }) => {
      // console.log(token);
      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHhlMDVlZDEzYzI0ODIxYzlhNGJhY2NjYzFiOTE1YzI0NzEyNTYzMmM5IiwiaWF0IjoxNjgyMzQyNzA3LCJleHAiOjE5OTc3MDI3MDd9.6mo_PcGtzGrg_NwMsJRk_ypAlz_06j2PqlW9Y_ZHSco

    });
  };

  const progressAnimValue = useDrawerProgress() as SharedValue<number>;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progressAnimValue.value || 0, [0, 1], [0, -width / 2]),
      },
    ],
  }), [width]);

  return (
    <Animated.View style={[
      animatedStyle,
      {
        position: "absolute",
        bottom: bottom + 12,
        left: 24,
        right: 24,
      },
    ]}>
      {
        connector.connected
          ? (
            <XStack justifyContent="space-between">
              <Button
                size={"$5"}
                pressStyle={{ opacity: 0.85 }}
                color={"white"}
                fontSize={"$6"}
                backgroundColor={"red"}
                onPress={onConnect}
              >
                {i18n.t("disconnect")}
              </Button>
              <Button
                size={"$5"}
                pressStyle={{ opacity: 0.85 }}
                color={"white"}
                fontSize={"$6"}
                backgroundColor={primary}
                onPress={onSignIn}
              >
                Sign in
              </Button>
            </XStack>
          )
          : (
            <Button
              size={"$5"}
              pressStyle={{ opacity: 0.85 }}
              color={"white"}
              fontSize={"$6"}
              backgroundColor={primary}
              onPress={onConnect}
              icon={<Plug size={"$1.5"} />}
            >
              {i18n.t("connect")}
            </Button>
          )
      }
    </Animated.View>
  );
};
