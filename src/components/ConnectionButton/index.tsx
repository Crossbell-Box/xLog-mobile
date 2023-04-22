import type { FC } from "react";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDrawerProgress } from "@react-navigation/drawer";
import { Plug } from "@tamagui/lucide-icons";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as Haptics from "expo-haptics";
import { Button, useWindowDimensions } from "tamagui";

import { useColor } from "@/hooks/styles";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const connector = useWalletConnect();
  const { primary } = useColor();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    connector.connected
      ? connector.killSession()
      : connector.connect().then((account) => {
        // eslint-disable-next-line no-console
        console.log(account);
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
      <Button
        size={"$5"}
        pressStyle={{ opacity: 0.85 }}
        color={"white"}
        fontSize={"$6"}
        backgroundColor={connector.connected ? primary : "black"}
        onPress={onPress}
        icon={connector.connected ? null : <Plug size={"$1.5"} />}
      >
        {connector.connected ? "Disconnect" : "Connect"}
      </Button>
    </Animated.View>
  );
};
