import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  FeedFieldsFragment,
  ItemFieldsFragment,
  useMyFeedItemsQuery,
  UserFeedFieldsFragment,
  useSetLastViewedItemDateMutation,
} from '../../generated/graphql';
import ViewItemModal from '../modals/view-item-modal';
import Spinner from '../spinner';
import FeedItem, { fontSizes } from './feed-item';
import FeedItemContent from './feed-item-content';
import { ReaderOptions } from './reader-options';

interface FeedItemsProps {
  feed: { feed: FeedFieldsFragment } & UserFeedFieldsFragment;
  readerOpts: ReaderOptions;
  filter?: string | null;
}

const take = 10;

const FeedItems: React.FC<FeedItemsProps> = ({ feed, readerOpts, filter }) => {
  const [showItemInModal, setShowItemInModal] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0 });
  const { data, loading, fetchMore, error } = useMyFeedItemsQuery({
    notifyOnNetworkStatusChange: true,
    variables: { feedId: feed.feed.id, skip: 0, take, filter },
  });
  const [setItemDate, setItemDateStatus] = useSetLastViewedItemDateMutation();

  const newItemDate = React.useMemo(
    () => feed.lastViewedItemDate,
    // Intentionally remember only by id to save date after initial render of the feed.
    // This way the "new" label won't disappear after update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed.id],
  );

  const items: ItemFieldsFragment[] = data?.myFeedItems.items || [];
  const hasMore = data?.myFeedItems.hasMore && !loading && !error;

  if (inView && hasMore) {
    fetchMore({ variables: { feedId: feed.feed.id, skip: items.length, take } }).catch((e) =>
      console.error(e),
    );
  }

  const modalItem = showItemInModal && items.find((it) => it.id === showItemInModal);

  const newestItem: ItemFieldsFragment | null = items.length ? items[0] : null;

  useEffect(() => {
    if (!newestItem || setItemDateStatus.loading) return;
    const prevDate = new Date(feed.lastViewedItemDate);
    const lastDate = new Date(newestItem.createdAt);
    if (prevDate < lastDate) {
      setItemDate({
        variables: { itemId: newestItem.id, userFeedId: feed.id },
      }).catch((e) => console.error("Couldn't update lastViewedItemDate", e));
    }
  }, [feed.id, feed.lastViewedItemDate, newestItem, setItemDate, setItemDateStatus.loading]);

  return (
    <main className="flex flex-col flex-grow space-y-4 p-3">
      {!items.length && !loading && (
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
      {error ? (
        <div className="border-2 border-error shadow-message-err self-center p-3 mt-3">
          {error.message}
        </div>
      ) : null}

      {hasMore ? <div ref={ref} className="h-0" /> : null}

      {loading ? (
        <div className="h-6 self-center">
          <Spinner />
        </div>
      ) : null}
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
