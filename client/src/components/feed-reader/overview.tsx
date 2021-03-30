import React from 'react';
import BarsIcon from '../../../public/static/bars.svg';
import { UserFeed } from '../../generated/graphql';

interface OverviewProps {
  feeds: UserFeed[];
  setSidebarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Overview: React.FC<OverviewProps> = ({ feeds, setSidebarModalOpen }) => {
  return (
    <div className="px-4 py-1 my-1">
      <div className="flex items-center flex-wrap mb-4">
        <button
          type="button"
          className="md:hidden icon-btn mr-4"
          title="Open list of the feeds"
          onClick={() => setSidebarModalOpen((prev) => !prev)}
        >
          <BarsIcon className="h-4 w-4" />
        </button>
      </div>
      <div>
        <ul className="text-sm grid grid-cols-feed-overview  gap-4">
          {feeds.map((f) => (
            <li
              key={f.id}
              className="p-2 bg-white shadow-sm hover:shadow-message-darker  overflow-hidden max-h-full"
            >
              <b>{f.title || f.feed.title}</b>
              <div className="text-xs">{f.feed.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Overview;
