import type { FC } from "react";
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
import { Button } from "tamagui";

import { useColor } from "@/hooks/styles";
import { i18n } from "@/i18n";

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
  const { primary } = useColor();
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
        fontSize={"$xl"}
        backgroundColor={primary}
        onPress={handleConnect}
        icon={<Plug size={"$1.5"} />}
      >
        {i18n.t("connect")}
      </Button>
    </Animated.View>
  );
}

function OPSignToggleBtn() {
  const { primary } = useColor();
  const { mutate: signIn, isLoading: isSignInLoading } = useWalletSignIn();
  const isWalletSignedIn = useIsWalletSignedIn();

  if (!isWalletSignedIn) {
    return (
      <Animated.View entering={FlipInXDown.delay(500).duration(300)} exiting={FlipOutXUp.delay(500).duration(300)}>
        <Button
          pressStyle={{ opacity: 0.85 }}
          color={"white"}
          fontSize={"$xl"}
          backgroundColor={primary}
          onPress={() => signIn()}
          icon={<Plug size={"$1.5"} />}
        >
          {isSignInLoading ? "Loading" : "Sign In"}
        </Button>
      </Animated.View>
    );
  }

  return null;
}

export function DisconnectBtn() {
  const { primary } = useColor();
  const disconnect = useDisconnectAccount();

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
      <Button
        pressStyle={{ opacity: 0.85 }}
        color={"white"}
        fontSize={"$xl"}
        backgroundColor={primary}
        onPress={disconnect}
      >
        Disconnect
      </Button>
    </Animated.View>
  );
}
