import { forwardRef } from "react";
import Animated from "react-native-reanimated";

import type { MasonryFlashListProps, MasonryFlashListRef } from "@shopify/flash-list";
import { MasonryFlashList as _MasonryFlashList } from "@shopify/flash-list";

const OriginalMasonryFlashList = Animated.createAnimatedComponent(_MasonryFlashList);

export const MasonryFlashList = forwardRef((props: MasonryFlashListProps<any>, ref: any) => {
  return (
    <OriginalMasonryFlashList
      {...props}
      ref={ref}
    />
  );
}) as <T>(
  props: MasonryFlashListProps<T> & {
    ref?: React.RefObject<MasonryFlashListRef<T>>
  }
) => React.ReactElement;

