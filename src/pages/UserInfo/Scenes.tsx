import type { FC } from "react";
import React from "react";

import { Stack } from "tamagui";

import { TabMasonryFeedList } from "@/components/FeedList";

export const HomeScene: FC<{ characterId: number; index: number }> = ({ characterId, index }) => {
  return (
    <Stack flex={1}>
      <TabMasonryFeedList
        index={index}
        characterId={characterId}
        type={"character"}
      />
    </Stack>
  );
};

export const TagScene: FC<{
  characterId: number
  index: number
  tag: string
}> = ({ characterId, tag, index }) => {
  return (
    <Stack flex={1}>
      <TabMasonryFeedList
        index={index}
        characterId={characterId}
        type={"tag"}
        tag={tag}
      />
    </Stack>
  );
};

