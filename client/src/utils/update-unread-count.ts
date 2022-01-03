import { gql, OnSubscriptionDataOptions } from '@apollo/client';
import {
  ItemsCountUpdatedSubscription,
  MyFeedItemsQuery,
  MyFeedsDocument,
  MyFeedsQuery,
} from '../generated/graphql';
import { PaginatedItemsRef } from '../lib/apollo-client';

export const createUpdateOnNewItems =
  (currentUserFeedId?: number, onNewItems?: () => void) =>
  (options: OnSubscriptionDataOptions<ItemsCountUpdatedSubscription>) => {
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
      newItemsCount: (f.newItemsCount || 0) + (dataNorm[f.feed.id] || 0),
    }));
    cache.writeQuery<MyFeedsQuery>({
      query,
      data: { __typename: 'Query', myFeeds } as MyFeedsQuery,
    });

    if (!currentUserFeedId) return;

    const myItems = cache.readQuery<MyFeedItemsQuery>({
      query: gql`
        query myFeedItems($feedId: Float!, $filter: String) {
          myFeedItems(feedId: $feedId, filter: $filter) {
            items {
              id
            }
          }
        }
      `,
      variables: { feedId: currentUserFeedId, filter: '' },
    });
    const items = myItems?.myFeedItems.items;
    const filterIds = new Set(items?.map((i) => i.id));
    cache.modify({
      fields: {
        myFeedItems: (existing: PaginatedItemsRef, { readField, DELETE }) => {
          const saveItems = existing?.items?.filter((ref) => filterIds.has(readField('id', ref)!));
          if (saveItems?.length) {
            return {
              ...existing,
              items: saveItems,
            };
          }
          return DELETE;
        },
      },
    });
    if (filterIds.size) onNewItems?.();
  };
