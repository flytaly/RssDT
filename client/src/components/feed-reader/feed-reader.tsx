import React, { useState } from 'react';
import { useMyFeedsQuery, UserFeed } from '../../generated/graphql';
import AddFeedModal from '../modals/add-feed-modal';
import ModalSidebar from '../modals/modal-sidebar';
import FeedSidebar from './feed-sidebar';
import FeedContent from './feed-content';

const FeedReader: React.FC<{ id?: number }> = ({ id }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [addFeedModalOpen, setAddFeedModalOpen] = useState(false);
  const { data, loading } = useMyFeedsQuery({ ssr: false });
  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const userFeed = id && !loading ? myFeeds.find((uf) => uf.id === id) : null;

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200 limit-width">
      <aside className="hidden md:flex flex-col row-span-2 bg-sidebar">
        <div className="flex-shrink-0">
          <FeedSidebar
            feeds={myFeeds}
            loading={loading}
            onAddFeedClick={() => setAddFeedModalOpen(true)}
          />
          ;
        </div>
        <button
          type="button"
          className="flex flex-col flex-1 py-2 px-2 mx-auto group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="scroll to the top"
        >
          <div className="w-px h-full bg-gray-100 bg-opacity-50 group-hover:bg-opacity-100" />
        </button>
      </aside>
      {userFeed ? (
        <FeedContent userFeed={userFeed as UserFeed} setSidebarModalOpen={setSidebarModalOpen} />
      ) : null}
      <ModalSidebar
        isOpen={sidebarModalOpen}
        closeModal={() => setSidebarModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        <FeedSidebar
          feeds={myFeeds}
          loading={loading}
          onAddFeedClick={() => setAddFeedModalOpen(true)}
          onSidebarClose={() => setSidebarModalOpen(false)}
        />
        ;
      </ModalSidebar>
      <AddFeedModal isOpen={addFeedModalOpen} closeModal={() => setAddFeedModalOpen(false)} />
    </section>
  );
};

export default FeedReader;
