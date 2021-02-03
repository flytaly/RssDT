import React, { useState } from 'react';
import BarsIcon from '../../../public/static/bars.svg';
import { useMyFeedsQuery, UserFeed } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import AddFeedModal from '../modals/add-feed-modal';
import ModalSidebar from '../modals/modal-sidebar';
import FeedHeader from './feed-header';
import FeedItems from './feed-items';
import FeedSidebar from './feed-sidebar';
import { useLocalState } from './reader-options';

const FeedReader: React.FC<{ id?: string }> = ({ id }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [addFeedModalOpen, setAddFeedModalOpen] = useState(false);
  const { data, loading } = useMyFeedsQuery({ skip: isServer() });
  const [readerOpts, setReaderOpts] = useLocalState();

  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const feedList = (
    <div className="bg-sidebar h-full py-2">
      <FeedSidebar feeds={myFeeds} loading={loading} />
      <button
        type="button"
        className="btn border border-gray-400 block mx-auto mt-8 hover:bg-secondary"
        onClick={() => setAddFeedModalOpen(true)}
      >
        Add new feed
      </button>
    </div>
  );

  const userFeed = id && !loading ? myFeeds.find((uf) => uf.id === parseInt(id)) : null;

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200">
      <aside className="hidden md:block row-span-2">{feedList}</aside>
      <div className="flex items-center px-4 py-1 my-1 ">
        <button
          type="button"
          className="md:hidden icon-btn w-4 h-4 mr-4"
          title="Open list of the feeds"
          onClick={() => setSidebarModalOpen((prev) => !prev)}
        >
          <BarsIcon />
        </button>
        <FeedHeader userFeed={userFeed} readerOpts={readerOpts} setReaderOpts={setReaderOpts} />
      </div>
      {userFeed ? <FeedItems feed={userFeed} readerOpts={readerOpts} /> : <div />}
      <ModalSidebar
        isOpen={sidebarModalOpen}
        closeModal={() => setSidebarModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        {feedList}
      </ModalSidebar>
      <AddFeedModal isOpen={addFeedModalOpen} closeModal={() => setAddFeedModalOpen(false)} />
    </section>
  );
};

export default FeedReader;
