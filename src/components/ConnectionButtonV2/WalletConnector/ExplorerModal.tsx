import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, useColorScheme, ImageBackground } from "react-native";
import Modal from "react-native-modal";

import { DarkTheme, LightTheme } from "@/constants/colors";
import { DEVICE_WIDTH } from "@/constants/platform";
import type { Routes } from "@/constants/routes";
import type { WalletInfo } from "@/types/api";
import { fetchAllWallets } from "@/utils/explorer-utils";

import ExplorerModalHeader from "./ExplorerModalHeader";
import InitialExplorerContent from "./InitialExplorerContent";
import QRView from "./QRView";
import ViewAllExplorerContent from "./ViewAllExplorerContent";

import Background from "../../../assets/Background.png";

const INITIAL_ROUTE = "INIT_WALLETS";

interface ExplorerModalProps {
  modalVisible: boolean
  close: () => void
  currentWCURI?: string
}

function ExplorerModal({
  modalVisible,
  close,
  currentWCURI,
}: ExplorerModalProps) {
  const [isWalletListLoading, setWalletListLoading] = useState(true);
  const [initialWallets, setInitialWallets] = useState<WalletInfo[]>([]);
  const [allWallets, setAllWallets] = useState<WalletInfo[]>([]);

  const isDarkMode = useColorScheme() === "dark";

  const [viewStack, setViewStack] = useState<Routes[]>([INITIAL_ROUTE]);

  const fetchWallets = useCallback(() => {
    fetchAllWallets().then((wallets) => {
      setWalletListLoading(false);
      if (wallets) {
        setInitialWallets(wallets.slice(0, 7));
        setAllWallets(wallets);
      }
    });
  }, []);

  const onNavigate = useCallback(
    (route: Routes) => {
      setViewStack(viewStack.concat([route]));
    },
    [viewStack],
  );

  const onNavigateBack = useCallback(() => {
    if (viewStack.length > 1)
      setViewStack(viewStack.slice(0, -1));
  }, [viewStack]);

  const SCREENS = useMemo(() => {
    return {
      INIT_WALLETS: (
        <InitialExplorerContent
          isLoading={isWalletListLoading}
          explorerData={initialWallets}
          onViewAllPress={() => onNavigate("ALL_WALLETS")}
          currentWCURI={currentWCURI}
          onQRPress={() => onNavigate("QR_CODE")}
        />
      ),
      ALL_WALLETS: (
        <ViewAllExplorerContent
          isLoading={isWalletListLoading}
          explorerData={allWallets}
          onBackPress={onNavigateBack}
          currentWCURI={currentWCURI}
        />
      ),
      QR_CODE: <QRView uri={currentWCURI} onBackPress={onNavigateBack} />,
    };
  }, [
    currentWCURI,
    initialWallets,
    isWalletListLoading,
    onNavigateBack,
    onNavigate,
    allWallets,
  ]);

  useEffect(() => {
    if (!allWallets.length)
      fetchWallets();
  }, [allWallets, fetchWallets, isWalletListLoading]);

  return (
    <Modal
      isVisible={modalVisible}
      style={styles.modal}
      propagateSwipe
      hideModalContentWhileAnimating
      onBackdropPress={close}
      onModalHide={() => {
        setViewStack([INITIAL_ROUTE]);
      }}
      useNativeDriver>
      <ImageBackground
        style={styles.wcContainer}
        source={Background}
        imageStyle={styles.wcImage}>
        <ExplorerModalHeader close={close} />
        <View
          style={[
            styles.connectWalletContainer,
            isDarkMode && styles.connectWalletContainerDark,
          ]}>
          {SCREENS[viewStack.at(-1) ?? INITIAL_ROUTE]}
        </View>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  wcContainer: {
    width: DEVICE_WIDTH,
  },
  wcImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  connectWalletContainer: {
    backgroundColor: LightTheme.background1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  connectWalletContainerDark: {
    backgroundColor: DarkTheme.background1,
  },
});

export default ExplorerModal;
