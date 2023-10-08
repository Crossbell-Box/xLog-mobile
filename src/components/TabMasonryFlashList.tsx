import type { RefObject } from "react";
import React from "react";

import type { MasonryFlashListProps, MasonryFlashListRef } from "@shopify/flash-list";
import { MasonryFlashList } from "@shopify/flash-list";
import { useHeaderTabContext } from "@showtime-xyz/tab-view";

import { TabFlashListScrollView } from "./TabFlashListScrollView";

export type TabMasonryFlashListProps<T> = Omit<
MasonryFlashListProps<T>,
"renderScrollComponent"
> & {
  index?: number
};

function TabMasonryFlashListComponent<T>(
  props: TabMasonryFlashListProps<T>,
  ref: RefObject<MasonryFlashListRef<T>>,
) {
  const { scrollViewPaddingTop } = useHeaderTabContext();

  return (
    <MasonryFlashList
      {...props}
      renderScrollComponent={TabFlashListScrollView as any}
      contentContainerStyle={{ paddingTop: scrollViewPaddingTop }}
      ref={ref}
    />
  );
}

export const TabMasonryFlashList = React.forwardRef(TabMasonryFlashListComponent) as <T>(
  props: TabMasonryFlashListProps<T> & {
    ref?: RefObject<MasonryFlashListRef<T>>
  }
) => React.ReactElement;
