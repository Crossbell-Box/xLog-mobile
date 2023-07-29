import type { ErrorInfo } from "react";
import React, { Component } from "react";
import { View, Text } from "react-native";

import * as Senrty from "sentry-expo";

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<any, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.log("ErrorBoundary:", error, errorInfo);

    Senrty.Native.captureException(
      error, {
        extra: { componentStack: errorInfo.componentStack },
      },
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
