import type { FC } from "react";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConnectedAccount, useWalletSignIn, useAccountBalance, useDisconnectAccount } from "@crossbell/react-account";
import { extractCharacterName } from "@crossbell/util-metadata";
import { Plug } from "@tamagui/lucide-icons";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as Haptics from "expo-haptics";
import { Button } from "tamagui";
import { useColor } from "@/hooks/styles";
import { i18n } from "@/i18n";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const connector = useWalletConnect();
  const { primary } = useColor();
  const { bottom } = useSafeAreaInsets();

  const disconnect = useDisconnectAccount();
  // const { token, setToken } = useGlobal();
  const { balance } = useAccountBalance();
  const connectedAccount = useConnectedAccount();
  const { mutate: handleSignIn } = useWalletSignIn();

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    connector.connect();
  };

  console.log(extractCharacterName(connectedAccount?.character), balance?.formatted);
  console.log("siwe:", connectedAccount?.type === "wallet" ? connectedAccount.siwe?.token : "");

  if (connectedAccount?.type === "wallet" && !!connectedAccount.siwe) {
    return null
  }

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
        connectedAccount
          ? (
            <>
              <Button
                size={"$5"}
                pressStyle={{ opacity: 0.85 }}
                color={"white"}
                fontSize={"$6"}
                backgroundColor={primary}
                onPress={() => handleSignIn()}
              >
                Sign in
              </Button>
              <Button
                size={"$5"}
                pressStyle={{ opacity: 0.85 }}
                color={"white"}
                fontSize={"$6"}
                backgroundColor={primary}
                onPress={disconnect}
              >
                Disconnect
              </Button>
            </>
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
