import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import { getGQLClient } from '@/app/lib/gqlClient.client';
import {
  FeedFieldsFragment,
  MyFeedItemsQuery,
  MyFeedsQuery,
  UserFeedFieldsFragment,
} from '@/gql/generated';

export type UserFeedWithFeed = { feed: FeedFieldsFragment } & UserFeedFieldsFragment;

const TAKE = 15;

// Offset based pagination
// TODO: it is better to replace it with a cursor-based, which will be less buggy and more perfomant.
// For example, sometimes it may return duplicate items, so they should be filtered out.
export function usePaginatedItems(userFeed: UserFeedWithFeed, filter?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['myFeedItems', userFeed.feed.id, filter];

  const { data, isLoading, error, isError, hasNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
        return getGQLClient().myFeedItems({
          feedId: userFeed.feed.id,
          skip: pageParam,
          take: TAKE,
          filter,
        });
      },
      getNextPageParam: (_, pages) => {
        if (!pages.at(-1)?.myFeedItems.hasMore) return undefined;
        return pages.length * TAKE;
      },
      onSuccess: (data) => {
        if (data.pageParams.length > 1) return;
        // reset newItemsCount if it is the first page
        queryClient.setQueryData<MyFeedsQuery>(['myFeeds'], (oldData) => {
          if (!oldData?.myFeeds) return oldData;
          const updated = oldData.myFeeds.map((uf) => {
            if (uf.id !== userFeed.id) return uf;
            return { ...uf, newItemsCount: 0 };
          });
          return { ...oldData, myFeeds: updated };
        });
      },
    });

  const items = React.useMemo(() => {
    const itm = data?.pages.flatMap((page) => page.myFeedItems.items) || [];
    // filter duplicates
    return itm.filter((item, index, self) => self.findIndex((i) => i.id === item.id) === index);
  }, [data]);

  const hasMore = hasNextPage && !isLoading && !isFetching && !isError;

  const reload = () => {
    queryClient.setQueryData<InfiniteData<MyFeedItemsQuery>>(queryKey, (data) => {
      if (!data) return data;
      return {
        pages: data?.pages.slice(0, 1),
        pageParams: data.pageParams.slice(0, 1),
      };
    });
    queryClient.invalidateQueries(queryKey);
  };

  return {
    fetchMore: fetchNextPage,
    items,
    reload,
    hasMore,
    isLoading,
    isFetching,
    error,
    isError,
  };
}
