import type { FC } from "react";

import type { ExpandedNote } from "@/types/crossbell";

import type { Props as FeedListProps } from "./useFeedList";
import { useFeedList } from "./useFeedList";

import { MasonryFlashList } from "../MasonryFlashList";
import { TabMasonryFlashList } from "../TabMasonryFlashList";

interface MasonryProps extends FeedListProps {}

export const MasonryFeedList: FC<MasonryProps> = (props) => {
  const _props = useFeedList(props);

  return <MasonryFlashList<ExpandedNote> {..._props}/>;
};

interface TabMasonryProps extends FeedListProps {
  index: number
  characterId: number
}

export const TabMasonryFeedList: FC<TabMasonryProps> = (props) => {
  const _props = useFeedList(props);

  return <TabMasonryFlashList<ExpandedNote> {..._props}/>;
};
