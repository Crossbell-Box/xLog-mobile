/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Props as FeedPageProps } from "@/pages/Feed";
import type { Props as PostDetailsPageProps } from "@/pages/PostDetails";
import type { Props as SettingsPageProps } from "@/pages/Settings";

export type HomeBottomTabsParamList = {
  Feed: FeedPageProps
  Settings: SettingsPageProps
};

export type RootStackParamList = {
  Home: undefined
  PostDetails: PostDetailsPageProps
};
