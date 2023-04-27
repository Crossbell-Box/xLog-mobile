import type { FC } from "react";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  useConnectedAccount,
  useWalletSignIn,
  useAccountBalance,
  useDisconnectAccount,
  useToggleOpSignOperator,
  useIsWalletSignedIn,
  useAccountCharacter,
} from "@crossbell/react-account";
import { extractCharacterName } from "@crossbell/util-metadata";
import { Plug } from "@tamagui/lucide-icons";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as Haptics from "expo-haptics";
import { Button } from "tamagui";
import { useColor } from "@/hooks/styles";
import { i18n } from "@/i18n";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const { bottom } = useSafeAreaInsets();
  const { balance } = useAccountBalance();
  const connectedAccount = useConnectedAccount();

  console.log(extractCharacterName(connectedAccount?.character), balance?.formatted);
  console.log("siwe:", connectedAccount?.type === "wallet" ? connectedAccount.siwe?.token : "");

  return (
    <Animated.View style={[
      {
        position: "absolute",
        bottom: bottom + 12,
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
            return (
              <>
                <OPSignToggleBtn />
                <DisconnectBtn />
              </>
            );
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

function OPSignToggleBtn() {
  const { primary } = useColor();
  const { mutate: signIn, isLoading: isSignInLoading } = useWalletSignIn();
  const character = useAccountCharacter();
  const isWalletSignedIn = useIsWalletSignedIn();
  const [{ toggleOperator, hasPermissions }, { isLoading: isToggleOperatorLoading }] = useToggleOpSignOperator(character);

  if (!isWalletSignedIn) {
    return (
      <Button
        size={"$5"}
        pressStyle={{ opacity: 0.85 }}
        color={"white"}
        fontSize={"$6"}
        backgroundColor={primary}
        onPress={() => signIn()}
        icon={<Plug size={"$1.5"} />}
      >
        {isSignInLoading? "Loading" : "Sign In"}
      </Button>
    )
  }

  return (
    <Button
      size={"$5"}
      pressStyle={{ opacity: 0.85 }}
      color={"white"}
      fontSize={"$6"}
      backgroundColor={primary}
      onPress={toggleOperator}
      icon={<Plug size={"$1.5"} />}
    >
      {isToggleOperatorLoading
        ? "Loading"
        : hasPermissions
        ? "Unauthorize OP Sign"
        : "Authorize OP Sign"
      }
    </Button>
  )
}

function DisconnectBtn() {
  const { primary } = useColor();
  const disconnect = useDisconnectAccount();

  return (
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
  )
}