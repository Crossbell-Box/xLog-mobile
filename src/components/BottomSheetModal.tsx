import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated";

import type { BottomSheetBackdropProps, BottomSheetModalProps } from "@gorhom/bottom-sheet";
import { BottomSheetModal as _BottomSheetModal } from "@gorhom/bottom-sheet";
import { Stack } from "tamagui";

import { useColors } from "@/hooks/use-colors";

export type BottomSheetModalInstance = _BottomSheetModal;

interface Props extends BottomSheetModalProps {
  onPressBackdrop?: () => void
}

export const BottomSheetModal = React.forwardRef<
BottomSheetModalInstance,
Props
>((props, ref) => {
  const { background, subtitle } = useColors();

  return (
    <_BottomSheetModal
      {...props}
      ref={ref}
      handleIndicatorStyle={{ backgroundColor: subtitle }}
      handleStyle={styles.handleStyle}
      backdropComponent={props.backdropComponent ?? (_props => <CustomizedBackdrop {..._props} onPress={props?.onPressBackdrop}/>)}
      backgroundStyle={[{ backgroundColor: background }, props.backgroundStyle]}
    />
  );
});

export const CustomizedBackdrop = ({ animatedIndex, style, onPress }: BottomSheetBackdropProps & {
  onPress?: () => void
}) => {
  const [shouldMount, setShouldMount] = React.useState(false);

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

  useAnimatedReaction(
    () => animatedIndex.value,
    (value) => {
      if (value === -1) {
        runOnJS(setShouldMount)(false);
      }
      else if (shouldMount === false) {
        runOnJS(setShouldMount)(true);
      }
    },
    [onPress, shouldMount],
  );

  if (!shouldMount) {
    return null;
  }

  return (
    <Animated.View style={containerStyle} >
      <Stack onPress={onPress} flex={1}/>
    </Animated.View>
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

