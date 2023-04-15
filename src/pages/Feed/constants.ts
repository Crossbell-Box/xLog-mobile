import { FeedType } from "@/models/home.model";

export type SortType = Exclude<FeedType, 'topic'>;

export const sortType: Record<Uppercase<SortType>, SortType> = {
    LATEST: 'latest',
    HOT: 'hot',
    FOLLOWING: 'following'
}