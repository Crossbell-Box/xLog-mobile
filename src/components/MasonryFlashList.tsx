import { useCallback, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";

import type { MasonryFlashListProps, MasonryFlashListRef } from "@shopify/flash-list";
import { MasonryFlashList as _MasonryFlashList } from "@shopify/flash-list";
import { Stack } from "tamagui";

const OriginalMasonryFlashList = Animated.createAnimatedComponent(_MasonryFlashList);

export const MasonryFlashList = ((props: MasonryFlashListProps<any>) => {
  const layoutsCaches = useRef(new Map<string, { height: number;width: number }>());

  const onLayout = useCallback((item: any, index: number, event: LayoutChangeEvent) => {
    const key = props.keyExtractor(item, index);
    const { height, width } = event.nativeEvent.layout;
    layoutsCaches.current.set(key, { height, width });
  }, [props.keyExtractor]);

  const getItemCachedLayout = useCallback((item: any, index: number) => {
    const key = props.keyExtractor(item, index);
    return layoutsCaches.current.get(key);
  }, [props.keyExtractor]);

  return (
    <OriginalMasonryFlashList
      {...props}
      renderItem={item => (
        <Stack
          height={getItemCachedLayout(item.item, item.index)?.height}
          onLayout={e => onLayout(item.item, item.index, e)}
        >
          {props.renderItem(item)}
        </Stack>
      )}
      overrideItemLayout={(
        layout: { span?: number; size?: number },
        item,
        index,
      ) => {
        layout.size = getItemCachedLayout(item, index)?.height;
      }}
    />
  );
}) as <T>(
  props: MasonryFlashListProps<T> & {
    ref?: React.RefObject<MasonryFlashListRef<T>>
  }
) => React.ReactElement;

