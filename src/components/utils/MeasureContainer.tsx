import type { ComponentPropsWithRef } from "react";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

import { Stack, type StackProps as _StackProps } from "tamagui";

type StackProps = ComponentPropsWithRef<typeof Stack>;

interface Props extends StackProps {
  children: (dimensions: {
    width: number
    height: number
  }) => React.ReactNode
}

export const MeasureContainer: React.FC<Props> = (props) => {
  const { children, onLayout: _onLayout, ...restProps } = props;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
    _onLayout?.(event);
  }, [
    setDimensions,
    _onLayout,
  ]);

  const childrenNode = useMemo(() => children(dimensions), [children, dimensions]);

  return <Stack {...restProps} onLayout={onLayout}>{childrenNode}</Stack>;
};
