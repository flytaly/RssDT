import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { getGQLClient } from '@/app/lib/gqlClient.client';
import useSetLastViewedItemDate from '@/app/lib/mutations/set-last-viewed-date';
import ViewItemModal from '@/components/modals/view-item-modal';
import Spinner from '@/components/spinner';
import { FeedFieldsFragment, MyFeedItemsQuery, UserFeedFieldsFragment } from '@/gql/generated';

import FeedItem, { fontSizes } from './feed-item';
import FeedItemContent from './feed-item-content';
import { ReaderOptions } from './reader-options';

type UserFeedWithFeed = { feed: FeedFieldsFragment } & UserFeedFieldsFragment;

interface FeedItemsProps {
  feed: UserFeedWithFeed;
  readerOpts: ReaderOptions;
  filter?: string | null;
  showRefetchBtn?: boolean;
  onRefetchEnd?: () => void;
}

const TAKE = 15;

// Offset based pagination
// TODO: it is better to replace it with a cursor-based, which will be less buggy and more perfomant.
// For example, sometimes it may return duplicate items, so they should be filtered out.
function usePaginatedItems(userFeed: UserFeedWithFeed, filter?: string | null) {
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

export default function FeedItems({
  feed,
  readerOpts,
  filter,
  showRefetchBtn,
  onRefetchEnd,
}: FeedItemsProps) {
  const [showItemInModal, setShowItemInModal] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0 });
  const { items, isLoading, hasMore, fetchMore, isFetching, error, isError, reload } =
    usePaginatedItems(feed, filter);

  useSetLastViewedItemDate(feed, items);

  useEffect(() => {
    if (hasMore && inView) {
      fetchMore();
    }
  }, [fetchMore, hasMore, inView]);

  const newItemDate = React.useMemo(
    () => feed.lastViewedItemDate,
    // Intentionally remember only by id to save date after initial render of the feed.
    // This way the "new" label won't disappear after update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed.id],
  );

  const modalItem = showItemInModal && items.find((it) => it.id === showItemInModal);

  return (
    <main className="flex flex-col flex-grow space-y-4 p-3 break-all justify-self-center max-w-[100ch]">
      {!error && feed.newItemsCount && showRefetchBtn ? (
        <div className="self-center">
          <button
            className="btn bg-white text-black"
            type="button"
            onClick={async () => {
              reload(), onRefetchEnd?.();
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? <Spinner /> : <span className="mx-1">Load new items</span>}
          </button>
        </div>
      ) : null}
      {isError ? (
        <div className="border-2 border-error shadow-message-err self-center p-3 mt-3">
          {(error as Error).message}
        </div>
      ) : null}
      {!items.length && !isLoading && (
        <div className="self-center font-bold">
          {!filter ? "The feed doesn't have items" : "Couldn't find posts that match your query"}
        </div>
      )}
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          readerOpts={readerOpts}
          onItemClick={setShowItemInModal}
          isNew={newItemDate && new Date(item.createdAt) > new Date(newItemDate)}
        />
      ))}

      {hasMore ? <div ref={ref} className="h-0" /> : null}

      {isLoading || isFetching ? <Spinner className="h-6 self-center" /> : null}
      <ViewItemModal isOpen={!!modalItem} onRequestClose={() => setShowItemInModal(null)}>
        {modalItem ? (
          <FeedItemContent
            item={modalItem}
            containerClassName={`${fontSizes[readerOpts.fontSize]} max-w-4xl`}
            showBody
          />
        ) : null}
      </ViewItemModal>
    </main>
  );
}
