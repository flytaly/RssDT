import { OnSubscriptionDataOptions } from '@apollo/client';
import {
  ItemsCountUpdatedSubscription,
  MyFeedItemsDocument,
  MyFeedsDocument,
  MyFeedsQuery,
} from '../generated/graphql';

export const updateUnreadCount = (
  options: OnSubscriptionDataOptions<ItemsCountUpdatedSubscription>,
) => {
  const { client, subscriptionData } = options;
  const data = subscriptionData.data?.itemsCountUpdated;
  if (!data) return;

  const { cache } = client;
  const query = MyFeedsDocument;
  const myFeedsPrev = cache.readQuery<MyFeedsQuery>({ query })?.myFeeds || [];
  const dataNorm: Record<number, number> = {};
  data.forEach((d) => {
    dataNorm[d.feedId] = d.count;
  });
  const myFeeds = myFeedsPrev.map((f) => ({
    ...f,
    newItemsCount: (f.newItemsCount || 0) + dataNorm[f.id],
  }));
  cache.writeQuery<MyFeedsQuery>({ query, data: { __typename: 'Query', myFeeds } as MyFeedsQuery });
};
