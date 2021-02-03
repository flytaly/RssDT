import React from 'react';
import Link from 'next/link';
import { FeedFieldsFragment, UserFeedFieldsFragment } from '../../generated/graphql';

interface FeedSidebarProps {
  feeds?: Array<{ feed: FeedFieldsFragment } & UserFeedFieldsFragment>;
  loading?: boolean;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({ feeds, loading }) => {
  const list = (
    <ul>
      {feeds?.map((uf) => (
        <li key={uf.id} className="whitespace-nowrap overflow-ellipsis overflow-hidden">
          <Link href={`/feed/${uf.id}`}>
            <a className="block pl-3 hover:underline focus:bg-secondary">
              {uf.feed.title || uf.feed.url}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
  const content = loading ? <div>Loading...</div> : list;
  return <nav className="w-full text-sm text-gray-50  pr-1 overflow-hidden">{content}</nav>;
};

export default FeedSidebar;
