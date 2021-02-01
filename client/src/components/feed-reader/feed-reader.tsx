import React, { useState } from 'react';
import BarsIcon from '../../../public/static/bars.svg';
import MailIcon from '../../../public/static/envelope.svg';
import { useMyFeedsQuery, UserFeed } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import EditFeedModal from '../modals/edit-feed-modal';
import ModalSidebar from '../modals/modal-sidebar';
import FeedItems from './feed-items';
import FeedSidebar from './feed-sidebar';

const FeedReader: React.FC<{ id?: string }> = ({ id }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [editFeedModal, setEditFeedModal] = useState(false);
  const { data, loading } = useMyFeedsQuery({ skip: isServer() });
  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const feedList = <FeedSidebar feeds={myFeeds} loading={loading} />;

  let titleElem = <div />;
  let itemsElem = <div />;
  const userFeed = id && !loading ? myFeeds.find((uf) => uf.id === parseInt(id)) : null;
  if (userFeed) {
    const isDigestDisable = userFeed?.schedule === 'disable';
    itemsElem = <FeedItems feed={userFeed} />;
    titleElem = (
      <span className="flex items-center space-x-2">
        <h3 className="font-bold text-lg max-w-sm">{userFeed.feed.title || userFeed.feed.url}</h3>
        <button
          type="button"
          title={
            isDigestDisable
              ? 'Email digest of this feed is disabled'
              : 'You are receiving email digests of this feed'
          }
          className="h-4 w-4 icon-btn overflow-visible"
          style={{ lineHeight: '1rem' }}
          onClick={() => setEditFeedModal(true)}
        >
          <MailIcon
            className={`width-auto height-full ${
              isDigestDisable ? 'text-gray-400' : 'text-gray-800'
            }`}
          />
        </button>
      </span>
    );
  }

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
        {titleElem}
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
      <EditFeedModal
        feed={userFeed as UserFeed}
        isOpen={editFeedModal}
        closeModal={() => setEditFeedModal(false)}
      />
    </section>
  );
};

export default FeedReader;
