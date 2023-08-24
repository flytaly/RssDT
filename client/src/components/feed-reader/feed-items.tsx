import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { getGQLClient } from '@/app/lib/gqlClient.client';
import ViewItemModal from '@/components/modals/view-item-modal';
import Spinner from '@/components/spinner';
import {
  FeedFieldsFragment,
  ItemFieldsFragment,
  UserFeedFieldsFragment,
  useSetLastViewedItemDateMutation,
} from '@/generated/graphql';

import FeedItem, { fontSizes } from './feed-item';
import FeedItemContent from './feed-item-content';
import { ReaderOptions } from './reader-options';

interface FeedItemsProps {
  feed: { feed: FeedFieldsFragment } & UserFeedFieldsFragment;
  readerOpts: ReaderOptions;
  filter?: string | null;
  showRefetchBtn?: boolean;
  onRefetchEnd?: () => void;
}

const take = 10;

const FeedItems = ({ feed, readerOpts, filter, showRefetchBtn, onRefetchEnd }: FeedItemsProps) => {
  const [showItemInModal, setShowItemInModal] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0 });

  const { data, isLoading, error, isError, hasNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ['myFeedItems', feed.feed.id, filter],
      queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
        return getGQLClient().myFeedItems({
          feedId: feed.feed.id,
          skip: pageParam,
          take: take,
          filter,
        });
      },
      getNextPageParam: (_, pages) => {
        if (!pages.at(-1)?.myFeedItems.hasMore) return undefined;
        return pages.length * take;
      },
    });

  const [setItemDate, setItemDateStatus] = useSetLastViewedItemDateMutation();

  const newItemDate = React.useMemo(
    () => feed.lastViewedItemDate,
    // Intentionally remember only by id to save date after initial render of the feed.
    // This way the "new" label won't disappear after update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed.id],
  );

  const items = React.useMemo(() => {
    const itm = data?.pages.flatMap((page) => page.myFeedItems.items) || [];
    // filter duplicates
    return itm.filter((item, index, self) => self.findIndex((i) => i.id === item.id) === index);
  }, [data]);

  const hasMore = hasNextPage && !isLoading && !isFetching && !isError;

  useEffect(() => {
    if (hasMore && inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasMore, inView]);

  const modalItem = showItemInModal && items.find((it) => it.id === showItemInModal);

  const newestItem: ItemFieldsFragment | null = items.length ? items[0] : null;

  useEffect(() => {
    if (!newestItem || setItemDateStatus.loading) return;
    const prevDate = new Date(feed.lastViewedItemDate);
    const lastDate = new Date(newestItem.createdAt);
    if (prevDate < lastDate) {
      setItemDate({
        variables: { itemId: newestItem.id, userFeedId: feed.id },
        optimisticResponse: {
          setLastViewedItemDate: {
            lastViewedItemDate: newestItem.createdAt,
            id: feed.id,
            newItemsCount: 0,
          },
        },
      }).catch((e) => console.error("Couldn't update lastViewedItemDate", e));
    }
  }, [feed.id, feed.lastViewedItemDate, newestItem, setItemDate, setItemDateStatus.loading]);

  return (
    <main className="flex flex-col flex-grow space-y-4 p-3 break-all justify-self-center max-w-[100ch]">
      {!error && feed.newItemsCount && showRefetchBtn ? (
        <div className="self-center">
          <button
            className="btn bg-white text-black"
            type="button"
            onClick={async () => {
              /* await refetch(); */
              onRefetchEnd?.();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <span className="mx-1">Load new items</span>}
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
};

export default FeedItems;
