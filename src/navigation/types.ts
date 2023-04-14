import { Props as FeedPageProps } from '@/pages/Feed';
import { Props as PostDetailsPageProps } from '@/pages/PostDetails';

export type HomeDrawerParamList = {
    Feed: FeedPageProps;
};

export type RootStackParamList = {
    Home: undefined;
    PostDetails: PostDetailsPageProps;
};