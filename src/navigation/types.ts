import type { ParamListBase } from "@react-navigation/native";

import type { Props as FeedPageProps } from "@/pages/Feed";
import type { Props as PostDetailsPageProps } from "@/pages/PostDetails";

export interface HomeDrawerParamList extends ParamListBase {
  Feed: FeedPageProps
}

export interface RootStackParamList extends ParamListBase {
  Home: undefined
  PostDetails: PostDetailsPageProps
}
