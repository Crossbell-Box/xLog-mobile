import { useRef, useState } from "react";
import type { ViewProps } from "react-native";
import { InteractionManager, View } from "react-native";

interface Props extends Omit<ViewProps, "children"> {
  children: ((dimensions: {
    width: number
    height: number
  }) => React.ReactNode) | React.ReactNode
  onDimensionsChange?: (dimensions: {
    x: number
    y: number
    width: number
    height: number
    pageX: number
    pageY: number
  }) => void
}

export const MeasureContainer: React.FC<Props> = (props) => {
  const { children, onDimensionsChange, ...restProps } = props;
  const ref = useRef<View>(null);
  const [dimensions, setDimensions] = useState<Parameters<Props["onDimensionsChange"]>[0]>(undefined);
  const childrenNode = typeof children === "function" ? children(dimensions) : children;

  return (
    <View
      {...restProps}
      ref={ref}
      onLayout={() => {
        InteractionManager.runAfterInteractions(() => {
          ref.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            const dimensions = { x, y, width, height, pageX, pageY };
            onDimensionsChange?.(dimensions);
            setDimensions(dimensions);
          });
        });
      }}
    >
      {childrenNode}
    </View>
  );
};
