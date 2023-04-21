import React, {useRef, useEffect} from 'react';
import {
  Animated,
  StyleSheet,
  useColorScheme,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {DarkTheme, LightTheme} from '@/constants/colors';
import {DEVICE_HEIGHT} from '@/constants/platform';
import ExplorerItem, {ITEM_HEIGHT} from './ExplorerItem';

import NavigationHeader from './NavigationHeader';

interface ViewAllExplorerContentProps {
  isLoading: boolean;
  explorerData: any;
  onBackPress: () => void;
  currentWCURI?: string;
}

function ViewAllExplorerContent({
  isLoading,
  explorerData,
  onBackPress,
  currentWCURI,
}: ViewAllExplorerContentProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{opacity: fadeAnim}}>
      <>
        <NavigationHeader
          title="Connect your Wallet"
          onBackPress={onBackPress}
        />
        {isLoading || !currentWCURI ? (
          <ActivityIndicator
            style={styles.loader}
            color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
          />
        ) : (
          <FlatList
            data={explorerData || []}
            style={styles.list}
            contentContainerStyle={styles.listContentContainer}
            indicatorStyle={isDarkMode ? 'white' : 'black'}
            showsVerticalScrollIndicator
            numColumns={4}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            renderItem={({item}) => (
              <ExplorerItem currentWCURI={currentWCURI} walletInfo={item} />
            )}
          />
        )}
      </>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: DEVICE_HEIGHT * 0.6,
  },
  listContentContainer: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  loader: {
    height: DEVICE_HEIGHT * 0.4,
  },
});

export default ViewAllExplorerContent;
