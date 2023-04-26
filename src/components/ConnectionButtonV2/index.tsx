/* eslint-disable no-console */
import type { FC } from "react";
import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDrawerProgress } from "@react-navigation/drawer";
import { Plug } from "@tamagui/lucide-icons";
import { Button, useWindowDimensions } from "tamagui";

import { DarkTheme, LightTheme } from "@/constants/colors";
import useInitialization from "@/hooks/use-initialization";
import {
  universalProviderSession,
  universalProvider,
  web3Provider,
  clearSession,
  createUniversalProviderSession,
} from "@/utils/universal-provider";

import ExplorerModal from "./WalletConnector/ExplorerModal";

interface Props { }

export const ConnectionButton: FC<Props> = () => {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const progressAnimValue = useDrawerProgress() as SharedValue<number>;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progressAnimValue.value || 0, [0, 1], [0, -width / 2]),
      },
    ],
  }), [width]);

  const isDarkMode = useColorScheme() === "dark";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const backgroundColor = isDarkMode
    ? DarkTheme.background2
    : LightTheme.background2;
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [currentWCURI, setCurrentWCURI] = useState<string>();

  // Initialize universal provider
  const initialized = useInitialization();

  const close = () => {
    setModalVisible(false);
  };

  const getAddress = useCallback(async () => {
    try {
      if (web3Provider) {
        const signer = web3Provider.getSigner();
        const currentAddress = await signer.getAddress();
        setCurrentAccount(currentAddress);
      }
    }
    catch (err: unknown) {
      Alert.alert("Error", "Error getting the Address");
    }
  }, [setCurrentAccount]);

  const onSessionCreated = useCallback(async () => {
    getAddress();
    setModalVisible(false);
  }, [getAddress]);

  const onSessionError = useCallback(async () => {
    setModalVisible(false);
    // TODO: Improve this, check why is alerting a lot, and check MaxListeners warning
    // Alert.alert('Error', 'Error creating session');
  }, []);

  const onSessionDelete = useCallback(
    async ({ topic }: { topic: string }) => {
      if (topic === universalProviderSession?.topic) {
        clearSession();
        setCurrentAccount(undefined);
        setCurrentWCURI(undefined);
      }
    },
    [setCurrentAccount],
  );

  const onConnect = useCallback(async () => {
    createUniversalProviderSession({
      onSuccess: onSessionCreated,
      onFailure: onSessionError,
    });
    setModalVisible(true);
  }, [onSessionCreated, onSessionError]);

  const onDisconnect = useCallback(async () => {
    try {
      await universalProvider.disconnect();
      clearSession();
      setCurrentAccount(undefined);
      setCurrentWCURI(undefined);
    }
    catch (err: unknown) {
      Alert.alert("Error", "Error disconnecting");
    }
  }, []);

  const subscribeToEvents = useCallback(async () => {
    if (universalProvider) {
      universalProvider.on("display_uri", (uri: string) => {
        setCurrentWCURI(uri);
      });

      // Subscribe to session ping
      universalProvider.on("session_ping", ({ id, topic }) => {
        console.log("session_ping", id, topic);
      });

      // Subscribe to session event
      universalProvider.on("session_event", ({ event, chainId }) => {
        console.log("session_event", event, chainId);
      });

      // Subscribe to session update
      universalProvider.on("session_update", ({ topic, params }) => {
        console.log("session_update", topic, params);
      });

      // Subscribe to session delete
      universalProvider.on("session_delete", onSessionDelete);
    }
  }, [onSessionDelete]);

  useEffect(() => {
    if (initialized)
      subscribeToEvents();
  }, [initialized, subscribeToEvents]);

  return (
    <>
      <Animated.View style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: bottom + 12,
          left: 24,
          right: 24,
        },
      ]}>
        {currentAccount
          ? (
            <View style={styles.container}>
              <Text style={[styles.text, isDarkMode && styles.whiteText]}>
                        Address: {currentAccount}
              </Text>
              <TouchableOpacity
                style={[
                  styles.blueButton,
                  styles.disconnectButton,
                  isDarkMode && styles.blueButtonDark,
                ]}
                onPress={onDisconnect}>
                <Text style={styles.blueButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )
          : (
            <Button
              size={"$5"}
              pressStyle={{ opacity: 0.85 }}
              color={"white"}
              fontSize={"$6"}
              backgroundColor={"black"}
              onPress={onConnect}
              disabled={!initialized}
              icon={<Plug size={"$1.5"} />}
            >
              {initialized
                ? (
                  <Text style={styles.blueButtonText}>Connect Wallet</Text>
                )
                : (
                  <ActivityIndicator size="small" color="white" />
                )}
            </Button>
          )}
      </Animated.View>

      <ExplorerModal
        modalVisible={modalVisible}
        close={close}
        currentWCURI={currentWCURI}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  text: {
    fontWeight: "700",
  },
  whiteText: {
    color: "white",
  },
  blueButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: LightTheme.accent,
    borderRadius: 20,
    width: 150,
    height: 50,
    borderWidth: 1,
    borderColor: LightTheme.overlayThin,
  },
  blueButtonDark: {
    backgroundColor: DarkTheme.accent,
    borderColor: DarkTheme.overlayThin,
  },
  blueButtonText: {
    color: "white",
    fontWeight: "700",
  },
  disconnectButton: {
    marginTop: 20,
  },
});
