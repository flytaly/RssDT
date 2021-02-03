import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  FeedFieldsFragment,
  ItemFieldsFragment,
  useMyFeedItemsQuery,
  UserFeedFieldsFragment,
} from '../../generated/graphql';
import ViewItemModal from '../modals/view-item-modal';
import Spinner from '../spinner';
import FeedItem, { fontSizes } from './feed-item';
import FeedItemContent from './feed-item-content';
import { ReaderOptions } from './reader-options';

interface FeedItemsProps {
  feed: { feed: FeedFieldsFragment } & UserFeedFieldsFragment;
  readerOpts: ReaderOptions;
}

const take = 10;

const FeedItems: React.FC<FeedItemsProps> = ({ feed, readerOpts }) => {
  const [showItemInModal, setShowItemInModal] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0 });
  const { data, loading, fetchMore, error } = useMyFeedItemsQuery({
    notifyOnNetworkStatusChange: true,
    variables: { feedId: feed.feed.id, skip: 0, take },
  });
  const items: ItemFieldsFragment[] = data?.myFeedItems.items || [];
  const hasMore = data?.myFeedItems.hasMore && !loading && !error;

  if (inView && hasMore) {
    fetchMore({ variables: { feedId: feed.feed.id, skip: items.length, take } }).catch((e) =>
      console.error(e),
    );
  }

  const modalItem = showItemInModal && items.find((it) => it.id === showItemInModal);

  return (
    <main className="min-h-full flex flex-col flex-grow space-y-4 p-3">
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          readerOpts={readerOpts}
          onItemClick={setShowItemInModal}
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
