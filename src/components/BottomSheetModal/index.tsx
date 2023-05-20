import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import type { BottomSheetBackdropProps, BottomSheetModalProps } from "@gorhom/bottom-sheet";
import { BottomSheetModal as _BottomSheetModal } from "@gorhom/bottom-sheet";

import { useColors } from "@/hooks/use-colors";

export type BottomSheetModalInstance = _BottomSheetModal;

export const BottomSheetModal = React.forwardRef<
BottomSheetModalInstance,
BottomSheetModalProps
>((props, ref) => {
  const { background, subtitle } = useColors();

  return (
    <_BottomSheetModal
      {...props}
      ref={ref}
      handleIndicatorStyle={{ backgroundColor: subtitle }}
      handleStyle={styles.handleStyle}
      backdropComponent={CustomBackdrop}
      backgroundStyle={{ backgroundColor: background }}
    />
  );
});

const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  const containerStyle = useMemo(
    () => [
      style,
      styles.backdrop,
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle],
  );

  return (
    <Animated.View style={containerStyle} />
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    paddingTop: 12,
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
