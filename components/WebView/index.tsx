import React, { useState, ForwardRefRenderFunction, useImperativeHandle } from 'react';
import { WebView as RNWebView, WebViewProps as RNWebViewProps } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface Props extends RNWebViewProps {
  source: RNWebViewProps['source'];
  onProgress?: (progress: number) => void;
}

const WebView = React.forwardRef<RNWebView, Props>(({ source, onProgress, ...props }, ref) => {
  const RNWebViewRef = React.useRef<RNWebView>(null!);
  const [progress, setProgress] = useState(0);

  const handleLoadProgress = ({ nativeEvent }: any) => {
    if (nativeEvent.progress === 1) {
      setProgress(0);
    } else {
      setProgress(nativeEvent.progress);
    }

    onProgress?.(nativeEvent.progress);
  };

  return (
    <View style={styles.container}>
      <RNWebView source={source} onLoadProgress={handleLoadProgress} {...props} ref={ref}/>
      {progress > 0 && (
        <Progress.Bar
          progress={progress}
          width={null}
          height={3}
          color="#000"
          unfilledColor="rgba(0,0,0,0.3)"
          borderWidth={0}
          style={styles.progress}
        />
      )}
    </View>
  );
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export {WebView}
