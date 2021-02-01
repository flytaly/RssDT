import React, { useState } from 'react';
import BarsIcon from '../../../public/static/bars.svg';
import { useMyFeedsQuery, UserFeed } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import EditFeedModal from '../modals/edit-feed-modal';
import ModalSidebar from '../modals/modal-sidebar';
import FeedHeader from './feed-header';
import FeedItems from './feed-items';
import FeedSidebar from './feed-sidebar';

const FeedReader: React.FC<{ id?: string }> = ({ id }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const { data, loading } = useMyFeedsQuery({ skip: isServer() });
  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const feedList = <FeedSidebar feeds={myFeeds} loading={loading} />;

  const userFeed = id && !loading ? myFeeds.find((uf) => uf.id === parseInt(id)) : null;
  const itemsElem = userFeed ? <FeedItems feed={userFeed} /> : <div />;

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200">
      <aside className="hidden md:block row-span-2">{feedList}</aside>
      <div className="px-4 py-1 flex items-center">
        <button
          type="button"
          className="md:hidden icon-btn w-4 h-4 mr-4"
          title="Open list of the feeds"
          onClick={() => setSidebarModalOpen((prev) => !prev)}
        >
          <BarsIcon />
        </button>
        <FeedHeader userFeed={userFeed} />
      </div>
      {itemsElem}
      <ModalSidebar
        isOpen={sidebarModalOpen}
        closeModal={() => setSidebarModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        {feedList}
      </ModalSidebar>
    </section>
  );
};

export default FeedReader;
