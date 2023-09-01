import React from "react";

import type { FlashListProps } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";

import { TabFlashListScrollView } from "./TabFlashListScrollView";

export type TabFlashListProps<T> = Omit<
FlashListProps<T>,
"renderScrollComponent"
> & {
  index: number
};

function TabFlashListComponent<T>(
  props: TabFlashListProps<T>,
  ref: React.Ref<FlashList<T>>,
) {
  return (
    <FlashList
      {...props}
      renderScrollComponent={TabFlashListScrollView as any}
      contentContainerStyle={{ paddingTop: 100 }}
      ref={ref}
    />
  );
}

export const TabFlashList = React.forwardRef(TabFlashListComponent) as <T>(
  props: TabFlashListProps<T> & {
    ref?: React.Ref<FlashList<T>>
  }
) => React.ReactElement;
