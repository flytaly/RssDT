import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FeedFieldsFragment, UserFeedFieldsFragment } from '../../generated/graphql';

interface FeedSidebarProps {
  feeds?: Array<{ feed: FeedFieldsFragment } & UserFeedFieldsFragment>;
  loading?: boolean;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({ feeds, loading }) => {
  const router = useRouter();
  const id = router.query.id ? parseInt(router.query.id as string) : null;

  const list = (
    <ul>
      {feeds?.map((uf) => {
        const hasNew = uf.newItemsCount > 0;
        const font = hasNew ? 'font-semibold text-white' : 'font-light text-gray-200';
        const bg = uf.id === id ? `bg-secondary` : '';
        return (
          <li key={uf.id} title={`${uf.newItemsCount || 0} new items`}>
            <Link href={`/feed/${uf.id}`}>
              <a
                className={`group flex pl-3 focus:ring-2 focus:ring-secondary whitespace-nowrap w-full ${font} ${bg}`}
              >
                <span className="overflow-ellipsis overflow-hidden group-hover:underline">
                  {uf.feed.title || uf.feed.url}
                </span>
                {hasNew ? (
                  <>
                    <div
                      className="flex-shrink-0 ml-1 mt-1 w-1 h-1 rounded-full bg-gray-200
                  bg-opacity-70 group-hover:bg-opacity-100"
                    />
                    <div className="group-hover:text-white text-xs text-gray-400 self-center ml-auto">
                      {uf.newItemsCount}
                    </div>
                  </>
                ) : null}
              </a>
            </Link>
          </li>
        );
      })}
    </ul>
  );
  const content = loading ? <div>Loading...</div> : list;
  return <nav className="w-full text-sm text-gray-50  pr-1 overflow-hidden">{content}</nav>;
};

export default FeedSidebar;
