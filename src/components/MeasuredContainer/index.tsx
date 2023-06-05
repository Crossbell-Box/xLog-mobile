import React, { useState, useEffect } from "react";
import type { LayoutChangeEvent, LayoutRectangle } from "react-native";

import type { StackProps } from "tamagui";
import { Stack } from "tamagui";

export interface Props extends StackProps {
  children: (layout: LayoutRectangle) => React.ReactNode
}

export const MeasuredContainer: React.FC<Props> = ({ children, ...StackProps }) => {
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setLayout({ x, y, width, height });
  };

  return (
    <Stack {...StackProps} onLayout={onLayout}>
      {layout && children(layout)}
    </Stack>
  );
};
