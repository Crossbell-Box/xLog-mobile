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
        searchType={"character"}
      />
    </Stack>
  );
};

export const TagScene: FC<{
  characterId: number
  index: number
  tags: string[]
}> = ({ characterId, tags, index }) => {
  return (
    <Stack flex={1}>
      <TabMasonryFeedList
        index={index}
        characterId={characterId}
        searchType={"tag"}
        tags={tags}
      />
    </Stack>
  );
};

