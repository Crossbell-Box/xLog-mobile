/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Props as CharacterListPageProps } from "@/pages/CharacterList";
import type { Props as FeedPageProps } from "@/pages/Feed";
import type { Props as LoginPageProps } from "@/pages/Login";
import type { Props as PostDetailsPageProps } from "@/pages/PostDetails";
import type { Props as AchievementsPageProps } from "@/pages/Profile/Achievements";
import type { Props as CommentsPageProps } from "@/pages/Profile/Comments";
import type { Props as DashboardPageProps } from "@/pages/Profile/Dashboard";
import type { Props as EventsPageProps } from "@/pages/Profile/Events";
import type { Props as NotificationsPageProps } from "@/pages/Profile/Notifications";
import type { Props as PagesPageProps } from "@/pages/Profile/Pages";
import type { Props as PostsPageProps } from "@/pages/Profile/Posts";
import type { Props as RepliesPageProps } from "@/pages/Replies";
import type { Props as SettingsPageProps } from "@/pages/Settings";
import type { Props as UserInfoPageProps } from "@/pages/UserInfo";
import type { Props as WebPageProps } from "@/pages/Web";

export type HomeBottomTabsParamList = {
  Feed: FeedPageProps
  Settings: SettingsPageProps
};

export type ProfilePagesParamList = {
  Dashboard: DashboardPageProps
  Achievements: AchievementsPageProps
  Comments: CommentsPageProps
  Events: EventsPageProps
  Notifications: NotificationsPageProps
  Pages: PagesPageProps
  Posts: PostsPageProps
};

export type RootStackParamList = {
  Home: undefined
  PostDetails: PostDetailsPageProps
  Replies: RepliesPageProps
  CharacterListPage: CharacterListPageProps
  Web: WebPageProps
  Login: LoginPageProps
  UserInfo: UserInfoPageProps
} & ProfilePagesParamList;

