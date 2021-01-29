/* eslint-disable react/no-danger */
import React from 'react';
import { useInView } from 'react-intersection-observer';
import {
  FeedFieldsFragment,
  Item,
  ItemFieldsFragment,
  useMyFeedItemsQuery,
  UserFeedFieldsFragment,
} from '../../generated/graphql';
import Spinner from '../spinner';

interface FeedItemsProps {
  feed: { feed: FeedFieldsFragment } & UserFeedFieldsFragment;
}

function getItemHTML(item: Pick<Item, 'description' | 'summary'>) {
  return { __html: item.summary || item.description || '' };
}

const take = 10;

const FeedItems: React.FC<FeedItemsProps> = ({ feed }) => {
  const { ref, inView } = useInView({ threshold: 0, initialInView: false });
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
        <article key={item.id} className="p-3 shadow-message bg-white rounded-sm text-sm">
          <h4 className="font-bold">{item.title}</h4>
          <div className="text-xs mb-3">
            {new Date(item.pubdate || item.createdAt).toLocaleString()}
          </div>
          <div dangerouslySetInnerHTML={getItemHTML(item)} />
        </article>
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
