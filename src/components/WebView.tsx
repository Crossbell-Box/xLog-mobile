import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Progress from "react-native-progress";
import type { WebViewProps as RNWebViewProps } from "react-native-webview";
import { WebView as RNWebView } from "react-native-webview";

interface Props extends RNWebViewProps {
  source: RNWebViewProps["source"]
  onProgress?: (progress: number) => void
  progressBarShown?: boolean
}

const WebView = React.forwardRef<RNWebView, Props>(({ source, onProgress, progressBarShown = true, ...props }, ref) => {
  const [progress, setProgress] = useState(0);

  const handleLoadProgress = ({ nativeEvent }: any) => {
    if (nativeEvent.progress === 1)
      setProgress(0);
    else
      setProgress(nativeEvent.progress);

    onProgress?.(nativeEvent.progress);
  };

  return (
    <View style={styles.container}>
      <RNWebView
        source={source}
        onLoadProgress={handleLoadProgress}
        {...props}
        ref={ref}
      />
      {progressBarShown && progress > 0 && (
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progress: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});

export { WebView };
