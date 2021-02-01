import React from 'react';
import { useInView } from 'react-intersection-observer';
import {
  FeedFieldsFragment,
  ItemFieldsFragment,
  useMyFeedItemsQuery,
  UserFeedFieldsFragment,
} from '../../generated/graphql';
import Spinner from '../spinner';
import FeedItem from './feed-item';
import { ReaderOptions } from './reader-options';

interface FeedItemsProps {
  feed: { feed: FeedFieldsFragment } & UserFeedFieldsFragment;
  readerOpts: ReaderOptions;
}

const take = 10;

const FeedItems: React.FC<FeedItemsProps> = ({ feed, readerOpts }) => {
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

  return (
    <main className="min-h-full flex flex-col flex-grow space-y-4 p-3">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} readerOpts={readerOpts} />
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
    </main>
  );
};

export default FeedItems;
