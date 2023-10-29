import type { FC } from "react";
import React from "react";

import { Stack } from "tamagui";

import { TabMasonryFeedList } from "@/components/FeedList";
import { PageVisibilityEnum } from "@/types";

export const HomeScene: FC<{ handle: string; characterId: number; index: number }> = ({ handle, characterId, index }) => {
  return (
    <Stack flex={1}>
      <TabMasonryFeedList
        index={index}
        characterId={characterId}
        type={"post"}
        handle={handle}
        visibility={PageVisibilityEnum.Published}
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
        type={"tag"}
        tags={tags}
      />
    </Stack>
  );
};
