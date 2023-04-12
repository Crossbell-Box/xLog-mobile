import { Props as ArticleListProps } from '@/pages/ArticleList';
import { Props as ArticleDetailsProps } from '@/pages/ArticleDetails';

export type HomeDrawerParamList = {
    ArticleList: ArticleListProps;
};

export type RootStackParamList = {
    Home: undefined;
    ArticleDetails: ArticleDetailsProps;
};